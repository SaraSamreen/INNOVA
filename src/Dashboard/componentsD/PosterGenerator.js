import React, { useState } from 'react';

const PosterGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [posterTitle, setPosterTitle] = useState('Your Event');
  const [posterSubtitle, setPosterSubtitle] = useState('Join us for an amazing experience');
  const [posterDate, setPosterDate] = useState('December 25, 2025');
  const [posterLocation, setPosterLocation] = useState('City Convention Center');
  const [brandDescription, setBrandDescription] = useState('');
  const [selectedFont, setSelectedFont] = useState('Poppins');
  const [selectedColor, setSelectedColor] = useState('#3E8EDE');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [bgOpacity, setBgOpacity] = useState(0.3);
  const [showEditor, setShowEditor] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

const templates = [
  {
    id: 1,
    name: 'Modern Event',
    svg: (title, subtitle, date, location, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 400 600" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern1" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="400" height="600" fill="#1a1a1a" />
        {bgImage && <rect x="0" y="0" width="400" height="600" fill="url(#bgPattern1)" opacity={opacity} />}
        <rect x="30" y="350" width="340" height="220" fill={color} opacity="0.95" />
        <text x="200" y="410" textAnchor="middle" fill="white" fontSize="36" fontFamily={font} fontWeight="700">{title}</text>
        <text x="200" y="450" textAnchor="middle" fill="white" fontSize="16" fontFamily={font} fontWeight="400" opacity="0.9">{subtitle}</text>
        <line x1="80" y1="475" x2="320" y2="475" stroke="white" strokeWidth="2" opacity="0.5" />
        <text x="200" y="510" textAnchor="middle" fill="white" fontSize="18" fontFamily={font} fontWeight="600">{date}</text>
        <text x="200" y="540" textAnchor="middle" fill="white" fontSize="14" fontFamily={font} fontWeight="400" opacity="0.8">{location}</text>
      </svg>
    )
  },
  {
    id: 2,
    name: 'Minimalist',
    svg: (title, subtitle, date, location, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 400 600" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern2" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="400" height="600" fill="white" />
        {bgImage && <rect x="0" y="0" width="400" height="600" fill="url(#bgPattern2)" opacity={opacity} />}
        <rect x="40" y="40" width="320" height="520" fill="none" stroke={color} strokeWidth="3" />
        <text x="200" y="200" textAnchor="middle" fill={color} fontSize="42" fontFamily={font} fontWeight="700">{title}</text>
        <text x="200" y="250" textAnchor="middle" fill="#333" fontSize="16" fontFamily={font} fontWeight="400">{subtitle}</text>
        <rect x="150" y="280" width="100" height="3" fill={color} />
        <text x="200" y="400" textAnchor="middle" fill={color} fontSize="20" fontFamily={font} fontWeight="600">{date}</text>
        <text x="200" y="440" textAnchor="middle" fill="#666" fontSize="16" fontFamily={font} fontWeight="400">{location}</text>
      </svg>
    )
  },
  {
    id: 3,
    name: 'Bold Typography',
    svg: (title, subtitle, date, location, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 400 600" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern3" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="400" height="600" fill={color} />
        {bgImage && <rect x="0" y="0" width="400" height="600" fill="url(#bgPattern3)" opacity={opacity} />}
        <text x="200" y="250" textAnchor="middle" fill="white" fontSize="52" fontFamily={font} fontWeight="900">{title}</text>
        <text x="200" y="300" textAnchor="middle" fill="white" fontSize="18" fontFamily={font} fontWeight="300" opacity="0.95">{subtitle}</text>
        <text x="200" y="450" textAnchor="middle" fill="white" fontSize="22" fontFamily={font} fontWeight="700">{date}</text>
        <text x="200" y="490" textAnchor="middle" fill="white" fontSize="16" fontFamily={font} fontWeight="400" opacity="0.9">{location}</text>
      </svg>
    )
  },
  {
    id: 4,
    name: 'Split Design',
    svg: (title, subtitle, date, location, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 400 600" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern4" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="400" height="300" fill="#2C2C2C" />
        {bgImage && <rect x="0" y="0" width="400" height="300" fill="url(#bgPattern4)" opacity={opacity} />}
        <rect x="0" y="300" width="400" height="300" fill="white" />
        <rect x="0" y="290" width="400" height="20" fill={color} />
        <text x="200" y="180" textAnchor="middle" fill="white" fontSize="44" fontFamily={font} fontWeight="800">{title}</text>
        <text x="200" y="220" textAnchor="middle" fill="white" fontSize="16" fontFamily={font} fontWeight="400" opacity="0.9">{subtitle}</text>
        <text x="200" y="400" textAnchor="middle" fill={color} fontSize="24" fontFamily={font} fontWeight="700">{date}</text>
        <text x="200" y="450" textAnchor="middle" fill="#333" fontSize="16" fontFamily={font} fontWeight="500">{location}</text>
      </svg>
    )
  },
  {
    id: 5,
    name: 'Creative Angle',
    svg: (title, subtitle, date, location, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 400 600" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern5" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <polygon points="0,0 400,0 400,450 0,600" fill="#1a1a1a" />
        {bgImage && (
          <g>
            <defs>
              <clipPath id="clip5">
                <polygon points="0,0 400,0 400,450 0,600" />
              </clipPath>
            </defs>
            <rect x="0" y="0" width="400" height="600" fill="url(#bgPattern5)" clipPath="url(#clip5)" opacity={opacity} />
          </g>
        )}
        <polygon points="0,450 400,300 400,600 0,600" fill={color} />
        <text x="200" y="200" textAnchor="middle" fill="white" fontSize="48" fontFamily={font} fontWeight="800">{title}</text>
        <text x="200" y="250" textAnchor="middle" fill="white" fontSize="16" fontFamily={font} fontWeight="400" opacity="0.95">{subtitle}</text>
        <text x="200" y="480" textAnchor="middle" fill="white" fontSize="22" fontFamily={font} fontWeight="700">{date}</text>
        <text x="200" y="520" textAnchor="middle" fill="white" fontSize="15" fontFamily={font} fontWeight="400" opacity="0.95">{location}</text>
      </svg>
    )
  },
  {
    id: 6,
    name: 'Geometric',
    svg: (title, subtitle, date, location, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 400 600" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern6" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="400" height="600" fill="#f5f5f5" />
        {bgImage && <rect x="0" y="0" width="400" height="600" fill="url(#bgPattern6)" opacity={opacity} />}
        <circle cx="200" cy="200" r="120" fill="none" stroke={color} strokeWidth="4" />
        <circle cx="200" cy="200" r="100" fill={color} opacity="0.1" />
        <text x="200" y="210" textAnchor="middle" fill={color} fontSize="38" fontFamily={font} fontWeight="700">{title}</text>
        <rect x="80" y="350" width="240" height="2" fill={color} />
        <text x="200" y="400" textAnchor="middle" fill="#333" fontSize="16" fontFamily={font} fontWeight="400">{subtitle}</text>
        <text x="200" y="480" textAnchor="middle" fill={color} fontSize="20" fontFamily={font} fontWeight="600">{date}</text>
        <text x="200" y="520" textAnchor="middle" fill="#666" fontSize="15" fontFamily={font} fontWeight="400">{location}</text>
      </svg>
    )
  },
  {
    id: 7,
    name: 'Gradient Overlay',
    svg: (title, subtitle, date, location, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 400 600" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern7" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
          <linearGradient id="gradient7" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="400" height="600" fill="url(#gradient7)" />
        {bgImage && <rect x="0" y="0" width="400" height="600" fill="url(#bgPattern7)" opacity={opacity} />}
        <text x="200" y="280" textAnchor="middle" fill="white" fontSize="46" fontFamily={font} fontWeight="800">{title}</text>
        <text x="200" y="330" textAnchor="middle" fill="white" fontSize="18" fontFamily={font} fontWeight="400" opacity="0.95">{subtitle}</text>
        <line x1="100" y1="360" x2="300" y2="360" stroke="white" strokeWidth="2" opacity="0.6" />
        <text x="200" y="420" textAnchor="middle" fill="white" fontSize="22" fontFamily={font} fontWeight="700">{date}</text>
        <text x="200" y="460" textAnchor="middle" fill="white" fontSize="16" fontFamily={font} fontWeight="400" opacity="0.9">{location}</text>
      </svg>
    )
  },
  {
    id: 8,
    name: 'Frame Focus',
    svg: (title, subtitle, date, location, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 400 600" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern8" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="400" height="600" fill="#2C2C2C" />
        {bgImage && <rect x="0" y="0" width="400" height="600" fill="url(#bgPattern8)" opacity={opacity} />}
        <rect x="50" y="150" width="300" height="300" fill="white" opacity="0.95" />
        <rect x="60" y="160" width="280" height="280" fill="none" stroke={color} strokeWidth="3" />
        <text x="200" y="250" textAnchor="middle" fill={color} fontSize="40" fontFamily={font} fontWeight="800">{title}</text>
        <text x="200" y="290" textAnchor="middle" fill="#333" fontSize="15" fontFamily={font} fontWeight="400">{subtitle}</text>
        <rect x="120" y="315" width="160" height="2" fill={color} opacity="0.5" />
        <text x="200" y="365" textAnchor="middle" fill={color} fontSize="20" fontFamily={font} fontWeight="700">{date}</text>
        <text x="200" y="400" textAnchor="middle" fill="#666" fontSize="14" fontFamily={font} fontWeight="500">{location}</text>
      </svg>
    )
  }
];

  const fonts = ['Poppins', 'Montserrat', 'Roboto', 'Playfair Display'];
  const colors = ['#3E8EDE', '#dd06f5ff', '#000000ff', '#e5f854ff', '#ff7b00ff', '#27AE60'];

  const generateBackgroundImage = async () => {
    if (!brandDescription.trim()) {
      alert("Please enter a description first!");
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:5000/api/image/generate-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: brandDescription }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.isLoading) {
          alert("🤖 AI model is warming up! Wait 20-30 seconds and try again.");
        } else {
          throw new Error(data.message || 'Failed to generate image');
        }
        return;
      }
      if (data.success && data.imageUrl) {
        setBackgroundImage(data.imageUrl);
        alert("✅ Background generated successfully!");
      } else {
        throw new Error('No image URL received');
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const svgElement = document.getElementById('poster-preview')?.querySelector('svg');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 2400;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 1600, 2400);
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.download = `${posterTitle.replace(/\s+/g, '_')}_poster.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(url);
      });
    };
    img.src = url;
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-gray-50 py-6 px-4 font-['Poppins']">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-2">
            <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2v-2h2v-2h-2v-2h-2v2H9v2h2z"/>
            </svg>
            Poster Generator
          </h1>
          <p className="text-sm text-gray-600">Design stunning posters with AI backgrounds</p>
        </div>

        {!showEditor ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => { setSelectedTemplate(template); setShowEditor(true); }}
                className="bg-white rounded-xl p-4 cursor-pointer transition-all shadow-md hover:shadow-lg hover:border-blue-500 border-2 border-transparent"
              >
                <div className="w-full h-48 bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                  {template.svg('EVENT', 'Description', 'Date', 'Location', '#3E8EDE', '', 'Poppins', 0.3)}
                </div>
                <p className="text-center text-xs font-semibold text-gray-900">{template.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl p-5 shadow-lg h-fit">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Customize</h3>

              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Event Title</label>
                <input
                  type="text"
                  value={posterTitle}
                  onChange={(e) => setPosterTitle(e.target.value)}
                  maxLength={30}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Subtitle</label>
                <input
                  type="text"
                  value={posterSubtitle}
                  onChange={(e) => setPosterSubtitle(e.target.value)}
                  maxLength={50}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Date</label>
                <input
                  type="text"
                  value={posterDate}
                  onChange={(e) => setPosterDate(e.target.value)}
                  maxLength={40}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Location</label>
                <input
                  type="text"
                  value={posterLocation}
                  onChange={(e) => setPosterLocation(e.target.value)}
                  maxLength={40}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">AI Background</label>
                <textarea
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                  placeholder="Music festival, tech conference..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none resize-none"
                />
                <button
                  onClick={generateBackgroundImage}
                  disabled={isGenerating}
                  className="w-full mt-2 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-70"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>Generate</>
                  )}
                </button>
                {backgroundImage && (
                  <>
                    <button
                      onClick={() => setBackgroundImage('')}
                      className="w-full mt-2 py-1.5 text-xs rounded-lg border-2 border-red-500 text-red-500 font-semibold hover:bg-red-50"
                    >
                      Remove Background
                    </button>
                    <div className="mt-3">
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">
                        Background Opacity: {Math.round(bgOpacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={bgOpacity}
                        onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Font</label>
                  <div className="grid grid-cols-2 gap-2">
                    {fonts.map((font) => (
                      <button
                        key={font}
                        onClick={() => setSelectedFont(font)}
                        className={`px-2 py-2 text-xs rounded-lg border-2 text-center truncate ${
                          selectedFont === font ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        style={{ fontFamily: font }}
                        title={font}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Color</label>
                  <div className="flex flex-row gap-2 flex-wrap">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          selectedColor === color
                            ? 'border-gray-900 ring-2 ring-offset-1 ring-blue-500'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => { setPosterTitle('Your Event'); setPosterSubtitle('Join us for an amazing experience'); setPosterDate('December 25, 2025'); setPosterLocation('City Convention Center'); setBrandDescription(''); setSelectedFont('Poppins'); setSelectedColor('#3E8EDE'); setBackgroundImage(''); setBgOpacity(0.3); }} className="flex-1 py-2 text-sm rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50">
                  Reset
                </button>
                <button onClick={() => setShowEditor(false)} className="flex-1 py-2 text-sm rounded-lg border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50">
                  Back
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg flex flex-col items-center justify-center h-fit">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Preview</h3>
              <div
                id="poster-preview"
                className="w-full max-w-[350px] aspect-[2/3] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden mb-3"
              >
                {selectedTemplate?.svg(posterTitle, posterSubtitle, posterDate, posterLocation, selectedColor, backgroundImage, selectedFont, bgOpacity)}
              </div>
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-blue-700 shadow"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
                </svg>
                Download Poster
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PosterGenerator;