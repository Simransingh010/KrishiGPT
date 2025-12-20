"""Sliding window utility for conversation history"""
from typing import List, Dict
from ..db.supabase import get_supabase


async def get_sliding_window_history(conversation_id: str, limit: int = 30) -> List[Dict]:
    """
    Fetch last N messages from conversation for AI context.
    Returns messages in chronological order (oldest first).
    """
    supabase = get_supabase()
    
    # Fetch last {limit} messages, ordered by created_at DESC
    response = supabase.table("messages") \
        .select("role, content") \
        .eq("conversation_id", conversation_id) \
        .order("created_at", desc=True) \
        .limit(limit) \
        .execute()
    
    messages = response.data or []
    
    # Reverse to get chronological order (oldest first)
    messages.reverse()
    
    # Format for AI API
    return [{"role": m["role"], "content": m["content"]} for m in messages]
