"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AudioWaveformIcon as Waveform,
  ArrowLeft,
  Save,
  Download,
  Undo,
  Redo,
  Settings,
  Info,
} from "lucide-react"
import { getAuthState } from "@/lib/auth"

export default function EditorPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)

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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 overflow-hidden">
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
              <span className="font-bold text-xl">Your Recordings</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Save className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Download className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Undo className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Redo className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Placeholder for audio visualization */}
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            🎵 Your gesture-based recordings will appear here!
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Use voice or gesture to record instruments. Then return here to mix, listen, and export them.
          </p>
        </div>
      </div>
    </div>
  )
}
