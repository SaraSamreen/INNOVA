import React, { useEffect, useState } from 'react';

const TypewriterText = ({ id, text = "", speed = 250 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!text) return; // If text is undefined or empty, do nothing

    const words = text.split(" ");
    let wordIndex = 0;

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        setDisplayedText(prev => (prev ? prev + " " : "") + words[wordIndex]);
        wordIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span id={id} className="typewriter-text">
      {displayedText}
      <span className="cursor">|</span>
    </span>
  );
};

export default TypewriterText;
