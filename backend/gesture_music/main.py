import os
os.environ["SDL_AUDIODRIVER"] = "coreaudio"  # macOS audio fix

import cv2
import mediapipe as mp
import pygame
import time
import threading
import speech_recognition as sr

# Logger instead of TTS
def speak(text):
    print("🔈", text)

# Threaded fade-in helper to prevent lag
def fadein(sound, target_volume, duration=300, steps=10):
    def _fade():
        sound.set_volume(0)
        sound.play(loops=-1)
        for i in range(1, steps + 1):
            volume = (target_volume / steps) * i
            sound.set_volume(volume)
            time.sleep(duration / steps / 1000.0)
    threading.Thread(target=_fade, daemon=True).start()

pygame.mixer.init()

# Load drum sounds
DRUM_SOUNDS = {
    "kick": pygame.mixer.Sound("./sounds/drums/kick.wav"),
    "snare": pygame.mixer.Sound("./sounds/drums/snare.wav"),
    "hihat_closed": pygame.mixer.Sound("./sounds/drums/hihat.wav"),
    "hihat_open": pygame.mixer.Sound("./sounds/drums/hihat_open.wav"),
}

# Load chord synth sounds
CHORD_SOUNDS = {
    "C": pygame.mixer.Sound("./sounds/chords_synth/C_major.wav"),
    "A": pygame.mixer.Sound("./sounds/chords_synth/A_major.wav"),
    "D": pygame.mixer.Sound("./sounds/chords_synth/D_major.wav")
}

# Load piano notes
base_notes = {0: "C", 1: "D", 2: "E", 3: "F", 4: "G", 5: "A"}
sharp_notes = {0: "Csharp", 1: "Dsharp", 2: "Fsharp", 3: "Gsharp", 4: "Asharp", 5: "B"}
all_notes = set(base_notes.values()) | set(sharp_notes.values())
NOTE_SOUNDS = {
    note: pygame.mixer.Sound(f"./sounds/notes_wav_piano/{note}.wav") for note in all_notes
}

# MediaPipe setup
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Webcam not found")
    exit()

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=2)
mp_draw = mp.solutions.drawing_utils

cv2.namedWindow("Gesture Music System", cv2.WINDOW_NORMAL)
cv2.startWindowThread()

# State
mode = "drums"
drums_map = {0: "kick", 1: "snare", 2: "hihat_closed", 3: "hihat_open"}
last_played_drum = None
last_note_played = -1
last_played_chord = None
last_played_volume = -1
fade_duration = 300
last_fade_time = 0
fade_cooldown = 0.4
recording = False
recorded_sequence = []
running = True

chords_by_fingers = {1: "C", 2: "A", 3: "D"}

def count_extended_fingers(hand_landmarks):
    tips = [8, 12, 16, 20]
    count = 0
    for tip_id in tips:
        tip = hand_landmarks.landmark[tip_id]
        pip = hand_landmarks.landmark[tip_id - 2]
        if tip.y < pip.y:
            count += 1
    return count + (1 if hand_landmarks.landmark[4].x < hand_landmarks.landmark[3].x else 0)

def contains_any(phrase, keywords):
    return any(k in phrase for k in keywords)

# 🎙️ Background voice thread
def continuous_command_listener():
    global mode, recording, recorded_sequence, running
    r = sr.Recognizer()
    while running:
        with sr.Microphone() as source:
            try:
                print("🎙️ Listening for voice command...")
                audio = r.listen(source, timeout=5)
                command = r.recognize_google(audio).lower().strip()
                print("🗣️ Heard:", command)
                speak(f"You said: {command}")
                print("🔍 Evaluating command:", command)

                if contains_any(command, ["piano", "switch to piano", "change to piano", "piano mode"]):
                    mode = "piano"
                    speak("Switched to Piano mode")

                elif contains_any(command, ["drum", "drums", "switch to drums", "change to drums"]):
                    mode = "drums"
                    speak("Switched to Drums mode")

                elif contains_any(command, ["shutdown music"]):
                    print("🛑 Exit triggered by voice:", command)
                    speak("Shutting down the music system")
                    running = False
                    break

                elif contains_any(command, ["start recording", "let's start", "begin recording"]):
                    recording = True
                    recorded_sequence.clear()
                    speak("Recording started")

                elif contains_any(command, ["stop recording", "end recording"]):
                    recording = False
                    speak("Recording stopped")

                elif contains_any(command, ["play back", "play recording", "replay"]):
                    speak("Playing recorded sequence")
                    for entry in recorded_sequence:
                        t, m, item = entry
                        print("🔁 Replaying:", item)
                        if m == "drums" and item in DRUM_SOUNDS:
                            DRUM_SOUNDS[item].set_volume(1.0)
                            DRUM_SOUNDS[item].play()
                        elif m == "piano":
                            if item in NOTE_SOUNDS:
                                NOTE_SOUNDS[item].set_volume(1.0)
                                NOTE_SOUNDS[item].play()
                            elif item in CHORD_SOUNDS:
                                CHORD_SOUNDS[item].set_volume(1.0)
                                CHORD_SOUNDS[item].play()
                        time.sleep(0.5)
            except Exception as e:
                print("⚠️ Voice error:", e)

