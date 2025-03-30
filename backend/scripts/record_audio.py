import sys
import sounddevice as sd
import soundfile as sf

filepath = sys.argv[1] if len(sys.argv) > 1 else "output.wav"

samplerate = 44100
channels = 1

print(f"🔴 Recording to {filepath}")

with sf.SoundFile(filepath, mode='x', samplerate=samplerate, channels=channels) as file:
    with sd.InputStream(samplerate=samplerate, channels=channels, dtype='float32') as stream:
        while True:
            data, _ = stream.read(1024)
            file.write(data)
