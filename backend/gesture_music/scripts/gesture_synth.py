# gesture_synth_chords.py

import cv2
import mediapipe as mp
import pygame
import time

# 🎵 Load Base Chord Sounds
pygame.init()
chord_sounds = {
    "C": pygame.mixer.Sound("../sounds/chords_synth/C_major.wav"),
    "A": pygame.mixer.Sound("../sounds/chords_synth/A_major.wav"),
    "D": pygame.mixer.Sound("../sounds/chords_synth/D_major.wav")
}

# 🎹 Load note sounds for each finger gesture with sharp variants + A and B
base_notes = {
    0: "C",
    1: "D",
    2: "E",
    3: "F",
    4: "G",
    5: "A"
}
sharp_notes = {
    0: "Csharp",
    1: "Dsharp",
    2: "Fsharp",
    3: "Gsharp",
    4: "Asharp",
    5: "B"
}

all_notes = set(base_notes.values()) | set(sharp_notes.values())
note_sounds = {
    note: pygame.mixer.Sound(f"../sounds/notes_wav_piano/{note}.wav") for note in all_notes
}

note_cooldown = 0.4
last_note_time = 0
last_finger_count = -1
note_played_this_gesture = False
current_note = None
current_layer = None

# 🔄 State tracking
last_played_chord = None
last_played_volume = -1
is_chord_playing = False
fade_duration = 300
last_fade_time = 0
fade_cooldown = 0.4

# ✌️ Map finger count to chords
chords_by_fingers = {
    1: "C",
    2: "A",
    3: "D"
}

# 📹 MediaPipe Setup
cap = cv2.VideoCapture(0)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=2)
mp_draw = mp.solutions.drawing_utils

h, w = 480, 640
current_chord = None
left_hand_y = None
right_finger_count = -1
right_hand_y = None

# Count fingers (index to pinky)
def count_extended_fingers(hand_landmarks):
    tips = [8, 12, 16, 20]
    count = 0
    for tip_id in tips:
        tip = hand_landmarks.landmark[tip_id]
        pip = hand_landmarks.landmark[tip_id - 2]
        if tip.y < pip.y:
            count += 1
    return count + (1 if hand_landmarks.landmark[4].x < hand_landmarks.landmark[3].x else 0)

# Fade out all currently playing chords
def fade_out_all():
    global last_fade_time
    for sound in chord_sounds.values():
        sound.fadeout(fade_duration)
    last_fade_time = time.time()

while True:
    success, frame = cap.read()
    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    left_hand_y = None
    chord_name = None
    right_hand_y = None
    hand_detected = False

    if results.multi_hand_landmarks:
        for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            hand_label = results.multi_handedness[idx].classification[0].label
            wrist_x = int(hand_landmarks.landmark[0].x * w)
            wrist_y = int(hand_landmarks.landmark[0].y * h)

            if hand_label == "Left":
                hand_detected = True
                fingers = count_extended_fingers(hand_landmarks)
                chord_name = chords_by_fingers.get(fingers, "C")  # default to C for 0 or unmatched fingers
                if chord_name:
                    current_chord = chord_name
                    left_hand_y = wrist_y

            elif hand_label == "Right":
                right_finger_count = count_extended_fingers(hand_landmarks)
                right_hand_y = wrist_y

    if not hand_detected:
        if is_chord_playing:
            fade_out_all()
            is_chord_playing = False
        last_played_chord = None
        last_played_volume = -1

    # Chord Volume Control
    if current_chord and left_hand_y is not None:
        if left_hand_y > 2*h/3:
            volume = 0.3
            current_layer = "Light"
        elif left_hand_y > h/3:
            volume = 0.6
            current_layer = "Mid"
        else:
            volume = 1.0
            current_layer = "Full"

        now = time.time()
        if (last_played_chord != current_chord or last_played_volume != volume):
            if now - last_fade_time > fade_cooldown:
                fade_out_all()
            sound = chord_sounds[current_chord]
            sound.set_volume(volume)
            sound.play(loops=-1)
            last_played_chord = current_chord
            last_played_volume = volume
            is_chord_playing = True

    # Right hand: Play a single note once using fingers + vertical position
    if right_finger_count >= 0 and right_finger_count <= 5 and right_hand_y is not None:
        now = time.time()
        selected_notes = sharp_notes if right_hand_y < h / 2 else base_notes

        if right_finger_count != last_finger_count:
            note_name = selected_notes.get(right_finger_count)
            if note_name and note_name in note_sounds:
                note_sounds[note_name].play()
                current_note = note_name
                last_note_time = now
                last_finger_count = right_finger_count
                note_played_this_gesture = True
    elif right_finger_count == 0:
        note_played_this_gesture = False
        last_finger_count = -1
        current_note = None

    # 🎹 Show unified HUD
    if current_note or current_chord or current_layer:
        cv2.rectangle(frame, (w//2 - 180, h - 100), (w//2 + 180, h - 40), (40, 40, 40), -1)
        hud_text = f"Chord: {current_chord or '-'}  |  Layer: {current_layer or '-'}  |  Note: {current_note or '-'}"
        cv2.putText(frame, hud_text, (w//2 - 170, h - 55), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)

    cv2.imshow("Gesture Chord Synth 🎹", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
