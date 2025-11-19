'use client'

import { useEffect, useRef } from 'react'

export default function Canvas({ videoSrc, currentTime, filters, textOverlays, canvasRef }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (!videoSrc || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const video = videoRef.current

    const drawFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) saturate(${filters.saturation}%)`
        ctx.filter = filterString

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        textOverlays.forEach((text) => {
          if (currentTime >= text.startTime && currentTime < text.startTime + text.duration) {
            ctx.font = `${text.size}px Arial`
            ctx.fillStyle = text.color
            ctx.textAlign = 'center'
            ctx.fillText(text.text, canvas.width / 2, canvas.height / 2)
          }
        })
      }

      requestAnimationFrame(drawFrame)
    }

    drawFrame()
  }, [videoSrc, filters, textOverlays, currentTime, canvasRef])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime
    }
  }, [currentTime])

  return (
    <div className="w-full max-w-4xl flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        className="max-w-full max-h-full rounded-lg bg-black"
      />
      <video
        ref={videoRef}
        src={videoSrc}
        crossOrigin="anonymous"
        className="hidden"
      />
    </div>
  )
}