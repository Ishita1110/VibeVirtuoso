import fluidsynth

class GuitarSynth:
    def __init__(self, sf2_path="FluidR3_GM.sf2", program=25):  # Steel acoustic
        self.fs = fluidsynth.Synth()
        self.fs.start(driver="coreaudio")
        self.sfid = self.fs.sfload(sf2_path)
        self.fs.program_select(0, self.sfid, 0, program)
        self.current_note = None

    def strum(self, midi_note, velocity=100):
        print(f"🎸 STRUM → MIDI note: {midi_note}")
        self.fs.noteon(0, midi_note, velocity)

    def stop_note(self, midi_note):
        self.fs.noteoff(0, midi_note)

    def delete(self):
        self.fs.delete()
