import React, { useState } from 'react';

const LogoGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [companyName, setCompanyName] = useState('Your Company');
  const [brandDescription, setBrandDescription] = useState('');
  const [selectedFont, setSelectedFont] = useState('Poppins');
  const [selectedColor, setSelectedColor] = useState('#3E8EDE');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = [
    {
      id: 1,
      name: 'Modern Circle',
      svg: (name, color, bgImage, font) => (
        <svg viewBox="0 0 300 300" className="template-svg">
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
          {bgImage ? (
            <>
              <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern1)" />
              <rect x="0" y="0" width="300" height="300" fill="white" opacity="0.85" />
            </>
          ) : (
            <rect x="0" y="0" width="300" height="300" fill="white" />
          )}
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
      name: 'Geometric Shield',
      svg: (name, color, bgImage, font) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          <defs>
            {bgImage && (
              <pattern id="bgPattern2" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          {bgImage ? (
            <>
              <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern2)" />
              <rect x="0" y="0" width="300" height="300" fill="white" opacity="0.9" />
            </>
          ) : (
            <rect x="0" y="0" width="300" height="300" fill="white" />
          )}
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
      id: 3,
      name: 'Dynamic Wave',
      svg: (name, color, bgImage, font) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          <defs>
            {bgImage && (
              <pattern id="bgPattern3" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          {bgImage ? (
            <>
              <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern3)" />
              <rect x="0" y="0" width="300" height="300" fill="white" opacity="0.85" />
            </>
          ) : (
            <rect x="0" y="0" width="300" height="300" fill="white" />
          )}
          <path d="M 30 120 Q 90 80 150 120 T 270 120" fill="none" stroke={color} strokeWidth="5" />
          <path d="M 30 140 Q 90 100 150 140 T 270 140" fill="none" stroke={color} strokeWidth="3" opacity="0.6" />
          <path d="M 30 160 Q 90 120 150 160 T 270 160" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
          <text x="150" y="210" textAnchor="middle" fill={color} fontSize="34" fontFamily={font} fontWeight="800">
            {name}
          </text>
        </svg>
      )
    },
    {
      id: 4,
      name: 'Bold Frame',
      svg: (name, color, bgImage, font) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          <defs>
            {bgImage && (
              <pattern id="bgPattern4" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
            <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {bgImage ? (
            <>
              <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern4)" />
              <rect x="0" y="0" width="300" height="300" fill="white" opacity="0.8" />
            </>
          ) : (
            <rect x="0" y="0" width="300" height="300" fill="white" />
          )}
          <rect x="30" y="30" width="240" height="240" fill="none" stroke={color} strokeWidth="6" />
          <rect x="45" y="130" width="210" height="50" fill="url(#grad4)" />
          <text x="150" y="167" textAnchor="middle" fill="white" fontSize="30" fontFamily={font} fontWeight="800">
            {name}
          </text>
        </svg>
      )
    },
    {
      id: 5,
      name: 'Infinity Loop',
      svg: (name, color, bgImage, font) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          <defs>
            {bgImage && (
              <pattern id="bgPattern5" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          {bgImage ? (
            <>
              <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern5)" />
              <rect x="0" y="0" width="300" height="300" fill="white" opacity="0.9" />
            </>
          ) : (
            <rect x="0" y="0" width="300" height="300" fill="white" />
          )}
          <path d="M 70 120 Q 70 80 100 80 Q 130 80 150 110 Q 170 80 200 80 Q 230 80 230 120 Q 230 160 200 160 Q 170 160 150 130 Q 130 160 100 160 Q 70 160 70 120" 
                fill="none" stroke={color} strokeWidth="5" />
          <circle cx="100" cy="120" r="8" fill={color} />
          <circle cx="200" cy="120" r="8" fill={color} />
          <text x="150" y="220" textAnchor="middle" fill={color} fontSize="32" fontFamily={font} fontWeight="700">
            {name}
          </text>
        </svg>
      )
    },
    {
      id: 6,
      name: 'Diamond Split',
      svg: (name, color, bgImage, font) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          <defs>
            {bgImage && (
              <pattern id="bgPattern6" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          {bgImage ? (
            <>
              <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern6)" />
              <rect x="0" y="0" width="300" height="300" fill="white" opacity="0.85" />
            </>
          ) : (
            <rect x="0" y="0" width="300" height="300" fill="white" />
          )}
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
      id: 7,
      name: 'Tech Circuit',
      svg: (name, color, bgImage, font) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          <defs>
            {bgImage && (
              <pattern id="bgPattern7" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          {bgImage ? (
            <>
              <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern7)" />
              <rect x="0" y="0" width="300" height="300" fill="white" opacity="0.9" />
            </>
          ) : (
            <rect x="0" y="0" width="300" height="300" fill="white" />
          )}
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
      id: 8,
      name: 'Crown Emblem',
      svg: (name, color, bgImage, font) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          <defs>
            {bgImage && (
              <pattern id="bgPattern8" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          {bgImage ? (
            <>
              <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern8)" />
              <rect x="0" y="0" width="300" height="300" fill="white" opacity="0.88" />
            </>
          ) : (
            <rect x="0" y="0" width="300" height="300" fill="white" />
          )}
          <path d="M 60 120 L 90 80 L 120 120 L 150 60 L 180 120 L 210 80 L 240 120 L 230 180 L 70 180 Z" 
                fill={color} opacity="0.15" />
          <path d="M 60 120 L 90 80 L 120 120 L 150 60 L 180 120 L 210 80 L 240 120 L 230 180 L 70 180 Z" 
                fill="none" stroke={color} strokeWidth="3" />
          <circle cx="90" cy="80" r="6" fill={color} />
          <circle cx="150" cy="60" r="8" fill={color} />
          <circle cx="210" cy="80" r="6" fill={color} />
          <text x="150" y="215" textAnchor="middle" fill={color} fontSize="30" fontFamily={font} fontWeight="700">
            {name}
          </text>
        </svg>
      )
    },
    {
      id: 9,
      name: 'Abstract Flow',
      svg: (name, color, bgImage, font) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          <defs>
            {bgImage && (
              <pattern id="bgPattern9" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          {bgImage ? (
            <>
              <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern9)" />
              <rect x="0" y="0" width="300" height="300" fill="white" opacity="0.87" />
            </>
          ) : (
            <rect x="0" y="0" width="300" height="300" fill="white" />
          )}
          <path d="M 50 100 Q 100 60 150 100 Q 200 140 250 100" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
          <path d="M 50 140 Q 100 100 150 140 Q 200 180 250 140" fill="none" stroke={color} strokeWidth="6" opacity="0.6" strokeLinecap="round" />
          <path d="M 50 180 Q 100 140 150 180 Q 200 220 250 180" fill="none" stroke={color} strokeWidth="4" opacity="0.3" strokeLinecap="round" />
          <text x="150" y="235" textAnchor="middle" fill={color} fontSize="32" fontFamily={font} fontWeight="700">
            {name}
          </text>
        </svg>
      )
    },
    {
      id: 10,
      name: 'Layered Rings',
      svg: (name, color, bgImage, font) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          <defs>
            {bgImage && (
              <pattern id="bgPattern10" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          {bgImage ? (
            <>
              <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern10)" />
              <rect x="0" y="0" width="300" height="300" fill="white" opacity="0.86" />
            </>
          ) : (
            <rect x="0" y="0" width="300" height="300" fill="white" />
          )}
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
      id: 11,
      name: 'Mountain Peak',
      svg: (name, color, bgImage, font) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          <defs>
            {bgImage && (
              <pattern id="bgPattern11" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          {bgImage ? (
            <>
              <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern11)" />
              <rect x="0" y="0" width="300" height="300" fill="white" opacity="0.88" />
            </>
          ) : (
            <rect x="0" y="0" width="300" height="300" fill="white" />
          )}
          <path d="M 30 180 L 100 80 L 150 120 L 200 60 L 270 180 Z" fill={color} opacity="0.12" />
          <path d="M 30 180 L 100 80 L 150 120 L 200 60 L 270 180" fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" />
          <circle cx="200" cy="60" r="6" fill={color} />
          <text x="150" y="230" textAnchor="middle" fill={color} fontSize="32" fontFamily={font} fontWeight="700">
            {name}
          </text>
        </svg>
      )
    },
    {
      id: 12,
      name: 'Hexagon Grid',
      svg: (name, color, bgImage, font) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          <defs>
            {bgImage && (
              <pattern id="bgPattern12" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>
          {bgImage ? (
            <>
              <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern12)" />
              <rect x="0" y="0" width="300" height="300" fill="white" opacity="0.9" />
            </>
          ) : (
            <rect x="0" y="0" width="300" height="300" fill="white" />
          )}
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
    '#3E8EDE', // Tufts Blue
    '#2E7BC8', // Darker Blue
    '#6BA3E8', // Light Blue
    '#4A4A4A', // Dark Gray
    '#2C2C2C', // Charcoal
    '#E94B3C', // Red
    '#F39C12', // Orange
    '#27AE60'  // Green
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const generateBackgroundImage = async () => {
    if (!brandDescription.trim()) {
      alert("Please enter a brand description first!");
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
          body: JSON.stringify({ inputs: `Professional background for ${brandDescription}, abstract, minimalist, high quality` }),
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
    const svgElement = document.getElementById('logo-preview').querySelector('svg');
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

  const handleReset = () => {
    setCompanyName('Your Company');
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
            <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67 0 1.38-1.12 2.5-2.5 2.5zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5 0-.16-.08-.28-.14-.35-.41-.46-.63-1.05-.63-1.65 0-1.38 1.12-2.5 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"/><circle cx="6.5" cy="11.5" r="1.5"/><circle cx="9.5" cy="7.5" r="1.5"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"/>
          </svg>
          Logo Generator
        </h1>
        <p style={styles.subtitle}>Create professional logos with AI-powered backgrounds</p>
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
                {template.svg('Company', '#3E8EDE', '', 'Poppins')}
              </div>
              <p style={styles.templateName}>{template.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.editorContainer}>
          <div style={styles.editorSidebar}>
            <h3 style={styles.sectionTitle}>Customize Your Logo</h3>
            
            <div style={styles.controlGroup}>
              <label style={styles.label}>Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={styles.input}
                maxLength={20}
              />
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.label}>
                <svg style={styles.smallIcon} viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 14H9v-2h6v2zm3-4H6V8h12v4z"/>
                </svg>
                Brand Description (for AI background)
              </label>
              <textarea
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                style={styles.textarea}
                placeholder="e.g., Modern tech startup, coffee shop, fitness brand..."
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
                Color
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
            <div style={styles.logoPreview} id="logo-preview">
              {selectedTemplate && selectedTemplate.svg(companyName, selectedColor, backgroundImage, selectedFont)}
            </div>
            <button onClick={handleDownload} style={styles.downloadButton}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style={{marginRight: '10px'}}>
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
              </svg>
              Download Logo
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
    height: '220px',
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
    marginBottom: '30px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: '12px'
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
  logoPreview: {
    width: '500px',
    height: '500px',
    backgroundColor: '#FAFAFA',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px',
    border: '2px solid #E5E5E5'
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

// Add spinner animation and SVG styles
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
fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Raleway:wght@400;600;700&family=Inter:wght@400;600;700;800&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

export default LogoGenerator;