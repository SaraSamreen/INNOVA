import { useEffect, useState } from "react"; 
import { Link } from "react-router-dom";
import Sidebar from "./componentsD/Sidebar";
import Topbar from "../Dashboard/componentsD/Topbar";
import { Sparkles, Video, Palette, Users, Zap, Wand2 } from "lucide-react";

const TypewriterText = ({ text = "", speed = 250 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!text) return;

    const words = text.split(" ");
    let wordIndex = 0;

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        setDisplayedText((prev) => (prev ? prev + " " : "") + words[wordIndex]);
        wordIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className="text-foreground">
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
  <div
    className="group relative backdrop-blur-xl bg-card/40 border border-border/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,132,246,0.3)] hover:border-blue-400/50 hover:-translate-y-1 animate-fade-in-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300" />
    <div className="relative">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

// Product Management Tools
const productTools = [
  {
    id: "img1",
    title: " Product Beautifier",
    description: "Convert any product image into a studio-grade professional product shot in seconds.",
    image: "/products/img1.jpg",
    route: "/product-beautifier"
  },
  {
    id: "img2",
    title: " Product Staging",
    description: "Create realistic product scenes to put your product in action.",
    image: "/products/img2.jpg",
    route: "/product-staging"
  },
  {
    id: "img3",
    title: "AI Backgrounds",
    description: "Generate realistic AI backgrounds in less than a second.",
    image: "/products/img3.jpg",
    route: "/prompt-background"
  },
  {
    id: "img4",
    title: "Background Remover",
    description: "Remove the background of your image automatically.",
    image: "/products/img4.jpg",
    route: "/background-remover"
  }
];

export default function Dashboard() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-white to-blue-400 flex flex-col">
        <Topbar projectTitle="INNOVA AI Studio" />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex-1 ml-20 flex flex-col items-center justify-center relative z-10">
              {/* Hero Section */}
              <div className="max-w-6xl w-full text-center mb-16 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 mb-6">
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    AI-Powered Content Creation
                  </span>
                </div>

                <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent animate-gradient-shift">
                    Next Generation
                  </span>
                  <br />
                  <span className="text-foreground">of Content Creation</span>
                </h1>

                <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                  Create stunning ads, videos, and content with cutting-edge AI.
                  <br />
                  <TypewriterText text="From concept to creation in minutes." speed={100} />
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mb-20">
                  <Link to="/reel-creation">
                    <button className="group relative px-8 py-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,132,246,0.3)] hover:scale-105 active:scale-95">
                      <span className="relative z-10 flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        Create Ad Reel
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </button>
                  </Link>
                  <Link to="/design-product">
                    <button className="px-8 py-4 backdrop-blur-xl bg-card/50 border-2 border-border hover:border-blue-400 text-foreground rounded-xl font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,132,246,0.2)] hover:scale-105 active:scale-95 flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Design Your Product
                    </button>
                  </Link>
                </div>
              </div>

              {/* Product Management Section */}
              <div className="max-w-7xl w-full mb-16">
                <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                  Product Studio
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {productTools.map((tool, idx) => (
                    <Link
                      key={tool.id}
                      to={tool.route}
                      className="group block bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {/* Image Container */}
                      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                        <img
                          src={tool.image}
                          alt={tool.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                          {tool.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {tool.description}
                        </p>
                        
                        {/* Image ID Tag */}
                        <div className="mt-4 inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                          {tool.id}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Feature Grid */}
              <div className="max-w-5xl w-full ml-auto mr-8">
                <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                  Features of INNOVA
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard
                    icon={Wand2}
                    title="AI Script Generator"
                    description="Generate engaging scripts with advanced AI that understands your brand voice and target audience."
                    delay={0}
                  />
                  <FeatureCard
                    icon={Video}
                    title="Avatar & Beats Studio"
                    description="Create professional videos with AI avatars and perfectly synced audio beats for maximum engagement."
                    delay={100}
                  />
                  <FeatureCard
                    icon={Sparkles}
                    title="Reel Maker"
                    description="Transform your ideas into viral-worthy reels with AI-powered editing and optimization."
                    delay={200}
                  />
                  <FeatureCard
                    icon={Palette}
                    title="Product Management"
                    description="Edit and enhance product visuals with automatic background removal and smart editing tools."
                    delay={300}
                  />
                  <FeatureCard
                    icon={Zap}
                    title="Social Sync"
                    description="Schedule and publish content across all platforms simultaneously with intelligent timing."
                    delay={400}
                  />
                  <FeatureCard
                    icon={Users}
                    title="Team Collaboration"
                    description="Work together in real-time with your team, share files, and streamline your workflow."
                    delay={500}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>
    </>
  );
}