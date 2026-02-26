"""
verify_setup.py — Scriptoria environment verification script.
Run from the backend/ folder: python scripts/verify_setup.py
Performs 5 ordered checks and reports ✅ / ❌ for each.
"""

import sys
import os
import logging
import shutil

logging.basicConfig(level=logging.WARNING, format="%(levelname)s: %(message)s")

all_passed: bool = True


# ── Check 1 — Python version ────────────────────────────────────────────────
def check_python_version() -> bool:
    """Returns True if Python >= 3.11, prints result."""
    major: int = sys.version_info.major
    minor: int = sys.version_info.minor
    micro: int = sys.version_info.micro
    if major == 3 and minor >= 11:
        print(f"✅ Python version: {major}.{minor}.{micro} — OK")
        return True
    else:
        print(f"❌ Python version: {major}.{minor}.{micro} — needs 3.11+")
        return False


# ── Check 2 — Package imports ───────────────────────────────────────────────
def check_packages() -> bool:
    """Returns True if all required packages can be imported."""
    packages: list[str] = [
        "fastapi",
        "uvicorn",
        "google.generativeai",
        "chromadb",
        "sentence_transformers",
        "langchain",
        "reportlab",
        "docx",
        "ollama",
    ]
    missing: list[str] = []
    for pkg in packages:
        try:
            __import__(pkg)
        except Exception:
            # Catch ImportError AND runtime errors from broken installs
            # (e.g. sentence_transformers raises ValueError for Keras 3 conflict)
            missing.append(pkg)

    if not missing:
        print("✅ All packages importable — OK")
        return True
    else:
        print(f"❌ Missing packages: {missing} — run pip install -r requirements.txt")
        return False


# ── Check 3 — GEMINI_API_KEY ─────────────────────────────────────────────────
def check_gemini_key() -> bool:
    """Returns True if GEMINI_API_KEY is set and has len > 10."""
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        logging.warning("python-dotenv not installed; skipping .env load.")

    key: str | None = os.getenv("GEMINI_API_KEY")
    if key is not None and len(key) > 10:
        print("✅ GEMINI_API_KEY found — OK")
        return True
    else:
        print("❌ GEMINI_API_KEY missing — check .env file location and contents")
        return False


# ── Check 4 — SARVAM_API_KEY ─────────────────────────────────────────────────
def check_sarvam_key() -> bool:
    """Returns True if SARVAM_API_KEY is set and has len > 10."""
    key: str | None = os.getenv("SARVAM_API_KEY")
    if key is not None and len(key) > 10:
        print("✅ SARVAM_API_KEY found — OK")
        return True
    else:
        print("❌ SARVAM_API_KEY missing — check .env file location and contents")
        return False


# ── Check 5 — ChromaDB initializes ──────────────────────────────────────────
def check_chromadb() -> bool:
    """Returns True if ChromaDB PersistentClient can be initialised."""
    test_path: str = "./chroma_db_test"
    try:
        import chromadb
        client = chromadb.PersistentClient(path=test_path)
        client.list_collections()
        print("✅ ChromaDB initializes — OK")
        return True
    except Exception as exc:
        print(f"❌ ChromaDB error: {exc}")
        return False
    finally:
        if os.path.exists(test_path):
            try:
                shutil.rmtree(test_path)
            except Exception as cleanup_err:
                logging.warning(f"Could not remove test chroma folder: {cleanup_err}")


# ── Main ─────────────────────────────────────────────────────────────────────
def main() -> None:
    """Run all checks in order and print final summary."""
    global all_passed

    results: list[bool] = [
        check_python_version(),
        check_packages(),
        check_gemini_key(),
        check_sarvam_key(),
        check_chromadb(),
    ]

    all_passed = all(results)

    if all_passed:
        print("\nALL SYSTEMS GO 🟢")
    else:
        print("\nSETUP INCOMPLETE — fix the ❌ items above before proceeding")


if __name__ == "__main__":
    main()
