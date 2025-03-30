"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AudioWaveformIcon as Waveform,
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Save,
  Download,
  Undo,
  Redo,
  Scissors,
  Copy,
  Clipboard,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  Hand,
  Mic,
  Music,
  Settings,
  Info,
  Maximize,
} from "lucide-react"
import { getAuthState } from "@/lib/auth"

// Mock user data
const mockUser = {
  name: "Alex Johnson",
  email: "alex@example.com",
}

// Mock audio tracks data
const mockTracks = [
  {
    id: 1,
    name: "Piano",
    color: "bg-blue-500",
    volume: 80,
    pan: 0,
    muted: false,
    solo: false,
    clips: [
      { id: 1, start: 0, length: 8, name: "Piano Intro" },
      { id: 2, start: 12, length: 16, name: "Piano Melody" },
    ],
  },
  {
    id: 2,
    name: "Drums",
    color: "bg-red-500",
    volume: 70,
    pan: 0,
    muted: false,
    solo: false,
    clips: [{ id: 3, start: 4, length: 24, name: "Beat Pattern" }],
  },
  {
    id: 3,
    name: "Bass",
    color: "bg-purple-500",
    volume: 75,
    pan: -10,
    muted: false,
    solo: false,
    clips: [{ id: 4, start: 8, length: 16, name: "Bass Line" }],
  },
  {
    id: 4,
    name: "Synth",
    color: "bg-green-500",
    volume: 65,
    pan: 15,
    muted: false,
    solo: false,
    clips: [{ id: 5, start: 16, length: 12, name: "Synth Pad" }],
  },
]

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const compositionId = searchParams.get("id")
  const isEditing = !!compositionId

  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [tracks, setTracks] = useState(mockTracks)
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null)
  const [selectedClip, setSelectedClip] = useState<number | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(true)
  const [isGestureRecognitionActive, setIsGestureRecognitionActive] = useState(true)
  const [showGestureGuide, setShowGestureGuide] = useState(false) // Set to false to hide gesture guide
  const [activeGesture, setActiveGesture] = useState<string | null>(null)
  const [isOpenCVLoaded, setIsOpenCVLoaded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // Timeline settings
  const secondWidth = 40 * zoomLevel // pixels per second
  const totalDuration = 60 // seconds
  const timelineWidth = totalDuration * secondWidth

  // Initialize dark mode based on user preference
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(prefersDark)

    if (prefersDark && typeof document !== "undefined") {
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Check if user is authenticated
  useEffect(() => {
    if (!getAuthState()) {
      router.push("/signin")
    }
  }, [router])

  // Add a useEffect to load composition data if editing
  useEffect(() => {
    if (isEditing && compositionId) {
      // In a real app, you would fetch the composition data from your API
      console.log(`Loading composition with ID: ${compositionId}`)

      // For now, we'll just use mock data
      // In a real app, you would set the tracks state with the fetched data
    }
  }, [isEditing, compositionId])

  // Add a placeholder for OpenCV integration
  const initializeOpenCV = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    // This is where you would initialize OpenCV and set up your hand gesture detection
    // For example:
    // 1. Load OpenCV.js
    // 2. Set up video capture
    // 3. Initialize your hand gesture detection models
    // 4. Start the processing loop

    console.log("OpenCV integration placeholder - ready for your implementation")
    setIsOpenCVLoaded(true)

    // Your OpenCV code would go here
  }, [])

  // Update the camera initialization to include OpenCV
  useEffect(() => {
    if (isCameraActive && videoRef.current) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
          })

          if (videoRef.current) {
            videoRef.current.srcObject = stream

            // Once video is ready, initialize OpenCV
            videoRef.current.onloadedmetadata = () => {
              initializeOpenCV()
            }
          }
        } catch (err) {
          console.error("Error accessing camera:", err)
          setIsCameraActive(false)
        }
      }

      startCamera()

      return () => {
        // Clean up camera stream when component unmounts
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream
          const tracks = stream.getTracks()
          tracks.forEach((track) => track.stop())
        }
      }
    }
  }, [isCameraActive, initializeOpenCV])

  // Simulate playback when playing
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 0.1
        })
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isPlaying, totalDuration])

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark")
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      editorRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Toggle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  // Reset playback to beginning
  const resetPlayback = () => {
    setCurrentTime(0)
    setIsPlaying(false)
  }

  // Handle track volume change
  const handleVolumeChange = (trackId: number, value: number) => {
    setTracks(tracks.map((track) => (track.id === trackId ? { ...track, volume: value } : track)))
  }

  // Handle track mute toggle
  const handleMuteToggle = (trackId: number) => {
    setTracks(tracks.map((track) => (track.id === trackId ? { ...track, muted: !track.muted } : track)))
  }

  // Handle track solo toggle
  const handleSoloToggle = (trackId: number) => {
    setTracks(tracks.map((track) => (track.id === trackId ? { ...track, solo: !track.solo } : track)))
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate position on timeline
  const timeToPosition = (time: number) => {
    return time * secondWidth
  }

  // Calculate clip width
  const clipWidth = (length: number) => {
    return length * secondWidth
  }

  return (
    <div
      ref={editorRef}
      className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 overflow-hidden"
    >
      {/* Simplified Header */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back to Dashboard */}
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 flex items-center gap-2"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Button>

            <div className="h-6 w-px bg-white/20 mx-2"></div>

            {/* Title */}
            <div className="flex items-center gap-2">
              <Waveform className="h-6 w-6" />
              <span className="font-bold text-xl">{isEditing ? "Edit Composition" : "Create New Composition"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Save */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Save className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save Project</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Download */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Download className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export Audio</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Undo */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Undo className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Redo */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Redo className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Fullscreen */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle Fullscreen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Main Content - Split into two sections */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Half - Gesture Capture */}
        <div className="h-1/2 bg-black relative overflow-hidden">
          {isCameraActive ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

              {/* Gesture Recognition Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <canvas ref={canvasRef} className="w-full h-full" />

                {/* Active Gesture Indicator */}
                {activeGesture && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600/80 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Hand className="h-5 w-5" />
                      <span>{activeGesture} detected</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="absolute top-4 left-4 flex gap-2">
                {isOpenCVLoaded ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-green-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <span className="mr-1">OpenCV Active</span>
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Hand gesture detection is active</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-yellow-500/80 text-white text-xs px-2 py-1 rounded-full">
                          OpenCV Loading...
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Hand gesture detection is initializing</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 rounded-full"
                        onClick={() => setIsGestureRecognitionActive(!isGestureRecognitionActive)}
                      >
                        <Hand className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isGestureRecognitionActive ? "Disable" : "Enable"} Gesture Recognition</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 rounded-full"
                        onClick={() => setIsCameraActive(false)}
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Switch to Audio Input</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
              <Music className="h-16 w-16 mb-4 text-indigo-400" />
              <h2 className="text-xl font-medium mb-2">Audio Input Mode</h2>
              <p className="text-gray-400 mb-4">Gesture recognition is disabled</p>
              <Button
                variant="outline"
                className="border-indigo-500 text-indigo-400 hover:bg-indigo-950"
                onClick={() => setIsCameraActive(true)}
              >
                Enable Camera
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Half - Audio Editing Window */}
        <div className="h-1/2 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
          {/* Toolbar */}
          <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
            {/* Left side - Editing tools */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Scissors className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cut (Ctrl+X)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy (Ctrl+C)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Paste (Ctrl+V)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2))}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom In</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom Out</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Center - Playback controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300 w-12 text-right">
                {formatTime(currentTime)}
              </span>

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetPlayback}>
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400"
                onClick={togglePlayback}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>

              <Button variant="ghost" size="icon" className="h-8 w-8">
                <SkipForward className="h-4 w-4" />
              </Button>

              <span className="text-sm text-gray-600 dark:text-gray-300 w-12">{formatTime(totalDuration)}</span>
            </div>

            {/* Right side - Settings */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Project Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Project Info</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Timeline and Tracks */}
          <div className="flex-1 flex overflow-hidden">
            {/* Track Controls */}
            <div className="w-48 flex-shrink-0 bg-gray-50 dark:bg-gray-850 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              {/* Header */}
              <div className="h-8 border-b border-gray-200 dark:border-gray-700 flex items-center px-3 sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tracks</span>
              </div>

              {/* Track List */}
              <div>
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className={`p-2 border-b border-gray-200 dark:border-gray-700 ${
                      selectedTrack === track.id ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                    }`}
                    onClick={() => setSelectedTrack(track.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${track.color} mr-2`}></div>
                        <span className="font-medium text-sm">{track.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMuteToggle(track.id)
                                }}
                              >
                                {track.muted ? (
                                  <VolumeX className="h-3 w-3 text-red-500" />
                                ) : (
                                  <Volume2 className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{track.muted ? "Unmute" : "Mute"} Track</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-6 w-6 ${track.solo ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSoloToggle(track.id)
                                }}
                              >
                                <span className="text-xs font-bold">S</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{track.solo ? "Unsolo" : "Solo"} Track</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-8">Vol</span>
                      <Slider
                        value={[track.muted ? 0 : track.volume]}
                        max={100}
                        step={1}
                        className="flex-1"
                        onValueChange={(value) => handleVolumeChange(track.id, value[0])}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-8">Pan</span>
                      <Slider
                        value={[track.pan + 50]}
                        min={0}
                        max={100}
                        step={1}
                        className="flex-1"
                        onValueChange={(value) => {
                          setTracks(tracks.map((t) => (t.id === track.id ? { ...t, pan: value[0] - 50 } : t)))
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Area */}
            <div className="flex-1 overflow-auto relative">
              {/* Time Ruler */}
              <div className="h-8 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-gray-100 dark:bg-gray-800 z-10 flex">
                <div className="relative" style={{ width: `${timelineWidth}px` }}>
                  {/* Time markers */}
                  {Array.from({ length: totalDuration + 1 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 flex flex-col items-center"
                      style={{ left: `${i * secondWidth}px` }}
                    >
                      <div className="h-2 w-px bg-gray-300 dark:bg-gray-600"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(i)}</span>
                    </div>
                  ))}

                  {/* Playhead */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-500 z-20"
                    style={{ left: `${timeToPosition(currentTime)}px` }}
                  >
                    <div className="w-3 h-3 bg-red-500 rounded-full -translate-x-1/2"></div>
                  </div>
                </div>
              </div>

              {/* Tracks */}
              <div className="relative" ref={timelineRef}>
                {/* Track lanes */}
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className={`h-24 border-b border-gray-200 dark:border-gray-700 relative ${
                      selectedTrack === track.id ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
                    }`}
                  >
                    {/* Track background with grid lines */}
                    <div className="absolute inset-0">
                      {Array.from({ length: totalDuration }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700/50"
                          style={{ left: `${(i + 1) * secondWidth}px` }}
                        ></div>
                      ))}
                    </div>

                    {/* Audio clips */}
                    {track.clips.map((clip) => (
                      <div
                        key={clip.id}
                        className={`absolute top-2 bottom-2 rounded-md border-2 ${
                          selectedClip === clip.id
                            ? "border-indigo-500 dark:border-indigo-400"
                            : `border-${track.color.split("-")[1]}-400`
                        } ${track.color} bg-opacity-70 dark:bg-opacity-50 cursor-pointer`}
                        style={{
                          left: `${timeToPosition(clip.start)}px`,
                          width: `${clipWidth(clip.length)}px`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedClip(clip.id)
                        }}
                      >
                        <div className="p-1 text-xs text-white font-medium truncate">{clip.name}</div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Playhead line that extends through all tracks */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                  style={{ left: `${timeToPosition(currentTime)}px` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

