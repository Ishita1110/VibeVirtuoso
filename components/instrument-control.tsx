"use client"

import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface Instrument {
  id: number
  name: string
  icon: LucideIcon
  volume: number
  muted: boolean
  solo: boolean
}

interface InstrumentControlProps {
  instrument: Instrument
  onChange: (id: number, property: string, value: any) => void
}

export default function InstrumentControl({ instrument, onChange }: InstrumentControlProps) {
  const { id, name, icon: Icon, volume, muted, solo } = instrument

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5" />
            <h3 className="font-medium">{name}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs">M</span>
              <Switch checked={muted} onCheckedChange={(checked) => onChange(id, "muted", checked)} size="sm" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs">S</span>
              <Switch checked={solo} onCheckedChange={(checked) => onChange(id, "solo", checked)} size="sm" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Volume control */}
          <div className="flex items-center space-x-2">
            <span className="text-xs w-8">Vol</span>
            <Slider
              value={[muted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={(value) => {
                onChange(id, "volume", value[0])
                if (value[0] > 0 && muted) onChange(id, "muted", false)
              }}
              className="flex-1"
            />
            <span className="text-xs w-8 text-right">{muted ? 0 : volume}%</span>
          </div>

          {/* Instrument visualization */}
          <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
            {!muted && (
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800"
                style={{
                  width: `${volume}%`,
                  opacity: solo ? 1 : 0.7,
                  animation: isNaN(id) ? "none" : `pulse-${(id % 3) + 1} 2s infinite`,
                }}
              />
            )}
          </div>
        </div>
      </CardContent>

      <style jsx global>{`
        @keyframes pulse-1 {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes pulse-2 {
          0%, 100% { opacity: 0.8; }
          30% { opacity: 0.6; }
          70% { opacity: 1; }
        }
        @keyframes pulse-3 {
          0%, 100% { opacity: 0.7; }
          25% { opacity: 1; }
          75% { opacity: 0.5; }
        }
      `}</style>
    </Card>
  )
}

