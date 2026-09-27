import os
import sys

# backend/tests has no __init__.py, so pytest does not add backend/ (the
# parent directory) to sys.path on its own. main.py, ai_client.py, db.py etc.
# all live there, so tests can't import them without this.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
