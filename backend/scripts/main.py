import speech_recognition as sr
import cv2
import mediapipe as mp
import threading
import time
import os
import signal
import subprocess

# Map voice commands to corresponding instrument files
instrument_scripts = {
    "flute": "gesture_flute.py",
    "drums": "gesture_drums.py",
    "guitar": "gesture_guitar.py",
    "piano": "gesture_piano.py",
    "saxophone": "gesture_sax_player.py",
    "violin": "gesture_violin.py"
}

# OpenCV + MediaPipe setup
cap = cv2.VideoCapture(0)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=2)
mp_draw = mp.solutions.drawing_utils

# Global state
current_instrument = None
current_process = None
last_finger_count = -1

def initialize_camera():
    if not cap.isOpened():
        print("❌ Webcam not found")
        exit()

def listen_for_command():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("🎙️ Say an instrument name (e.g., 'flute', 'drums', 'exit')")
        try:
            audio = recognizer.listen(source, timeout=5)
            command = recognizer.recognize_google(audio).lower()
            print(f"🗣️ Heard: {command}")
            return command
        except sr.UnknownValueError:
            print("❓ Could not understand audio.")
        except sr.RequestError:
            print("⚠️ Speech Recognition service unavailable.")
        except sr.WaitTimeoutError:
            print("⌛ Listening timed out.")
        return None

def stop_current_instrument():
    global current_process
    if current_process is not None:
        try:
            os.killpg(os.getpgid(current_process.pid), signal.SIGTERM)
            print("🛑 Stopped current instrument.")
        except ProcessLookupError:
            print("⚠️ Process already terminated.")
        current_process = None

def switch_instrument(instrument_name):
    global current_process
    if instrument_name not in instrument_scripts:
        print("❌ Invalid instrument name.")
        return
    stop_current_instrument()
    print(f"🎼 Switching to {instrument_name}")
    try:
        current_process = subprocess.Popen(
            ["python", f"./{instrument_scripts[instrument_name]}"],
            preexec_fn=os.setsid
        )
    except Exception as e:
        print(f"🚫 Failed to launch {instrument_name}: {e}")

def listen_for_instrument_changes():
    while True:
        command = listen_for_command()
        if command == "exit":
            stop_current_instrument()
            print("👋 Exiting...")
            break
        elif command:
            switch_instrument(command)

def process_gestures():
    global last_finger_count
    while True:
        success, img = cap.read()
        if not success:
            continue
        img = cv2.flip(img, 1)  # 🔁 Flip image to fix mirror effect
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        result = hands.process(img_rgb)
        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                mp_draw.draw_landmarks(img, hand_landmarks, mp_hands.HAND_CONNECTIONS)
        cv2.imshow("Gesture Controller", img)
        if cv2.waitKey(1) & 0xFF == 27:  # ESC to quit
            break
    cap.release()
    cv2.destroyAllWindows()


def main():
    initialize_camera()
    threading.Thread(target=listen_for_instrument_changes, daemon=True).start()
    process_gestures()

if __name__ == "__main__":
    main()
