# voice_control.py
import speech_recognition as sr
import threading

class VoiceCommandListener:
    def __init__(self, on_command_callback):
        self.running = True
        self.on_command_callback = on_command_callback
        self.thread = threading.Thread(target=self._listen_loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.running = False

    def _listen_loop(self):
        r = sr.Recognizer()
        while self.running:
            with sr.Microphone() as source:
                try:
                    print("🎙️ Listening...")
                    audio = r.listen(source, timeout=5)
                    command = r.recognize_google(audio).lower().strip()
                    self.on_command_callback(command)
                except Exception as e:
                    print("⚠️", e)
