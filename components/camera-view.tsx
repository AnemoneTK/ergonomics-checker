"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { RefreshCw, ZoomIn, ZoomOut } from "lucide-react"

interface CameraViewProps {
  onCapture?: (imageData: string) => void
  isTracking?: boolean
  className?: string
}

export function CameraView({ onCapture, isTracking = false, className }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [zoom, setZoom] = useState(1)
  const [maxZoom, setMaxZoom] = useState(1)
  const [supportsZoom, setSupportsZoom] = useState(false)

  const setupCamera = useCallback(async (facing: "user" | "environment") => {
    // Stop previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facing, 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        },
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true)
        }
      }

      // Check zoom capabilities
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { zoom?: { min: number; max: number } }
      
      if (capabilities?.zoom) {
        setSupportsZoom(true)
        setMaxZoom(capabilities.zoom.max || 1)
        setZoom(1)
      } else {
        setSupportsZoom(false)
        setMaxZoom(1)
      }
      
      setHasPermission(true)
    } catch (error) {
      console.error("Camera access denied:", error)
      setHasPermission(false)
    }
  }, [])

  useEffect(() => {
    setupCamera(facingMode)

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const switchCamera = useCallback(async () => {
    const newFacing = facingMode === "user" ? "environment" : "user"
    setFacingMode(newFacing)
    setIsCameraReady(false)
    await setupCamera(newFacing)
  }, [facingMode, setupCamera])

  const handleZoom = useCallback(async (direction: "in" | "out") => {
    const newZoom = direction === "in" 
      ? Math.min(zoom + 0.5, supportsZoom ? maxZoom : 3)
      : Math.max(zoom - 0.5, 1)
    
    // Try native zoom first
    if (streamRef.current && supportsZoom) {
      const track = streamRef.current.getVideoTracks()[0]
      try {
        await track.applyConstraints({
          advanced: [{ zoom: newZoom } as MediaTrackConstraintSet & { zoom: number }]
        })
      } catch (error) {
        // Fallback to CSS zoom handled by state
      }
    }
    
    setZoom(newZoom)
  }, [zoom, maxZoom, supportsZoom])

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL("image/jpeg", 0.8)
  }, [isCameraReady])

  const handleCapture = useCallback(() => {
    const imageData = captureFrame()
    if (imageData && onCapture) {
      onCapture(imageData)
    }
  }, [captureFrame, onCapture])

  // Expose captureFrame for parent component
  useEffect(() => {
    if (videoRef.current) {
      ;(videoRef.current as HTMLVideoElement & { captureFrame?: () => string | null }).captureFrame = captureFrame
    }
  }, [captureFrame])

  if (hasPermission === false) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl bg-muted p-8 text-center",
          className
        )}
      >
        <div className="mb-4 rounded-full bg-destructive/10 p-4">
          <svg
            className="h-8 w-8 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">ไม่สามารถเข้าถึงกล้องได้</h3>
        <p className="text-sm text-muted-foreground">กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่าเบราว์เซอร์</p>
      </div>
    )
  }

  if (hasPermission === null) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl bg-muted p-8",
          className
        )}
      >
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">กำลังเริ่มต้นกล้อง...</p>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden bg-black", className)}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover transition-transform duration-200"
        style={{ transform: !supportsZoom && zoom > 1 ? `scale(${zoom})` : undefined }}
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Camera Controls - Right side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        {/* Switch Camera */}
        <button
          onClick={switchCamera}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-95"
          aria-label="Switch camera"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        
        {/* Zoom Controls - always enabled, uses CSS transform fallback */}
        <button
          onClick={() => handleZoom("in")}
          disabled={zoom >= 3}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        
        {/* Zoom Level Indicator */}
        {zoom > 1 && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
            <span className="text-[10px] font-medium">{zoom.toFixed(1)}x</span>
          </div>
        )}
        
        <button
          onClick={() => handleZoom("out")}
          disabled={zoom <= 1}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>
      
      {/* Tracking overlay - subtle corner guides */}
      {isTracking && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner guides - full screen, avoiding right side controls */}
          <div className="absolute top-16 left-4 h-10 w-10 border-l-2 border-t-2 border-white/50 rounded-tl-lg" />
          <div className="absolute top-16 right-16 h-10 w-10 border-r-2 border-t-2 border-white/50 rounded-tr-lg" />
          <div className="absolute bottom-28 left-4 h-10 w-10 border-l-2 border-b-2 border-white/50 rounded-bl-lg" />
          <div className="absolute bottom-28 right-16 h-10 w-10 border-r-2 border-b-2 border-white/50 rounded-br-lg" />
        </div>
      )}
    </div>
  )
}
