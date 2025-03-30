from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/start")
def start_main_script():
    subprocess.Popen(["python3", "./main.py"])  # launches webcam + sound
    return {"status": "started", "message": "Gesture control activated!"}
