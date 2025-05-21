import React, { useRef } from 'react';
import '../../Styles/Createvidpg1.css';

export default function Createvidpg1() {
  const fileInputRef = useRef();

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("User selected file:", file);
    }
  };

  return (
    <div className="create-video-wrapper">
      {/* Step Timeline */}
      <div className="step-timeline">
        <div className="step active">1. Choose Model</div>
        <div className="line"></div>
        <div className="step">2. Choose VoiceOver</div>
        <div className="line"></div>
        <div className="step">3. Write Script</div>
        <div className="line"></div>
        <div className="step">4. Customize</div>
        <div className="line"></div>
        <div className="step">5. Preview & Generate</div>
      </div>

      {/* Content Area */}
      <div className="content-area">
        <h2 className="main-heading">Step 1: Choose Your AI Model</h2>
        <div className="face-grid">
          <img src='./videos/face1.png' alt="Face 1" />
          <img src='./videos/face2.png' alt="Face 2" />
          <img src='./videos/face3.png' alt="Face 3" />
          <img src='./videos/face4.png' alt="Face 4" />
          <img src='./videos/face5.png' alt="Face 5" />
          <img src='./videos/face6.png' alt="Face 6" />
          <img src='./videos/face7.png' alt="Face 7" />

          <div className="upload-box" onClick={handleUploadClick}>
            
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <p>Upload Model</p>
            <span className="plus-sign">+</span>
          </div>
        </div>

        <button className="step-button">Next: Choose voiceover →</button>
      </div>
    </div>
  );
}
