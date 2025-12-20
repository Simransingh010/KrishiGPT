"""Message routes with AI integration"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
import asyncio
import logging
from ..db.supabase import get_supabase
from ..utils.sliding_window import get_sliding_window_history

router = APIRouter(prefix="/api/messages", tags=["messages"])
logger = logging.getLogger(__name__)

# Initialize Gemini
api_key = os.getenv("GEMINI_API_KEY")
model = None
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')


class SendMessageRequest(BaseModel):
    conversationId: str
    userMessage: str
    userId: str


SYSTEM_PROMPT = """You are KrishiGPT, an AI assistant specifically designed to help farmers with agricultural questions. 
Please provide helpful, practical answers to farming questions.

Keep your response:
- Practical and actionable
- Focused on farming and agriculture
- Easy to understand for farmers
- Comprehensive and detailed

Formatting rules:
1. Use GitHub-flavored Markdown (GFM).
2. Use clear section headings (## or ###) to organize content.
3. Use bullet points for lists and explanations.
4. Use Markdown tables when comparing items.
5. Use numbered lists only when sequence matters.
6. Use short, scannable paragraphs.
7. Be concise but complete.

If the question is not related to farming, politely redirect to farming topics."""


async def save_message(conversation_id: str, role: str, content: str, tokens_used: int = None):
    """Save a message to the database"""
    supabase = get_supabase()
    response = supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "tokens_used": tokens_used
    }).execute()
    return response.data[0] if response.data else None


async def generate_ai_response_stream(user_message: str, conversation_history: list):
    """Generate streaming response from Gemini with conversation history"""
    if not model:
        error_data = json.dumps({"error": "AI not configured"}) + "\n"
        yield f"data: {error_data}\n\n"
        return
    
    try:
        # Build conversation context
        context_messages = []
        for msg in conversation_history:
            role_label = "User" if msg["role"] == "user" else "Assistant"
            context_messages.append(f"{role_label}: {msg['content']}")
        
        context = "\n\n".join(context_messages) if context_messages else ""
        
        full_prompt = f"""{SYSTEM_PROMPT}

Previous conversation:
{context}

User: {user_message}

Please provide a helpful response:"""
        
        response = model.generate_content(full_prompt, stream=True)
        
        accumulated_text = ""
        for chunk in response:
            if chunk.text:
                accumulated_text += chunk.text
                data = json.dumps({"chunk": chunk.text, "done": False}) + "\n"
                yield f"data: {data}\n\n"
                await asyncio.sleep(0.01)
        
        final_data = json.dumps({"chunk": "", "done": True, "full_text": accumulated_text}) + "\n"
        yield f"data: {final_data}\n\n"
        
    except Exception as e:
        logger.error(f"Error streaming response: {e}")
        error_data = json.dumps({"error": str(e), "done": True}) + "\n"
        yield f"data: {error_data}\n\n"


@router.post("/send")
async def send_message(request: SendMessageRequest):
    """Send a message and get AI response (non-streaming for DB storage)"""
    try:
        supabase = get_supabase()
        
        # Verify conversation exists and belongs to user
        conv_check = supabase.table("conversations") \
            .select("user_id") \
            .eq("id", request.conversationId) \
            .is_("deleted_at", "null") \
            .single() \
            .execute()
        
        if not conv_check.data:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if conv_check.data["user_id"] != request.userId:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # 1. Save user message immediately
        user_msg = await save_message(
            request.conversationId, 
            "user", 
            request.userMessage
        )
        
        # 2. Get conversation history (sliding window)
        history = await get_sliding_window_history(request.conversationId, limit=30)
        
        # 3. Generate AI response
        if not model:
            raise HTTPException(status_code=503, detail="AI not configured")
        
        context_messages = []
        for msg in history:
            role_label = "User" if msg["role"] == "user" else "Assistant"
            context_messages.append(f"{role_label}: {msg['content']}")
        
        context = "\n\n".join(context_messages) if context_messages else ""
        
        full_prompt = f"""{SYSTEM_PROMPT}

Previous conversation:
{context}

User: {request.userMessage}

Please provide a helpful response:"""
        
        response = model.generate_content(full_prompt)
        ai_content = response.text
        
        # Estimate tokens (rough approximation)
        tokens_used = len(full_prompt.split()) + len(ai_content.split())
        
        # 4. Save AI response
        ai_msg = await save_message(
            request.conversationId,
            "assistant",
            ai_content,
            tokens_used
        )
        
        return {
            "userMessageId": user_msg["id"] if user_msg else None,
            "aiMessageId": ai_msg["id"] if ai_msg else None,
            "aiResponse": ai_content,
            "tokensUsed": tokens_used,
            "timestamp": ai_msg["created_at"] if ai_msg else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send/stream")
async def send_message_stream(request: SendMessageRequest):
    """Send a message and get streaming AI response"""
    try:
        supabase = get_supabase()
        
        # Verify conversation
        conv_check = supabase.table("conversations") \
            .select("user_id") \
            .eq("id", request.conversationId) \
            .is_("deleted_at", "null") \
            .single() \
            .execute()
        
        if not conv_check.data:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if conv_check.data["user_id"] != request.userId:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Save user message
        await save_message(request.conversationId, "user", request.userMessage)
        
        # Get history
        history = await get_sliding_window_history(request.conversationId, limit=30)
        
        async def stream_and_save():
            accumulated = ""
            async for chunk_data in generate_ai_response_stream(request.userMessage, history):
                yield chunk_data
                # Parse to accumulate
                if chunk_data.startswith("data: "):
                    try:
                        data = json.loads(chunk_data[6:].strip())
                        if data.get("chunk"):
                            accumulated += data["chunk"]
                        if data.get("done") and accumulated:
                            # Save AI response after streaming completes
                            await save_message(
                                request.conversationId,
                                "assistant",
                                accumulated,
                                len(accumulated.split())
                            )
                    except:
                        pass
        
        return StreamingResponse(
            stream_and_save(),
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
        logger.error(f"Error in stream: {e}")
        raise HTTPException(status_code=500, detail=str(e))