threading.Thread(target=continuous_command_listener, daemon=True).start()

# Main loop
while running:
    success, frame = cap.read()
    if not success:
        print("⚠️ Frame capture failed.")
        continue

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    timestamp = time.time()
    current_chord = None
    left_hand_y = None
    right_hand_y = None
    right_finger_count = -1
    current_layer = None

    if results.multi_hand_landmarks:
        for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            hand_label = results.multi_handedness[idx].classification[0].label
            wrist_y = hand_landmarks.landmark[0].y * h
            finger_count = count_extended_fingers(hand_landmarks)

            if hand_label == "Left" and mode == "piano":
                chord_name = chords_by_fingers.get(finger_count)
                if chord_name:
                    current_chord = chord_name
                    left_hand_y = wrist_y
            elif hand_label == "Right":
                right_finger_count = finger_count
                right_hand_y = wrist_y

            if mode == "drums" and finger_count in drums_map:
                drum_name = drums_map[finger_count]
                if drum_name != last_played_drum:
                    print("🥁 Playing drum:", drum_name)
                    DRUM_SOUNDS[drum_name].set_volume(1.0)
                    DRUM_SOUNDS[drum_name].play()
                    last_played_drum = drum_name
                    if recording:
                        recorded_sequence.append((timestamp, mode, drum_name))

    # 🎹 Play chord if left hand is valid
    if mode == "piano" and current_chord and left_hand_y is not None:
        if left_hand_y > 0.75 * h:
            volume = 0.3
            current_layer = "Light"
        elif left_hand_y > 0.5 * h:
            volume = 0.6
            current_layer = "Mid"
        else:
            volume = 1.0
            current_layer = "Full"

        now = time.time()
        if current_chord != last_played_chord or volume != last_played_volume:
            if now - last_fade_time > fade_cooldown:
                for sound in CHORD_SOUNDS.values():
                    sound.fadeout(fade_duration)
                last_fade_time = now

            print("🎹 Playing chord:", current_chord)
            chord_sound = CHORD_SOUNDS[current_chord]
            fadein(chord_sound, volume, duration=fade_duration)
            last_played_chord = current_chord
            last_played_volume = volume

    # 🛑 Fade out chord if hand disappears or invalid
    elif mode == "piano":
        now = time.time()
        if now - last_fade_time > fade_cooldown:
            for sound in CHORD_SOUNDS.values():
                sound.fadeout(fade_duration)
            last_played_chord = None
            last_played_volume = -1
            last_fade_time = now

    # 🎵 Right hand notes
    if mode == "piano" and right_finger_count in range(6) and right_hand_y is not None:
        selected_notes = sharp_notes if right_hand_y < h / 2 else base_notes
        note_name = selected_notes.get(right_finger_count)
        if note_name and note_name in NOTE_SOUNDS:
            if right_finger_count != last_note_played:
                print("🎵 Playing note:", note_name)
                NOTE_SOUNDS[note_name].set_volume(1.0)
                NOTE_SOUNDS[note_name].play()
                last_note_played = right_finger_count
                if recording:
                    recorded_sequence.append((timestamp, mode, note_name))

    # UI
    if mode == "piano" and (current_chord or current_layer):
        cv2.rectangle(frame, (w // 2 - 180, h - 100), (w // 2 + 180, h - 40), (40, 40, 40), -1)
        hud_text = f"Chord: {current_chord or '-'}  |  Layer: {current_layer or '-'}"
        cv2.putText(frame, hud_text, (w // 2 - 170, h - 55), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    cv2.putText(frame, f"Mode: {mode.title()} | {'Recording...' if recording else 'Say a command'}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.imshow("Gesture Music System", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        running = False

cap.release()
cv2.destroyAllWindows()
