"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AudioWaveformIcon as Waveform, Moon, Sun, ArrowLeft, Music } from "lucide-react"
import { getAuthState, clearAuthState } from "@/lib/auth"

// Mock user data
const mockUser = {
  name: "Alex Johnson",
  email: "alex@example.com",
}

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

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark")
    }
  }

  // Check if user is authenticated
  useEffect(() => {
    if (!getAuthState()) {
      router.push("/signin")
    }
  }, [router])

  const handleLogout = () => {
    clearAuthState()
    router.push("/signin")
  }

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
      {/* Navigation Ribbon */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Waveform className="h-6 w-6" />
            <span className="font-bold text-xl">SoundCraft</span>
          </Link>
          <nav className="flex gap-8 items-center">
            <Link href="/" className="text-sm font-medium hover:text-purple-200 transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-purple-200 transition-colors">
              Dashboard
            </Link>
            <Link href="/music" className="text-sm font-medium hover:text-purple-200 transition-colors">
              Explore
            </Link>
            <Button
              variant="ghost"
              className="text-sm font-medium text-white hover:text-purple-200 transition-colors"
              onClick={handleLogout}
            >
              Logout
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-white hover:bg-white/10 rounded-full h-8 w-8"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Composition</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Choose a template to get started or begin with a blank canvas.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/editor?template=${template.id}`)}
              >
                <div className={`h-32 bg-gradient-to-br ${bgColor} flex items-center justify-center`}>
                  <Music className="h-12 w-12 text-white opacity-75" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{template.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{template.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-900 text-gray-300">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Waveform className="h-6 w-6" />
              <span className="font-bold">SoundCraft</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <Link href="/" className="text-sm hover:text-white">
                Home
              </Link>
              <Link href="/dashboard" className="text-sm hover:text-white">
                Dashboard
              </Link>
              <Link href="/music" className="text-sm hover:text-white">
                Explore
              </Link>
              <Link href="#" className="text-sm hover:text-white">
                Contact
              </Link>
              <Link href="#" className="text-sm hover:text-white">
                Privacy
              </Link>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">© 2025 SoundCraft. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-gray-500 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

