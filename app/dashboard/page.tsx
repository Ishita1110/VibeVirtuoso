"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  AudioWaveformIcon as Waveform,
  Moon,
  Sun,
  Search,
  Plus,
  Play,
  Pencil,
  Trash2,
  Music,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { getAuthState, clearAuthState } from "@/lib/auth"

// Mock user data - in a real app, this would come from your authentication system
const mockUser = {
  name: "Alex Johnson",
  email: "alex@example.com",
}

// Mock music creation data - in a real app, this would come from your database
const mockCreations = [
  {
    id: "1",
    title: "Summer Vibes",
    date: new Date("2023-06-15"),
    genre: "Electronic",
    duration: "3:45",
    thumbnail: "electronic",
  },
  {
    id: "2",
    title: "Midnight Jazz",
    date: new Date("2023-07-22"),
    genre: "Jazz",
    duration: "4:12",
    thumbnail: "jazz",
  },
  {
    id: "3",
    title: "Acoustic Dreams",
    date: new Date("2023-08-05"),
    genre: "Acoustic",
    duration: "2:58",
    thumbnail: "acoustic",
  },
  {
    id: "4",
    title: "Urban Beats",
    date: new Date("2023-09-10"),
    genre: "Hip Hop",
    duration: "3:21",
    thumbnail: "hiphop",
  },
  {
    id: "5",
    title: "Classical Fusion",
    date: new Date("2023-10-18"),
    genre: "Classical",
    duration: "5:07",
    thumbnail: "classical",
  },
]

// Thumbnail component that shows different icons based on genre
function CreationThumbnail({ genre }: { genre: string }) {
  const bgColors: Record<string, string> = {
    Electronic: "from-blue-400 to-purple-500",
    Jazz: "from-amber-400 to-orange-500",
    Acoustic: "from-green-400 to-emerald-500",
    "Hip Hop": "from-red-400 to-pink-500",
    Classical: "from-indigo-400 to-violet-500",
    default: "from-gray-400 to-gray-600",
  }

  const bgColor = bgColors[genre] || bgColors.default

  return (
    <div className={`w-full h-32 rounded-t-md bg-gradient-to-br ${bgColor} flex items-center justify-center`}>
      <Music className="h-12 w-12 text-white opacity-75" />
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [creations, setCreations] = useState<typeof mockCreations>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [creationToDelete, setCreationToDelete] = useState<string | null>(null)

  // Initialize dark mode based on user preference
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(prefersDark)

    if (prefersDark && typeof document !== "undefined") {
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setCreations(mockCreations)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Check if user is authenticated
  useEffect(() => {
    if (!getAuthState()) {
      router.push("/signin")
    }
  }, [router])

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark")
    }
  }

  // Filter creations based on search query
  const filteredCreations = creations.filter((creation) =>
    creation.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    setCreationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (creationToDelete) {
      setCreations(creations.filter((creation) => creation.id !== creationToDelete))
      setCreationToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const handleLogout = () => {
    clearAuthState()
    router.push("/signin")
  }

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
            <Link href="/dashboard" className="text-sm font-medium text-purple-200 border-b-2 border-purple-200">
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {mockUser.name}!</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Continue working on your music or start a new composition.
          </p>
        </div>

        {/* Search and Create New */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search your creations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            onClick={() => router.push("/editor")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Composition
          </Button>
        </div>

        {/* Creations Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading your creations...</span>
          </div>
        ) : filteredCreations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCreations.map((creation) => (
              <Card key={creation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CreationThumbnail genre={creation.genre} />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{creation.title}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(creation.date, "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="mr-3">{creation.genre}</span>
                    <span>{creation.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 mr-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/preview?id=${creation.id}`)
                      }}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 mr-2"
                      onClick={() => router.push(`/editor?id=${creation.id}`)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDeleteClick(creation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <Music className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              You haven't created any compositions yet!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Start your musical journey by creating your first composition.
            </p>
            <Button
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              onClick={() => router.push("/editor")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Composition
            </Button>
          </div>
        )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your composition.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

