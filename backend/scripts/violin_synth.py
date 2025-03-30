# violin_synth.py

import fluidsynth

class ViolinSynth:
    def __init__(self, sf2_path="../sounds/FluidR3_GM.sf2"):
        self.fs = fluidsynth.Synth()
        self.fs.start(driver="coreaudio")
        self.sfid = self.fs.sfload(sf2_path)
        self.fs.program_select(0, self.sfid, 0, 40)  # 73 = Flute (GM 74)
        self.last_note = None

    def play_note(self, midi_note, velocity=120):
        if self.last_note is not None:
            self.fs.noteoff(0, self.last_note)
        self.fs.noteon(0, midi_note, velocity)
        self.last_note = midi_note

    def stop(self):
        if self.last_note is not None:
            self.fs.noteoff(0, self.last_note)
            self.last_note = None

    def delete(self):
        self.stop()
        self.fs.delete()
