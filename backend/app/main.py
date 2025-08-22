from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="KrishiGPT API",
    description="AI Assistant for Farmers - Powered by Gemini",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class QuestionRequest(BaseModel):
    question: str

class AnswerResponse(BaseModel):
    answer: str
    source: str = "Gemini AI"

# Initialize Gemini
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not found. Using mock responses.")
        api_key = None
    else:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        logger.info("Gemini API configured successfully")
except Exception as e:
    logger.error(f"Error configuring Gemini: {e}")
    api_key = None

def get_mock_response(question: str) -> str:
    """Generate a mock farming response if Gemini is not available"""
    farming_tips = [
        "For better wheat yield, ensure proper soil preparation and timely irrigation. Consider crop rotation to maintain soil health.",
        "To improve crop productivity, focus on balanced fertilization and pest management. Regular soil testing helps optimize nutrient levels.",
        "Water management is crucial for farming success. Implement efficient irrigation systems and monitor soil moisture regularly.",
        "Crop rotation helps prevent soil-borne diseases and improves soil fertility. Plan your rotation based on local climate conditions.",
        "Integrated pest management combines biological, cultural, and chemical methods for sustainable pest control.",
        "Soil health is the foundation of good farming. Regular composting and organic matter addition improves soil structure.",
        "Timing is everything in farming. Plant according to local weather patterns and soil temperature conditions.",
        "Use cover crops to protect soil during off-seasons and improve soil organic matter content."
    ]
    
    import random
    return random.choice(farming_tips)

@app.get("/")
async def root():
    return {"message": "🌾 KrishiGPT API - AI Assistant for Farmers", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "gemini_configured": api_key is not None}

@app.post("/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    try:
        question = request.question.strip()
        if not question:
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        logger.info(f"Received question: {question}")
        
        # Try Gemini API if available
        if api_key and model:
            try:
                # Create a farming-focused prompt
                farming_prompt = f"""You are KrishiGPT, an AI assistant specifically designed to help farmers with agricultural questions. 
                Please provide a helpful, practical answer to this farming question: {question}
                
                Keep your response:
                - Practical and actionable
                - Focused on farming and agriculture
                - Easy to understand for farmers
                - Under 200 words
                
                If the question is not related to farming, politely redirect to farming topics."""
                
                response = model.generate_content(farming_prompt)
                answer = response.text.strip()
                logger.info("Generated response using Gemini API")
                
            except Exception as e:
                logger.error(f"Gemini API error: {e}")
                answer = get_mock_response(question)
                logger.info("Fell back to mock response")
        else:
            # Use mock response
            answer = get_mock_response(question)
            logger.info("Using mock response")
        
        return AnswerResponse(answer=answer, source="Gemini AI" if api_key and model else "Mock Response")
        
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
