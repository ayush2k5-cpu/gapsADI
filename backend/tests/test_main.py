import asyncio
import pathlib
import runpy
import time

import httpx
import pytest
from fastapi.testclient import TestClient

import main

# Plain instantiation (no `with` context manager) skips FastAPI's startup
# lifespan, so this never triggers the real RAG/ChromaDB load.
client = TestClient(main.app)


class FakePollinationsResponse:
    ok = True
    content = b"fake-image-bytes"
    headers = {"Content-Type": "image/jpeg"}


class TestGenerateValidation:
    def test_rejects_story_idea_shorter_than_10_chars(self):
        resp = client.post("/api/generate", json={
            "story_idea": "too short", "genre": "Thriller", "language": "English", "tone": 50,
        })
        assert resp.status_code == 400
        assert resp.json()["code"] == "VALIDATION_ERROR"

    def test_rejects_story_idea_longer_than_400_chars(self):
        resp = client.post("/api/generate", json={
            "story_idea": "x" * 401, "genre": "Thriller", "language": "English", "tone": 50,
        })
        assert resp.status_code == 400
        assert resp.json()["code"] == "VALIDATION_ERROR"


class TestCBFCNotFound:
    def test_returns_400_when_project_does_not_exist(self, mocker):
        mocker.patch("main.db.get_project", return_value=None)
        resp = client.post("/api/cbfc", json={"project_id": "does-not-exist"})
        assert resp.status_code == 400
        assert resp.json()["message"] == "Project not found"


class TestCharacterPortraits:
    def test_returns_a_portrait_per_named_character_and_skips_unnamed_ones(self, mocker):
        mocker.patch("main.db.get_project", return_value={
            "characters": [
                {"name": "KUMAR", "role": "PROTAGONIST", "bio": "A retired teacher."},
                {"name": "", "role": "MINOR", "bio": "no name, should be skipped"},
            ]
        })
        mocker.patch("main.ai_client.generate_character_portrait", return_value="data:image/jpeg;base64,xyz")

        resp = client.post("/api/character-portraits", json={"project_id": "p1", "tone": 50})

        assert resp.status_code == 200
        assert resp.json()["portraits"] == [{"name": "KUMAR", "image_url": "data:image/jpeg;base64,xyz"}]

    def test_returns_400_when_project_does_not_exist(self, mocker):
        mocker.patch("main.db.get_project", return_value=None)
        resp = client.post("/api/character-portraits", json={"project_id": "missing", "tone": 50})
        assert resp.status_code == 400

    def test_returns_empty_image_url_when_portrait_generation_fails_for_one_character(self, mocker):
        mocker.patch("main.db.get_project", return_value={
            "characters": [{"name": "KUMAR", "role": "PROTAGONIST", "bio": "..."}],
        })
        mocker.patch("main.ai_client.generate_character_portrait", side_effect=RuntimeError("Pollinations down"))

        resp = client.post("/api/character-portraits", json={"project_id": "p1", "tone": 50})

        assert resp.status_code == 200
        assert resp.json()["portraits"] == [{"name": "KUMAR", "image_url": ""}]


class TestMoodboard:
    def test_uses_a_generic_fallback_description_when_project_not_found(self, mocker):
        mocker.patch("main.db.get_project", return_value=None)
        mocker.patch("requests.get", return_value=FakePollinationsResponse())

        resp = client.post("/api/moodboard", json={"project_id": "missing", "act": 2})

        assert resp.status_code == 200
        assert resp.json()["caption"] == "ACT 2 — ESCALATE"

    def test_returns_empty_image_url_when_pollinations_fetch_fails_both_attempts(self, mocker):
        mocker.patch("main.db.get_project", return_value={"story_idea": "A story", "tone": 50})
        mocker.patch("requests.get", side_effect=RuntimeError("network error"))

        resp = client.post("/api/moodboard", json={"project_id": "p1", "act": 1})

        assert resp.status_code == 200
        assert resp.json()["image_url"] == ""


@pytest.mark.asyncio
async def test_cbfc_request_is_not_blocked_by_a_slow_character_portrait_fetch(mocker):
    """Regression test (covers: /debug fix for character_portraits_pipeline).
    Before the fix, the synchronous requests.get() inside
    generate_character_portrait() blocked FastAPI's single-threaded event
    loop, so a concurrent /api/cbfc request would stall behind it too."""

    def slow_portrait(name, role, bio, tone):
        time.sleep(0.3)
        return "data:image/jpeg;base64,xyz"

    mocker.patch("main.ai_client.generate_character_portrait", side_effect=slow_portrait)
    mocker.patch("main.db.get_project", return_value={
        "characters": [{"name": "KUMAR", "role": "PROTAGONIST", "bio": "..."}],
        "screenplay": "INT. HOUSE - DAY\n\nSome action.\n",
        "genre": "Thriller",
        "tone": 50,
    })

    async def timed(coro):
        start = time.monotonic()
        resp = await coro
        return resp, time.monotonic() - start

    transport = httpx.ASGITransport(app=main.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as async_client:
        (portraits_resp, portraits_elapsed), (cbfc_resp, cbfc_elapsed) = await asyncio.gather(
            timed(async_client.post("/api/character-portraits", json={"project_id": "p1", "tone": 50})),
            timed(async_client.post("/api/cbfc", json={"project_id": "p1"})),
        )

    assert portraits_resp.status_code == 200
    assert cbfc_resp.status_code == 200
    assert portraits_elapsed >= 0.25  # ~0.3s expected; small tolerance for scheduler jitter
    # Before the fix this also took ~0.3s, stuck behind the blocking call on
    # the same event loop thread.
    assert cbfc_elapsed < 0.2


@pytest.mark.asyncio
async def test_cbfc_request_is_not_blocked_by_a_slow_moodboard_fetch(mocker):
    """Regression test (covers: /debug fix for moodboard_pipeline, the sibling
    of the character-portraits bug — same blocking requests.get() pattern)."""

    def slow_get(url, timeout=45):
        time.sleep(0.3)
        return FakePollinationsResponse()

    mocker.patch("requests.get", side_effect=slow_get)
    mocker.patch("main.db.get_project", return_value={
        "story_idea": "A story", "tone": 50,
        "screenplay": "INT. HOUSE - DAY\n\nSome action.\n",
        "genre": "Thriller",
    })

    async def timed(coro):
        start = time.monotonic()
        resp = await coro
        return resp, time.monotonic() - start

    transport = httpx.ASGITransport(app=main.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as async_client:
        (mood_resp, mood_elapsed), (cbfc_resp, cbfc_elapsed) = await asyncio.gather(
            timed(async_client.post("/api/moodboard", json={"project_id": "p1", "act": 1})),
            timed(async_client.post("/api/cbfc", json={"project_id": "p1"})),
        )

    assert mood_resp.status_code == 200
    assert cbfc_resp.status_code == 200
    assert mood_elapsed >= 0.25  # ~0.3s expected; small tolerance for scheduler jitter
    assert cbfc_elapsed < 0.2


def test_running_main_as_a_script_starts_uvicorn_on_port_8000(mocker):
    """Regression test (covers: /debug fix for the missing __main__ block).
    `python main.py` previously imported the module and exited without
    starting anything. Executes main.py as __main__ with uvicorn.run mocked
    out, so no real server actually starts during the test."""
    mock_run = mocker.patch("uvicorn.run")
    main_path = pathlib.Path(main.__file__)

    runpy.run_path(str(main_path), run_name="__main__")

    mock_run.assert_called_once()
    _, kwargs = mock_run.call_args
    assert kwargs.get("port") == 8000
