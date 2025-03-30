from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from datetime import datetime
from dotenv import load_dotenv
from scripts.gesture_control import handle_gesture
import subprocess
import os
import signal
import uvicorn
import json
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
import base64
import requests

load_dotenv()

app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RECORDINGS_FILE = Path("recordings/recordings.json")
RECORDINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
if not RECORDINGS_FILE.exists():
    RECORDINGS_FILE.write_text("[]")

class Trigger(BaseModel):
    gesture: str
    instrument: str

@app.post("/play")
def play_sound(trigger: Trigger):
    result = handle_gesture(trigger.gesture, trigger.instrument)

    entry = {
        "gesture": trigger.gesture,
        "instrument": trigger.instrument,
        "timestamp": datetime.utcnow().isoformat()
    }

    with RECORDINGS_FILE.open("r+") as f:
        data = json.load(f)
        data.append(entry)
        f.seek(0)
        json.dump(data, f, indent=2)

    return {**entry, "status": "ok", "played": result}

@app.get("/recordings")
def get_recordings():
    with RECORDINGS_FILE.open("r") as f:
        return {"recordings": json.load(f)}

@app.post("/generate-samples")
def generate_samples(file: UploadFile = File(...)):
    # Read and encode the uploaded file
    audio_bytes = file.file.read()
    audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

    # Prepare prompt and send to Gemini API
    api_key = os.getenv("GEMINI_API_KEY")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    prompt = {
        "contents": [
            {"role": "user", "parts": [
                {"text": "You are a music producer. Create 4 different music variations of the following audio sample with unique styles: acoustic, electronic, lo-fi, and orchestral."},
                {"inline_data": {
                    "mime_type": "audio/wav",
                    "data": audio_base64
                }}
            ]}
        ]
    }

    response = requests.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        headers=headers,
        json=prompt
    )

    try:
        result = response.json()
        return result
    except Exception as e:
        return {"error": str(e), "raw_response": response.text}

# Store the process globally
gesture_process = None

@app.get("/start-script")
def start_gesture_script():
    global gesture_process

    if gesture_process is None or gesture_process.poll() is not None:
        gesture_process = subprocess.Popen(
            ["python", "scripts/main.py"],
            preexec_fn=os.setsid
        )
        return {"status": "started"}
    else:
        return {"status": "already running"}

@app.get("/stop-script")
def stop_gesture_script():
    global gesture_process

    if gesture_process and gesture_process.poll() is None:
        os.killpg(os.getpgid(gesture_process.pid), signal.SIGTERM)
        gesture_process = None
        return {"status": "stopped"}
    return {"status": "not running"}

@app.get("/")
def root():
    return {"message": "🎵 VibeVirtuoso API is running!"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
