import React from "react";
import "../Styles/Home.css"; 
import Voicehome from "./Components/VoiceHome";
import Editinghome from "./Components/EditingHome";
import Stepshome from "./Components/StepsHome";
import Homepricing from "./Components/Homepricing";
import Footer from "./Components/Footer";


export default function Home() {
  return (
    <div className="container">
      <h1 className="heading">AI-Powered Content Creator</h1>
      <p className="content">
        Effortlessly craft viral Instagram reels with InVideo’s AI-driven reel generator.  
        Simply choose a topic, and the AI will generate your script, design scenes, add voiceovers,  
        and create subtitles—all automatically.  
        Produce high-quality, engaging reels in just minutes!
      </p>
      <div className="video-container">
        <video controls autoPlay muted loop className="video">
          <source src="/videos/home-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

    <Voicehome/>
    <Editinghome/>
    <Stepshome/>
    <Homepricing/>
    <Footer/>
    </div>
  );
}
