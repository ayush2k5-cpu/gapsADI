import google.generativeai as genai
import os, logging
from google.api_core.exceptions import ResourceExhausted

# Configure logging early
logging.basicConfig(level=logging.INFO)

genai.configure(api_key=os.getenv("GEMINI_API_KEY", "dummy"))
model = genai.GenerativeModel("gemini-2.0-flash")

def generate(prompt: str, json_mode: bool = False) -> str:
    """Call Gemini 2.0 Flash. Returns text. Raises RuntimeError on rate limit."""
    config = {"response_mime_type": "application/json"} if json_mode else {}
    try:
        response = model.generate_content(prompt, generation_config=config)
        return response.text
    except ResourceExhausted:
        logging.error("Gemini rate limit hit")
        raise RuntimeError("GEMINI_RATE_LIMIT")
    except Exception as e:
        logging.error(f"Gemini error: {e}")
        raise RuntimeError(f"GEMINI_ERROR: {str(e)}")
