import pytest

import ai_client


class TestIsPlaceholder:
    @pytest.mark.parametrize(
        "value,expected",
        [
            ("your_key_here", True),
            ("YOUR_KEY_HERE", True),
            ("placeholder", True),
            ("CHANGEME", True),
            ("xxx", True),
            ("<insert-key>", True),
            ("gsk_abcDEF1234567890", False),
        ],
    )
    def test_flags_known_placeholder_patterns(self, value, expected):
        assert ai_client._is_placeholder(value) is expected


class TestGetGroqKeys:
    def _clear_numbered_keys(self, monkeypatch, start=1, end=10):
        for i in range(start, end):
            monkeypatch.delenv(f"GROQ_API_KEY_{i}", raising=False)

    def test_collects_and_dedupes_base_and_numbered_keys(self, monkeypatch):
        monkeypatch.setenv("GROQ_API_KEY", "gsk_real_key_1")
        monkeypatch.setenv("GROQ_API_KEY_2", "gsk_real_key_2")
        monkeypatch.setenv("GROQ_API_KEY_3", "gsk_real_key_1")  # duplicate
        self._clear_numbered_keys(monkeypatch, start=4)

        assert ai_client._get_groq_keys() == ["gsk_real_key_1", "gsk_real_key_2"]

    def test_drops_placeholder_values(self, monkeypatch):
        monkeypatch.setenv("GROQ_API_KEY", "your_key_here")
        self._clear_numbered_keys(monkeypatch, start=2)

        assert ai_client._get_groq_keys() == []

    def test_returns_empty_list_when_nothing_configured(self, monkeypatch):
        monkeypatch.delenv("GROQ_API_KEY", raising=False)
        self._clear_numbered_keys(monkeypatch, start=2)

        assert ai_client._get_groq_keys() == []


class TestGetSarvamKeys:
    def test_collects_base_and_numbered_keys(self, monkeypatch):
        monkeypatch.setenv("SARVAM_API_KEY", "sk_real_key_1")
        monkeypatch.setenv("SARVAM_API_KEY_2", "sk_real_key_2")
        for i in range(3, 10):
            monkeypatch.delenv(f"SARVAM_API_KEY_{i}", raising=False)

        assert ai_client._get_sarvam_keys() == ["sk_real_key_1", "sk_real_key_2"]

    def test_returns_empty_list_when_nothing_configured(self, monkeypatch):
        monkeypatch.delenv("SARVAM_API_KEY", raising=False)
        for i in range(1, 10):
            monkeypatch.delenv(f"SARVAM_API_KEY_{i}", raising=False)

        assert ai_client._get_sarvam_keys() == []


class TestExtractCharactersRegex:
    def test_finds_all_caps_names_preceded_by_a_blank_line(self):
        screenplay = (
            "INT. HOUSE - DAY\n"
            "\n"
            "Some action line here.\n"
            "\n"
            "                    KUMAR\n"
            "          Hello there.\n"
            "\n"
            "EXT. STREET - NIGHT\n"
            "\n"
            "                    ARJUN\n"
            "          Who's there?\n"
        )

        characters = ai_client._extract_characters_regex(screenplay)

        assert [c["name"] for c in characters] == ["KUMAR", "ARJUN"]
        assert characters[0]["role"] == "PROTAGONIST"
        assert characters[1]["role"] == "ANTAGONIST"

    def test_caps_at_six_characters_and_assigns_remaining_roles(self):
        names = ["ALPHA", "BETA", "GAMMA", "DELTA", "EPSILON", "ZETA", "ETA", "THETA"]
        lines = []
        for name in names:
            lines.append("")
            lines.append(name)
            lines.append("          Line of dialogue.")
        screenplay = "\n".join(lines)

        characters = ai_client._extract_characters_regex(screenplay)

        assert [c["name"] for c in characters] == names[:6]
        assert [c["role"] for c in characters] == [
            "PROTAGONIST", "ANTAGONIST", "SUPPORTING", "SUPPORTING", "MINOR", "MINOR",
        ]

    def test_returns_empty_list_when_no_character_names_found(self):
        assert ai_client._extract_characters_regex("INT. HOUSE - DAY\n\nJust action, no names.\n") == []

    def test_returns_empty_list_for_empty_screenplay(self):
        assert ai_client._extract_characters_regex("") == []


class TestExtractDialogueLines:
    def test_finds_indented_non_caps_lines(self):
        screenplay = (
            "INT. HOUSE - DAY\n"
            "\n"
            "                    KUMAR\n"
            "          You always had a talent for hiding things.\n"
            "\n"
        )

        result = ai_client._extract_dialogue_lines(screenplay)

        assert len(result) == 1
        _, text = result[0]
        assert text == "You always had a talent for hiding things."

    def test_excludes_all_caps_lines_even_when_indented(self):
        screenplay = "INT. HOUSE - DAY\n\n     KUMAR\n\n"
        assert ai_client._extract_dialogue_lines(screenplay) == []

    def test_returns_empty_list_when_there_is_no_dialogue(self):
        assert ai_client._extract_dialogue_lines("INT. HOUSE - DAY\n\nJust action.\n") == []


class TestResolveSarvamLangCode:
    def test_maps_known_languages_case_insensitively(self):
        assert ai_client._resolve_sarvam_lang_code("Hindi") == "hi-IN"
        assert ai_client._resolve_sarvam_lang_code("TAMIL") == "ta-IN"
        assert ai_client._resolve_sarvam_lang_code(" bengali ") == "bn-IN"

    def test_raises_value_error_for_an_unsupported_language(self):
        with pytest.raises(ValueError, match="SARVAM_UNSUPPORTED_LANG"):
            ai_client._resolve_sarvam_lang_code("Klingon")
