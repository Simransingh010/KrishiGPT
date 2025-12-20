"""Conversation routes"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..db.supabase import get_supabase

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


class CreateConversationRequest(BaseModel):
    userId: str
    title: Optional[str] = None


class UpdateConversationRequest(BaseModel):
    title: str
    userId: str


class DeleteConversationRequest(BaseModel):
    userId: str


@router.post("")
async def create_conversation(request: CreateConversationRequest):
    """Create a new conversation"""
    try:
        supabase = get_supabase()
        
        # Generate default title if not provided
        title = request.title or f"Conversation - {datetime.now().strftime('%b %d, %Y')}"
        
        response = supabase.table("conversations").insert({
            "user_id": request.userId,
            "title": title
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create conversation")
        
        conv = response.data[0]
        return {
            "id": conv["id"],
            "userId": conv["user_id"],
            "title": conv["title"],
            "createdAt": conv["created_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}")
async def get_user_conversations(user_id: str):
    """Get all conversations for a user with last message preview"""
    try:
        supabase = get_supabase()
        
        # Get conversations that aren't deleted
        response = supabase.table("conversations") \
            .select("id, title, created_at, updated_at") \
            .eq("user_id", user_id) \
            .is_("deleted_at", "null") \
            .order("created_at", desc=True) \
            .execute()
        
        conversations = response.data or []
        result = []
        
        for conv in conversations:
            # Get last message for preview
            msg_response = supabase.table("messages") \
                .select("content, role, created_at") \
                .eq("conversation_id", conv["id"]) \
                .order("created_at", desc=True) \
                .limit(1) \
                .execute()
            
            # Get message count
            count_response = supabase.table("messages") \
                .select("id", count="exact") \
                .eq("conversation_id", conv["id"]) \
                .execute()
            
            last_message = msg_response.data[0] if msg_response.data else None
            
            result.append({
                "id": conv["id"],
                "title": conv["title"],
                "createdAt": conv["created_at"],
                "updatedAt": conv["updated_at"],
                "lastMessage": last_message["content"][:100] if last_message else None,
                "lastMessageRole": last_message["role"] if last_message else None,
                "messageCount": count_response.count or 0
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{conversation_id}/messages")
async def get_conversation_messages(conversation_id: str, limit: int = 50, offset: int = 0):
    """Get messages for a conversation (paginated)"""
    try:
        supabase = get_supabase()
        
        response = supabase.table("messages") \
            .select("id, role, content, created_at, tokens_used") \
            .eq("conversation_id", conversation_id) \
            .order("created_at", desc=False) \
            .range(offset, offset + limit - 1) \
            .execute()
        
        messages = response.data or []
        return [{
            "id": m["id"],
            "role": m["role"],
            "content": m["content"],
            "createdAt": m["created_at"],
            "tokensUsed": m.get("tokens_used")
        } for m in messages]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{conversation_id}")
async def update_conversation(conversation_id: str, request: UpdateConversationRequest):
    """Update conversation title"""
    try:
        supabase = get_supabase()
        
        # Verify ownership
        conv_check = supabase.table("conversations") \
            .select("user_id") \
            .eq("id", conversation_id) \
            .single() \
            .execute()
        
        if not conv_check.data or conv_check.data["user_id"] != request.userId:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        response = supabase.table("conversations") \
            .update({"title": request.title}) \
            .eq("id", conversation_id) \
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        conv = response.data[0]
        return {
            "id": conv["id"],
            "title": conv["title"],
            "updatedAt": conv["updated_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str, request: DeleteConversationRequest):
    """Soft delete a conversation"""
    try:
        supabase = get_supabase()
        
        # Verify ownership
        conv_check = supabase.table("conversations") \
            .select("user_id") \
            .eq("id", conversation_id) \
            .single() \
            .execute()
        
        if not conv_check.data or conv_check.data["user_id"] != request.userId:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Soft delete
        response = supabase.table("conversations") \
            .update({"deleted_at": datetime.utcnow().isoformat()}) \
            .eq("id", conversation_id) \
            .execute()
        
        return {"success": True, "conversationId": conversation_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
