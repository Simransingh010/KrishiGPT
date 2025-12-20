from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging
import json
import asyncio

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

# Import and include routers
from .routes.conversations import router as conversations_router
from .routes.messages import router as messages_router

app.include_router(conversations_router)
app.include_router(messages_router)

# Pydantic models
class QuestionRequest(BaseModel):
    question: str

class AnswerResponse(BaseModel):
    answer: str
    source: str = "Gemini AI"

# Initialize Gemini
api_key = os.getenv("GEMINI_API_KEY")
model = None

if not api_key:
    logger.error("GEMINI_API_KEY not found in environment variables.")
else:
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        logger.info("Gemini API configured successfully")
    except Exception as e:
        logger.error(f"Error configuring Gemini: {e}")

@app.get("/")
async def root():
    return {"message": "🌾 KrishiGPT API - AI Assistant for Farmers", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "gemini_configured": model is not None}

async def generate_stream(question: str):
    """Generate streaming response from Gemini API"""
    if not model:
        error_data = json.dumps({"error": "Gemini API not configured"}) + "\n"
        yield f"data: {error_data}\n\n"
        return
    
    try:
        farming_prompt = f"""You are KrishiGPT, an AI assistant specifically designed to help farmers with agricultural questions. 
        Please provide a helpful, practical answer to this farming question: {question}
        
        Keep your response:
        - Practical and actionable
        - Focused on farming and agriculture
        - Easy to understand for farmers
        - Comprehensive and detailed
        
        Formatting rules are STRICT and MUST be followed in every response:
        
        1. You MUST format all responses using GitHub-flavored Markdown (GFM).
        2. Use clear section headings (## or ###) to organize content.
        3. Use bullet points for lists and explanations.
        4. When comparing items, YOU MUST use Markdown tables.
        5. Use numbered lists only when sequence or steps matter.
        6. Use short, scannable paragraphs. Avoid long blocks of text.
        7. NEVER wrap the entire response in a single code block.
        8. Code blocks are allowed ONLY for actual code or commands.
        9. Do NOT mention Markdown, formatting rules, or meta commentary in your output.
        10. Do NOT explain what you are doing — only produce the final formatted answer.
        
        Content quality rules:
        
        11. Be concise but complete.
        12. Prefer structured clarity over conversational tone.
        13. Avoid filler words, emojis, or decorative language.
        14. If the user request is ambiguous, make reasonable assumptions and proceed.
        15. If a table improves clarity, use it without being asked.
        16. If bullet points improve clarity, use them without being asked.
        
        Failure to follow these rules is considered an incorrect response.
        
        If the question is not related to farming, politely redirect to farming topics."""
        
        response = model.generate_content(farming_prompt, stream=True)
        
        accumulated_text = ""
        for chunk in response:
            if chunk.text:
                accumulated_text += chunk.text
                data = json.dumps({"chunk": chunk.text, "done": False}) + "\n"
                yield f"data: {data}\n\n"
                await asyncio.sleep(0.01)
        
        final_data = json.dumps({"chunk": "", "done": True, "full_text": accumulated_text}) + "\n"
        yield f"data: {final_data}\n\n"
        
        logger.info(f"Streamed response for question: {question[:50]}...")
        
    except Exception as e:
        logger.error(f"Error streaming response: {e}")
        error_data = json.dumps({"error": str(e), "done": True}) + "\n"
        yield f"data: {error_data}\n\n"

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    try:
        question = request.question.strip()
        if not question:
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        if not model:
            raise HTTPException(status_code=503, detail="Gemini API not configured")
        
        logger.info(f"Received question: {question}")
        
        return StreamingResponse(
            generate_stream(question),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
