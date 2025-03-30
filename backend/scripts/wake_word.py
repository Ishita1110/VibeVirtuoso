import speech_recognition as sr

r = sr.Recognizer()
with sr.Microphone() as source:
    print("Listening for wake word...")
    while True:
        try:
            audio = r.listen(source, timeout=5)
            text = r.recognize_google(audio).lower()
            print("You said:", text)
            if "music" in text and "mode" in text:
                print("✅ Wake word detected!")
        except Exception as e:
            print("Error:", e)
