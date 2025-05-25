import React from 'react';
import "../../Styles/TeamsH.css";
import Footer from "./Footer";

export default function TeamsH() {
  return (
    <div className="teams-container">
      <header className="teams-header">
        <h1>Teams at Innova</h1>
      </header>

      {/* Section 1: Text | Image */}
      <div className="split-section">
      <div className="image-content">
          <img src="/videos/TeamsH2.png" alt="Reel Planning" className="team-image" />
        </div>
        <div className="text-content">
          <p>
            Team Collaboration is crafted to bring teams together for efficient and creative reel production. 
            It creates a shared digital space where team members can brainstorm ideas, exchange feedback, 
            and contribute their unique skills. Real-time chat, voice messaging, file sharing, and instant 
            notifications ensure smooth coordination. 
          </p>
        </div>
       
      </div>

      {/* Section 2: Image | Text */}
      <div className="split-section reverse">
        <div className="image-content">
          <img src="/videos/TeamsH.jpg" alt="Team Chat" className="team-image" />
        </div>
        <div className="text-content">
          <p>
            This module ensures everyone stays aligned and engaged — making the process of creating engaging reel ads 
            faster, smarter, and more enjoyable. Saved chat history, voice messages, and asset sharing help capture 
            every team member's input while working together in real-time.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
