import fluidsynth

fs = fluidsynth.Synth()
fs.start()

sfid = fs.sfload("./sounds/FluidR3_GM.sf2")  # or your preferred .sf2 path
fs.program_select(0, sfid, 0, 0)

def handle_gesture(gesture, instrument):
    gesture_map = {
        "fist": 36,
        "index": 38,
        "victory": 42,
        "open": 46
    }

    note = gesture_map.get(gesture)
    if note:
        fs.noteon(0, note, 120)
        return f"Played {note} on {instrument}"
