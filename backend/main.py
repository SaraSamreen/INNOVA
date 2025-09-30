# main.py - Copy this entire code into your main.py file
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Load API key from environment
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set. Please create a .env file in the backend directory with your API key.")

# Configure Gemini API
genai.configure(api_key=api_key)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schemas
class BrainstormRequest(BaseModel):
    action: str
    product_name: str
    tone: str

class ChatRequest(BaseModel):
    question: str

@app.post("/api/chat/brainstorm")
async def brainstorm(request: BrainstormRequest):
    try:
        # Create different prompts based on action
        if request.action == "idea":
            prompt = f"""Generate 3-5 creative advertising ideas for {request.product_name}.

Please provide innovative advertising concepts that would appeal to the target audience. Include:
- Creative campaign concepts
- Unique selling propositions
- Target audience insights
- Suggested marketing channels"""
        
        elif request.action == "slogan":
            prompt = f"""Create catchy slogans for {request.product_name}.

Generate 5-7 memorable slogans that capture the essence of the product."""
        
        elif request.action == "content":
            prompt = f"""Create marketing content for {request.product_name}.

Generate social media posts, ad copy, and promotional text that would engage customers."""
        
        else:
            prompt = f"""Help with {request.action} for {request.product_name}.
Provide creative marketing and advertising suggestions."""
        
        # Call Gemini API
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=400,
                temperature=0.8,
            )
        )
        
        result = response.text
        
        return {"result": result}
    
    except Exception as e:
        print(f"Error in brainstorm endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating ideas: {str(e)}")

@app.post("/api/chat")
async def general_chat(request: ChatRequest):
    """General chat endpoint for any question"""
    try:
        prompt = f"""You are an AI assistant specialized in marketing, advertising, and content creation.
Help users create engaging ads, marketing content, and business ideas.

User question: {request.question}

Please provide helpful, creative suggestions."""
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=300,
                temperature=0.7,
            )
        )
        
        answer = response.text
        return {"answer": answer}
    
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error in chat: {str(e)}")

# Test endpoints
@app.get("/")
async def root():
    return {"message": "AI Content Creator API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is working without memory features"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)