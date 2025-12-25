"""
KrishiGPT Routes
New routes for the KrishiGPT system with forms and tools.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging

from ..krishi.controller import get_krishi_controller
from ..krishi.types import FarmContext, CropStage, Season, SoilType
from ..krishi.forms import get_form, get_all_forms
from ..db.supabase import get_supabase
from ..utils.sliding_window import get_sliding_window_history

router = APIRouter(prefix="/api/krishi", tags=["krishi"])
logger = logging.getLogger(__name__)


# === Request Models ===

class FarmContextRequest(BaseModel):
    """Farm context from frontend"""
    location: Optional[str] = None
    crop: Optional[str] = None
    crop_stage: Optional[str] = None
    season: Optional[str] = None
    soil_type: Optional[str] = None
    land_size_acres: Optional[float] = None
    irrigation_method: Optional[str] = None


class KrishiMessageRequest(BaseModel):
    """Request for sending a message to KrishiGPT"""
    conversationId: str
    userMessage: str
    userId: str
    context: Optional[FarmContextRequest] = None
    formData: Optional[Dict[str, Any]] = None


class ToolExecuteRequest(BaseModel):
    """Request for executing a tool"""
    toolName: str
    context: FarmContextRequest
    params: Dict[str, Any] = {}


class UpdateContextRequest(BaseModel):
    """Request for updating conversation context"""
    conversationId: str
    userId: str
    context: FarmContextRequest


# === Helper Functions ===

def request_to_farm_context(req: Optional[FarmContextRequest]) -> FarmContext:
    """Convert request model to FarmContext"""
    if not req:
        return FarmContext()
    
    context_dict = {}
    
    if req.location:
        context_dict["location"] = req.location
    if req.crop:
        context_dict["crop"] = req.crop
    if req.crop_stage:
        try:
            context_dict["crop_stage"] = CropStage(req.crop_stage)
        except ValueError:
            pass
    if req.season:
        try:
            context_dict["season"] = Season(req.season)
        except ValueError:
            pass
    if req.soil_type:
        try:
            context_dict["soil_type"] = SoilType(req.soil_type)
        except ValueError:
            pass
    if req.land_size_acres:
        context_dict["land_size_acres"] = req.land_size_acres
    if req.irrigation_method:
        context_dict["irrigation_method"] = req.irrigation_method
    
    return FarmContext(**context_dict)


async def save_message(conversation_id: str, role: str, content: str, tokens_used: int = None, metadata: Dict = None):
    """Save a message to the database"""
    supabase = get_supabase()
    
    insert_data = {
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "tokens_used": tokens_used
    }
    
    # Store metadata as JSON if provided (for form data, confidence, etc.)
    # Note: This requires a metadata column in the messages table
    
    response = supabase.table("messages").insert(insert_data).execute()
    return response.data[0] if response.data else None


# === Routes ===

@router.post("/send")
async def send_krishi_message(request: KrishiMessageRequest):
    """
    Send a message to KrishiGPT and get a response.
    Handles context validation and form requests.
    """
    try:
        supabase = get_supabase()
        controller = get_krishi_controller()
        
        # Verify conversation exists
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
        user_msg = await save_message(
            request.conversationId,
            "user",
            request.userMessage
        )
        
        # Get conversation history
        history = await get_sliding_window_history(request.conversationId, limit=30)
        
        # Convert context
        farm_context = request_to_farm_context(request.context)
        
        # Process message
        result = await controller.process_message(
            request.userMessage,
            farm_context,
            history,
            request.formData
        )
        
        # Handle different response types
        if result["type"] == "form_request":
            # Don't save AI message for form requests
            return {
                "type": "form_request",
                "form": result["form"],
                "message": result["message"],
                "userMessageId": user_msg["id"] if user_msg else None
            }
        
        elif result["type"] == "response":
            # Save AI response
            ai_msg = await save_message(
                request.conversationId,
                "assistant",
                result["content"],
                len(result["content"].split())  # Rough token estimate
            )
            
            return {
                "type": "response",
                "userMessageId": user_msg["id"] if user_msg else None,
                "aiMessageId": ai_msg["id"] if ai_msg else None,
                "aiResponse": result["content"],
                "confidence": result["confidence"],
                "intent": result.get("intent"),
                "timestamp": ai_msg["created_at"] if ai_msg else None
            }
        
        else:
            # Error
            return {
                "type": "error",
                "message": result.get("message", "Unknown error"),
                "userMessageId": user_msg["id"] if user_msg else None
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in send_krishi_message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send/stream")
async def send_krishi_message_stream(request: KrishiMessageRequest):
    """
    Send a message to KrishiGPT with streaming response.
    """
    try:
        supabase = get_supabase()
        controller = get_krishi_controller()
        
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
        
        # Convert context
        farm_context = request_to_farm_context(request.context)
        
        async def stream_and_save():
            accumulated = ""
            async for chunk_data in controller.process_message_stream(
                request.userMessage,
                farm_context,
                history,
                request.formData
            ):
                yield chunk_data
                
                # Parse to accumulate for saving
                if chunk_data.startswith("data: "):
                    try:
                        import json
                        data = json.loads(chunk_data[6:].strip())
                        if data.get("chunk"):
                            accumulated += data["chunk"]
                        if data.get("done") and accumulated and data.get("type") != "form_request":
                            # Save AI response
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


@router.get("/forms")
async def get_available_forms():
    """Get all available forms for the frontend"""
    forms = get_all_forms()
    return {
        "forms": {form_id: form.model_dump() for form_id, form in forms.items()}
    }


@router.get("/forms/{form_id}")
async def get_form_by_id(form_id: str):
    """Get a specific form by ID"""
    form = get_form(form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form.model_dump()


@router.post("/tools/execute")
async def execute_tool(request: ToolExecuteRequest):
    """Execute a KrishiMCP tool"""
    controller = get_krishi_controller()
    farm_context = request_to_farm_context(request.context)
    
    result = await controller.execute_tool(
        request.toolName,
        farm_context,
        request.params
    )
    
    return result


@router.get("/tools")
async def get_available_tools():
    """Get list of available tools"""
    controller = get_krishi_controller()
    return {
        "tools": controller.get_available_tool_names()
    }


@router.post("/context/update")
async def update_conversation_context(request: UpdateContextRequest):
    """
    Update the context for a conversation.
    This stores context in the conversation metadata.
    """
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
        
        # Convert and validate context
        farm_context = request_to_farm_context(request.context)
        
        # TODO: Store context in conversation metadata
        # This requires adding a metadata/context column to conversations table
        
        return {
            "success": True,
            "context": farm_context.model_dump()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating context: {e}")
        raise HTTPException(status_code=500, detail=str(e))
