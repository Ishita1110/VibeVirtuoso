import cv2
import mediapipe as mp
import pygame
import time
import math

# 🎷 Load Saxophone Notes (A, C, D, E, G)
pygame.init()
pygame.mixer.init()
sax_notes = {
    1: pygame.mixer.Sound("../sounds/sax_notes/sax_A.wav"),
    2: pygame.mixer.Sound("../sounds/sax_notes/sax_C.wav"),
    3: pygame.mixer.Sound("../sounds/sax_notes/sax_D.wav"),
    4: pygame.mixer.Sound("../sounds/sax_notes/sax_E.wav"),
    5: pygame.mixer.Sound("../sounds/sax_notes/sax_G.wav")
}

note_labels = {
    1: "A",
    2: "C",
    3: "D",
    4: "E",
    5: "G"
}

# MediaPipe Setup
cap = cv2.VideoCapture(0)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=2)
mp_draw = mp.solutions.drawing_utils

last_finger_count = -1
note_cooldown = 0.5
last_note_time = 0

# Sound state
current_note = None
current_note_channel = None
note_start_time = 0
vibrato_intensity = 0

# Count extended fingers
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

# Main loop
while True:
    success, frame = cap.read()
    if not success or frame is None:
        print("⚠️ Failed to read frame from webcam.")
        continue

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    right_finger_count = -1
    right_hand_y = None
    left_hand_y = None
    current_time = time.time()

    if results.multi_hand_landmarks:
        for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            label = results.multi_handedness[idx].classification[0].label
            wrist_y = int(hand_landmarks.landmark[0].y * h)

            finger_count = count_extended_fingers(hand_landmarks)

            if label == "Right":
                right_finger_count = finger_count
                right_hand_y = wrist_y

                if finger_count in sax_notes and finger_count != last_finger_count and (current_time - last_note_time) > note_cooldown:
                    if current_note_channel:
                        current_note_channel.fadeout(200)

                    current_note = finger_count
                    current_note_channel = sax_notes[finger_count].play(-1)  # loop for sustain
                    note_start_time = current_time
                    last_finger_count = finger_count
                    last_note_time = current_time

            elif label == "Left":
                left_hand_y = wrist_y

    # Vibrato + Fade Logic
    if current_note_channel and current_note_channel.get_busy():
        if left_hand_y is not None:
            # Vibrato strength based on vertical position
            vibrato_strength = 1.0 - (left_hand_y / h)
            vibrato_intensity = max(0.0, min(1.0, vibrato_strength))
            vibrato_volume = 0.75 + 0.25 * math.sin(current_time * 12) * vibrato_intensity
            current_note_channel.set_volume(vibrato_volume)
        else:
            # No left hand detected = stop note gracefully
            current_note_channel.fadeout(400)
            current_note_channel = None
            current_note = None
            last_finger_count = -1

    # HUD
    if current_note:
        vib_level = f"{round(vibrato_intensity*100)}%" if left_hand_y else "0%"
        cv2.rectangle(frame, (w//2 - 220, h - 100), (w//2 + 220, h - 40), (30, 30, 30), -1)
        cv2.putText(frame, f"Sax Note: {note_labels[current_note]} | Vibrato: {vib_level}",
                    (w//2 - 200, h - 55), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255,255,255), 2)

    cv2.imshow("🎷 Gesture Sax Player", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
