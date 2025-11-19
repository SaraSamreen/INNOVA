'use client'

export default function FileUpload({ onVideoUpload }) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('File selected:', file.name)
      onVideoUpload(file)
    }
  }

  return (
    <div 
      className="p-8 border-2 border-dashed border-slate-700 rounded-md text-center cursor-pointer hover:border-blue-500 transition-colors"
      onClick={() => document.getElementById('video-upload-input').click()}
    >
      <input
        id="video-upload-input"
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="text-slate-400 text-sm mb-2">📹 Click to upload or drag video</p>
      <p className="text-xs text-slate-600">
        Supports MP4, MOV, AVI, MKV, WebM
      </p>
    </div>
  )
}