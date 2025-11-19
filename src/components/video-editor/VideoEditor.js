'use client'

import React, { useState } from 'react'
import FileUpload from './FileUpload'

export default function VideoEditor() {
  const [uploading, setUploading] = useState(false)

  const handleVideoUpload = async (file) => {
    const formData = new FormData()
    formData.append('video', file) // Must match multer key in backend

    try {
      setUploading(true)
      const res = await fetch('http://localhost:5000/api/video/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      console.log('Upload response:', data)

      if (res.ok) {
        alert('Video uploaded successfully!')
      } else {
        alert('Upload failed: ' + data.message)
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Upload failed. Make sure the backend is running.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <FileUpload onVideoUpload={handleVideoUpload} />
      {uploading && <p>Uploading...</p>}
    </div>
  )
}
