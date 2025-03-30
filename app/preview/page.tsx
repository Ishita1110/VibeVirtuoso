"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  AudioWaveformIcon as Waveform,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  ArrowLeft,
} from "lucide-react"

// Mock tracks data - in a real app, this would come from your database
const mockTracks = [
  {
    id: "1",
    title: "Summer Vibes",
    artist: "DJ Codewave",
    duration: "3:45",
    genre: "Electronic",
    color: "from-blue-400 to-purple-500",
  },
  {
    id: "2",
    title: "Midnight Jazz",
    artist: "Jazz Ensemble",
    duration: "4:12",
    genre: "Jazz",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "3",
    title: "Acoustic Dreams",
    artist: "Guitar Master",
    duration: "2:58",
    genre: "Acoustic",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "4",
    title: "Urban Beats",
    artist: "Beat Maker",
    duration: "3:21",
    genre: "Hip Hop",
    color: "from-red-400 to-pink-500",
  },
  {
    id: "5",
    title: "Classical Fusion",
    artist: "Orchestra Plus",
    duration: "5:07",
    genre: "Classical",
    color: "from-indigo-400 to-violet-500",
  },
]

export default function PreviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const trackId = searchParams.get("id") || "1"

  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Find the track based on ID
  const track = mockTracks.find((t) => t.id === trackId) || mockTracks[0]

  // Initialize dark mode based on user preference
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(prefersDark)

    if (prefersDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  // Animation for waveform visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)

    const drawSmoothWaves = () => {
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, rect.width, 0)
      gradient.addColorStop(0, "#f472b6") // pink-400
      gradient.addColorStop(0.5, "#a855f7") // purple-500
      gradient.addColorStop(1, "#6366f1") // indigo-500

      const centerY = rect.height / 2

      // Draw the center line
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(rect.width, centerY)
      ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
      ctx.stroke()

      // Parameters for wave complexity
      const frequency1 = 0.02
      const frequency2 = 0.01
      const frequency3 = 0.005

      const amplitude1 = rect.height * 0.15
      const amplitude2 = rect.height * 0.1
      const amplitude3 = rect.height * 0.05

      // Add more complexity when playing
      const playingMultiplier = isPlaying ? 1.5 : 1

      // Use requestAnimationFrame timestamp for smoother animation
      const now = Date.now() / 1000
      const animationSpeed = isPlaying ? 2.0 : 0.5
      const animationPhase = now * animationSpeed

      // Draw the primary smooth wave (top)
      ctx.beginPath()
      ctx.moveTo(0, centerY)

      for (let x = 0; x <= rect.width; x += 1) {
        // Combine multiple sine waves for a more interesting but still smooth pattern
        // Use animationPhase for smoother animation
        const y1 = Math.sin(x * frequency1 + animationPhase) * amplitude1 * playingMultiplier
        const y2 = Math.sin(x * frequency2 + animationPhase * 0.7) * amplitude2 * playingMultiplier
        const y3 = Math.sin(x * frequency3 + animationPhase * 1.3) * amplitude3 * playingMultiplier

        const y = centerY - (y1 + y2 + y3) // Negative to go above center line

        ctx.lineTo(x, y)
      }

      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw the mirrored smooth wave (bottom)
      ctx.beginPath()
      ctx.moveTo(0, centerY)

      for (let x = 0; x <= rect.width; x += 1) {
        // Same waves but inverted to go below center line
        const y1 = Math.sin(x * frequency1 + animationPhase) * amplitude1 * playingMultiplier
        const y2 = Math.sin(x * frequency2 + animationPhase * 0.7) * amplitude2 * playingMultiplier
        const y3 = Math.sin(x * frequency3 + animationPhase * 1.3) * amplitude3 * playingMultiplier

        const y = centerY + (y1 + y2 + y3) // Positive to go below center line

        ctx.lineTo(x, y)
      }

      ctx.strokeStyle = "rgba(164, 94, 229, 0.5)" // Semi-transparent purple
      ctx.lineWidth = 3
      ctx.stroke()

      // Continue the animation loop
      animationRef.current = requestAnimationFrame(drawSmoothWaves)
    }

    drawSmoothWaves()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, progress, isDarkMode])

  // Simulate progress when playing - using requestAnimationFrame for smoother updates
  useEffect(() => {
    let lastTime = 0
    let animationFrameId: number

    const updateProgress = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp

      // Calculate time elapsed since last frame
      const elapsed = timestamp - lastTime

      // Update progress based on elapsed time (smoother than fixed increments)
      if (isPlaying) {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          // Calculate smooth increment based on elapsed time
          // 3 minutes (180 seconds) should take 100% progress
          // So we increment by elapsed/1000 * (100/180) percent
          return prev + (elapsed / 1000) * (100 / 180)
        })
      }

      lastTime = timestamp
      animationFrameId = requestAnimationFrame(updateProgress)
    }

    if (isPlaying) {
      lastTime = 0
      animationFrameId = requestAnimationFrame(updateProgress)
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isPlaying])

  const togglePlay = () => setIsPlaying(!isPlaying)
  const toggleMute = () => setIsMuted(!isMuted)

  const goBack = () => {
    router.back()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Preview Header */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Waveform className="h-6 w-6" />
              <span className="font-bold text-xl">Track Preview</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="text-white hover:bg-white/10 rounded-full h-8 w-8"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <Card className="bg-black/30 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              {/* Track Info */}
              <div className="text-center mb-6">
                <div
                  className={`h-24 mb-6 rounded-lg bg-gradient-to-r ${track.color} flex items-center justify-center`}
                >
                  <h2 className="text-3xl font-bold text-white">{track.title}</h2>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300">{track.artist}</p>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{track.genre}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{track.duration}</span>
                </div>
              </div>

              {/* Waveform Visualization */}
              <div className="h-48 mb-6">
                <canvas ref={canvasRef} className="w-full h-full rounded-md" />
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-gray-700 dark:text-gray-300">{formatTime(progress)}</span>
                <Slider
                  value={[progress]}
                  max={100}
                  step={0.1}
                  onValueChange={(value) => setProgress(value[0])}
                  className="flex-1"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{track.duration}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-10 w-10"
                  onClick={() => setProgress(0)}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-purple-600 text-white hover:bg-purple-700 rounded-full h-14 w-14 flex items-center justify-center"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-10 w-10"
                  onClick={() => setProgress(100)}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 h-8 w-8"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={(value) => {
                    setVolume(value[0])
                    if (value[0] > 0 && isMuted) setIsMuted(false)
                  }}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={goBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => router.push(`/editor?id=${trackId}`)}
              className="bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
            >
              <Waveform className="h-4 w-4" />
              Open in Editor
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500"> VibeVirtuoso. All rights reserved.</p>
        </div>
      </footer>

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes formatTime {
          from { opacity: 0.8; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// Helper function to format time from percentage to MM:SS
function formatTime(percentage: number) {
  // Assuming a 3-minute track for simplicity
  const totalSeconds = 180 * (percentage / 100)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
}

