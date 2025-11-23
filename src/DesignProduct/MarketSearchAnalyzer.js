import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, History, Bookmark, Send, Loader2, BarChart3, X } from 'lucide-react';

export default function MarketSearchAnalyzer() {
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hi! I can help you analyze market trends, product demand, and search patterns. Try asking: "What are trending topics in tech?" or "Compare iPhone vs Samsung searches"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [savedInsights, setSavedInsights] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) setHistory(JSON.parse(saved));
    const insights = localStorage.getItem('savedInsights');
    if (insights) setSavedInsights(JSON.parse(insights));
  }, []);

  const saveToHistory = (query) => {
    const newHistory = [{ query, timestamp: new Date().toISOString() }, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const saveInsight = (insight) => {
    const newInsight = { ...insight, id: Date.now(), timestamp: new Date().toISOString() };
    const updated = [newInsight, ...savedInsights];
    setSavedInsights(updated);
    localStorage.setItem('savedInsights', JSON.stringify(updated));
  };

  const deleteInsight = (id) => {
    const updated = savedInsights.filter(i => i.id !== id);
    setSavedInsights(updated);
    localStorage.setItem('savedInsights', JSON.stringify(updated));
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);
    saveToHistory(userMessage);

    try {
      // Simulated API call - Replace with actual backend endpoint
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage })
      });

      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: data.analysis,
        data: data.trends,
        saveable: true 
      }]);
    } catch (error) {
      // Fallback demo response
      const demoResponse = generateDemoResponse(userMessage);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: demoResponse.analysis,
        data: demoResponse.data,
        saveable: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Best time to post queries
    if (lowerQuery.includes('best time') || lowerQuery.includes('when to post') || lowerQuery.includes('optimal time')) {
      const topic = lowerQuery.includes('fitness') ? 'Fitness' : 
                   lowerQuery.includes('food') ? 'Food' :
                   lowerQuery.includes('fashion') ? 'Fashion' :
                   lowerQuery.includes('tech') ? 'Technology' : 'General';
      
      return {
        analysis: `⏰ **Best Times to Post ${topic} Content**\n\n**Peak Engagement Hours:**\n• Monday-Friday: 6:00 AM - 8:00 AM (morning workouts)\n• Monday-Friday: 5:00 PM - 7:00 PM (evening routines)\n• Saturday-Sunday: 8:00 AM - 10:00 AM (weekend activity)\n\n**Optimal Days:**\n🔥 Monday (motivation high) - 85% engagement\n📈 Wednesday (mid-week boost) - 78% engagement\n💪 Sunday (planning ahead) - 82% engagement\n\n**Audience Activity:**\n• Search volume peaks at 6 AM and 6 PM\n• Weekend content performs 23% better\n• Video content gets 2.3x more engagement\n\n💡 **Pro Tip:** Post 30 minutes before peak times for maximum algorithm boost!`,
        data: { type: 'timing', topic: topic }
      };
    }
    
    if (lowerQuery.includes('trending') || lowerQuery.includes('popular')) {
      return {
        analysis: "📊 Current trending topics:\n\n1. **AI Tools** - 🔥 Surging 145% this month\n2. **Sustainable Fashion** - ⬆️ Growing 67% interest\n3. **Remote Work Tech** - 📈 Steady 32% increase\n4. **Health & Wellness** - 💪 Up 89% in searches\n\nThese topics show strong engagement potential for content creation.",
        data: { type: 'trends', items: ['AI Tools', 'Sustainable Fashion', 'Remote Work Tech', 'Health & Wellness'] }
      };
    }
    
    if (lowerQuery.includes('compare')) {
      return {
        analysis: "🔍 Comparison Analysis:\n\n**Product A vs Product B**\n• Product A: 62% market interest\n• Product B: 38% market interest\n\n**Regional insights:**\n- Product A dominates in urban areas\n- Product B popular in 25-34 age group\n\n**Recommendation:** Focus content on Product A for broader reach.",
        data: { type: 'comparison', winner: 'Product A' }
      };
    }
    
    if (lowerQuery.includes('market') || lowerQuery.includes('product')) {
      return {
        analysis: "📦 Product Market Insights:\n\n**Search Volume:** High (8.2M monthly)\n**Competition:** Moderate\n**Opportunity Score:** 7.5/10\n\n**Best times to post:**\n- Weekdays: 9 AM - 11 AM\n- Weekends: 2 PM - 5 PM\n\n**Related keywords:** Check trending hashtags for this niche.",
        data: { type: 'market', score: 7.5 }
      };
    }
    
    return {
      analysis: "🤖 I can help you with:\n\n• **Trend Discovery** - Find what's hot right now\n• **Product Research** - Analyze market demand\n• **Comparison** - Compare multiple products/topics\n• **Best Times** - Optimal posting schedules\n\nTry asking specific questions about products or trends!",
      data: null
    };
  };

  const quickActions = [
    "What's trending in technology?",
    "Best time to post fitness content",
    "Compare iPhone vs Android searches",
    "Popular fashion trends 2024"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Market Search Analyzer</h1>
                <p className="text-blue-200 text-sm">AI-powered market insights</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'chat'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20'
                }`}
              >
                History
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[600px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/20 text-white backdrop-blur-sm'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.saveable && msg.type === 'bot' && (
                        <button
                          onClick={() => saveInsight({ query: messages[idx-1]?.content, response: msg.content })}
                          className="mt-2 flex items-center gap-1 text-sm text-blue-200 hover:text-white transition-colors"
                        >
                          <Bookmark className="w-4 h-4" />
                          Save Insight
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/20 text-white backdrop-blur-sm rounded-2xl p-4">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="px-6 pb-4">
                <div className="flex gap-2 flex-wrap">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(action)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-blue-200 text-sm rounded-full transition-all"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-6 bg-white/5 border-t border-white/10">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about trends, products, or market insights..."
                    className="flex-1 bg-white/10 text-white placeholder-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white p-3 rounded-xl transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6 h-[600px] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Search History
              </h2>
              {history.length === 0 ? (
                <p className="text-blue-200 text-center py-12">No search history yet</p>
              ) : (
                <div className="space-y-2">
                  {history.map((item, idx) => (
                    <div key={idx} className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer"
                      onClick={() => { setActiveTab('chat'); setInput(item.query); }}>
                      <p className="text-white">{item.query}</p>
                      <p className="text-blue-200 text-sm mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="p-6 h-[600px] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                Saved Insights
              </h2>
              {savedInsights.length === 0 ? (
                <p className="text-blue-200 text-center py-12">No saved insights yet</p>
              ) : (
                <div className="space-y-4">
                  {savedInsights.map((item) => (
                    <div key={item.id} className="bg-white/10 rounded-lg p-4 relative">
                      <button
                        onClick={() => deleteInsight(item.id)}
                        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4 text-blue-200" />
                      </button>
                      <p className="text-blue-300 font-medium mb-2">{item.query}</p>
                      <p className="text-white text-sm whitespace-pre-wrap">{item.response}</p>
                      <p className="text-blue-200 text-xs mt-2">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}