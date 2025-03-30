from pydub import AudioSegment
import os

input_folder = "../sounds/notes_piano"  # adjust if needed
output_folder = "../sounds/notes_wav_piano"
os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(input_folder):
    if filename.endswith(".mp3"):
        mp3_path = os.path.join(input_folder, filename)
        wav_name = filename.replace(".mp3", ".wav")
        wav_path = os.path.join(output_folder, wav_name)

        print(f"Converting {filename} -> {wav_name}")
        sound = AudioSegment.from_mp3(mp3_path)
        sound.export(wav_path, format="wav")

print("✅ All MP3s converted to WAV!")
