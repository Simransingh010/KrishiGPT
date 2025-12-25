"""
Input Validation Utilities
Rule: Fail fast, loudly. Validate all inputs.
"""

import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator


# Constants
MAX_MESSAGE_LENGTH = 4000
MIN_MESSAGE_LENGTH = 1
MAX_TITLE_LENGTH = 200
MAX_QUESTION_LENGTH = 2000


class ValidationError(Exception):
    """Custom validation error with code"""
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


def validate_message_content(content: str) -> str:
    """
    Validate and sanitize message content.
    Returns sanitized content or raises ValidationError.
    """
    if not content:
        raise ValidationError("EMPTY_MESSAGE", "Message cannot be empty")
    
    # Strip whitespace
    content = content.strip()
    
    if len(content) < MIN_MESSAGE_LENGTH:
        raise ValidationError("MESSAGE_TOO_SHORT", "Message is too short")
    
    if len(content) > MAX_MESSAGE_LENGTH:
        raise ValidationError(
            "MESSAGE_TOO_LONG", 
            f"Message exceeds maximum length of {MAX_MESSAGE_LENGTH} characters"
        )
    
    # Basic XSS prevention - remove script tags
    content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.IGNORECASE | re.DOTALL)
    
    # Remove potential SQL injection patterns (basic)
    dangerous_patterns = [
        r';\s*DROP\s+TABLE',
        r';\s*DELETE\s+FROM',
        r';\s*UPDATE\s+.*\s+SET',
        r';\s*INSERT\s+INTO',
        r'--\s*$',
        r'/\*.*\*/',
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            raise ValidationError("INVALID_CONTENT", "Message contains invalid content")
    
    return content


def validate_title(title: str) -> str:
    """Validate conversation title"""
    if not title:
        return "New Conversation"
    
    title = title.strip()
    
    if len(title) > MAX_TITLE_LENGTH:
        title = title[:MAX_TITLE_LENGTH]
    
    # Remove any HTML tags
    title = re.sub(r'<[^>]+>', '', title)
    
    return title


def validate_uuid(value: str, field_name: str = "ID") -> str:
    """Validate UUID format"""
    uuid_pattern = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    
    if not uuid_pattern.match(value):
        raise ValidationError("INVALID_UUID", f"Invalid {field_name} format")
    
    return value


def validate_user_id(user_id: str) -> str:
    """Validate user ID"""
    if not user_id:
        raise ValidationError("MISSING_USER_ID", "User ID is required")
    
    return validate_uuid(user_id, "User ID")


def validate_conversation_id(conversation_id: str) -> str:
    """Validate conversation ID"""
    if not conversation_id:
        raise ValidationError("MISSING_CONVERSATION_ID", "Conversation ID is required")
    
    return validate_uuid(conversation_id, "Conversation ID")


# Pydantic models with validation

class ValidatedMessageRequest(BaseModel):
    """Message request with built-in validation"""
    conversationId: str = Field(..., min_length=36, max_length=36)
    userMessage: str = Field(..., min_length=1, max_length=MAX_MESSAGE_LENGTH)
    userId: str = Field(..., min_length=36, max_length=36)
    
    @field_validator('userMessage')
    @classmethod
    def validate_message(cls, v: str) -> str:
        return validate_message_content(v)
    
    @field_validator('conversationId')
    @classmethod
    def validate_conv_id(cls, v: str) -> str:
        return validate_uuid(v, "Conversation ID")
    
    @field_validator('userId')
    @classmethod
    def validate_user(cls, v: str) -> str:
        return validate_uuid(v, "User ID")


class ValidatedQuestionRequest(BaseModel):
    """Question request with validation"""
    question: str = Field(..., min_length=1, max_length=MAX_QUESTION_LENGTH)
    
    @field_validator('question')
    @classmethod
    def validate_question(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Question cannot be empty")
        return v


class ValidatedConversationCreate(BaseModel):
    """Conversation creation with validation"""
    userId: str = Field(..., min_length=36, max_length=36)
    title: Optional[str] = Field(None, max_length=MAX_TITLE_LENGTH)
    
    @field_validator('userId')
    @classmethod
    def validate_user(cls, v: str) -> str:
        return validate_uuid(v, "User ID")
    
    @field_validator('title')
    @classmethod
    def validate_conv_title(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return validate_title(v)
        return v
