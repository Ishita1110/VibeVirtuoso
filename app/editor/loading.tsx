export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading editor...</p>
      </div>
    </div>
  )
}

