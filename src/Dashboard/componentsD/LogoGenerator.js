import React, { useState } from 'react';

const LogoGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [companyName, setCompanyName] = useState('Your Company');
  const [brandDescription, setBrandDescription] = useState('');
  const [selectedFont, setSelectedFont] = useState('Poppins');
  const [selectedColor, setSelectedColor] = useState('#8B7AB8');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = [
    {
      id: 1,
      name: 'Modern Circle',
      svg: (name, color, bgImage) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern1" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" opacity="1" />
              </pattern>
            </defs>
          )}
          {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern1)" />}
          <circle cx="150" cy="150" r="140" fill={color} opacity="0.1" />
          <circle cx="150" cy="150" r="120" fill="none" stroke={color} strokeWidth="3" />
          <text x="150" y="160" textAnchor="middle" fill={color} fontSize="32" fontFamily={selectedFont} fontWeight="600">
            {name}
          </text>
        </svg>
      )
    },
    {
      id: 2,
      name: 'Minimalist Square',
      svg: (name, color, bgImage) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern2" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" opacity="1" />
              </pattern>
            </defs>
          )}
          {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern2)" />}
          <rect x="30" y="30" width="240" height="240" fill="none" stroke={color} strokeWidth="4" />
          <rect x="50" y="50" width="200" height="200" fill={color} opacity="0.08" />
          <text x="150" y="160" textAnchor="middle" fill={color} fontSize="28" fontFamily={selectedFont} fontWeight="600">
            {name}
          </text>
        </svg>
      )
    },
    {
      id: 3,
      name: 'Elegant Badge',
      svg: (name, color, bgImage) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern3" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" opacity="1" />
              </pattern>
            </defs>
          )}
          {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern3)" />}
          <polygon points="150,20 250,80 250,220 150,280 50,220 50,80" fill={color} opacity="0.1" />
          <polygon points="150,30 240,85 240,215 150,270 60,215 60,85" fill="none" stroke={color} strokeWidth="3" />
          <text x="150" y="160" textAnchor="middle" fill={color} fontSize="26" fontFamily={selectedFont} fontWeight="600">
            {name}
          </text>
        </svg>
      )
    },
    {
      id: 4,
      name: 'Bold Typography',
      svg: (name, color, bgImage) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern4" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" opacity="1" />
              </pattern>
            </defs>
          )}
          {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern4)" />}
          <rect x="40" y="120" width="220" height="60" fill={color} />
          <text x="150" y="162" textAnchor="middle" fill="white" fontSize="34" fontFamily={selectedFont} fontWeight="700">
            {name}
          </text>
        </svg>
      )
    },
    {
      id: 5,
      name: 'Creative Arc',
      svg: (name, color, bgImage) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern5" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" opacity="1" />
              </pattern>
            </defs>
          )}
          {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern5)" />}
          <path d="M 50 200 Q 150 50 250 200" fill="none" stroke={color} strokeWidth="4" />
          <path d="M 60 210 Q 150 80 240 210" fill={color} opacity="0.1" />
          <text x="150" y="240" textAnchor="middle" fill={color} fontSize="30" fontFamily={selectedFont} fontWeight="600">
            {name}
          </text>
        </svg>
      )
    },
    {
      id: 6,
      name: 'Diamond Frame',
      svg: (name, color, bgImage) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern6" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" opacity="1" />
              </pattern>
            </defs>
          )}
          {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern6)" />}
          <rect x="150" y="150" width="160" height="160" fill={color} opacity="0.1" transform="rotate(45 150 150)" />
          <rect x="150" y="150" width="140" height="140" fill="none" stroke={color} strokeWidth="3" transform="rotate(45 150 150)" />
          <text x="150" y="160" textAnchor="middle" fill={color} fontSize="28" fontFamily={selectedFont} fontWeight="600">
            {name}
          </text>
        </svg>
      )
    },
    {
      id: 7,
      name: 'Wave Design',
      svg: (name, color, bgImage) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern7" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" opacity="1" />
              </pattern>
            </defs>
          )}
          {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern7)" />}
          <path d="M 30 150 Q 90 100 150 150 T 270 150" fill="none" stroke={color} strokeWidth="4" />
          <path d="M 30 170 Q 90 120 150 170 T 270 170" fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
          <text x="150" y="220" textAnchor="middle" fill={color} fontSize="30" fontFamily={selectedFont} fontWeight="600">
            {name}
          </text>
        </svg>
      )
    },
    {
      id: 8,
      name: 'Dual Ring',
      svg: (name, color, bgImage) => (
        <svg viewBox="0 0 300 300" className="template-svg">
          {bgImage && (
            <defs>
              <pattern id="bgPattern8" x="0" y="0" width="100%" height="100%">
                <image href={bgImage} x="0" y="0" width="300" height="300" opacity="1" />
              </pattern>
            </defs>
          )}
          {bgImage && <rect x="0" y="0" width="300" height="300" fill="url(#bgPattern8)" />}
          <circle cx="150" cy="150" r="130" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="150" cy="150" r="110" fill="none" stroke={color} strokeWidth="4" />
          <circle cx="150" cy="150" r="95" fill={color} opacity="0.08" />
          <text x="150" y="160" textAnchor="middle" fill={color} fontSize="26" fontFamily={selectedFont} fontWeight="600">
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
    '#8B7AB8', // Light Purple
    '#6B5B95', // Medium Purple
    '#9B8AC4', // Soft Purple
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
            Authorization: `Bearer ${process.env.REACT_APP_HF_API_KEY}`, // put in .env
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: `Background image for ${brandDescription}` }),
        }
      );
  
      if (!response.ok) {
        throw new Error(`HF API error: ${response.status}`);
      }
  
      // Get the generated image as a blob
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
    setSelectedColor('#8B7AB8');
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
                {template.svg('Company', '#8B7AB8', '')}
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
              {selectedTemplate && selectedTemplate.svg(companyName, selectedColor, backgroundImage)}
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
    color: '#8B7AB8'
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
    boxShadow: '0 4px 12px rgba(139, 122, 184, 0.1)',
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
    boxShadow: '0 4px 12px rgba(139, 122, 184, 0.1)',
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
    color: '#8B7AB8'
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
    backgroundColor: '#8B7AB8',
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
    borderColor: '#8B7AB8',
    backgroundColor: '#F5F3F9'
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
    border: '2px solid #8B7AB8',
    backgroundColor: 'white',
    color: '#8B7AB8',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  previewArea: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 12px rgba(139, 122, 184, 0.1)',
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
    backgroundColor: '#8B7AB8',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(139, 122, 184, 0.3)'
  }
};

// Add spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

// Add Google Fonts
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Raleway:wght@400;600;700&family=Inter:wght@400;600;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

export default LogoGenerator;