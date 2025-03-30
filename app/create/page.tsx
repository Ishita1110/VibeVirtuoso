"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AudioWaveformIcon as Waveform, ArrowLeft, Music } from "lucide-react"
import { getAuthState } from "@/lib/auth"

export default function CreatePage() {
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

  // Template options for new compositions
  const templates = [
    {
      id: "1",
      title: "Electronic Beat",
      description: "Start with a modern electronic beat template",
      icon: "electronic",
    },
    { id: "2", title: "Jazz Ensemble", description: "Begin with a jazz ensemble arrangement", icon: "jazz" },
    { id: "3", title: "Acoustic Guitar", description: "Simple acoustic guitar backing track", icon: "acoustic" },
    { id: "4", title: "Hip Hop Beat", description: "Urban hip hop beat with drums and bass", icon: "hiphop" },
    { id: "5", title: "Classical Piano", description: "Solo piano composition template", icon: "classical" },
    { id: "6", title: "Blank Canvas", description: "Start from scratch with an empty project", icon: "blank" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Top header with back button and logo */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 -ml-3"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Button>

          <div className="flex items-center gap-2">
            <Waveform className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">SoundCraft</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Create New Composition</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose a template to get started or begin with a blank canvas.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {templates.map((template) => {
            // Define background colors based on template type
            const bgColors: Record<string, string> = {
              electronic: "from-blue-400 to-purple-500",
              jazz: "from-amber-400 to-orange-500",
              acoustic: "from-green-400 to-emerald-500",
              hiphop: "from-red-400 to-pink-500",
              classical: "from-indigo-400 to-violet-500",
              blank: "from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700",
            }

            const bgColor = bgColors[template.icon] || bgColors.blank

            return (
              <Card
                key={template.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md transform hover:scale-105 hover:rotate-1"
                onClick={() => router.push(`/editor?template=${template.id}`)}
              >
                <div className={`h-40 bg-gradient-to-br ${bgColor} flex items-center justify-center`}>
                  <Music className="h-16 w-16 text-white opacity-75" />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{template.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{template.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Waveform className="h-5 w-5 text-purple-400" />
            <span className="font-bold">SoundCraft</span>
          </div>
          <p className="text-sm text-gray-500">© 2025 SoundCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

