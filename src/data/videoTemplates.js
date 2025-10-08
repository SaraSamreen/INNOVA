// Update this in your src/data/videoTemplates.js

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
              id: "app-title-1",
              type: "text",
              content: "HeyGen\nApp",
              position: { x: 80, y: 150 },
              style: { 
                fontSize: "72px", 
                fontWeight: "bold", 
                color: "white",
                textAlign: "left",
                lineHeight: "1.1",
                textShadow: "3px 3px 6px rgba(0,0,0,0.3)"
              }
            },
            {
              id: "app-subtitle-1", 
              type: "text",
              content: "Your online high-quality\nFlower Shop",
              position: { x: 80, y: 310 },
              style: { 
                fontSize: "22px", 
                color: "white",
                textAlign: "left",
                lineHeight: "1.5",
                fontWeight: "400"
              }
            },
            {
              id: "store-badge-google-1",
              type: "text",
              content: "📱 Google Play",
              position: { x: 80, y: 390 },
              style: { 
                fontSize: "14px", 
                color: "white",
                background: "rgba(0,0,0,0.5)",
                padding: "8px 16px",
                borderRadius: "8px"
              }
            },
            {
              id: "store-badge-apple-1",
              type: "text",
              content: "🍎 App Store",
              position: { x: 210, y: 390 },
              style: { 
                fontSize: "14px", 
                color: "white",
                background: "rgba(0,0,0,0.5)",
                padding: "8px 16px",
                borderRadius: "8px"
              }
            },
            {
              id: "progress-dots-1",
              type: "text",
              content: "• • • • • • • •",
              position: { x: 80, y: 30 },
              style: { 
                fontSize: "16px", 
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "4px"
              }
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
              id: "intro-header-2",
              type: "text", 
              content: "Brief Intro of the App",
              position: { x: 420, y: 60 },
              style: { 
                fontSize: "32px", 
                fontWeight: "bold", 
                color: "white",
                textAlign: "center",
                background: "rgba(147, 112, 147, 0.85)",
                padding: "20px 40px",
                borderRadius: "12px",
                width: "400px"
              }
            },
            {
              id: "intro-description-2",
              type: "text",
              content: "HeyGen app is an app that lists most of the flower shops in the city and sells a wide variety of flowers.\n\nWe also provide courier service to ensure the freshness of the flowers you order.",
              position: { x: 420, y: 180 },
              style: { 
                fontSize: "16px", 
                color: "white",
                lineHeight: "1.8",
                textAlign: "center",
                width: "400px"
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
              id: "how-to-header-3",
              type: "text",
              content: "HOW TO USE?",
              position: { x: 500, y: 60 },
              style: { 
                fontSize: "42px", 
                fontWeight: "bold", 
                color: "white",
                letterSpacing: "2px",
                textAlign: "center",
                background: "rgba(147, 112, 147, 0.85)",
                padding: "20px 50px",
                borderRadius: "12px"
              }
            },
            {
              id: "step-1-3",
              type: "text",
              content: "1. Log in to create your account.",
              position: { x: 500, y: 160 },
              style: { 
                fontSize: "16px", 
                color: "white",
                textAlign: "left"
              }
            },
            {
              id: "step-2-3",
              type: "text",
              content: "2. Choose a flower shop near you.",
              position: { x: 500, y: 195 },
              style: { 
                fontSize: "16px", 
                color: "white",
                textAlign: "left"
              }
            },
            {
              id: "step-3-3",
              type: "text",
              content: "3. Choose the flower you want to buy.",
              position: { x: 500, y: 230 },
              style: { 
                fontSize: "16px", 
                color: "white",
                textAlign: "left"
              }
            },
            {
              id: "step-4-3",
              type: "text",
              content: "4. Pay your bills. We accept Visa,\n   Mastercard and UnionPay.",
              position: { x: 500, y: 265 },
              style: { 
                fontSize: "16px", 
                color: "white",
                textAlign: "left",
                lineHeight: "1.6"
              }
            },
            {
              id: "step-5-3",
              type: "text",
              content: "5. Wait and get your bouquet by\n   delivery.",
              position: { x: 500, y: 330 },
              style: { 
                fontSize: "16px", 
                color: "white",
                textAlign: "left",
                lineHeight: "1.6"
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
              id: "tagline-4",
              type: "text",
              content: "Where Every Bloom Tells a Story",
              position: { x: 50, y: 60 },
              style: { 
                fontSize: "42px", 
                fontWeight: "normal",
                fontFamily: "cursive",
                color: "white",
                fontStyle: "italic",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
              }
            },
            {
              id: "logo-4",
              type: "text",
              content: "🌸 LOGO",
              position: { x: 720, y: 30 },
              style: { 
                fontSize: "18px", 
                color: "rgba(255,255,255,0.9)",
                background: "rgba(255,255,255,0.2)",
                padding: "10px 20px",
                borderRadius: "8px"
              }
            },
            {
              id: "download-apple-4",
              type: "text",
              content: "Download on the\nApp Store",
              position: { x: 680, y: 330 },
              style: { 
                fontSize: "14px", 
                color: "white",
                background: "rgba(0,0,0,0.7)",
                padding: "12px 24px",
                borderRadius: "8px",
                textAlign: "center",
                lineHeight: "1.4"
              }
            },
            {
              id: "download-google-4",
              type: "text",
              content: "Available on\nGoogle Play",
              position: { x: 680, y: 395 },
              style: { 
                fontSize: "14px", 
                color: "white",
                background: "rgba(0,0,0,0.7)",
                padding: "12px 24px",
                borderRadius: "8px",
                textAlign: "center",
                lineHeight: "1.4"
              }
            }
          ]
        }
      ],
      background: {
        type: "gradient",
        scene1: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)",
        scene2: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)",
        scene3: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)",
        scene4: "linear-gradient(135deg, #7e3a8a 0%, #a64d79 50%, #d87093 100%)"
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
              style: { fontSize: "32px", fontWeight: "bold", color: "#f97316" }
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