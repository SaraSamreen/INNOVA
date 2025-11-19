'use client'

import { useRef } from 'react'

export default function Timeline({
  duration,
  currentTime,
  onTimeChange,
  trim,
  onTrimChange,
}) {
  const timelineRef = useRef(null)

  const handleTimelineClick = (e) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    onTimeChange(percentage * duration)
  }

  const handleStartTrimDrag = (e) => {
    e.preventDefault()
    const startMove = (moveEvent) => {
      const rect = timelineRef.current.getBoundingClientRect()
      const x = moveEvent.clientX - rect.left
      const newStart = Math.max(0, (x / rect.width) * duration)
      onTrimChange({ ...trim, start: Math.min(newStart, trim.end) })
    }

    const stopMove = () => {
      document.removeEventListener('mousemove', startMove)
      document.removeEventListener('mouseup', stopMove)
    }

    document.addEventListener('mousemove', startMove)
    document.addEventListener('mouseup', stopMove)
  }

  const handleEndTrimDrag = (e) => {
    e.preventDefault()
    const startMove = (moveEvent) => {
      const rect = timelineRef.current.getBoundingClientRect()
      const x = moveEvent.clientX - rect.left
      const newEnd = Math.min(duration, (x / rect.width) * duration)
      onTrimChange({ ...trim, end: Math.max(newEnd, trim.start) })
    }

    const stopMove = () => {
      document.removeEventListener('mousemove', startMove)
      document.removeEventListener('mouseup', stopMove)
    }

    document.addEventListener('mousemove', startMove)
    document.addEventListener('mouseup', stopMove)
  }

  const startPercentage = (trim.start / duration) * 100
  const endPercentage = (trim.end / duration) * 100
  const currentPercentage = (currentTime / duration) * 100

  return (
    <div className="h-40 bg-slate-800 border-t border-slate-700 p-4 flex flex-col gap-2 overflow-hidden">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div 
        ref={timelineRef} 
        onClick={handleTimelineClick}
        className="flex-1 relative bg-slate-900 border border-slate-700 rounded-md cursor-pointer overflow-hidden"
      >
        <div
          className="absolute top-0 h-full bg-blue-500 bg-opacity-10 border-l border-r border-blue-500"
          style={{
            left: `${startPercentage}%`,
            right: `${100 - endPercentage}%`,
          }}
        />

        <div
          className="absolute w-1 h-full top-0 cursor-ew-resize bg-green-500 rounded-sm"
          style={{ left: `${startPercentage}%`, transform: 'translateX(-2px)' }}
          onMouseDown={handleStartTrimDrag}
        />

        <div
          className="absolute w-1 h-full top-0 cursor-ew-resize bg-red-500 rounded-sm"
          style={{ left: `${endPercentage}%`, transform: 'translateX(-2px)' }}
          onMouseDown={handleEndTrimDrag}
        />

        <div
          className="absolute w-0.5 h-full top-0 bg-yellow-400 pointer-events-none"
          style={{ left: `${currentPercentage}%` }}
        />
      </div>
    </div>
  )
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}
