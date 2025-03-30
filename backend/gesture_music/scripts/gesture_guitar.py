import os
os.environ["SDL_AUDIODRIVER"] = "coreaudio"

import cv2
import mediapipe as mp
import time
from guitar_synth import GuitarSynth

# Initialize Synth
guitar = GuitarSynth("../sounds/FluidR3_GM.sf2")

# 📷 MediaPipe setup
cap = cv2.VideoCapture(0)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=2)
mp_draw = mp.solutions.drawing_utils

NOTE_MAP = {
    0: 52,  # E3
    1: 55,  # G3
    2: 57,  # A3
    3: 59,  # B3
    4: 60,  # C4
    5: 64   # E4
}

cv2.namedWindow("Guitar", cv2.WINDOW_NORMAL)
cv2.startWindowThread()

last_chosen_note = None
last_strum_time = 0
strum_cooldown = 0.4  # in seconds
running = True

# ✋ Finger count helper
def count_extended_fingers(hand_landmarks):
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

# 🧠 Main loop
while running:
    success, frame = cap.read()
    if not success:
        continue

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    left_note = None
    right_hand_y = None

    if results.multi_hand_landmarks:
        for i, hand_landmarks in enumerate(results.multi_hand_landmarks):
            label = results.multi_handedness[i].classification[0].label
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            print(f"🖐️ Detected hand {i}: {label}")

            finger_count = count_extended_fingers(hand_landmarks)

            if label == "Left":
                if finger_count in NOTE_MAP:
                    left_note = NOTE_MAP[finger_count]
                    last_chosen_note = left_note
                    print(f"🎼 Left hand → {finger_count} fingers → Note: {last_chosen_note}")

            elif label == "Right":
                wrist_y = hand_landmarks.landmark[0].y * h
                right_hand_y = wrist_y
                print(f"🫱 Right hand Y-pos: {right_hand_y:.2f}")

    # 🎸 Trigger strum if right hand is low
    now = time.time()
    if right_hand_y is not None and right_hand_y > 2 * h / 3:
        if last_chosen_note and (now - last_strum_time > strum_cooldown):
            print("💥 STRUM zone entered!")
            guitar.strum(last_chosen_note)
            last_strum_time = now

    # 🎨 UI
    cv2.putText(frame, "Mode: Guitar", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    if last_chosen_note:
        cv2.putText(frame, f"Note: {last_chosen_note}", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 255, 200), 2)

    # 🎯 Draw strum zone
    cv2.rectangle(frame, (0, int(2 * h / 3)), (w, h), (50, 50, 50), 2)
    cv2.putText(frame, "STRUM ZONE", (10, h - 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 100), 2)

    cv2.imshow("Guitar", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        running = False

# 🧹 Cleanup
guitar.delete()
cap.release()
cv2.destroyAllWindows()