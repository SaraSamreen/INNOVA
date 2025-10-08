"use client"

import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Sidebar from "./componentsD/Sidebar"
import HeaderD from "./componentsD/HeaderD"
import Chatbot from "./componentsD/Chatbot"
import "../Styles/Dashboard.css"

const TypewriterText = ({ id, text = "", speed = 250 }) => {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    if (!text) return // ADD THIS LINE - same as your separate file

    const words = text.split(" ")
    let wordIndex = 0

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        setDisplayedText((prev) => (prev ? prev + " " : "") + words[wordIndex])
        wordIndex++
      } else {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span id={id} className="typewriter-text">
      {displayedText}
      <span className="cursor">|</span>
    </span>
  )
}

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="content-area">
        <HeaderD />
        <div className="main-content">
          <h3 className="center-heading">INNOVA has got a lot of crafts videos waiting for you...</h3>

          <div className="button-wrapper">
            <Link to="/reel-creation" style={{ textDecoration: "none" }}>
              <button className="ai-video-btn">
                <h2 className="btn-heading">Create Ad Reel With Avatar</h2>
              </button>
            </Link>

            <Link to="/educational-video" style={{ textDecoration: "none" }}>
              <button className="educational-video-btn">
                <h2 className="btn-heading">Create Product Reel with Avatar</h2>
              </button>
            </Link>
          </div>

          <div className="video-script-wrapper">
            <div className="video-box">
              <video controls autoPlay muted loop className="video">
                <source src="/videos/Hamburger-Ad.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="script-box">
              <TypewriterText
                id="script1"
                text="Discover the magic behind our new McDonald's Hamburger recipe. Experience the perfect blend of premium beef, fresh lettuce, juicy tomatoes, and our signature sauce, all wrapped in a golden toasted bun. This isn't just a burger - it's a culinary masterpiece crafted with love and precision. Taste the difference that makes millions choose McDonald's every day."
                speed={400}
              />
            </div>
          </div>

          <div className="video-script-wrapper">
            <div className="video-box">
              <video controls autoPlay muted loop className="video">
                <source src="/videos/Korean_SkincareAd.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="script-box">
              <TypewriterText
                id="script2"
                text="Introducing Rajelica — the ultimate Korean skincare transformation. Unlock the secrets of K-beauty with our revolutionary 10-step routine that combines ancient Korean wisdom with cutting-edge technology. From gentle cleansing to intensive hydration, Rajelica delivers radiant, glass-like skin that glows from within. Join millions who have discovered the power of Korean skincare excellence."
                speed={400}
              />
            </div>
          </div>

          <div className="video-script-wrapper">
            <div className="video-box">
              <video controls autoPlay muted loop className="video">
                <source src="/videos/Water-bottleAd.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="script-box">
              <TypewriterText
                id="script3"
                text="Stay hydrated with our all-new eco-friendly water bottle. Crafted from premium BPA-free materials, this innovative design keeps your water cold for 24 hours and hot for 12 hours. With its leak-proof technology, ergonomic grip, and sleek stainless steel construction, it's the perfect companion for your active lifestyle. Make a difference for your health and the planet with every sip."
                speed={400}
              />
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  )
}
