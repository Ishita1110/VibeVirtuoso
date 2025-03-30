import os
os.environ["SDL_AUDIODRIVER"] = "coreaudio"

import cv2
import mediapipe as mp
import time
import fluidsynth

# 🎼 Init FluidSynth for MIDI Drums
fs = fluidsynth.Synth()
fs.start(driver="coreaudio")
sfid = fs.sfload("./sounds/FluidR3_GM.sf2")
fs.program_select(9, sfid, 128, 0)  # Channel 9 = Drum Kit

# Drum mapping
MIDI_DRUM_MAP = {
    0: (35, "Kick Drum"),
    1: (38, "Snare Drum"),
    2: (42, "Closed Hi-Hat"),
    3: (46, "Open Hi-Hat"),
    4: (45, "Low Tom"),
    5: (49, "Crash Cymbal"),
}

# MediaPipe setup
cap = cv2.VideoCapture(0)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

last_drum = -1
last_hit_time = 0
cooldown = 0.3  # seconds

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

while True:
    success, frame = cap.read()
    if not success:
        continue

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    drum_name = "-"

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            finger_count = count_extended_fingers(hand_landmarks)
            if finger_count in MIDI_DRUM_MAP:
                note, drum_name = MIDI_DRUM_MAP[finger_count]
                if finger_count != last_drum:
                    fs.noteon(9, note, 120)
                    print(f"🥁 MIDI Drum: {drum_name} ({note})")
                    last_drum = finger_count
            else:
                last_drum = -1  # Reset if unrecognized gesture


    else:
        last_drum = -1

cv2.destroyAllWindows()
exit(0)


    # # UI
    # cv2.putText(frame, f"Drum: {drum_name}", (10, 30),
    #             cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    # cv2.imshow("Gesture MIDI Drums", frame)

    # if cv2.waitKey(1) & 0xFF == 27:
    #     break

# fs.delete()
# cap.release()
# cv2.destroyAllWindows()
