import speech_recognition as sr
import cv2
import mediapipe as mp
import threading
import time
import os
import signal
import subprocess  # Ensure subprocess is imported

# Map voice commands to corresponding instrument files
instrument_scripts = {
    "flute": "gesture_flute.py",
    "drums": "gesture_drums.py",
    "guitar": "gesture_guitar.py",
    "piano": "gesture_piano.py",
    "saxophone": "gesture_sax_player.py",
    "violin": "gesture_violin.py"
}

# Persistent camera setup (OpenCV + MediaPipe)
cap = cv2.VideoCapture(0)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=2)  # Allow for two hands to be tracked
mp_draw = mp.solutions.drawing_utils

# Global variables
current_instrument = None
current_process = None
last_finger_count = -1

# Initialize the camera and hands detection
def initialize_camera():
    if not cap.isOpened():
        print("❌ Webcam not found")
        exit()

def listen_for_command():
    """ Listen for voice commands using speech recognition. """
    r = sr.Recognizer()
    mic = sr.Microphone()
    print("\n🎙️ Say an instrument name (e.g., 'flute', 'drums', 'exit')")

    with mic as source:
        r.adjust_for_ambient_noise(source)
        audio = r.listen(source)

    try:
        command = r.recognize_google(audio).lower()
        print(f"🗣️ Heard: {command}")
        return command
    except sr.UnknownValueError:
        print("😕 Could not understand audio.")
    except sr.RequestError:
        print("🚫 Could not request results.")
    return None

def start_instrument(script_name):
    """ Start the instrument's gesture script in a new process. """
    return subprocess.Popen(["python3", script_name], preexec_fn=os.setsid)

def stop_current_instrument():
    """ Stop the currently running instrument process. """
    global current_process
    if current_process:
        print("🛑 Stopping current instrument...")
        os.killpg(os.getpgid(current_process.pid), signal.SIGTERM)
        current_process = None
        time.sleep(1)

def process_gestures():
    """ Capture the webcam frames, detect hand gestures, and route to the correct instrument. """
    global last_finger_count, current_instrument

    while True:
        success, frame = cap.read()
        if not success:
            continue

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        finger_count = -1
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                hand_label = "Left" if hand_landmarks == results.multi_hand_landmarks[0] else "Right"

                # Allow both hands to be highlighted for guitar and piano
                if current_instrument in ["guitar", "piano"]:
                    mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                elif hand_label == "Right":
                    mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                
                finger_count = count_extended_fingers(hand_landmarks)

        # Here, you can map the gesture (finger_count) to instrument actions
        if finger_count != last_finger_count:
            last_finger_count = finger_count
            if current_instrument == "flute":
                # Call flute logic here
                pass
            elif current_instrument == "drums":
                # Call drum logic here
                pass
            # Continue for other instruments...

        # Display the video feed with the current mode
        cv2.putText(frame, f"Mode: {current_instrument}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.imshow("Gesture Music Mode", frame)

        if cv2.waitKey(1) & 0xFF == 27:  # Press 'ESC' to quit
            break

    cap.release()
    cv2.destroyAllWindows()

def count_extended_fingers(hand_landmarks):
    """ Count the number of extended fingers in the gesture. """
    tips = [8, 12, 16, 20]
    count = 0
    for tip_id in tips:
        tip = hand_landmarks.landmark[tip_id]
        pip = hand_landmarks.landmark[tip_id - 2]
        if tip.y < pip.y:
            count += 1
    if hand_landmarks.landmark[4].x < hand_landmarks.landmark[3].x:
        count += 1
    return count

def listen_for_instrument_changes():
    """ Listen for voice commands to switch between instruments. """
    global current_instrument, current_process

    while True:
        command = listen_for_command()
        if not command:
            continue

        if "exit" in command:
            print("👋 Exiting...")
            stop_current_instrument()
            break

        for keyword, script in instrument_scripts.items():
            if keyword in command:
                if current_instrument == keyword:
                    print(f"🎵 Already playing {keyword}")
                    break
                print(f"🎼 Switching to {keyword}")
                stop_current_instrument()
                current_process = start_instrument(script)
                current_instrument = keyword
                break
        else:
            print("❓ Unknown command. Try: flute, drums, guitar, piano, saxophone, violin.")

def main():
    """ Main loop for combining gesture control and voice command. """
    global current_instrument

    # Start the camera and gesture tracking
    initialize_camera()

    # Start the background thread for voice command listening
    voice_thread = threading.Thread(target=listen_for_instrument_changes)
    voice_thread.daemon = True
    voice_thread.start()

    # Start the webcam and gesture recognition
    process_gestures()

if __name__ == "__main__":
    main()
