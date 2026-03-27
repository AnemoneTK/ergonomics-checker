"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

export type PostureLevel = "good" | "warning" | "bad"

interface PostureStatusProps {
  level: PostureLevel
  duration: number
  className?: string
  compact?: boolean
}

const statusConfig = {
  good: {
    label: "Good Posture",
    shortLabel: "Good posture",
    description: "Keep it up!",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    textColor: "text-green-700 dark:text-green-300",
    iconBg: "bg-green-100 dark:bg-green-900/50",
    dotColor: "bg-green-400",
    Icon: CheckCircle2,
  },
  warning: {
    label: "Adjust Posture",
    shortLabel: "Adjust posture",
    description: "Your back is starting to slouch",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    textColor: "text-yellow-700 dark:text-yellow-300",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/50",
    dotColor: "bg-yellow-400",
    Icon: AlertTriangle,
  },
  bad: {
    label: "Poor Posture",
    shortLabel: "Poor posture!",
    description: "Please correct your posture now",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-700 dark:text-red-300",
    iconBg: "bg-red-100 dark:bg-red-900/50",
    dotColor: "bg-red-400",
    Icon: XCircle,
  },
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

export function PostureStatus({ level, duration, className, compact = false }: PostureStatusProps) {
  const config = statusConfig[level]
  const Icon = config.Icon

  // Compact version for overlay
  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5 text-white/90", className)}>
        <span className={cn(
          "h-2.5 w-2.5 rounded-full",
          config.dotColor,
          level === "bad" && "animate-pulse"
        )} />
        <span className="text-sm">{config.shortLabel}</span>
      </div>
    )
  }

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-colors",
      config.bgColor,
      config.borderColor,
      level === "bad" && "animate-pulse",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", config.iconBg)}>
          <Icon className={cn("h-5 w-5", config.textColor)} />
        </div>
        <div className="flex-1">
          <h3 className={cn("font-semibold", config.textColor)}>{config.label}</h3>
          <p className={cn("text-sm opacity-80", config.textColor)}>{config.description}</p>
        </div>
        <div className={cn("text-right text-sm", config.textColor)}>
          <span className="opacity-70">Session</span>
          <p className="font-mono font-medium">{formatDuration(duration)}</p>
        </div>
      </div>
    </div>
  )
}
