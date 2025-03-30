import os
os.environ["SDL_AUDIODRIVER"] = "coreaudio"

import cv2
import mediapipe as mp
import time
from flute_synth import FluteSynth  # Make sure this file is in the same folder

# 🎵 Initialize Flute Synth
flute = FluteSynth("../sounds/FluidR3_GM.sf2")  # adjust path if needed

# 🎥 Initialize MediaPipe
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Webcam not found")
    exit()

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

cv2.namedWindow("Flute Mode", cv2.WINDOW_NORMAL)
cv2.startWindowThread()

# 🔢 Map finger counts to notes (base C4 range)
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

# ✋ Count extended fingers
def count_extended_fingers(hand_landmarks):
    tips = [8, 12, 16, 20]  # Index, Middle, Ring, Pinky
    count = 0
    for tip_id in tips:
        tip = hand_landmarks.landmark[tip_id]
        pip = hand_landmarks.landmark[tip_id - 2]
        if tip.y < pip.y:
            count += 1
    # Thumb logic (horizontal)
    if hand_landmarks.landmark[4].x < hand_landmarks.landmark[3].x:
        count += 1
    return count

# 🎼 Main Loop
while running:
    success, frame = cap.read()
    if not success:
        continue

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    finger_count = -1

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            finger_count = count_extended_fingers(hand_landmarks)

    # 🎶 Play flute note (always high pitch)
    if finger_count in NOTE_BASE:
        base_note = NOTE_BASE[finger_count]
        midi_note = base_note + 12  # Force high octave

        if finger_count != last_note_played:
            print(f"🎶 Flute MIDI Note: {midi_note}")
            flute.play_note(midi_note)
            last_note_played = finger_count
    else:
        flute.stop()
        last_note_played = -1

    # # UI
    # cv2.putText(frame, "Mode: Flute (High Octave)", (10, 30),
    #             cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    # cv2.imshow("Flute Mode", frame)

    # if cv2.waitKey(1) & 0xFF == 27:
    #     running = False

# # 🧹 Cleanup
# flute.delete()
# cap.release()
# cv2.destroyAllWindows()
