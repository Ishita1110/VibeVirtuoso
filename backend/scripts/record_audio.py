# scripts/record_audio.py

import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write
import sys
import os
import time

samplerate = 44100  # 44.1 kHz
channels = 1
duration = 30  # Record for 30 seconds max
filename = sys.argv[1] if len(sys.argv) > 1 else "output.wav"

os.makedirs(os.path.dirname(filename), exist_ok=True)
print("🎙️ Recording started...")

try:
    frames = []
    start = time.time()

    def callback(indata, frames_count, time_info, status):
        frames.append(indata.copy())
        if time.time() - start > duration:
            raise sd.CallbackStop()

    with sd.InputStream(samplerate=samplerate, channels=channels, callback=callback):
        sd.sleep(int(duration * 1000))  # Keep alive

    audio = np.concatenate(frames, axis=0)
    write(filename, samplerate, audio)
    print(f"✅ Recording saved to: {filename}")

except Exception as e:
    print(f"❌ Recording failed: {e}")
