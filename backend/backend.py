from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from dotenv import load_dotenv
# from db.mongo import recordings  # REMOVED: Old database import
from scripts.gesture_control import handle_gesture
import subprocess
import os
import signal

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

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

    # TODO: Connect to new database layer at http://127.0.0.1:8001
    # recordings.insert_one(entry)  # REMOVED: Old database operation

    return {**entry, "status": "ok", "played": result}

@app.get("/recordings")
def get_recordings():
    # TODO: Connect to new database layer at http://127.0.0.1:8001
    # return {"recordings": list(recordings.find({}, {"_id": 0}))}  # REMOVED: Old database operation
    return {
        "recordings": [],
        "message": "Connect to database layer at http://127.0.0.1:8001 for recordings"
    }

# Store the process globally
gesture_process = None

@app.get("/start-webcam")
def start_webcam():
    global gesture_process

    if gesture_process is None or gesture_process.poll() is not None:
        gesture_process = subprocess.Popen(
            ["python", "scripts/main.py"],
            preexec_fn=os.setsid
        )
        return {"status": "started"}
    else:
        return {"status": "already running"}

@app.get("/stop-webcam")
def stop_webcam():
    global gesture_process

    if gesture_process and gesture_process.poll() is None:
        os.killpg(os.getpgid(gesture_process.pid), signal.SIGTERM)
        gesture_process = None
        return {"status": "stopped"}
    return {"status": "not running"}

@app.get("/start")
def start_main_script():
    subprocess.Popen(["python3", "scripts/main.py"])
    return {"status": "started", "message": "Gesture control activated!"}