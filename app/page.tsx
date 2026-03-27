"use client"

import { useState, useCallback, useEffect } from "react"
import { CameraView } from "@/components/camera-view"
import { PostureStatus, type PostureLevel } from "@/components/posture-status"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { HelpCircle, Camera, Play, Square } from "lucide-react"

export default function HomePage() {
  const [isTracking, setIsTracking] = useState(false)
  const [postureLevel, setPostureLevel] = useState<PostureLevel>("good")
  const [trackingDuration, setTrackingDuration] = useState(0)
  const [badPostureDuration, setBadPostureDuration] = useState(0)

  // Simulate posture detection
  useEffect(() => {
    if (!isTracking) {
      setTrackingDuration(0)
      setBadPostureDuration(0)
      setPostureLevel("good")
      return
    }

    const interval = setInterval(() => {
      setTrackingDuration((prev) => prev + 1)
      
      const random = Math.random()
      if (random < 0.7) {
        setPostureLevel("good")
        setBadPostureDuration(0)
      } else if (random < 0.9) {
        setPostureLevel("warning")
        setBadPostureDuration((prev) => prev + 1)
      } else {
        setBadPostureDuration((prev) => {
          const newDuration = prev + 1
          if (newDuration >= 5) {
            setPostureLevel("bad")
          } else {
            setPostureLevel("warning")
          }
          return newDuration
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isTracking])

  const triggerCapture = useCallback(() => {
    const video = document.querySelector("video")
    const canvas = document.createElement("canvas")
    if (video) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.9)
        
        // Download image directly
        const link = document.createElement("a")
        link.href = imageData
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
        link.download = `posture-${timestamp}.jpg`
        link.click()
      }
    }
  }, [])

  const toggleTracking = useCallback(() => {
    setIsTracking((prev) => !prev)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {/* Camera - Full Screen */}
      <div className="relative h-full w-full">
        <CameraView
          isTracking={isTracking}
          onCapture={() => {}}
          className="h-full w-full rounded-none"
        />
        
        {/* Top Bar - Minimal */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pb-2 safe-area-inset-top">
          {/* Logo & Name */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white/90 drop-shadow-md">PostureGuard</span>
          </div>
          
          {/* Help Button */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                aria-label="How to use"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="left-1/2 top-1/2 mx-auto w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  How to use
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Instructions for using PostureGuard posture monitoring app
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">1</span>
                  <div>
                    <p className="font-medium text-foreground">Position your camera</p>
                    <p className="text-sm text-muted-foreground">Place your device so the camera can see your sitting posture.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">2</span>
                  <div>
                    <p className="font-medium text-foreground">Start tracking</p>
                    <p className="text-sm text-muted-foreground">Tap the play button to begin posture monitoring.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">3</span>
                  <div>
                    <p className="font-medium text-foreground">Get alerts</p>
                    <p className="text-sm text-muted-foreground">
                      The indicator turns <span className="font-medium text-yellow-600">yellow</span> when posture needs adjustment, 
                      and <span className="font-medium text-red-600">red</span> after 5 seconds of poor posture.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">4</span>
                  <div>
                    <p className="font-medium text-foreground">Capture moments</p>
                    <p className="text-sm text-muted-foreground">Use the camera button to save snapshots directly to your device.</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tracking Status - Small indicator top center */}
        {isTracking && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full bg-black/40 px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-xs font-medium text-white/90">{formatTime(trackingDuration)}</span>
            </div>
            <PostureStatus level={postureLevel} duration={trackingDuration} compact />
          </div>
        )}
        
        {/* Bottom Controls - Minimal Camera Style */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 pb-10 pt-20 safe-area-inset-bottom">
          <div className="flex items-center justify-center gap-10">
            {/* Tracking Toggle */}
            <button
              onClick={toggleTracking}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all active:scale-95",
                isTracking 
                  ? "border-red-500 bg-red-500/20 text-red-500" 
                  : "border-white/70 bg-white/10 text-white"
              )}
              aria-label={isTracking ? "Stop tracking" : "Start tracking"}
            >
              {isTracking ? (
                <Square className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </button>

            {/* Capture Button - Camera Style */}
            <button
              onClick={triggerCapture}
              className="group relative flex h-20 w-20 items-center justify-center active:scale-95"
              aria-label="Capture photo"
            >
              {/* Outer ring */}
              <span className="absolute inset-0 rounded-full border-4 border-white/90 transition-transform group-hover:scale-105" />
              {/* Inner circle */}
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white transition-transform group-active:scale-90">
                <Camera className="h-6 w-6 text-gray-800" />
              </span>
            </button>

            {/* Spacer for symmetry */}
            <div className="h-14 w-14" />
          </div>
        </div>
      </div>
    </div>
  )
}
