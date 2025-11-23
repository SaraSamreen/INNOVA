from flask import Flask, request, jsonify
from flask_cors import CORS
from pytrends.request import TrendReq
import re
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Initialize Google Trends
pytrends = TrendReq(hl='en-US', tz=360)

def analyze_query(query):
    """Analyze user query and determine intent"""
    query_lower = query.lower()
    
    intent = {
        'type': 'general',
        'keywords': [],
        'timeframe': 'today 3-m',
        'action': 'search'
    }
    
    # Extract keywords
    if 'compare' in query_lower:
        intent['type'] = 'comparison'
        # Extract items to compare (simplified)
        parts = re.split(r'\s+vs\s+|\s+and\s+', query_lower)
        intent['keywords'] = [p.strip() for p in parts if len(p.strip()) > 2][:5]
    elif 'trending' in query_lower or 'popular' in query_lower:
        intent['type'] = 'trending'
        # Extract topic if mentioned
        words = query_lower.split()
        for i, word in enumerate(words):
            if word in ['in', 'about', 'for']:
                intent['keywords'] = [' '.join(words[i+1:])]
                break
    elif 'market' in query_lower or 'product' in query_lower:
        intent['type'] = 'market'
        # Extract product name
        words = query.split()
        intent['keywords'] = [' '.join(words[-3:])]
    else:
        # General search
        intent['keywords'] = [query]
    
    return intent

def get_trending_searches():
    """Get trending searches"""
    try:
        trending_df = pytrends.trending_searches(pn='united_states')
        return trending_df[0].head(10).tolist()
    except:
        return ['AI Tools', 'Technology', 'Health', 'Finance', 'Entertainment']

def get_interest_over_time(keywords, timeframe='today 3-m'):
    """Get interest over time for keywords"""
    try:
        pytrends.build_payload(keywords, timeframe=timeframe)
        interest_df = pytrends.interest_over_time()
        
        if interest_df.empty:
            return None
        
        results = {}
        for keyword in keywords:
            if keyword in interest_df.columns:
                data = interest_df[keyword].tolist()
                avg = sum(data) / len(data)
                trend = 'rising' if data[-1] > avg else 'falling'
                results[keyword] = {
                    'average': round(avg, 2),
                    'current': data[-1],
                    'trend': trend,
                    'data': data[-10:]  # Last 10 data points
                }
        
        return results
    except Exception as e:
        print(f"Error getting interest: {e}")
        return None

def get_related_queries(keyword):
    """Get related queries"""
    try:
        pytrends.build_payload([keyword])
        related = pytrends.related_queries()
        
        if keyword in related and related[keyword]['top'] is not None:
            top_queries = related[keyword]['top']['query'].head(5).tolist()
            return top_queries
        return []
    except:
        return []

def generate_analysis(intent, trends_data):
    """Generate natural language analysis"""
    analysis = ""
    
    if intent['type'] == 'trending':
        trending = get_trending_searches()
        analysis = "📊 **Current Trending Topics:**\n\n"
        for i, topic in enumerate(trending[:5], 1):
            analysis += f"{i}. **{topic}** - High search volume\n"
        analysis += "\n💡 These topics show strong engagement potential for content creation."
    
    elif intent['type'] == 'comparison' and trends_data:
        analysis = "🔍 **Comparison Analysis:**\n\n"
        sorted_items = sorted(trends_data.items(), key=lambda x: x[1]['average'], reverse=True)
        
        for keyword, data in sorted_items:
            percentage = round((data['average'] / 100) * 100, 1)
            trend_emoji = "📈" if data['trend'] == 'rising' else "📉"
            analysis += f"• **{keyword}**: {percentage}% market interest {trend_emoji}\n"
        
        winner = sorted_items[0][0]
        analysis += f"\n🏆 **Recommendation:** Focus on **{winner}** for better reach."
    
    elif intent['type'] == 'market' and trends_data:
        keyword = list(trends_data.keys())[0]
        data = trends_data[keyword]
        
        analysis = f"📦 **Market Insights for '{keyword}':**\n\n"
        analysis += f"**Interest Level:** {'High' if data['average'] > 60 else 'Moderate' if data['average'] > 30 else 'Low'}\n"
        analysis += f"**Trend:** {data['trend'].capitalize()} ({data['current']} points)\n"
        analysis += f"**Opportunity Score:** {min(data['average']/10, 10):.1f}/10\n\n"
        
        related = get_related_queries(keyword)
        if related:
            analysis += "**Related Topics:**\n"
            for rel in related[:3]:
                analysis += f"• {rel}\n"
    
    else:
        # General analysis
        if trends_data:
            keyword = list(trends_data.keys())[0]
            data = trends_data[keyword]
            
            analysis = f"📈 **Search Analysis:**\n\n"
            analysis += f"**Current Interest:** {data['current']} points\n"
            analysis += f"**Average Interest:** {data['average']:.1f} points\n"
            analysis += f"**Trend Direction:** {data['trend'].capitalize()}\n\n"
            
            if data['trend'] == 'rising':
                analysis += "✨ This topic is gaining momentum - good time to create content!"
            else:
                analysis += "💡 Consider exploring related topics for better engagement."
        else:
            analysis = "🤖 I can help you with:\n\n"
            analysis += "• **Trend Discovery** - Find what's hot right now\n"
            analysis += "• **Product Research** - Analyze market demand\n"
            analysis += "• **Comparison** - Compare multiple products/topics\n\n"
            analysis += "Try asking specific questions about products or trends!"
    
    return analysis

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Main analysis endpoint"""
    try:
        data = request.json
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        # Analyze query intent
        intent = analyze_query(query)
        
        # Get trends data
        trends_data = None
        if intent['keywords']:
            trends_data = get_interest_over_time(intent['keywords'][:5])
        
        # Generate analysis
        analysis = generate_analysis(intent, trends_data)
        
        return jsonify({
            'analysis': analysis,
            'trends': trends_data,
            'intent': intent['type']
        })
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            'analysis': "I encountered an error analyzing that query. Please try rephrasing your question.",
            'trends': None,
            'error': str(e)
        }), 500

@app.route('/api/trending', methods=['GET'])
def trending():
    """Get current trending searches"""
    try:
        trending_searches = get_trending_searches()
        return jsonify({
            'trending': trending_searches
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)