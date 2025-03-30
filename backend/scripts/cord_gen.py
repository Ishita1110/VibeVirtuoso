from pydub import AudioSegment
import os

# Folder where original chord files live
input_folder = "../sounds/chords_synth"
output_folder = "../sounds/chords_synth"  # same for now

# Chords to process
chords = ["C_major", "D_major", "A_major"]

for chord in chords:
    try:
        input_path = os.path.join(input_folder, f"{chord}.wav")
        print(f"🎧 Processing {input_path}")
        sound = AudioSegment.from_wav(input_path)

        # Chop off "_major" for shorter filenames
        short = chord.split("_")[0]  # e.g., "C"

        # Create 3 variants
        light = sound - 10
        mid = sound
        full = sound + 6

        # Export with unique names
        light.export(os.path.join(output_folder, f"{short}_light.wav"), format="wav")
        mid.export(os.path.join(output_folder, f"{short}_mid.wav"), format="wav")
        full.export(os.path.join(output_folder, f"{short}_full.wav"), format="wav")

    except Exception as e:
        print(f"⚠️ Error processing {chord}: {e}")

print("✅ All chords processed with 3 layers each.")
