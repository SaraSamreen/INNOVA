import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

// Header Component
const Header = () => {
  const [showAIDropdown, setShowAIDropdown] = useState(false);
  const [showStudioDropdown, setShowStudioDropdown] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-[#3E8EDE]">INNOVA</Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <div 
              className="relative"
              onMouseEnter={() => setShowAIDropdown(true)}
              onMouseLeave={() => setShowAIDropdown(false)}
            >
              <span className="text-[#111827] font-medium cursor-pointer hover:text-[#3E8EDE] transition-colors">
                INNOVA AI▾
              </span>
              {showAIDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-[14px] py-2 min-w-[200px]">
                  <Link to="/explore" className="block px-4 py-2 text-[#374151] hover:bg-[#f1f3f5] hover:text-[#3E8EDE]">AI video generator</Link>
                  <Link to="/create" className="block px-4 py-2 text-[#374151] hover:bg-[#f1f3f5] hover:text-[#3E8EDE]">AI Image generator</Link>
                  <Link to="/trending" className="block px-4 py-2 text-[#374151] hover:bg-[#f1f3f5] hover:text-[#3E8EDE]">AI subtitle generator</Link>
                  <Link to="/custom-ai" className="block px-4 py-2 text-[#374151] hover:bg-[#f1f3f5] hover:text-[#3E8EDE]">Voiceover generator</Link>
                </div>
              )}
            </div>

            <div 
              className="relative"
              onMouseEnter={() => setShowStudioDropdown(true)}
              onMouseLeave={() => setShowStudioDropdown(false)}
            >
              <span className="text-[#111827] font-medium cursor-pointer hover:text-[#3E8EDE] transition-colors">
                INNOVA Studio▾
              </span>
              {showStudioDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-[14px] py-2 min-w-[400px]">
                  <div className="grid grid-cols-2 gap-4 p-4">
                    <div>
                      <h4 className="font-semibold text-[#111827] mb-2">Studio</h4>
                      <Link to="/video-editor" className="block py-1 text-[#374151] hover:text-[#3E8EDE]">Video Editor</Link>
                      <Link to="/picture-video" className="block py-1 text-[#374151] hover:text-[#3E8EDE]">Picture To Video Maker</Link>
                      <Link to="/add-text" className="block py-1 text-[#374151] hover:text-[#3E8EDE]">Add Text to Video</Link>
                      <Link to="/compressor" className="block py-1 text-[#374151] hover:text-[#3E8EDE]">MP4 Compressor</Link>
                      <Link to="/compressor" className="block py-1 text-[#374151] hover:text-[#3E8EDE]">Video Trimmer</Link>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#111827] mb-2">Templates</h4>
                      <Link to="/business-template" className="block py-1 text-[#374151] hover:text-[#3E8EDE]">Business Video Template</Link>
                      <Link to="/slideshow-template" className="block py-1 text-[#374151] hover:text-[#3E8EDE]">Slideshow Template</Link>
                      <Link to="/social-template" className="block py-1 text-[#374151] hover:text-[#3E8EDE]">Social Media Video Template</Link>
                      <Link to="/ad-template" className="block py-1 text-[#374151] hover:text-[#3E8EDE]">Advertisement Video Template</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to="/teamsH" className="text-[#111827] font-medium hover:text-[#3E8EDE] transition-colors">Team Work</Link>
            <Link to="/pricingH" className="text-[#111827] font-medium hover:text-[#3E8EDE] transition-colors">Pricing</Link>
          </nav>

          <Link to="/login" className="hidden md:block px-6 py-2 bg-gradient-to-r from-[#3E8EDE] to-[#2E7BC8] text-white rounded-[14px] font-semibold hover:shadow-lg transition-shadow">
            Start for free
          </Link>

          <button onClick={() => setIsDrawerOpen(true)} className="md:hidden text-[#3E8EDE] text-2xl">
            <FaBars />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl">
            <button onClick={() => setIsDrawerOpen(false)} className="absolute top-4 right-4 text-2xl text-[#374151]">
              <FaTimes />
            </button>
            <nav className="flex flex-col p-8 space-y-4 mt-12">
              <Link to="/" onClick={() => setIsDrawerOpen(false)} className="text-[#374151] hover:text-[#3E8EDE]">Home</Link>
              <Link to="/explore" onClick={() => setIsDrawerOpen(false)} className="text-[#374151] hover:text-[#3E8EDE]">Explore Prompts</Link>
              <Link to="/create" onClick={() => setIsDrawerOpen(false)} className="text-[#374151] hover:text-[#3E8EDE]">Create Prompt</Link>
              <Link to="/trending" onClick={() => setIsDrawerOpen(false)} className="text-[#374151] hover:text-[#3E8EDE]">Trending Reels</Link>
              <Link to="/custom-ai" onClick={() => setIsDrawerOpen(false)} className="text-[#374151] hover:text-[#3E8EDE]">Custom AI Models</Link>
              <Link to="/login" onClick={() => setIsDrawerOpen(false)} className="text-[#374151] hover:text-[#3E8EDE]">Login</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

// Voice Home Component
const VoiceHome = () => (
  <div className="py-16 px-4 bg-[#f9fafb]">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-[#3E8EDE] text-center mb-12">Voice of your Imagination</h2>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <img src="/videos/voice-trans.webp" alt="Voice Transition" className="w-full rounded-[14px] shadow-lg" />
        </div>
        <div>
          <p className="text-lg text-[#374151] leading-relaxed">
            Use AI voice cloning to bring scripts to life, add your own audio, or even translate voiceovers into different languages with stunning clarity and realism.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Editing Home Component
const EditingHome = () => (
  <div className="py-16 px-4 bg-white">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-[#3E8EDE] text-center mb-12">Editing Studio</h2>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <img src="/videos/editing-studio.png" alt="Editing Studio" className="w-full rounded-[14px] shadow-lg" />
        </div>
        <div>
          <p className="text-xl text-[#111827] font-semibold mb-4">
            Logo, Colors, Voice: Customize Every Detail in Your Video
          </p>
          <ul className="space-y-2 text-[#374151]">
            <li className="flex items-start">
              <span className="text-[#3E8EDE] mr-2">✓</span>
              Smart cut detection for seamless editing
            </li>
            <li className="flex items-start">
              <span className="text-[#3E8EDE] mr-2">✓</span>
              Auto-color correction and lighting adjustment
            </li>
            <li className="flex items-start">
              <span className="text-[#3E8EDE] mr-2">✓</span>
              AI-powered background removal/replacement
            </li>
            <li className="flex items-start">
              <span className="text-[#3E8EDE] mr-2">✓</span>
              One-click social media format conversion
            </li>
            <li className="flex items-start">
              <span className="text-[#3E8EDE] mr-2">✓</span>
              Real-time collaboration features
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// Steps Home Component
const StepsHome = () => {
  const steps = [
    {
      number: "01",
      title: "Tell Your Story",
      description: "Simply input your script or key points into the system, and our AI will understand the main message, helping you create AI video content in an instant.",
      image: "/videos/01.png"
    },
    {
      number: "02",
      title: "AI Crafts Your Video",
      description: "Sit back as our system turns your text into an AI-generated video. The AI will choose animations and transitions and even suggest music and voiceovers.",
      image: "/videos/02.png"
    },
    {
      number: "03",
      title: "Personalize the Video",
      description: "Customize the video to your liking by tweaking colors, fonts, layouts, and timing. Add your own voiceover or choose from a library of professional options.",
      image: "/videos/03.png"
    },
    {
      number: "04",
      title: "Download & Share",
      description: "Once you're happy with your masterpiece, render it in minutes and share it with the world! Impress your audience on social media, your website, or anywhere you need to captivate your audience.",
      image: "/videos/04.png"
    }
  ];

  return (
    <div className="py-16 px-4 bg-[#f9fafb]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-[#3E8EDE] text-center mb-4">Watch How INNOVA Crafts Your Video</h2>
        <p className="text-center text-[#374151] mb-12 max-w-3xl mx-auto">
          Sit back as INNOVA turns your Ideas to Life.<br />
          Your creative partner that whips up stunning ads, smart logos, and posts them to Social Media directly.
        </p>
        
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-1">
                <div className="relative">
                  <img src={step.image} alt={step.title} className="w-full rounded-[14px] shadow-lg" />
                  <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-[#3E8EDE] to-[#2E7BC8] text-white text-3xl font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                    {step.number}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#111827] mb-4">{step.title}</h3>
                <p className="text-[#374151] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Homepricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      title: 'Starter',
      monthly: '$9/mo',
      yearly: '$86/yr',
      features: ['AI Ad Generator', 'Logo Creator', 'Instagram Posting (5/mo)']
    },
    {
      title: 'Pro',
      monthly: '$19/mo',
      yearly: '$182/yr',
      features: ['Everything in Starter', 'Unlimited Posts', 'Premium Templates'],
      popular: true
    },
    {
      title: 'Business',
      monthly: '$39/mo',
      yearly: '$374/yr',
      features: ['Everything in Pro', 'Team Access', 'Priority Support']
    }
  ];

  return (
    <div className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-[#3E8EDE] text-center mb-8">Choose Your Plan</h2>
        
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`font-medium ${!isYearly ? 'text-[#3E8EDE]' : 'text-[#374151]'}`}>Annually</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-7 bg-[#d1d5db] rounded-full transition-colors"
          >
            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${isYearly ? 'translate-x-7' : ''}`}></div>
          </button>
          <span className={`font-medium ${isYearly ? 'text-[#3E8EDE]' : 'text-[#374151]'}`}>Monthly</span>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-white border-2 rounded-[14px] p-8 ${plan.popular ? 'border-[#3E8EDE] shadow-xl' : 'border-[#d1d5db]'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#3E8EDE] to-[#2E7BC8] text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-[#111827] mb-4">{plan.title}</h3>
              <p className="text-4xl font-bold text-[#3E8EDE] mb-6">{isYearly ? plan.yearly : plan.monthly}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-[#374151]">
                    <span className="text-[#3E8EDE] mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-gradient-to-r from-[#3E8EDE] to-[#2E7BC8] text-white py-3 rounded-[14px] font-semibold hover:shadow-lg transition-shadow">
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => (
  <footer className="bg-[#111827] text-white py-12 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-bold text-[#3E8EDE] mb-4">INNOVA AI</h3>
          <div className="space-y-2">
            <Link to="/explore" className="block text-gray-300 hover:text-[#3E8EDE]">AI Video Generator</Link>
            <Link to="/create" className="block text-gray-300 hover:text-[#3E8EDE]">AI Image Generator</Link>
            <Link to="/trending" className="block text-gray-300 hover:text-[#3E8EDE]">AI Subtitle Generator</Link>
            <Link to="/custom-ai" className="block text-gray-300 hover:text-[#3E8EDE]">Voiceover Generator</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#3E8EDE] mb-4">INNOVA Studio</h3>
          <div className="space-y-2">
            <Link to="/video-editor" className="block text-gray-300 hover:text-[#3E8EDE]">Video Editor</Link>
            <Link to="/picture-video" className="block text-gray-300 hover:text-[#3E8EDE]">Picture Video Maker</Link>
            <Link to="/add-text" className="block text-gray-300 hover:text-[#3E8EDE]">Add Text to Video</Link>
            <Link to="/compressor" className="block text-gray-300 hover:text-[#3E8EDE]">MP4 Compressor</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#3E8EDE] mb-4">Templates</h3>
          <div className="space-y-2">
            <Link to="/business-template" className="block text-gray-300 hover:text-[#3E8EDE]">Business Video</Link>
            <Link to="/slideshow-template" className="block text-gray-300 hover:text-[#3E8EDE]">Slideshow</Link>
            <Link to="/social-template" className="block text-gray-300 hover:text-[#3E8EDE]">Social Media</Link>
            <Link to="/ad-template" className="block text-gray-300 hover:text-[#3E8EDE]">Advertisement</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#3E8EDE] mb-4">Company</h3>
          <div className="space-y-2">
            <Link to="/help" className="block text-gray-300 hover:text-[#3E8EDE]">Help</Link>
            <Link to="/teamsH" className="block text-gray-300 hover:text-[#3E8EDE]">Team Work</Link>
            <Link to="/pricingH" className="block text-gray-300 hover:text-[#3E8EDE]">Pricing</Link>
            <Link to="/login" className="block text-gray-300 hover:text-[#3E8EDE]">Login</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
        <p>© {new Date().getFullYear()} INNOVA. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// Main Home Component
export default function Home() {
  return (
    <div className="bg-[#c3d5ef]">
      <Header />
      
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#3E8EDE] mb-6">Transform Idea to Visual</h1>
          <p className="text-lg md:text-xl text-[#374151] mb-12 max-w-4xl mx-auto leading-relaxed">
            Effortlessly craft viral Instagram reels with InVideo's AI-driven reel generator.  
            Simply choose a topic, and the AI will generate your script, design scenes, add voiceovers,  
            and create subtitles—all automatically.  
            Produce high-quality, engaging reels in just minutes!
          </p>
          <div className="max-w-4xl mx-auto rounded-[14px] overflow-hidden shadow-2xl">
            <video controls autoPlay muted loop className="w-full">
              <source src="/videos/home-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>

      <VoiceHome />
      <EditingHome />
      <StepsHome />
      <Homepricing />
      <Footer />
    </div>
  );
}