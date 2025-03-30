from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
from dotenv import load_dotenv
from db.mongo import recordings
from scripts.gesture_control import handle_gesture
import subprocess
import os
import signal

load_dotenv()

app = FastAPI()

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

    recordings.insert_one(entry)

    return {**entry, "status": "ok", "played": result}

@app.get("/recordings")
def get_recordings():
    return {
        "recordings": list(recordings.find({}, {"_id": 0}))
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