"use client"

import { cn } from "@/lib/utils"

interface SimpleVisualizerProps {
  data: number[]
  className?: string
  /** Color for active/lit bars */
  activeColor?: string
  /** Color for inactive/unlit bars */
  inactiveColor?: string
  /** Bar width in pixels */
  barWidth?: number
  /** Bar height in pixels */
  barHeight?: number
  /** Gap between bars in pixels */
  barGap?: number
}

export function SimpleVisualizer({
  data,
  className,
  activeColor = "bg-gray-700",
  inactiveColor = "bg-gray-300",
  barWidth = 3,
  barHeight = 16,
  barGap = 2
}: SimpleVisualizerProps) {
  return (
    <div
      className={cn("flex items-center justify-start", className)}
      style={{ gap: `${barGap}px`, height: `${barHeight * 2}px` }}
    >
      {data.map((value, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full transition-colors duration-75",
            value > 0 ? activeColor : inactiveColor
          )}
          style={{
            width: `${barWidth}px`,
            height: `${barHeight}px`,
            transitionProperty: "background-color",
            willChange: "background-color"
          }}
        />
      ))}
    </div>
  )
}
