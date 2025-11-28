"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Upload,
  Image,
  Sparkles,
  Download,
  RotateCcw,
  Wand2,
  Zap,
  Layers,
  SlidersHorizontal,
  X,
  ChevronRight,
  Loader2,
  GripVertical,
} from "lucide-react"

export default function ProductModelShowcase() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonPosition, setComparisonPosition] = useState(50)
  const [quality, setQuality] = useState(80)
  const [creativity, setCreativity] = useState(50)
  
  // Product positioning and scaling - NEW
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })
  
  const fileInputRef = useRef(null)
  const comparisonRef = useRef(null)

  const quickPrompts = [
    { 
      label: "Neon Glow", 
      prompt: "Vibrant neon gradients, glowing particles, cyberpunk aesthetic, electric blue and pink colors" 
    },
    { 
      label: "Watercolor", 
      prompt: "Soft watercolor wash, pastel colors, artistic paint strokes, dreamy aesthetic" 
    },
    { 
      label: "Cosmic", 
      prompt: "Colorful nebula, space background, stars and galaxies, deep purples and blues" 
    },
    { 
      label: "Sunset Vibes", 
      prompt: "Warm sunset gradient, orange and pink sky, golden hour lighting, atmospheric" 
    },
    { 
      label: "Abstract Art", 
      prompt: "Bold abstract shapes, vibrant color blocks, modern art style, geometric patterns" 
    },
    { 
      label: "Bokeh Dreams", 
      prompt: "Colorful bokeh lights, soft focus background, dreamy atmosphere, warm tones" 
    },
    { 
      label: "Liquid Colors", 
      prompt: "Fluid paint swirls, mixing colors, liquid art, dynamic movement, vibrant hues" 
    },
    { 
      label: "Rainbow", 
      prompt: "Rainbow gradient background, spectrum of colors, smooth transitions, vibrant and cheerful" 
    },
  ]

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result || null)
        setGeneratedImage(null)
        setShowComparison(false)
        setScale(1)
        setPosition({ x: 0, y: 0 })
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result || null)
        setGeneratedImage(null)
        setShowComparison(false)
        setScale(1)
        setPosition({ x: 0, y: 0 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!uploadedImage || !prompt) return
    setIsGenerating(true)

    try {
      const response = await fetch(uploadedImage)
      const blob = await response.blob()
      
      const formData = new FormData()
      formData.append('image', blob, 'product.png')
      formData.append('prompt', prompt)
      formData.append('creativity', creativity.toString())
      formData.append('quality', quality.toString())

      console.log('🚀 Sending to backend...')
      
      const apiResponse = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        body: formData
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || 'Generation failed')
      }

      const data = await apiResponse.json()
      
      if (data.success && data.image) {
        console.log('✅ Generation successful!')
        setGeneratedImage(data.image)
        setShowComparison(true)
        setScale(1)
        setPosition({ x: 0, y: 0 })
      } else {
        throw new Error('Invalid response from server')
      }
      
    } catch (error) {
      console.error('❌ Generation failed:', error)
      alert(`Failed to generate image: ${error.message}\n\nMake sure the backend server is running on http://localhost:3001`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleComparisonDrag = useCallback((e) => {
    if (!comparisonRef.current) return
    const rect = comparisonRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    setComparisonPosition((x / rect.width) * 100)
  }, [])

  const handleReset = () => {
    setUploadedImage(null)
    setGeneratedImage(null)
    setPrompt("")
    setShowComparison(false)
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // Product dragging handlers - NEW
  const startDrag = (e) => {
    e.preventDefault()
    dragging.current = true
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  const stopDrag = () => {
    dragging.current = false
  }

  const handleProductDrag = (e) => {
    if (!dragging.current) return
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    })
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleProductDrag)
    window.addEventListener("mouseup", stopDrag)
    return () => {
      window.removeEventListener("mousemove", handleProductDrag)
      window.removeEventListener("mouseup", stopDrag)
    }
  })

  const handleDownload = () => {
    if (!generatedImage) return
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = 1024
    canvas.height = 1024
    
    const bgImg = new window.Image()
    bgImg.crossOrigin = "anonymous"
    bgImg.src = generatedImage
    
    bgImg.onload = () => {
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)
      
      if (uploadedImage) {
        const prodImg = new window.Image()
        prodImg.crossOrigin = "anonymous"
        prodImg.src = uploadedImage
        
        prodImg.onload = () => {
          const scaledWidth = prodImg.width * scale
          const scaledHeight = prodImg.height * scale
          
          ctx.drawImage(
            prodImg,
            position.x + (canvas.width / 2),
            position.y + (canvas.height / 2),
            scaledWidth,
            scaledHeight
          )
          
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'product-showcase.png'
            a.click()
            URL.revokeObjectURL(url)
          })
        }
      } else {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'product-showcase.png'
          a.click()
          URL.revokeObjectURL(url)
        })
      }
    }
  }

  return (
    <div className="p-6 rounded-2xl shadow-md bg-blue-50">
      
      <header className="border-b border-gray-200 bg-white backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">ProductAI Studio</h1>
              <p className="text-sm text-gray-500">Transform your product images</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-2">
        
        <div className="space-y-6">
          <div className="border rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-lg font-medium">
                <Upload className="h-5 w-5 text-blue-600" /> Upload Product
              </h2>

              {uploadedImage && (
                <button
                  onClick={handleReset}
                  className="text-sm px-3 py-1 rounded-md border hover:bg-gray-50 flex items-center gap-1"
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              )}
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-4 cursor-pointer transition ${
                isDragging ? "border-blue-600 bg-blue-50" : "border-gray-300"
              }`}
            >
              {uploadedImage ? (
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <img src={uploadedImage} className="w-full h-full object-contain" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReset()
                    }}
                    className="absolute top-3 right-3 bg-white p-1 rounded-full shadow"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center aspect-square text-center">
                  <div className="p-4 bg-gray-200 rounded-full mb-3">
                    <Image className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-sm font-medium">Drop your product image here</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</p>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </div>
          </div>

          <div className="border rounded-xl bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 mb-4 text-lg font-medium">
              <Sparkles className="h-5 w-5 text-blue-600" /> Background Prompt
            </h2>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the background you want..."
              className="w-full min-h-[120px] p-3 border rounded-lg bg-gray-50 resize-none"
            />

            <p className="text-xs mt-3 mb-1 text-gray-500">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setPrompt(item.prompt)}
                  className="px-3 py-1.5 text-xs rounded-full bg-gray-200 hover:bg-blue-600 hover:text-white transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border rounded-xl bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 mb-4 text-lg font-medium">
              <SlidersHorizontal className="h-5 w-5 text-blue-600" /> Generation Settings
            </h2>

            <label className="text-sm font-medium flex justify-between">
              Quality <span>{quality}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full mt-1"
            />

            <label className="text-sm font-medium flex justify-between mt-4">
              Creativity <span>{creativity}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={creativity}
              onChange={(e) => setCreativity(Number(e.target.value))}
              className="w-full mt-1"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!uploadedImage || !prompt || isGenerating}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Generating Magic...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" /> Generate Background <ChevronRight />
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <div className="border rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-lg font-medium">
                <Layers className="h-5 w-5 text-blue-600" />
                {showComparison ? "Before / After" : "Preview"}
              </h2>

              {generatedImage && (
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-1 text-sm px-3 py-1 rounded-md border hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              )}
            </div>

            {showComparison && generatedImage ? (
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                <img 
                  src={generatedImage} 
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Generated background"
                />
                
                {uploadedImage && (
                  <img
                    src={uploadedImage}
                    onMouseDown={startDrag}
                    style={{
                      position: "absolute",
                      left: position.x,
                      top: position.y,
                      transform: `scale(${scale})`,
                      cursor: dragging.current ? "grabbing" : "grab",
                      userSelect: "none",
                    }}
                    className="max-w-full max-h-full object-contain"
                    draggable={false}
                    alt="Product"
                  />
                )}
              </div>
            ) : isGenerating ? (
              <div className="flex flex-col items-center justify-center aspect-square bg-gray-100 rounded-xl">
                <div className="relative">
                  <div className="h-16 w-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
                </div>
                <p className="mt-4 text-sm font-medium">Creating your vision...</p>
                <p className="text-xs text-gray-500">This may take a few seconds</p>
              </div>
            ) : uploadedImage ? (
              <div className="relative aspect-square bg-gray-100 rounded-xl">
                <img src={uploadedImage} className="w-full h-full object-contain opacity-50" alt="Product preview" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="bg-white/80 px-4 py-2 rounded-lg shadow">Enter a prompt to generate</p>
                </div>
              </div>
            ) : (
              <div className="aspect-square flex flex-col items-center justify-center rounded-xl bg-gray-100">
                <Image className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500">Upload an image to get started</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[ 
              { icon: <Zap className="h-6 w-6 text-blue-600 mx-auto" />, title: "Instant", desc: "Results in seconds" },
              { icon: <Image className="h-6 w-6 text-blue-600 mx-auto" />, title: "HD Output", desc: "High resolution" },
              { icon: <Sparkles className="h-6 w-6 text-blue-600 mx-auto" />, title: "AI Magic", desc: "Smart editing" },
            ].map((item) => (
              <div key={item.title} className="border rounded-xl bg-white p-4 text-center shadow-sm">
                {item.icon}
                <p className="text-xs font-medium mt-1">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* NEW: Product Controls Panel */}
          {generatedImage && uploadedImage && (
            <div className="border rounded-xl bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 mb-4 text-lg font-medium">
                <GripVertical className="h-5 w-5 text-blue-600" /> Product Controls
              </h2>

              <label className="text-sm font-medium flex justify-between">
                Product Size <span>{Math.round(scale * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.3"
                max="2"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full mt-2"
              />

              <button
                onClick={() => {
                  setScale(1)
                  setPosition({ x: 0, y: 0 })
                }}
                className="mt-4 w-full py-2 px-4 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
              >
                <RotateCcw className="h-4 w-4" /> Reset Position & Size
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                💡 Drag the product image to reposition it
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}