import speech_recognition as sr
import cv2
import mediapipe as mp
import threading
import time
import os
import signal
import subprocess
from gemini_helper import ask_gemini

instrument_scripts = {
    "flute": os.path.join("scripts", "gesture_flute.py"),
    "drums": os.path.join("scripts", "gesture_drums.py"),
    "guitar": os.path.join("scripts", "gesture_guitar.py"),
    "piano": os.path.join("scripts", "gesture_piano.py"),
    "saxophone": os.path.join("scripts", "gesture_sax_player.py"),
    "violin": os.path.join("scripts", "gesture_violin.py"),
}

# 🎥 Webcam & MediaPipe setup
cap = cv2.VideoCapture(0)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=2)
mp_draw = mp.solutions.drawing_utils

# 🌍 Global state
current_instrument = None
current_process = None
last_finger_count = -1
gemini_mode = "create"
gemini_response = ""  # 👁️ Show Gemini output on video

def initialize_camera():
    if not cap.isOpened():
        print("❌ Webcam not found")
        exit()

def listen_for_command():
    global gemini_mode, gemini_response
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("🎙️ Say an instrument name or command (e.g., 'flute', 'guide me', 'exit')")
        try:
            audio = recognizer.listen(source, timeout=5)
            command = recognizer.recognize_google(audio).lower()
            print(f"🗣️ Heard: {command}")

            if "enter teach mode" in command:
                gemini_mode = "teach"
                gemini_response = "📘 Gemini is now in TEACHING mode."
                print(gemini_response)
                return None

            elif "enter create mode" in command:
                gemini_mode = "create"
                gemini_response = "🎨 Gemini is now in CREATION mode."
                print(gemini_response)
                return None

            elif "guide me" in command or "gemini" in command:
                response = ask_gemini("Guide me to make something cool!", gemini_mode)
                print("🧠 Gemini says:\n", response)
                gemini_response = response
                return None

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
        img = cv2.flip(img, 1)  # Mirror correction
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        result = hands.process(img_rgb)
        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                mp_draw.draw_landmarks(img, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        # 🧠 Display Gemini text on webcam window
        if gemini_response:
            y0 = 30
            for i, line in enumerate(gemini_response.split('\n')):
                y = y0 + i * 30
                cv2.putText(img, line, (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

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
