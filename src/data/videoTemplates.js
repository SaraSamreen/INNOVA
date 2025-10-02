// src/data/videoTemplates.js - Enhanced for HeyGen-style functionality

export const videoTemplates = {
  Advertisement: [
    {
      id: 1,
      title: "App Presentation",
      thumbnail: "/heygen-app-presentation-video-frame-with-avatar.jpg",
      videoUrl: "",
      category: "Advertisement",
      duration: 17,
      defaultScript: "Your online high-quality flower shop app is published! HeyGen is an app that lists most of the flower shops in your city and sells flowers online. Start in a few simple steps as follow. Let's make a better life with flowers! Download now!",
      scenes: [
        {
          id: 1,
          startTime: 0,
          endTime: 4.25,
          script: "Your online high-quality flower shop app is published!",
          avatar: "scarlett",
          voiceSettings: { voice: "Scarlett - Professional", emotion: "Expressive" },
          elements: [
            {
              id: "app-title",
              type: "text",
              content: "HeyGen\nApp",
              position: { x: 150, y: 180 },
              style: { 
                fontSize: "48px", 
                fontWeight: "bold", 
                color: "white",
                textAlign: "left",
                lineHeight: "1.2"
              }
            },
            {
              id: "app-subtitle", 
              type: "text",
              content: "Your online high-quality\nFlower Shop",
              position: { x: 150, y: 280 },
              style: { 
                fontSize: "18px", 
                color: "rgba(255,255,255,0.9)",
                textAlign: "left",
                lineHeight: "1.4"
              }
            },
            {
              id: "store-badges",
              type: "element",
              content: "App Store & Google Play badges",
              position: { x: 150, y: 350 },
              style: { width: "200px", height: "60px" }
            }
          ]
        },
        {
          id: 2,
          startTime: 4.25,
          endTime: 8.5,
          script: "HeyGen is an app that lists most of the flower shops in your city and sells flowers online.",
          avatar: "scarlett",
          voiceSettings: { voice: "Scarlett - Professional", emotion: "Expressive" },
          elements: [
            {
              id: "intro-title",
              type: "text", 
              content: "BRIEF INTRO OF THE APP",
              position: { x: 80, y: 160 },
              style: { 
                fontSize: "20px", 
                fontWeight: "bold", 
                color: "white",
                letterSpacing: "1px"
              }
            },
            {
              id: "feature-list",
              type: "text",
              content: "• Lists flower shops in your city\n• Online flower purchasing\n• Easy to use interface\n• Fast delivery service",
              position: { x: 80, y: 200 },
              style: { 
                fontSize: "16px", 
                color: "rgba(255,255,255,0.9)",
                lineHeight: "1.8"
              }
            }
          ]
        },
        {
          id: 3,
          startTime: 8.5,
          endTime: 12.75,
          script: "Start in a few simple steps as follow.",
          avatar: "scarlett", 
          voiceSettings: { voice: "Scarlett - Professional", emotion: "Expressive" },
          elements: [
            {
              id: "how-to-title",
              type: "text",
              content: "HOW TO USE?",
              position: { x: 150, y: 180 },
              style: { 
                fontSize: "36px", 
                fontWeight: "bold", 
                color: "white",
                letterSpacing: "2px"
              }
            },
            {
              id: "steps-subtitle",
              type: "text",
              content: "Follow these simple steps to get started:",
              position: { x: 150, y: 240 },
              style: { 
                fontSize: "16px", 
                color: "rgba(255,255,255,0.8)"
              }
            }
          ]
        },
        {
          id: 4,
          startTime: 12.75,
          endTime: 17,
          script: "Let's make a better life with flowers! Download now!",
          avatar: "scarlett",
          voiceSettings: { voice: "Scarlett - Professional", emotion: "Expressive" },
          elements: [
            {
              id: "cta-main",
              type: "text",
              content: "Download Now!",
              position: { x: 180, y: 200 },
              style: { 
                fontSize: "42px", 
                fontWeight: "bold", 
                color: "#fbbf24",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
              }
            },
            {
              id: "cta-subtitle",
              type: "text",
              content: "Available on App Store & Google Play",
              position: { x: 180, y: 260 },
              style: { 
                fontSize: "14px", 
                color: "rgba(255,255,255,0.9)"
              }
            },
            {
              id: "tagline",
              type: "text",
              content: "Let's make a better life with flowers!",
              position: { x: 180, y: 320 },
              style: { 
                fontSize: "16px", 
                color: "white",
                fontStyle: "italic"
              }
            }
          ]
        }
      ],
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)"
      }
    },
    {
      id: 2,
      title: "Product Launch Ad",
      thumbnail: "/product-launch-advertisement-video-template.jpg",
      videoUrl: "",
      category: "Advertisement",
      duration: 15,
      defaultScript: "Introducing our revolutionary new product that will transform your daily routine. Experience innovation like never before with cutting-edge technology. Available now at incredible prices with free shipping worldwide.",
      scenes: [
        {
          id: 1,
          startTime: 0,
          endTime: 5,
          script: "Introducing our revolutionary new product that will transform your daily routine.",
          avatar: "james",
          elements: [
            {
              id: "product-title",
              type: "text",
              content: "NEW PRODUCT\nLAUNCH",
              position: { x: 120, y: 160 },
              style: { fontSize: "38px", fontWeight: "bold", color: "white" }
            }
          ]
        },
        {
          id: 2,
          startTime: 5,
          endTime: 10,
          script: "Experience innovation like never before with cutting-edge technology.",
          avatar: "james",
          elements: [
            {
              id: "innovation-text",
              type: "text",
              content: "CUTTING-EDGE\nTECHNOLOGY",
              position: { x: 100, y: 200 },
              style: { fontSize: "32px", fontWeight: "bold", color: "#60a5fa" }
            }
          ]
        },
        {
          id: 3,
          startTime: 10,
          endTime: 15,
          script: "Available now at incredible prices with free shipping worldwide.",
          avatar: "james",
          elements: [
            {
              id: "cta-text",
              type: "text",
              content: "ORDER NOW\nFREE SHIPPING",
              position: { x: 140, y: 220 },
              style: { fontSize: "28px", fontWeight: "bold", color: "#34d399" }
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Brand Awareness",
      thumbnail: "/brand-awareness-advertisement-video-template.jpg",
      videoUrl: "",
      category: "Advertisement", 
      duration: 12,
      defaultScript: "Building trust through quality craftsmanship and exceptional service. Your success is our commitment to excellence. Together we create lasting partnerships.",
      scenes: [
        {
          id: 1,
          startTime: 0,
          endTime: 4,
          script: "Building trust through quality craftsmanship and exceptional service.",
          avatar: "emma",
          elements: [
            {
              id: "trust-title",
              type: "text",
              content: "BUILDING TRUST",
              position: { x: 150, y: 180 },
              style: { fontSize: "36px", fontWeight: "bold", color: "white" }
            }
          ]
        },
        {
          id: 2,
          startTime: 4,
          endTime: 8,
          script: "Your success is our commitment to excellence.",
          avatar: "emma",
          elements: [
            {
              id: "success-text",
              type: "text",
              content: "YOUR SUCCESS\nOUR COMMITMENT",
              position: { x: 120, y: 200 },
              style: { fontSize: "28px", fontWeight: "bold", color: "#fbbf24" }
            }
          ]
        },
        {
          id: 3,
          startTime: 8,
          endTime: 12,
          script: "Together we create lasting partnerships.",
          avatar: "emma",
          elements: [
            {
              id: "partnership-text",
              type: "text",
              content: "LASTING\nPARTNERSHIPS",
              position: { x: 160, y: 220 },
              style: { fontSize: "32px", fontWeight: "bold", color: "#8b5cf6" }
            }
          ]
        }
      ]
    }
  ],
  Ecommerce: [
    {
      id: 5,
      title: "Product Showcase",
      thumbnail: "/ecommerce-product-showcase-video-template.jpg",
      videoUrl: "",
      category: "Ecommerce",
      duration: 14,
      defaultScript: "Discover premium quality products at unbeatable prices. Shop our exclusive collection with confidence. Free shipping on all orders over fifty dollars plus easy returns guaranteed.",
      scenes: [
        {
          id: 1,
          startTime: 0,
          endTime: 5,
          script: "Discover premium quality products at unbeatable prices.",
          avatar: "scarlett",
          elements: [
            {
              id: "discover-title",
              type: "text",
              content: "PREMIUM QUALITY\nUNBEATABLE PRICES",
              position: { x: 100, y: 180 },
              style: { fontSize: "32px", fontWeight: "bold", color: "white" }
            }
          ]
        },
        {
          id: 2,
          startTime: 5,
          endTime: 9,
          script: "Shop our exclusive collection with confidence.",
          avatar: "scarlett",
          elements: [
            {
              id: "collection-text",
              type: "text",
              content: "EXCLUSIVE\nCOLLECTION",
              position: { x: 140, y: 200 },
              style: { fontSize: "36px", fontWeight: "bold", color: "#f59e0b" }
            }
          ]
        },
        {
          id: 3,
          startTime: 9,
          endTime: 14,
          script: "Free shipping on all orders over fifty dollars plus easy returns guaranteed.",
          avatar: "scarlett",
          elements: [
            {
              id: "shipping-text",
              type: "text",
              content: "FREE SHIPPING\nEASY RETURNS",
              position: { x: 120, y: 220 },
              style: { fontSize: "28px", fontWeight: "bold", color: "#10b981" }
            }
          ]
        }
      ]
    },
    {
      id: 6,
      title: "Sale Announcement",
      thumbnail: "/ecommerce-sale-announcement-video-template.jpg",
      videoUrl: "",
      category: "Ecommerce",
      duration: 10,
      defaultScript: "Limited time mega sale now live with up to seventy percent off everything. Flash sale prices on top brands. Hurry offer ends soon!",
      scenes: [
        {
          id: 1,
          startTime: 0,
          endTime: 4,
          script: "Limited time mega sale now live with up to seventy percent off everything.",
          avatar: "emma",
          elements: [
            {
              id: "sale-title",
              type: "text",
              content: "MEGA SALE\n70% OFF",
              position: { x: 150, y: 160 },
              style: { fontSize: "48px", fontWeight: "bold", color: "#ef4444" }
            }
          ]
        },
        {
          id: 2,
          startTime: 4,
          endTime: 7,
          script: "Flash sale prices on top brands.",
          avatar: "emma",
          elements: [
            {
              id: "flash-sale",
              type: "text",
              content: "FLASH SALE\nTOP BRANDS",
              position: { x: 130, y: 200 },
              style: { fontSize: "36px", fontWeight: "bold", color: "#fbbf24" }
            }
          ]
        },
        {
          id: 3,
          startTime: 7,
          endTime: 10,
          script: "Hurry offer ends soon!",
          avatar: "emma",
          elements: [
            {
              id: "hurry-text",
              type: "text",
              content: "HURRY!\nENDS SOON",
              position: { x: 160, y: 240 },
              style: { fontSize: "32px", fontWeight: "bold", color: "#f97316", animation: "pulse" }
            }
          ]
        }
      ]
    }
  ]
};

export const avatarOptions = [
  { 
    id: "scarlett", 
    name: "Scarlett", 
    thumbnail: "/professional-woman-avatar.png",
    description: "Professional female presenter" 
  },
  { 
    id: "james", 
    name: "James", 
    thumbnail: "/professional-man-avatar.png",
    description: "Friendly male presenter" 
  },
  { 
    id: "emma", 
    name: "Emma", 
    thumbnail: "/business-woman-avatar.png",
    description: "Energetic business woman" 
  },
  {
    id: "custom",
    name: "Custom Avatar",
    thumbnail: "/upload-avatar-placeholder.png",
    description: "Upload your own image"
  }
];

export const voiceOptions = [
  { value: "scarlett-professional", label: "Scarlett - Professional", gender: "female", accent: "american" },
  { value: "james-friendly", label: "James - Friendly", gender: "male", accent: "american" },
  { value: "emma-energetic", label: "Emma - Energetic", gender: "female", accent: "british" },
  { value: "david-authoritative", label: "David - Authoritative", gender: "male", accent: "british" }
];

export const emotionOptions = [
  { value: "natural", label: "Natural", description: "Calm and natural delivery" },
  { value: "expressive", label: "Expressive", description: "Animated and engaging" },
  { value: "calm", label: "Calm", description: "Relaxed and soothing" },
  { value: "excited", label: "Excited", description: "Energetic and enthusiastic" }
];

// Helper functions for template management
export const templateHelpers = {
  getSceneAtTime: (template, time) => {
    return template.scenes.find(scene => 
      time >= scene.startTime && time < scene.endTime
    );
  },
  
  getTotalDuration: (template) => {
    return Math.max(...template.scenes.map(scene => scene.endTime));
  },
  
  updateSceneScript: (template, sceneId, newScript) => {
    return {
      ...template,
      scenes: template.scenes.map(scene =>
        scene.id === sceneId ? { ...scene, script: newScript } : scene
      )
    };
  },
  
  updateElementContent: (template, sceneId, elementId, newContent) => {
    return {
      ...template,
      scenes: template.scenes.map(scene => {
        if (scene.id === sceneId) {
          return {
            ...scene,
            elements: scene.elements.map(element =>
              element.id === elementId ? { ...element, content: newContent } : element
            )
          };
        }
        return scene;
      })
    };
  },
  
  addNewScene: (template, afterSceneId) => {
    const afterIndex = template.scenes.findIndex(scene => scene.id === afterSceneId);
    const newSceneId = Math.max(...template.scenes.map(s => s.id)) + 1;
    const startTime = afterIndex >= 0 ? template.scenes[afterIndex].endTime : 0;
    
    const newScene = {
      id: newSceneId,
      startTime: startTime,
      endTime: startTime + 3,
      script: "Enter your script here...",
      avatar: "scarlett",
      voiceSettings: { voice: "Scarlett - Professional", emotion: "Expressive" },
      elements: [
        {
          id: `text-${newSceneId}`,
          type: "text",
          content: "Your Text Here",
          position: { x: 150, y: 200 },
          style: { fontSize: "32px", fontWeight: "bold", color: "white" }
        }
      ]
    };
    
    const newScenes = [...template.scenes];
    newScenes.splice(afterIndex + 1, 0, newScene);
    
    // Adjust timing for subsequent scenes
    for (let i = afterIndex + 2; i < newScenes.length; i++) {
      newScenes[i].startTime += 3;
      newScenes[i].endTime += 3;
    }
    
    return { ...template, scenes: newScenes };
  },
  
  removeScene: (template, sceneId) => {
    const sceneIndex = template.scenes.findIndex(scene => scene.id === sceneId);
    if (sceneIndex === -1 || template.scenes.length <= 1) return template;
    
    const removedScene = template.scenes[sceneIndex];
    const duration = removedScene.endTime - removedScene.startTime;
    
    const newScenes = template.scenes.filter(scene => scene.id !== sceneId);
    
    // Adjust timing for subsequent scenes
    for (let i = sceneIndex; i < newScenes.length; i++) {
      newScenes[i].startTime -= duration;
      newScenes[i].endTime -= duration;
    }
    
    return { ...template, scenes: newScenes };
  }
};