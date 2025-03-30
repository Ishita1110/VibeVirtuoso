// Simple auth state management for demo purposes
// In a real app, you would use a proper auth solution like NextAuth.js

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Get auth state from localStorage
export const getAuthState = () => {
  if (!isBrowser) return false

  try {
    const authState = localStorage.getItem("soundcraft_auth")
    return authState === "true"
  } catch (error) {
    console.error("Error reading auth state:", error)
    return false
  }
}

// Set auth state in localStorage
export const setAuthState = (isAuthenticated: boolean) => {
  if (!isBrowser) return

  try {
    localStorage.setItem("soundcraft_auth", isAuthenticated ? "true" : "false")
  } catch (error) {
    console.error("Error setting auth state:", error)
  }
}

// Clear auth state
export const clearAuthState = () => {
  if (!isBrowser) return

  try {
    localStorage.removeItem("soundcraft_auth")
  } catch (error) {
    console.error("Error clearing auth state:", error)
  }
}

