import cv2
import mediapipe as mp
import pygame
import time

# 🎵 Load drum sounds
pygame.init()
snare = pygame.mixer.Sound("sounds/snare.wav")
kick = pygame.mixer.Sound("sounds/kick.wav")
hihat_closed = pygame.mixer.Sound("sounds/hihat.wav")
hihat_open = pygame.mixer.Sound("sounds/hihat_open.wav")  # Add this file

# ⏱️ Cooldown system
cooldowns = {
    "snare": 0,
    "kick": 0,
    "hihat_closed": 0,
    "hihat_open": 0
}

def play_with_cooldown(name, sound):
    now = time.time()
    if now - cooldowns[name] > 0.5:
        sound.play()
        cooldowns[name] = now

# ✋ Count how many fingers are extended
def count_extended_fingers(hand_landmarks):
    fingers = []
    tips = [8, 12, 16, 20]  # Index, Middle, Ring, Pinky

    for tip_id in tips:
        tip = hand_landmarks.landmark[tip_id]
        pip = hand_landmarks.landmark[tip_id - 2]
        fingers.append(tip.y < pip.y)

    return fingers.count(True)

# 🎥 Setup
cap = cv2.VideoCapture(0)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=2)
mp_draw = mp.solutions.drawing_utils

prev_gesture = None

while True:
    success, frame = cap.read()
    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    if results.multi_hand_landmarks:
        for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            fingers_up = count_extended_fingers(hand_landmarks)

            # Map gesture
            gesture = None
            if fingers_up == 0:
                gesture = "kick"
            elif fingers_up == 1:
                gesture = "snare"
            elif fingers_up == 2:
                gesture = "hihat_closed"
            elif fingers_up >= 4:
                gesture = "hihat_open"

            # Trigger sound if gesture changed
            if gesture and gesture != prev_gesture:
                if gesture == "snare":
                    print("🥁 Snare")
                    play_with_cooldown("snare", snare)
                elif gesture == "kick":
                    print("🥾 Kick")
                    play_with_cooldown("kick", kick)
                elif gesture == "hihat_closed":
                    print("🎶 Hi-Hat Closed")
                    play_with_cooldown("hihat_closed", hihat_closed)
                elif gesture == "hihat_open":
                    print("🎶 Hi-Hat Open")
                    play_with_cooldown("hihat_open", hihat_open)

            prev_gesture = gesture

    cv2.imshow("Gesture Drum Kit 🥁", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
