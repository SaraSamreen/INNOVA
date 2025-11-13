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
  const [showEditor, setShowEditor] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = [
    {
      id: 1,
      name: 'Modern Event',
      svg: (title, subtitle, date, location, color, bgImage, font) => (
        <svg viewBox="0 0 400 600" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern1" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
              </pattern>
              <linearGradient id="overlay1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
              </linearGradient>
            </defs>
          )}
          {bgImage ? (
            <>
              <rect x="0" y="0" width="400" height="600" fill="url(#bgPattern1)" />
              <rect x="0" y="0" width="400" height="600" fill="url(#overlay1)" />
            </>
          ) : (
            <rect x="0" y="0" width="400" height="600" fill="#1a1a1a" />
          )}
          <rect x="30" y="350" width="340" height="220" fill={color} opacity="0.95" />
          <text x="200" y="410" textAnchor="middle" fill="white" fontSize="36" fontFamily={font} fontWeight="700">
            {title}
          </text>
          <text x="200" y="450" textAnchor="middle" fill="white" fontSize="16" fontFamily={font} fontWeight="400" opacity="0.9">
            {subtitle}
          </text>
          <line x1="80" y1="475" x2="320" y2="475" stroke="white" strokeWidth="2" opacity="0.5" />
          <text x="200" y="510" textAnchor="middle" fill="white" fontSize="18" fontFamily={font} fontWeight="600">
            {date}
          </text>
          <text x="200" y="540" textAnchor="middle" fill="white" fontSize="14" fontFamily={font} fontWeight="400" opacity="0.8">
            {location}
          </text>
        </svg>
      )
    },
    {
      id: 2,
      name: 'Minimalist',
      svg: (title, subtitle, date, location, color, bgImage, font) => (
        <svg viewBox="0 0 400 600" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern2" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            </defs>
          )}
          <rect x="0" y="0" width="400" height="600" fill={bgImage ? "url(#bgPattern2)" : "white"} />
          <rect x="0" y="0" width="400" height="600" fill="white" opacity={bgImage ? "0.85" : "1"} />
          <rect x="40" y="40" width="320" height="520" fill="none" stroke={color} strokeWidth="3" />
          <text x="200" y="200" textAnchor="middle" fill={color} fontSize="42" fontFamily={font} fontWeight="700">
            {title}
          </text>
          <text x="200" y="250" textAnchor="middle" fill="#333" fontSize="16" fontFamily={font} fontWeight="400">
            {subtitle}
          </text>
          <rect x="150" y="280" width="100" height="3" fill={color} />
          <text x="200" y="400" textAnchor="middle" fill={color} fontSize="20" fontFamily={font} fontWeight="600">
            {date}
          </text>
          <text x="200" y="440" textAnchor="middle" fill="#666" fontSize="16" fontFamily={font} fontWeight="400">
            {location}
          </text>
        </svg>
      )
    },
    {
      id: 3,
      name: 'Bold Typography',
      svg: (title, subtitle, date, location, color, bgImage, font) => (
        <svg viewBox="0 0 400 600" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern3" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
              </pattern>
              <linearGradient id="overlay3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="0.95" />
              </linearGradient>
            </defs>
          )}
          {bgImage ? (
            <>
              <rect x="0" y="0" width="400" height="600" fill="url(#bgPattern3)" />
              <rect x="0" y="0" width="400" height="600" fill="url(#overlay3)" />
            </>
          ) : (
            <rect x="0" y="0" width="400" height="600" fill={color} />
          )}
          <text x="200" y="250" textAnchor="middle" fill="white" fontSize="52" fontFamily={font} fontWeight="900" style={{letterSpacing: '-2px'}}>
            {title}
          </text>
          <text x="200" y="300" textAnchor="middle" fill="white" fontSize="18" fontFamily={font} fontWeight="300" opacity="0.95">
            {subtitle}
          </text>
          <text x="200" y="450" textAnchor="middle" fill="white" fontSize="22" fontFamily={font} fontWeight="700">
            {date}
          </text>
          <text x="200" y="490" textAnchor="middle" fill="white" fontSize="16" fontFamily={font} fontWeight="400" opacity="0.9">
            {location}
          </text>
        </svg>
      )
    },
    {
      id: 4,
      name: 'Split Design',
      svg: (title, subtitle, date, location, color, bgImage, font) => (
        <svg viewBox="0 0 400 600" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern4" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            </defs>
          )}
          {bgImage ? (
            <rect x="0" y="0" width="400" height="300" fill="url(#bgPattern4)" />
          ) : (
            <rect x="0" y="0" width="400" height="300" fill="#2C2C2C" />
          )}
          <rect x="0" y="300" width="400" height="300" fill="white" />
          <rect x="0" y="290" width="400" height="20" fill={color} />
          <text x="200" y="180" textAnchor="middle" fill="white" fontSize="44" fontFamily={font} fontWeight="800">
            {title}
          </text>
          <text x="200" y="220" textAnchor="middle" fill="white" fontSize="16" fontFamily={font} fontWeight="400" opacity="0.9">
            {subtitle}
          </text>
          <text x="200" y="400" textAnchor="middle" fill={color} fontSize="24" fontFamily={font} fontWeight="700">
            {date}
          </text>
          <text x="200" y="450" textAnchor="middle" fill="#333" fontSize="16" fontFamily={font} fontWeight="500">
            {location}
          </text>
        </svg>
      )
    },
    {
      id: 5,
      name: 'Creative Angle',
      svg: (title, subtitle, date, location, color, bgImage, font) => (
        <svg viewBox="0 0 400 600" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern5" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
              </pattern>
              <clipPath id="clip5">
                <polygon points="0,0 400,0 400,450 0,600" />
              </clipPath>
            </defs>
          )}
          {bgImage ? (
            <rect x="0" y="0" width="400" height="600" fill="url(#bgPattern5)" clipPath="url(#clip5)" />
          ) : (
            <polygon points="0,0 400,0 400,450 0,600" fill="#1a1a1a" />
          )}
          <polygon points="0,450 400,300 400,600 0,600" fill={color} />
          <text x="200" y="200" textAnchor="middle" fill="white" fontSize="48" fontFamily={font} fontWeight="800">
            {title}
          </text>
          <text x="200" y="250" textAnchor="middle" fill="white" fontSize="16" fontFamily={font} fontWeight="400" opacity="0.95">
            {subtitle}
          </text>
          <text x="200" y="480" textAnchor="middle" fill="white" fontSize="22" fontFamily={font} fontWeight="700">
            {date}
          </text>
          <text x="200" y="520" textAnchor="middle" fill="white" fontSize="15" fontFamily={font} fontWeight="400" opacity="0.95">
            {location}
          </text>
        </svg>
      )
    },
    {
      id: 6,
      name: 'Geometric',
      svg: (title, subtitle, date, location, color, bgImage, font) => (
        <svg viewBox="0 0 400 600" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern6" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            </defs>
          )}
          <rect x="0" y="0" width="400" height="600" fill={bgImage ? "url(#bgPattern6)" : "#f5f5f5"} />
          <rect x="0" y="0" width="400" height="600" fill="white" opacity={bgImage ? "0.9" : "0"} />
          <circle cx="200" cy="200" r="120" fill="none" stroke={color} strokeWidth="4" />
          <circle cx="200" cy="200" r="100" fill={color} opacity="0.1" />
          <text x="200" y="210" textAnchor="middle" fill={color} fontSize="38" fontFamily={font} fontWeight="700">
            {title}
          </text>
          <rect x="80" y="350" width="240" height="2" fill={color} />
          <text x="200" y="400" textAnchor="middle" fill="#333" fontSize="16" fontFamily={font} fontWeight="400">
            {subtitle}
          </text>
          <text x="200" y="480" textAnchor="middle" fill={color} fontSize="20" fontFamily={font} fontWeight="600">
            {date}
          </text>
          <text x="200" y="520" textAnchor="middle" fill="#666" fontSize="15" fontFamily={font} fontWeight="400">
            {location}
          </text>
        </svg>
      )
    },
    {
      id: 7,
      name: 'Gradient Overlay',
      svg: (title, subtitle, date, location, color, bgImage, font) => (
        <svg viewBox="0 0 400 600" className="template-svg">
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
          {bgImage ? (
            <>
              <rect x="0" y="0" width="400" height="600" fill="url(#bgPattern7)" />
              <rect x="0" y="0" width="400" height="600" fill="url(#gradient7)" />
            </>
          ) : (
            <rect x="0" y="0" width="400" height="600" fill="url(#gradient7)" />
          )}
          <text x="200" y="280" textAnchor="middle" fill="white" fontSize="46" fontFamily={font} fontWeight="800">
            {title}
          </text>
          <text x="200" y="330" textAnchor="middle" fill="white" fontSize="18" fontFamily={font} fontWeight="400" opacity="0.95">
            {subtitle}
          </text>
          <line x1="100" y1="360" x2="300" y2="360" stroke="white" strokeWidth="2" opacity="0.6" />
          <text x="200" y="420" textAnchor="middle" fill="white" fontSize="22" fontFamily={font} fontWeight="700">
            {date}
          </text>
          <text x="200" y="460" textAnchor="middle" fill="white" fontSize="16" fontFamily={font} fontWeight="400" opacity="0.9">
            {location}
          </text>
        </svg>
      )
    },
    {
      id: 8,
      name: 'Frame Focus',
      svg: (title, subtitle, date, location, color, bgImage, font) => (
        <svg viewBox="0 0 400 600" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern8" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="400" height="600" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            </defs>
          )}
          <rect x="0" y="0" width="400" height="600" fill={bgImage ? "url(#bgPattern8)" : "#2C2C2C"} />
          <rect x="0" y="0" width="400" height="600" fill="black" opacity={bgImage ? "0.4" : "0"} />
          <rect x="50" y="150" width="300" height="300" fill="white" opacity="0.95" />
          <rect x="60" y="160" width="280" height="280" fill="none" stroke={color} strokeWidth="3" />
          <text x="200" y="250" textAnchor="middle" fill={color} fontSize="40" fontFamily={font} fontWeight="800">
            {title}
          </text>
          <text x="200" y="290" textAnchor="middle" fill="#333" fontSize="15" fontFamily={font} fontWeight="400">
            {subtitle}
          </text>
          <rect x="120" y="315" width="160" height="2" fill={color} opacity="0.5" />
          <text x="200" y="365" textAnchor="middle" fill={color} fontSize="20" fontFamily={font} fontWeight="700">
            {date}
          </text>
          <text x="200" y="400" textAnchor="middle" fill="#666" fontSize="14" fontFamily={font} fontWeight="500">
            {location}
          </text>
        </svg>
      )
    }
  ];

  const fonts = [
    'Poppins',
    'Montserrat',
    'Roboto',
    'Playfair Display',
    'Open Sans',
    'Lato',
    'Raleway',
    'Inter'
  ];

  const colors = [
    '#3E8EDE', // Blue
    '#2E7BC8', // Darker Blue
    '#E94B3C', // Red
    '#F39C12', // Orange
    '#27AE60', // Green
    '#8E44AD', // Purple
    '#E74C3C', // Bright Red
    '#2C2C2C'  // Dark Gray
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const generateBackgroundImage = async () => {
    if (!brandDescription.trim()) {
      alert("Please enter a description for the poster background!");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: `Professional poster background for ${brandDescription}, high quality, artistic` }),
        }
      );

      if (!response.ok) {
        throw new Error(`HF API error: ${response.status}`);
      }

      const blob = await response.blob();
      const imgUrl = URL.createObjectURL(blob);

      setBackgroundImage(imgUrl);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate background image. Try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const svgElement = document.getElementById('poster-preview').querySelector('svg');
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

  const handleReset = () => {
    setPosterTitle('Your Event');
    setPosterSubtitle('Join us for an amazing experience');
    setPosterDate('December 25, 2025');
    setPosterLocation('City Convention Center');
    setBrandDescription('');
    setSelectedFont('Poppins');
    setSelectedColor('#3E8EDE');
    setBackgroundImage('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <svg style={styles.icon} viewBox="0 0 24 24" fill="currentColor" width="42" height="42">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2v-2h2v-2h-2v-2h-2v2H9v2h2z"/>
          </svg>
          Poster Generator
        </h1>
        <p style={styles.subtitle}>Design stunning posters with AI-powered backgrounds</p>
      </div>

      {!showEditor ? (
        <div style={styles.templatesGrid}>
          {templates.map((template) => (
            <div
              key={template.id}
              style={styles.templateCard}
              onClick={() => handleTemplateSelect(template)}
            >
              <div style={styles.templatePreview}>
                {template.svg('EVENT', 'Description', 'Date', 'Location', '#3E8EDE', '', 'Poppins')}
              </div>
              <p style={styles.templateName}>{template.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.editorContainer}>
          <div style={styles.editorSidebar}>
            <h3 style={styles.sectionTitle}>Customize Your Poster</h3>
            
            <div style={styles.controlGroup}>
              <label style={styles.label}>Event Title</label>
              <input
                type="text"
                value={posterTitle}
                onChange={(e) => setPosterTitle(e.target.value)}
                style={styles.input}
                maxLength={30}
              />
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.label}>Subtitle</label>
              <input
                type="text"
                value={posterSubtitle}
                onChange={(e) => setPosterSubtitle(e.target.value)}
                style={styles.input}
                maxLength={50}
              />
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.label}>Date</label>
              <input
                type="text"
                value={posterDate}
                onChange={(e) => setPosterDate(e.target.value)}
                style={styles.input}
                maxLength={40}
              />
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.label}>Location</label>
              <input
                type="text"
                value={posterLocation}
                onChange={(e) => setPosterLocation(e.target.value)}
                style={styles.input}
                maxLength={40}
              />
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.label}>
                <svg style={styles.smallIcon} viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 14H9v-2h6v2zm3-4H6V8h12v4z"/>
                </svg>
                Background Description (for AI)
              </label>
              <textarea
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                style={styles.textarea}
                placeholder="e.g., music festival, tech conference, art exhibition, sports event..."
                rows="3"
              />
              <button 
                onClick={generateBackgroundImage} 
                style={styles.generateButton}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div style={styles.spinner}></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{marginRight: '8px'}}>
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                    Generate AI Background
                  </>
                )}
              </button>
              {backgroundImage && (
                <button 
                  onClick={() => setBackgroundImage('')} 
                  style={styles.removeButton}
                >
                  Remove Background
                </button>
              )}
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.label}>
                <svg style={styles.smallIcon} viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z"/>
                </svg>
                Font Style
              </label>
              <div style={styles.fontGrid}>
                {fonts.map((font) => (
                  <button
                    key={font}
                    onClick={() => setSelectedFont(font)}
                    style={{
                      ...styles.fontButton,
                      ...(selectedFont === font ? styles.fontButtonActive : {})
                    }}
                  >
                    <span style={{ fontFamily: font }}>{font}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.label}>
                <svg style={styles.smallIcon} viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67 0 1.38-1.12 2.5-2.5 2.5zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5 0-.16-.08-.28-.14-.35-.41-.46-.63-1.05-.63-1.65 0-1.38 1.12-2.5 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"/>
                </svg>
                Primary Color
              </label>
              <div style={styles.colorGrid}>
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      ...styles.colorButton,
                      backgroundColor: color,
                      ...(selectedColor === color ? styles.colorButtonActive : {})
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button onClick={handleReset} style={styles.resetButton}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{marginRight: '8px'}}>
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                </svg>
                Reset
              </button>
              <button onClick={() => setShowEditor(false)} style={styles.backButton}>
                Back to Templates
              </button>
            </div>
          </div>

          <div style={styles.previewArea}>
            <h3 style={styles.previewTitle}>Preview</h3>
            <div style={styles.posterPreview} id="poster-preview">
              {selectedTemplate && selectedTemplate.svg(posterTitle, posterSubtitle, posterDate, posterLocation, selectedColor, backgroundImage, selectedFont)}
            </div>
            <button onClick={handleDownload} style={styles.downloadButton}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style={{marginRight: '10px'}}>
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
              </svg>
              Download Poster
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FAFAFA',
    padding: '40px 20px',
    fontFamily: 'Poppins, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px'
  },
  title: {
    fontSize: '42px',
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px'
  },
  icon: {
    color: '#3E8EDE'
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    fontWeight: '400'
  },
  templatesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '30px',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px'
  },
  templateCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '30px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(62, 142, 222, 0.1)',
    border: '2px solid transparent'
  },
  templatePreview: {
    width: '100%',
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px',
    backgroundColor: '#FAFAFA',
    borderRadius: '12px'
  },
  templateName: {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '600',
    color: '#2C2C2C',
    margin: 0
  },
  editorContainer: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px'
  },
  editorSidebar: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(62, 142, 222, 0.1)',
    height: 'fit-content',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: '25px'
  },
  controlGroup: {
    marginBottom: '25px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: '10px'
  },
  smallIcon: {
    color: '#3E8EDE'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid #E5E5E5',
    fontSize: '16px',
    fontWeight: '500',
    color: '#2C2C2C',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid #E5E5E5',
    fontSize: '14px',
    fontWeight: '400',
    color: '#2C2C2C',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Poppins, sans-serif',
    resize: 'vertical'
  },
  generateButton: {
    width: '100%',
    marginTop: '12px',
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#3E8EDE',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  removeButton: {
    width: '100%',
    marginTop: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    border: '2px solid #E94B3C',
    backgroundColor: 'white',
    color: '#E94B3C',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  spinner: {
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    animation: 'spin 1s linear infinite',
    marginRight: '8px'
  },
  fontGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '10px'
  },
  fontButton: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid #E5E5E5',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2C2C2C',
    transition: 'all 0.3s ease',
    textAlign: 'left'
  },
  fontButtonActive: {
    borderColor: '#3E8EDE',
    backgroundColor: '#E3F2FD'
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px'
  },
  colorButton: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '10px',
    border: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  colorButtonActive: {
    borderColor: '#2C2C2C',
    transform: 'scale(1.1)'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '30px'
  },
  resetButton: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: '2px solid #E5E5E5',
    backgroundColor: 'white',
    color: '#4A4A4A',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  backButton: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: '2px solid #3E8EDE',
    backgroundColor: 'white',
    color: '#3E8EDE',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  previewArea: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 12px rgba(62, 142, 222, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: '30px'
  },
  posterPreview: {
    width: '400px',
    height: '600px',
    backgroundColor: '#FAFAFA',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px',
    border: '2px solid #E5E5E5',
    overflow: 'hidden'
  },
  downloadButton: {
    padding: '16px 40px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#3E8EDE',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(62, 142, 222, 0.3)'
  }
};

// Add spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .template-svg {
    width: 100%;
    height: 100%;
  }
`;
document.head.appendChild(styleSheet);

// Add Google Fonts
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Montserrat:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Raleway:wght@400;600;700&family=Inter:wght@400;600;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

export default PosterGenerator;