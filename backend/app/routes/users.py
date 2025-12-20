"""User routes"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..db.supabase import get_supabase

router = APIRouter(prefix="/api/users", tags=["users"])


class CreateUserRequest(BaseModel):
    email: str
    username: str
    password: str  # In production, hash this!
    location: Optional[str] = None
    phone: Optional[str] = None


@router.post("")
async def create_user(request: CreateUserRequest):
    """Create a new user"""
    try:
        supabase = get_supabase()
        
        # In production, hash the password!
        response = supabase.table("users").insert({
            "email": request.email,
            "username": request.username,
            "password_hash": request.password,  # Should be hashed!
            "location": request.location,
            "phone": request.phone
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        user = response.data[0]
        return {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "createdAt": user["created_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}")
async def get_user(user_id: str):
    """Get user by ID"""
    try:
        supabase = get_supabase()
        
        response = supabase.table("users") \
            .select("id, email, username, location, phone, created_at") \
            .eq("id", user_id) \
            .is_("deleted_at", "null") \
            .single() \
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/setup-test-user")
async def setup_test_user():
    """Create a test user for development"""
    try:
        supabase = get_supabase()
        
        test_user_id = "00000000-0000-0000-0000-000000000001"
        
        # Check if test user exists
        existing = supabase.table("users") \
            .select("id") \
            .eq("id", test_user_id) \
            .execute()
        
        if existing.data:
            return {"message": "Test user already exists", "userId": test_user_id}
        
        # Create test user
        response = supabase.table("users").insert({
            "id": test_user_id,
            "email": "test@krishiai.com",
            "username": "testfarmer",
            "password_hash": "test123",
            "location": "India"
        }).execute()
        
        return {"message": "Test user created", "userId": test_user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
