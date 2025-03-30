import fluidsynth

class PianoSynth:
    def __init__(self, sf2_path="../sounds/FluidR3_GM.sf2", program=0):  # Acoustic Grand Piano
        self.fs = fluidsynth.Synth()
        self.fs.start(driver="coreaudio")
        self.sfid = self.fs.sfload(sf2_path)
        self.fs.program_select(0, self.sfid, 0, program)
        self.notes_playing = set()

    def play_note(self, midi_note, velocity=110):
        if midi_note not in self.notes_playing:
            self.fs.noteon(0, midi_note, velocity)
            self.notes_playing.add(midi_note)

    def play_chord(self, notes, velocity=100):
        self.stop_all()
        for note in notes:
            self.play_note(note, velocity)

    def stop_all(self):
        for note in list(self.notes_playing):
            self.fs.noteoff(0, note)
        self.notes_playing.clear()

    def delete(self):
        self.stop_all()
        self.fs.delete()
