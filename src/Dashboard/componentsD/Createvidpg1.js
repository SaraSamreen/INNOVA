// File: CreateScript1.js
import React, { useState } from 'react';
import '../../Styles/Createvidpg1.css';

export default function Createvidpg1() {
  const [inputText, setInputText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [actor, setActor] = useState('');        // no default
  const [background, setBackground] = useState(''); // no default
  const [videoType, setVideoType] = useState('');   // no default
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    setCharCount(text.length);
  };

  // Generate Enhanced Script
  const generateScript = async () => {
    if (!inputText.trim() || !actor || !background || !videoType) {
      alert('⚠️ Please fill in all options before enhancing the script.');
      return;
    }

    setLoading(true);
    setScript('');

    const prompt = `
      Enhance this user script for an AI-generated video. 
      Actor: ${actor}, Background: ${background}, Video Type: ${videoType}.
      User Script: ${inputText}
      Please rewrite and enhance it to be more engaging and professional.
    `;

try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();

      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        setScript(data.candidates[0].content.parts[0].text);
      } else {
        setScript('⚠️ No script generated. Try again.');
        console.warn('Unexpected response:', data);
      }
    } catch (error) {
      console.error('Error generating script:', error);
      setScript('Error generating script.');
    }

    setLoading(false);
  };

  const moveToStep2 = () => {
    if (!actor || !background || !videoType) {
      alert('⚠️ Please make sure you selected Actor, Background, and Video Type.');
      return;
    }
    alert('✅ Moving to Step 2: Audio Generation (hook this to your router)');
  };

  return (
    <div className="video-generator-container">
      <div className="header">
        <h1 className="version">AI Content Creator </h1>
      </div>

      <div className="content">
        <h2 className="prompt-text">Customize Your Video Setup 🎬</h2>

        {/* Actor Selection */}
        <div className="option-group">
          <h3>Choose Actor:</h3>
          <label>
            <input
              type="radio"
              name="actor"
              value="male"
              checked={actor === 'male'}
              onChange={(e) => setActor(e.target.value)}
            />
            Male
          </label>
          <label>
            <input
              type="radio"
              name="actor"
              value="female"
              checked={actor === 'female'}
              onChange={(e) => setActor(e.target.value)}
            />
            Female
          </label>
        </div>

        {/* Background Dropdown */}
        <div className="option-group">
          <h3>Select Background:</h3>
          <select
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          >
            <option value="">-- Select Background --</option>
            <option value="studio">Studio</option>
            <option value="office">Office</option>
            <option value="nature">Nature</option>
            <option value="portrait">Portrait</option>
            <option value="abstract">Abstract</option>
          </select>
        </div>

        {/* Video Type Selection */}
        <div className="option-group">
          <h3>Video Type:</h3>
          <label>
            <input
              type="radio"
              name="videoType"
              value="informative"
              checked={videoType === 'informative'}
              onChange={(e) => setVideoType(e.target.value)}
            />
            Informative
          </label>
          <label>
            <input
              type="radio"
              name="videoType"
              value="storytelling"
              checked={videoType === 'storytelling'}
              onChange={(e) => setVideoType(e.target.value)}
            />
            Storytelling
          </label>
          <label>
            <input
              type="radio"
              name="videoType"
              value="tutorial"
              checked={videoType === 'tutorial'}
              onChange={(e) => setVideoType(e.target.value)}
            />
            Tutorial
          </label>
          <label>
            <input
              type="radio"
              name="videoType"
              value="advertisement"
              checked={videoType === 'advertisement'}
              onChange={(e) => setVideoType(e.target.value)}
            />
            Advertisement
          </label>
        </div>

        {/* Script Input */}
        <div className="input-container">
          <textarea
            className="text-input"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Write your script idea here..."
            maxLength={32000}
          />
          <div className="char-counter">{charCount}/32000</div>
        </div>

        {/* Buttons */}
        <div className="button-group">
          <button
            className="Enhance-button"
            onClick={generateScript}
            disabled={loading}
          >
            {loading ? 'Enhancing...' : 'Enhance Script'}
          </button>
          <button className="next-button" onClick={moveToStep2}>
            Move to Step 2 ➝
          </button>
        </div>

        {/* Output Script */}
        {script && (
          <div className="output-box">
            <h3>✨ Enhanced Script:</h3>
            <p>{script}</p>
          </div>
        )}
      </div>
    </div>
  );
}