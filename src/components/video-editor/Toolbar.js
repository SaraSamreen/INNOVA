'use client'

export default function Toolbar({ isPlaying, onPlayPause, onMute, isMuted }) {
  return (
    <div className="flex gap-4 items-center p-4 bg-slate-800 border-b border-slate-700">
      <button 
        onClick={onPlayPause} 
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors text-lg"
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      <button 
        onClick={onMute} 
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors text-lg"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  )
}