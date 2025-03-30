import os
os.environ["SDL_AUDIODRIVER"] = "coreaudio"

import cv2
import mediapipe as mp
import time
import fluidsynth

# Load SoundFont
SF2_PATH = "../sounds/FluidR3_GM.sf2"

# 🎹 Piano Synth
piano = fluidsynth.Synth()
piano.start(driver="coreaudio")
piano_sf2 = piano.sfload(SF2_PATH)
piano.program_select(0, piano_sf2, 0, 0)  # Program 0: Acoustic Grand Piano

# 🎻 String Chords Synth
synth = fluidsynth.Synth()
synth.start(driver="coreaudio")
synth_sf2 = synth.sfload(SF2_PATH)
synth.program_select(1, synth_sf2, 0, 48)  # Program 48: Strings 1

# MediaPipe Hands
cap = cv2.VideoCapture(0)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=2)
mp_draw = mp.solutions.drawing_utils

# Right Hand Piano Notes
MELODY_MAP = {
    0: 60,  # C4
    1: 62,  # D4
    2: 64,  # E4
    3: 65,  # F4
    4: 67,  # G4
    5: 69   # A4
}

# Left Hand Chords
SYNTH_CHORDS = {
    1: [60, 64, 67],   # C Major
    2: [62, 65, 69],   # D Minor
    3: [65, 69, 72],   # F Major
    4: [67, 71, 74],   # G Major
    5: [69, 72, 76]    # A Minor
}

last_piano_note = None
last_synth_fingers = -1
synth_playing = []
layer = "-"

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

def is_right_hand(hand_landmarks, width):
    wrist_x = hand_landmarks.landmark[0].x * width
    return wrist_x > width / 2

def stop_synth():
    global synth_playing
    for note in synth_playing:
        synth.noteoff(1, note)
    synth_playing = []

while True:
    success, frame = cap.read()
    if not success:
        continue

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    current_synth_fingers = -1
    layer = "-"

    if results.multi_hand_landmarks:
        for i, hand_landmarks in enumerate(results.multi_hand_landmarks):
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            finger_count = count_extended_fingers(hand_landmarks)
            is_right = is_right_hand(hand_landmarks, w)

            if is_right:
                # 🎹 Right hand piano
                if finger_count in MELODY_MAP:
                    note = MELODY_MAP[finger_count]
                    if note != last_piano_note:
                        if last_piano_note is not None:
                            piano.noteoff(0, last_piano_note)
                        piano.noteon(0, note, 120)
                        last_piano_note = note
                        print(f"🎹 Piano: {note}")
                else:
                    if last_piano_note is not None:
                        piano.noteoff(0, last_piano_note)
                        last_piano_note = None

            else:
                # 🎻 Left hand strings + dynamics
                wrist_y = hand_landmarks.landmark[0].y * h
                current_synth_fingers = finger_count

                if finger_count != last_synth_fingers:
                    stop_synth()
                    if finger_count in SYNTH_CHORDS:
                        chord = SYNTH_CHORDS[finger_count]

                        # 🎚️ More comfortable Y thresholds
                        if wrist_y > 0.85 * h:
                            velocity = 50
                            layer = "Light"
                        elif wrist_y > 0.6 * h:
                            velocity = 90
                            layer = "Mid"
                        else:
                            velocity = 127
                            layer = "Full"


                        for note in chord:
                            synth.noteon(1, note, velocity)
                        synth_playing = chord
                        print(f"🎻 Strings Chord: {chord} | Layer: {layer}")

                    last_synth_fingers = finger_count

    else:
        # No hands visible
        if last_piano_note is not None:
            piano.noteoff(0, last_piano_note)
            last_piano_note = None
        stop_synth()
        last_synth_fingers = -1

    # # UI
    # cv2.putText(frame, "Right: Piano 🎹 | Left: Strings 🎻", (10, 30),
    #             cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    # if current_synth_fingers in SYNTH_CHORDS:
    #     cv2.putText(frame, f"Layer: {layer}", (10, 60),
    #                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 220, 180), 2)

    # cv2.imshow("Gesture Piano + Strings", frame)

    # if cv2.waitKey(1) & 0xFF == 27:
    #     break

# # Cleanup
# piano.delete()
# synth.delete()
# cap.release()
# cv2.destroyAllWindows()
