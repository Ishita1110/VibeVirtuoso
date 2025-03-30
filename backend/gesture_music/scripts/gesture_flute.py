import os
os.environ["SDL_AUDIODRIVER"] = "coreaudio"

import cv2
import mediapipe as mp
import time
from flute_synth import FluteSynth

# --- Flute Synth Init ---
flute = FluteSynth("../sounds/FluidR3_GM.sf2")  # Make sure this file is in the same folder

# --- MediaPipe Setup ---
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Webcam not found")
    exit()

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

cv2.namedWindow("Flute Mode", cv2.WINDOW_NORMAL)
cv2.startWindowThread()

# --- Note Mapping ---
NOTE_BASE = {
    0: 60,  # C4
    1: 62,  # D4
    2: 64,  # E4
    3: 65,  # F4
    4: 67,  # G4
    5: 69   # A4
}

last_note_played = -1
running = True

# --- Finger Count Helper ---
def count_extended_fingers(hand_landmarks):
    tips = [8, 12, 16, 20]
    count = 0
    for tip_id in tips:
        tip = hand_landmarks.landmark[tip_id]
        pip = hand_landmarks.landmark[tip_id - 2]
        if tip.y < pip.y:
            count += 1
    return count + (1 if hand_landmarks.landmark[4].x < hand_landmarks.landmark[3].x else 0)

# --- Main Loop ---
while running:
    success, frame = cap.read()
    if not success:
        continue

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    finger_count = -1
    hand_y = None

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            wrist_y = hand_landmarks.landmark[0].y * h
            hand_y = wrist_y
            finger_count = count_extended_fingers(hand_landmarks)

    # Flute logic
    if hand_y is not None and finger_count in NOTE_BASE:
        base_note = NOTE_BASE[finger_count]

        # Octave adjustment
        if hand_y < h / 3:
            midi_note = base_note + 12  # High
        elif hand_y > 2 * h / 3:
            midi_note = base_note - 12  # Low
        else:
            midi_note = base_note       # Mid

        if finger_count != last_note_played:
            print(f"🎶 Flute MIDI Note: {midi_note}")
            flute.play_note(midi_note)
            last_note_played = finger_count

    else:
        flute.stop()
        last_note_played = -1

    cv2.putText(frame, "Mode: Flute", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.imshow("Flute Mode", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        running = False

# Cleanup
flute.delete()
cap.release()
cv2.destroyAllWindows()
