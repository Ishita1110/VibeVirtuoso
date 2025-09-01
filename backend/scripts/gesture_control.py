# import fluidsynth  # DISABLED for testing

# Mock audio initialization
# fs = fluidsynth.Synth()
# fs.start()
# sfid = fs.sfload("./sounds/FluidR3_GM.sf2")
# fs.program_select(0, sfid, 0, 0)

print("Audio system disabled for testing - gestures will be detected but no sound will play")

def handle_gesture(gesture, instrument):
    gesture_map = {
        "fist": 36,
        "index": 38,
        "victory": 42,
        "open": 46
    }

    note = gesture_map.get(gesture)
    if note:
        # fs.noteon(0, note, 120)  # DISABLED for testing
        print(f"Would play note {note} for gesture '{gesture}' on {instrument}")
        return f"Detected {gesture} gesture for {instrument} (note {note})"
    else:
        print(f"Unknown gesture: {gesture}")
        return f"Unknown gesture '{gesture}' for {instrument}"
