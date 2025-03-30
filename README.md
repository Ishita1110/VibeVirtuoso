# 🎶 VibeVirtuoso

**VibeVirtuoso** is a gesture-controlled virtual instrument system that lets you play music with your hands and voice. It integrates with **Google Gemini AI** to suggest creative musical ideas, helps you record, and even generates AI-enhanced sound samples.

🌐 Live Demo: [oops-ididitagain-iplayedwithsomecode-imesseditagain.co](http://oops-ididitagain-iplayedwithsomecode-imesseditagain.co)

---

## 🧠 Features

- 🎸 Play instruments like piano, flute, violin, drums, saxophone, and guitar using just your hands
- 🎙️ Voice commands to switch instruments, get Gemini AI help, and control modes
- 🧠 Gemini integration provides suggestions and chord ideas
- 🔴 Real-time recording of each session
- 📊 Dashboard to preview and manage your compositions
- 🌐 Deployed frontend on Vercel with custom domain via GoDaddy

---

## 📦 Tech Stack

| Tool / Library     | Purpose                              |
|--------------------|--------------------------------------|
| Next.js            | Frontend (React + Tailwind)          |
| Python             | Backend gesture & voice engine       |
| MediaPipe + OpenCV | Hand gesture recognition             |
| SpeechRecognition  | Voice control                        |
| Google Gemini API  | AI suggestions and music guidance    |
| MongoDB            | Session + audio metadata storage     |
| FluidSynth         | Synth audio playback                 |
| Vercel             | Frontend hosting                     |

---

## 🚀 Getting Started

### 1. Clone the repository
git clone https://github.com/your-username/vibevirtuoso.git
cd vibevirtuoso

### 2. Running the Backend (Python)
cd backend
python -m venv env
source env/bin/activate        # Mac/Linux
env\Scripts\activate           # Windows

pip install -r requirements.txt


####Create a .env file in backend/ with the following:
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key

#### Run the Backend Server
uvicorn backend:app --reload





