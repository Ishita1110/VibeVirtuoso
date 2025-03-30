"use client"

import { useRef, useEffect } from "react"

interface BeatTimingDisplayProps {
  bpm: number
  isPlaying: boolean
  currentTime: number
}

export default function BeatTimingDisplay({ bpm, isPlaying, currentTime }: BeatTimingDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = 60 * dpr

    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, 60)

    // Calculate beat positions
    const beatsPerSecond = bpm / 60
    const beatSpacing = rect.width / 16 // Show 16 beats
    const currentBeat = currentTime * beatsPerSecond

    // Draw beat markers
    for (let i = 0; i < 16; i++) {
      const x = i * beatSpacing
      const isMajorBeat = i % 4 === 0
      const height = isMajorBeat ? 40 : 20

      // Determine if this beat is active
      const beatNumber = Math.floor(currentBeat) % 16
      const isActive = isPlaying && i === beatNumber

      ctx.fillStyle = isActive ? "#3b82f6" : isMajorBeat ? "#64748b" : "#94a3b8"

      ctx.fillRect(x, 60 - height, beatSpacing / 3, height)

      if (isMajorBeat) {
        ctx.fillStyle = "#64748b"
        ctx.font = "10px sans-serif"
        ctx.fillText(`${i + 1}`, x, 15)
      }
    }
  }, [bpm, isPlaying, currentTime])

  return <canvas ref={canvasRef} style={{ width: "100%", height: "60px" }} className="rounded-md" />
}

