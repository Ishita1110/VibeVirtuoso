"use client"

import { useRef, useEffect } from "react"

interface WaveformVisualizerProps {
  data: number[]
  height: number
  isPlaying: boolean
}

export default function WaveformVisualizer({ data, height, isPlaying }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = height * dpr

    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height)

    // Draw waveform
    const barWidth = rect.width / data.length
    const barGap = 2

    ctx.fillStyle = isPlaying ? "#3b82f6" : "#64748b"

    data.forEach((value, index) => {
      const barHeight = value * height
      const x = index * barWidth
      const y = (height - barHeight) / 2

      ctx.fillRect(x, y, barWidth - barGap, barHeight)
    })

    // Draw playhead line if playing
    if (isPlaying) {
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 2
      ctx.beginPath()
      const playheadX = rect.width * 0.3
      ctx.moveTo(playheadX, 0)
      ctx.lineTo(playheadX, height)
      ctx.stroke()
    }
  }, [data, height, isPlaying])

  return <canvas ref={canvasRef} style={{ width: "100%", height: `${height}px` }} className="rounded-md" />
}

