# Scriptoria 🎬

**Scriptoria** is an AI-powered screenplay generation tool that leverages multiple LLM providers (Gemini, Groq, Sarvam, HuggingFace) to dynamically write, translate, and manage storyboards and scenes.

---

## 🚀 Getting Started

This project is split into two parts: a **Python/FastAPI backend** and a **Next.js frontend**. You will need to run *both* to fully experience the application.

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- API Keys for the AI services you intend to use (Gemini, Groq, Sarvam, HuggingFace).

---

## 1. Backend Setup (FastAPI & AI Engines)

The backend handles database interactions, vector embeddings (ChromaDB), and complex prompt networking to generation models.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment & install dependencies:**
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   Copy the example file to create your own configuration.
   ```bash
   cp .env.example .env
   ```
   Open the new `.env` file in a text editor and paste your API keys where it says `your_key_here`.
   *(Note: The database and vector DB files will be generated automatically when the app first runs).*

4. **Start the API Server:**
   ```bash
   python main.py
   ```
   The backend will start and listen on `http://localhost:8000`.

---

## 2. Frontend Setup (Next.js URL & Dashboard)

The frontend provides the user interface for building stories, casting characters, generating image moodboards, and viewing translated screenplays.

1. **Navigate to the frontend directory:**
   Leave your backend terminal running, open a new terminal window, and:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Configure API URL:**
   By default, the UI assumes the backend is running at `http://localhost:8000`. If you need to change this, create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   
5. **Open the App:** Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ License & Contributing

Feel free to fork this repository, submit PRs, and build upon Scriptoria! 

*Make sure not to commit your `.env` API keys when making pull requests.*
