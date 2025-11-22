import React, { useState } from 'react';

const LogoGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [companyName, setCompanyName] = useState('Your Company');
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
    name: 'Modern Circle',
    svg: (name, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern1" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="300" fill="white" />
        {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern1)" opacity={opacity} />}
        <circle cx="150" cy="150" r="140" fill="url(#grad1)" />
        <circle cx="150" cy="150" r="120" fill="none" stroke={color} strokeWidth="4" />
        <circle cx="150" cy="150" r="100" fill="none" stroke={color} strokeWidth="2" opacity="0.4" />
        <text x="150" y="165" textAnchor="middle" fill={color} fontSize="32" fontFamily={font} fontWeight="700">
          {name}
        </text>
      </svg>
    )
  },
  {
    id: 2,
    name: 'Bold Square',
    svg: (name, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern2" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="300" height="300" fill="white" />
        {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern2)" opacity={opacity} />}
        <rect x="50" y="50" width="200" height="200" fill={color} rx="10" />
        <text x="150" y="165" textAnchor="middle" fill="white" fontSize="28" fontFamily={font} fontWeight="800">
          {name}
        </text>
      </svg>
    )
  },
  {
    id: 3,
    name: 'Minimal Line',
    svg: (name, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern3" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="300" height="300" fill="white" />
        {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern3)" opacity={opacity} />}
        <line x1="50" y1="180" x2="250" y2="180" stroke={color} strokeWidth="3" />
        <text x="150" y="155" textAnchor="middle" fill={color} fontSize="30" fontFamily={font} fontWeight="600">
          {name}
        </text>
      </svg>
    )
  },
  {
    id: 4,
    name: 'Hexagon',
    svg: (name, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern4" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="300" height="300" fill="white" />
        {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern4)" opacity={opacity} />}
        <polygon points="150,40 230,90 230,190 150,240 70,190 70,90" fill="none" stroke={color} strokeWidth="4" />
        <text x="150" y="165" textAnchor="middle" fill={color} fontSize="28" fontFamily={font} fontWeight="700">
          {name}
        </text>
      </svg>
    )
  },
  {
    id: 5,
    name: 'Geometric Shield',
    svg: (name, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern5" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="300" height="300" fill="white" />
        {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern5)" opacity={opacity} />}
        <path d="M 150 40 L 240 90 L 240 180 L 150 250 L 60 180 L 60 90 Z" fill={color} opacity="0.12" />
        <path d="M 150 50 L 230 95 L 230 175 L 150 240 L 70 175 L 70 95 Z" fill="none" stroke={color} strokeWidth="3" />
        <line x1="150" y1="50" x2="150" y2="90" stroke={color} strokeWidth="2" />
        <line x1="150" y1="240" x2="150" y2="200" stroke={color} strokeWidth="2" />
        <text x="150" y="165" textAnchor="middle" fill={color} fontSize="28" fontFamily={font} fontWeight="700">
          {name}
        </text>
      </svg>
    )
  },
  {
    id: 6,
    name: 'Bold Frame',
    svg: (name, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern6" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
          <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="300" fill="white" />
        {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern6)" opacity={opacity} />}
        <rect x="30" y="30" width="240" height="240" fill="none" stroke={color} strokeWidth="6" />
        <rect x="45" y="130" width="210" height="50" fill="url(#grad6)" />
        <text x="150" y="167" textAnchor="middle" fill="white" fontSize="30" fontFamily={font} fontWeight="800">
          {name}
        </text>
      </svg>
    )
  },
  {
    id: 7,
    name: 'Diamond Split',
    svg: (name, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern7" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="300" height="300" fill="white" />
        {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern7)" opacity={opacity} />}
        <rect x="150" y="150" width="180" height="180" fill={color} opacity="0.15" transform="rotate(45 150 150)" />
        <rect x="150" y="150" width="160" height="160" fill="none" stroke={color} strokeWidth="4" transform="rotate(45 150 150)" />
        <line x1="150" y1="37" x2="150" y2="263" stroke={color} strokeWidth="2" opacity="0.5" />
        <text x="150" y="165" textAnchor="middle" fill={color} fontSize="30" fontFamily={font} fontWeight="700">
          {name}
        </text>
      </svg>
    )
  },
  {
    id: 8,
    name: 'Tech Circuit',
    svg: (name, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern8" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="300" height="300" fill="white" />
        {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern8)" opacity={opacity} />}
        <circle cx="150" cy="150" r="100" fill="none" stroke={color} strokeWidth="3" />
        <circle cx="150" cy="150" r="80" fill={color} opacity="0.08" />
        <circle cx="150" cy="80" r="8" fill={color} />
        <circle cx="220" cy="150" r="8" fill={color} />
        <circle cx="150" cy="220" r="8" fill={color} />
        <circle cx="80" cy="150" r="8" fill={color} />
        <line x1="150" y1="88" x2="150" y2="120" stroke={color} strokeWidth="2" />
        <line x1="212" y1="150" x2="180" y2="150" stroke={color} strokeWidth="2" />
        <line x1="150" y1="212" x2="150" y2="180" stroke={color} strokeWidth="2" />
        <line x1="88" y1="150" x2="120" y2="150" stroke={color} strokeWidth="2" />
        <text x="150" y="162" textAnchor="middle" fill={color} fontSize="28" fontFamily={font} fontWeight="700">
          {name}
        </text>
      </svg>
    )
  },
  {
    id: 9,
    name: 'Layered Rings',
    svg: (name, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern9" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="300" height="300" fill="white" />
        {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern9)" opacity={opacity} />}
        <circle cx="150" cy="150" r="130" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
        <circle cx="150" cy="150" r="110" fill="none" stroke={color} strokeWidth="3" opacity="0.5" />
        <circle cx="150" cy="150" r="90" fill="none" stroke={color} strokeWidth="5" />
        <circle cx="150" cy="150" r="70" fill={color} opacity="0.1" />
        <text x="150" y="162" textAnchor="middle" fill={color} fontSize="28" fontFamily={font} fontWeight="800">
          {name}
        </text>
      </svg>
    )
  },
  {
    id: 10,
    name: 'Hexagon Grid',
    svg: (name, color, bgImage, font, opacity) => (
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          {bgImage && (
            <pattern id="bgPattern10" x="0" y="0" width="100%" height="100%">
              <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <rect x="0" y="0" width="300" height="300" fill="white" />
        {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern10)" opacity={opacity} />}
        <polygon points="150,50 210,85 210,155 150,190 90,155 90,85" fill={color} opacity="0.1" />
        <polygon points="150,60 200,90 200,150 150,180 100,150 100,90" fill="none" stroke={color} strokeWidth="4" />
        <polygon points="150,80 180,98 180,132 150,150 120,132 120,98" fill="none" stroke={color} strokeWidth="2" />
        <text x="150" y="230" textAnchor="middle" fill={color} fontSize="30" fontFamily={font} fontWeight="700">
          {name}
        </text>
      </svg>
    )
  }
];

  const fonts = ['Poppins', 'Montserrat', 'Roboto', 'Playfair Display', 'Open Sans'];
  const colors = ['#3E8EDE', '#dd06f5ff', '#000000ff', '#e5f854ff', '#ff7b00ff', '#27AE60'];


  const generateBackgroundImage = async () => {
    if (!brandDescription.trim()) {
      alert("Please enter a brand description first!");
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
          alert("🤖 AI model is warming up! Please wait 20-30 seconds and try again.");
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
      console.error("Error generating image:", error);
      alert(`Failed to generate background: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const svgElement = document.getElementById('logo-preview')?.querySelector('svg');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 1200, 1200);
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.download = `${companyName.replace(/\s+/g, '_')}_logo.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(url);
      });
    };
    img.src = url;
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-gray-50 py-6 px-4 font-['Poppins']">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-2">
            <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67 0 1.38-1.12 2.5-2.5 2.5zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5 0-.16-.08-.28-.14-.35-.41-.46-.63-1.05-.63-1.65 0-1.38 1.12-2.5 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"/><circle cx="6.5" cy="11.5" r="1.5"/><circle cx="9.5" cy="7.5" r="1.5"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"/>
            </svg>
            Logo Generator
          </h1>
          <p className="text-sm text-gray-600">Create professional logos with AI backgrounds</p>
        </div>

        {!showEditor ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => { setSelectedTemplate(template); setShowEditor(true); }}
                className="bg-white rounded-xl p-4 cursor-pointer transition-all shadow-md hover:shadow-lg hover:border-blue-500 border-2 border-transparent"
              >
                <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                  {template.svg('Company', '#3E8EDE', '', 'Poppins', 0.3)}
                </div>
                <p className="text-center text-xs font-semibold text-gray-900">{template.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* Left Side - Customization */}
            <div className="bg-white rounded-xl p-5 shadow-lg h-fit">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Customize</h3>

              {/* Company Name */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={20}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>

              {/* AI Background */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">AI Background</label>
                <textarea
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                  placeholder="Modern tech startup, coffee shop..."
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

             {/* Font & Color Section (stacked) */}
{/* Font & Color Section (stacked) */}
<div className="flex flex-col gap-4 mb-4">

  {/* Font Options */}
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

  {/* Color Palette BELOW Font */}
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

</div> 
<div className="bg-white rounded-xl p-6 shadow-lg flex flex-col items-center justify-center h-fit">

  <h3 className="text-base font-semibold text-gray-900 mb-3">Preview</h3>

  <div
    id="logo-preview"
    className="w-full max-w-[400px] aspect-square bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden mb-3"
  >
    {selectedTemplate &&
      selectedTemplate.svg(
        companyName,
        selectedColor,
        backgroundImage,
        selectedFont,
        bgOpacity
      )}
  </div>

  <button
    onClick={handleDownload}
    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-blue-700 shadow"
  >
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
    </svg>
    Download Logo
  </button>

</div>



</div> 
)};
</div> {/* End Main Container */}
</>
  );
};

export default LogoGenerator;

