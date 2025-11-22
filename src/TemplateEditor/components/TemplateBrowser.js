import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { videoTemplates } from "../data/videoTemplates";
import PremiumModal from "./PremiumModal";

export default function TemplateBrowser() {
  const [activeCategory, setActiveCategory] = useState("Advertisement");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [selectedPremiumTemplate, setSelectedPremiumTemplate] = useState(null);
  const [purchasedTemplates, setPurchasedTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch purchased templates on component mount
  useEffect(() => {
    fetchPurchasedTemplates();
  }, []);

  const fetchPurchasedTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/payment/purchases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPurchasedTemplates(data.purchasedTemplateIds || []);
        console.log('✅ Loaded purchased templates:', data.purchasedTemplateIds);
      } else {
        console.error('Failed to fetch purchases');
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    // Check if template is premium and not purchased
    if (template.isPremium && !purchasedTemplates.includes(template.id)) {
      setSelectedPremiumTemplate(template);
      setIsPremiumModalOpen(true);
      return;
    }

    // Allow access to free templates or purchased premium templates
    navigate("/template-editor", { 
      state: { 
        template: {
          ...template,
          videoUrl: template.videoUrl || "",
          defaultScript: template.defaultScript,
          scenes: template.scenes || []
        }
      } 
    });
  };

  const handlePurchase = async (templateId) => {
    // Refresh purchased templates from backend
    await fetchPurchasedTemplates();
    
    // Navigate to editor after purchase
    const template = Object.values(videoTemplates)
      .flat()
      .find(t => t.id === templateId);
    
    if (template) {
      navigate("/template-editor", { 
        state: { 
          template: {
            ...template,
            videoUrl: template.videoUrl || "",
            defaultScript: template.defaultScript,
            scenes: template.scenes || []
          }
        } 
      });
    }
  };

  const handleBackToCreation = () => {
    navigate("/reel-creation");
  };

  const filteredTemplates = videoTemplates[activeCategory].filter((template) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTemplates = Object.values(videoTemplates).flat().length;
  const totalPremium = Object.values(videoTemplates).flat().filter(t => t.isPremium).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white px-10 py-5 border-b border-slate-200 flex justify-between items-center flex-wrap gap-5">
        <div className="flex items-center gap-5">
          <button 
            onClick={handleBackToCreation}
            className="bg-none border-none text-slate-500 text-base cursor-pointer px-3 py-2 rounded-lg hover:bg-slate-100 transition-all"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 m-0">Video Template Library</h1>
            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
              {totalTemplates} templates
            </span>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
              👑 {totalPremium} premium
            </span>
            {purchasedTemplates.length > 0 && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                ✓ {purchasedTemplates.length} owned
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search video templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white px-10 border-b border-slate-200 flex gap-0">
        <button
          className={`px-6 py-4 text-base font-medium border-b-4 transition-all ${
            activeCategory === "Advertisement"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
          onClick={() => setActiveCategory("Advertisement")}
        >
          Advertisement ({videoTemplates.Advertisement.length})
        </button>
        <button
          className={`px-6 py-4 text-base font-medium border-b-4 transition-all ${
            activeCategory === "Ecommerce"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
          onClick={() => setActiveCategory("Ecommerce")}
        >
          Ecommerce ({videoTemplates.Ecommerce.length})
        </button>
      </div>

      {/* Templates Grid */}
      <div className="px-10 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {filteredTemplates.map((template) => {
          const isPurchased = purchasedTemplates.includes(template.id);
          const isPremium = template.isPremium;
          
          return (
            <div 
              key={template.id} 
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative"
              onClick={() => handleTemplateSelect(template)}
            >
              {/* Premium Badge */}
              {isPremium && !isPurchased && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    👑 PREMIUM
                  </span>
                </div>
              )}

              {/* Purchased Badge */}
              {isPurchased && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    ✓ OWNED
                  </span>
                </div>
              )}

              {/* Thumbnail */}
              <div className="relative bg-black aspect-video overflow-hidden group">
                <img 
                  src={template.thumbnail || "/placeholder.svg"} 
                  alt={template.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Lock Overlay for Premium Templates */}
                {isPremium && !isPurchased && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-4xl mb-2">🔒</span>
                    <button className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-500 font-bold">
                      <span>👑</span> Unlock ${template.price}
                    </button>
                  </div>
                )}
                
                {/* Regular Overlay for Free/Purchased Templates */}
                {(!isPremium || isPurchased) && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-semibold">
                      <span>🎬</span> Customize & Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-base font-semibold text-slate-900 mb-2">{template.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">{template.category}</span>
                  {isPremium && !isPurchased && (
                    <span className="text-xs font-bold text-yellow-600">${template.price}</span>
                  )}
                  {isPurchased && (
                    <span className="text-xs font-bold text-green-600">✓ Owned</span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  {template.defaultScript.substring(0, 80)}...
                </p>
                <div className="flex gap-3 text-xs text-slate-600">
                  <span>⏱️ {template.scenes?.length || 3} scenes</span>
                  <span>💬 Custom script</span>
                  {isPremium && <span>👑 Premium</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No templates found</h3>
          <p className="text-slate-600 mb-4">No video templates found matching "{searchQuery}"</p>
          <p className="text-slate-500 mb-6">Try searching for different keywords or browse other categories.</p>
          <button 
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            onClick={() => setSearchQuery("")}
          >
            Clear search
          </button>
        </div>
      )}

      {/* Premium Modal */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        template={selectedPremiumTemplate}
        onPurchase={handlePurchase}
      />
    </div>
  );
}