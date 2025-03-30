from google import genai

# 🔑 Replace with your actual Gemini API key
client = genai.Client(
    api_key="AIzaSyAcgTUuHjWB0Mv5ruzr0u8NCsNaq1E43Dc")

gesture_context = """
You are helping a user create or learn music using hand gestures.
🎹 Piano:
- Right Hand (Melody):
  0 fingers → C4
  1 finger  → D4
  2 fingers → E4
  3 fingers → F4
  4 fingers → G4
  5 fingers → A4
- Left Hand (Chords):
  1 → C Major (C, E, G)
  2 → D Minor (D, F, A)
  3 → F Major (F, A, C)
  4 → G Major (G, B, D)
  5 → A Minor (A, C, E)

🥁 Drums:
- 0 fingers → Kick Drum
- 1 finger  → Snare Drum
- 2 fingers → Closed Hi-Hat
- 3 fingers → Open Hi-Hat
- 4 fingers → Low Tom
- 5 fingers → Crash Cymbal

🎸 Guitar:
- Left Hand (Chord Notes):
  0 → E3
  1 → G3
  2 → A3
  3 → B3
  4 → C4
  5 → E4
- Right Hand = Strumming (activates the chord from left hand)

🎷 Saxophone (Tenor feel):
- 1 → A3
- 2 → C4
- 3 → D4
- 4 → E4
- 5 → G4

🎻 Violin:
- 1 → A3
- 2 → C4
- 3 → E4
- 4 → G4
- 5 → G5

🎶 Flute:
- 0 → C4
- 1 → D4
- 2 → E4
- 3 → F4
- 4 → G4
- 5 → A4

General Gesture Rules:
- Right hand = melody or drum sound trigger
- Left hand:
  - Fist = minor chord (if applicable)
  - Open palm = major chord (if applicable)
  - Raised = octave up
  - Lowered = octave down

In "teach" mode, explain concepts with gesture examples.  
In "create" mode, suggest musical ideas using gestures directly.
"""

# 🎯 Main function to ask Gemini
def ask_gemini(prompt, mode="create"):
    prefix = "You are a helpful music instructor." if mode == "teach" else "You are a music producer helping a user make music with gestures."
    full_prompt = prefix + "\n\n" + gesture_context + "\n\n" + prompt

    try:
        # ✅ Get the model object from the client
        model = client.get_model("models/gemini-1.5-pro-latest")  # Or gemini-1.5-flash

        # ✅ Use generate_content from the model (not client!)
        response = model.generate_content(contents=[full_prompt])
        return response.text.strip()
    except Exception as e:
        return f"❌ Gemini error: {e}"