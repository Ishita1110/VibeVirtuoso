import cv2
import mediapipe as mp
import pygame
import time
import threading
import speech_recognition as sr
import pyttsx3

# 🔊 Text-to-speech
engine = pyttsx3.init()
def speak(text):
    print("🔈", text)
    engine.say(text)
    engine.runAndWait()

# 🎵 Initialize pygame mixer
pygame.init()

# 🥁 Load drum sounds
DRUM_SOUNDS = {
    "kick": pygame.mixer.Sound("./sounds/drums/kick.wav"),
    "snare": pygame.mixer.Sound("./sounds/drums/snare.wav"),
    "hihat_closed": pygame.mixer.Sound("./sounds/drums/hihat.wav"),
    "hihat_open": pygame.mixer.Sound("./sounds/drums/hihat_open.wav"),
}

# 🎹 Load chord synth sounds
CHORD_SOUNDS = {
    "C": pygame.mixer.Sound("./sounds/chords_synth/C_major.wav"),
    "A": pygame.mixer.Sound("./sounds/chords_synth/A_major.wav"),
    "D": pygame.mixer.Sound("./sounds/chords_synth/D_major.wav")
}

# 🎹 Load piano note sounds
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
NOTE_SOUNDS = {
    note: pygame.mixer.Sound(f"./sounds/notes_wav_piano/{note}.wav") for note in all_notes
}

# ✋ MediaPipe setup
cap = cv2.VideoCapture(0)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, max_num_hands=2)
mp_draw = mp.solutions.drawing_utils

mode = "drums"
drums_map = {0: "kick", 1: "snare", 2: "hihat_closed", 3: "hihat_open"}
last_played_drum = None
last_note_played = -1
last_played_chord = None
last_played_volume = -1
is_chord_playing = False
fade_duration = 300
last_fade_time = 0
fade_cooldown = 0.4
recording = False
recorded_sequence = []
voice_thread_active = False
wake_word = "hey music"
running = True

chords_by_fingers = {
    1: "C",
    2: "A",
    3: "D"
}

def count_extended_fingers(hand_landmarks):
    tips = [8, 12, 16, 20]
    count = 0
    for tip_id in tips:
        tip = hand_landmarks.landmark[tip_id]
        pip = hand_landmarks.landmark[tip_id - 2]
        if tip.y < pip.y:
            count += 1
    return count + (1 if hand_landmarks.landmark[4].x < hand_landmarks.landmark[3].x else 0)

def handle_voice_command():
    global mode, recording, recorded_sequence, running
    r = sr.Recognizer()
    with sr.Microphone() as source:
        speak("Waiting for your command...")
        try:
            audio = r.listen(source, timeout=5)
            command = r.recognize_google(audio).lower()
            print("🗣️ You said:", command)

            if "piano" in command:
                mode = "piano"
                speak("Switched to Piano mode")
            elif "drum" in command:
                mode = "drums"
                speak("Switched to Drums mode")
            elif "quit" in command or "exit" in command:
                speak("Exiting the music system")
                running = False
            elif "start recording" in command or "let's start" in command:
                recording = True
                recorded_sequence.clear()
                speak("Recording started")
            elif "stop recording" in command:
                recording = False
                speak("Recording stopped")
            elif "play back" in command or "play recording" in command:
                speak("Playing your recorded sequence")
                for entry in recorded_sequence:
                    t, m, item = entry
                    if m == "drums" and item in DRUM_SOUNDS:
                        DRUM_SOUNDS[item].play()
                    elif m == "piano":
                        if item in NOTE_SOUNDS:
                            NOTE_SOUNDS[item].play()
                        elif item in CHORD_SOUNDS:
                            CHORD_SOUNDS[item].play()
                    time.sleep(0.5)
        except Exception as e:
            print("❌ Voice command error:", e)

def wake_word_listener():
    global voice_thread_active
    r = sr.Recognizer()
    while running:
        if not voice_thread_active:
            with sr.Microphone() as source:
                try:
                    print("👂 Listening for wake word... ('hey music')")
                    audio = r.listen(source, timeout=5)
                    trigger = r.recognize_google(audio).lower()
                    if wake_word in trigger:
                        voice_thread_active = True
                        handle_voice_command()
                        voice_thread_active = False
                except Exception as e:
                    continue

threading.Thread(target=wake_word_listener, daemon=True).start()

while running:
    success, frame = cap.read()
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

    left_hand_index = -1
    right_hand_index = -1

    if results.multi_hand_landmarks:
        for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            hand_label = results.multi_handedness[idx].classification[0].label
            wrist_y = hand_landmarks.landmark[0].y * h
            finger_count = count_extended_fingers(hand_landmarks)

            if hand_label == "Left":
                left_hand_index = idx
                if mode == "piano":
                    chord_name = chords_by_fingers.get(finger_count)
                    if chord_name:
                        current_chord = chord_name
                        left_hand_y = wrist_y
            elif hand_label == "Right":
                right_hand_index = idx
                right_finger_count = finger_count
                right_hand_y = wrist_y

            elif mode == "drums":
                if finger_count in drums_map:
                    drum_name = drums_map[finger_count]
                    if drum_name != last_played_drum:
                        DRUM_SOUNDS[drum_name].play()
                        last_played_drum = drum_name
                        if recording:
                            recorded_sequence.append((timestamp, mode, drum_name))

    if mode == "piano" and current_chord and left_hand_y is not None:
        if left_hand_y > 2 * h / 3:
            volume = 0.3
            current_layer = "Light"
        elif left_hand_y > h / 3:
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
            chord_sound = CHORD_SOUNDS[current_chord]
            chord_sound.set_volume(volume)
            chord_sound.play(loops=-1)
            last_played_chord = current_chord
            last_played_volume = volume
            is_chord_playing = True

    if mode == "piano" and right_hand_index != -1 and right_finger_count >= 0 and right_finger_count <= 5 and right_hand_y is not None:
        now = time.time()
        selected_notes = sharp_notes if right_hand_y < h / 2 else base_notes
        note_name = selected_notes.get(right_finger_count)
        if note_name and note_name in NOTE_SOUNDS:
            if right_finger_count != last_note_played:
                NOTE_SOUNDS[note_name].play()
                last_note_played = right_finger_count
                if recording:
                    recorded_sequence.append((timestamp, mode, note_name))

    if mode == "piano" and (current_chord or current_layer):
        cv2.rectangle(frame, (w // 2 - 180, h - 100), (w // 2 + 180, h - 40), (40, 40, 40), -1)
        hud_text = f"Chord: {current_chord or '-'}  |  Layer: {current_layer or '-'}"
        cv2.putText(frame, hud_text, (w // 2 - 170, h - 55), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    cv2.putText(frame, f"Mode: {mode.title()} | {'Recording...' if recording else 'Say hey music'}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.imshow("Gesture Music System", frame)

    if cv2.getWindowProperty("Gesture Music System", cv2.WND_PROP_VISIBLE) < 1:
        running = False

cap.release()
cv2.destroyAllWindows()
