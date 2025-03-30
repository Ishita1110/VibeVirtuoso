import fluidsynth

sf2_path = "/Users/saatvikpradhan/Documents/GitHub/Finger-Bangers/backend/gesture_music/sounds/DCs_Mellotron_Flute.SF2"


fs = fluidsynth.Synth()
fs.start(driver="coreaudio")

# Load the SF2 file
sfid = fs.sfload(sf2_path)
fs.program_select(0, sfid, 0, 0)

print("🔍 Checking presets...\n")

# Check all possible presets in all banks
for bank in range(128):  # banks can go up to 128
    for preset in range(128):
        preset_exists = fs.program_select(0, sfid, bank, preset)
        if preset_exists == 0:
            continue  # Skip invalid ones
        print(f"✅ Found preset at Bank {bank}, Program {preset}")

fs.delete()