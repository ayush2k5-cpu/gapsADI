from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import mock_data, db, logging

app = FastAPI(title="Scriptoria API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup(): 
    try:
        db.init_db()
    except Exception as e:
        logging.error(f"Failed to init DB: {e}")

@app.post("/api/generate")
async def generate_pipeline():
    return mock_data.MOCK_GENERATE

@app.post("/api/analyze")
async def analyze_pipeline():
    return mock_data.MOCK_ANALYZE

@app.post("/api/moodboard")
async def moodboard_pipeline():
    return mock_data.MOCK_MOODBOARD

@app.post("/api/translate")
async def translate_pipeline():
    return mock_data.MOCK_TRANSLATE

@app.post("/api/export")
async def export_pipeline():
    return {"message": "export dummy"}
