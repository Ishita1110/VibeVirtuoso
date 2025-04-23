import cv2
import mediapipe as mp
import threading
import os
import signal
import subprocess
import uuid
from datetime import datetime
import speech_recognition as sr

# Instrument scripts
instrument_scripts = {
    "flute": os.path.join("scripts", "gesture_flute.py"),
    "drums": os.path.join("scripts", "gesture_drums.py"),
    "guitar": os.path.join("scripts", "gesture_guitar.py"),
    "piano": os.path.join("scripts", "gesture_piano.py"),
    "saxophone": os.path.join("scripts", "gesture_sax_player.py"),
    "violin": os.path.join("scripts", "gesture_violin.py"),
}

# MediaPipe + Webcam
cap = cv2.VideoCapture(0)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=2)
mp_draw = mp.solutions.drawing_utils

current_instrument = None
current_process = None
recording_process = None

def initialize_camera():
    if not cap.isOpened():
        print("❌ Webcam not found")
        exit()

def stop_current_instrument():
    global current_process, recording_process
    if recording_process:
        recording_process.terminate()
        recording_process.wait()
        print("🛑 Stopped recording.")
        recording_process = None

    if current_process:
        try:
            os.killpg(os.getpgid(current_process.pid), signal.SIGTERM)
            print("🛑 Stopped current instrument.")
        except ProcessLookupError:
            print("⚠️ Process already terminated.")
        current_process = None

def start_recording(instrument):
    global recording_process
    filename = f"{instrument}_{uuid.uuid4().hex}.wav"
    filepath = os.path.join("recordings", filename)
    os.makedirs("recordings", exist_ok=True)

    try:
        recording_process = subprocess.Popen(
            ["python", "scripts/record_audio.py", filepath],
            preexec_fn=os.setsid
        )
        print(f"🔴 Started recording {instrument} to {filepath}")
    except Exception as e:
        print(f"❌ Failed to start recording: {e}")

def switch_instrument(instrument_name):
    global current_instrument, current_process

    if instrument_name not in instrument_scripts:
        print("❌ Invalid instrument name.")
        return

    if instrument_name == current_instrument:
        print(f"ℹ️ Already on {instrument_name}, skipping.")
        return

    stop_current_instrument()

    print(f"🎼 Switching to {instrument_name}")
    current_instrument = instrument_name

    try:
        current_process = subprocess.Popen(
            ["python", instrument_scripts[instrument_name]],
            preexec_fn=os.setsid
        )
        print(f"✅ Launched {instrument_name} script.")
        start_recording(instrument_name)
    except Exception as e:
        print(f"🚫 Failed to launch {instrument_name}: {e}")

def extract_instrument_name(command):
    for instrument in instrument_scripts:
        if instrument in command:
            return instrument
    return None

# ==== Voice Command Thread ====

def listen_for_voice_commands():
    recognizer = sr.Recognizer()
    mic = sr.Microphone()
    while True:
        with mic as source:
            recognizer.adjust_for_ambient_noise(source)
            print("🎙️ Say an instrument (flute, guitar, etc.)")
            try:
                audio = recognizer.listen(source, timeout=5)
                command = recognizer.recognize_google(audio).lower()
                print(f"🗣️ Heard: {command}")
                instrument = extract_instrument_name(command)
                if instrument:
                    threading.Thread(target=switch_instrument, args=(instrument,), daemon=True).start()
                else:
                    print("⚠️ No valid instrument found in voice command.")
            except sr.UnknownValueError:
                print("❓ Could not understand audio.")
            except sr.WaitTimeoutError:
                print("⌛ Listening timed out.")
            except sr.RequestError as e:
                print(f"⚠️ Speech service error: {e}")

# ==== Main Gesture + Keyboard Loop ====

def process_gestures():
    while True:
        success, img = cap.read()
        if not success:
            continue

        img = cv2.flip(img, 1)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        result = hands.process(img_rgb)

        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                mp_draw.draw_landmarks(img, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        if current_instrument:
            cv2.putText(
                img, f"🎹 Instrument: {current_instrument.upper()}",
                (10, img.shape[0] - 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2
            )

        cv2.putText(
            img, "[1] Flute [2] Drums [3] Guitar [4] Piano [5] Sax [6] Violin [Q] Quit",
            (10, img.shape[0] - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150, 255, 150), 1
        )

        
        cv2.imshow("Gesture Controller", img)


        key = cv2.waitKey(1) & 0xFF
        if key == 27 or key == ord('q'):
            break
        elif key == ord('1'):
            threading.Thread(target=switch_instrument, args=("flute",), daemon=True).start()
        elif key == ord('2'):
            threading.Thread(target=switch_instrument, args=("drums",), daemon=True).start()
        elif key == ord('3'):
            threading.Thread(target=switch_instrument, args=("guitar",), daemon=True).start()
        elif key == ord('4'):
            threading.Thread(target=switch_instrument, args=("piano",), daemon=True).start()
        elif key == ord('5'):
            threading.Thread(target=switch_instrument, args=("saxophone",), daemon=True).start()
        elif key == ord('6'):
            threading.Thread(target=switch_instrument, args=("violin",), daemon=True).start()

    cap.release()
    stop_current_instrument()
    cv2.destroyAllWindows()

# ==== Entry Point ====

def main():
    initialize_camera()
    threading.Thread(target=listen_for_voice_commands, daemon=True).start()
    process_gestures()

if __name__ == "__main__":
    main()
