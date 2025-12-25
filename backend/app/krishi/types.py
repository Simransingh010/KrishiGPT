"""
KrishiGPT Type Definitions
Typed schemas for tools, forms, and responses.
"""

from enum import Enum
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime


class ConfidenceLevel(str, Enum):
    """AI response confidence levels"""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class Season(str, Enum):
    """Indian agricultural seasons"""
    KHARIF = "kharif"      # Monsoon crops (June-October)
    RABI = "rabi"          # Winter crops (October-March)
    ZAID = "zaid"          # Summer crops (March-June)


class CropStage(str, Enum):
    """Crop growth stages"""
    SOWING = "sowing"
    GERMINATION = "germination"
    VEGETATIVE = "vegetative"
    FLOWERING = "flowering"
    FRUITING = "fruiting"
    HARVEST = "harvest"


class SoilType(str, Enum):
    """Common soil types in India"""
    ALLUVIAL = "alluvial"
    BLACK = "black"
    RED = "red"
    LATERITE = "laterite"
    SANDY = "sandy"
    CLAY = "clay"
    LOAMY = "loamy"


# === Farm Context ===
class FarmContext(BaseModel):
    """
    Context injected into every AI call.
    Missing data triggers clarifying questions via forms.
    """
    location: Optional[str] = Field(None, description="State/district if known")
    crop: Optional[str] = Field(None, description="Current crop if known")
    crop_stage: Optional[CropStage] = Field(None, description="Growth stage")
    season: Optional[Season] = Field(None, description="Current season")
    soil_type: Optional[SoilType] = Field(None, description="Soil type if known")
    land_size_acres: Optional[float] = Field(None, description="Farm size in acres")
    irrigation_method: Optional[str] = Field(None, description="Irrigation type")
    weather_summary: Optional[str] = Field(None, description="Last 7 days weather")
    
    def is_sufficient_for_diagnosis(self) -> bool:
        """Check if context is sufficient for crop diagnosis"""
        return bool(self.crop and self.crop_stage)
    
    def is_sufficient_for_dosage(self) -> bool:
        """Check if context is sufficient for fertilizer/pesticide dosage"""
        return bool(self.crop and self.crop_stage and self.land_size_acres)
    
    def missing_fields(self) -> List[str]:
        """Return list of missing critical fields"""
        missing = []
        if not self.crop:
            missing.append("crop")
        if not self.crop_stage:
            missing.append("crop_stage")
        if not self.location:
            missing.append("location")
        return missing


# === Messages ===
class FarmMessage(BaseModel):
    """Renamed from ChatMessage - represents a single message in conversation"""
    id: str
    conversation_id: str
    role: Literal["user", "assistant", "system"]
    content: str
    created_at: datetime
    tokens_used: Optional[int] = None
    confidence: Optional[ConfidenceLevel] = None
    tool_calls: Optional[List[str]] = None  # Tools used to generate response
    form_data: Optional[Dict[str, Any]] = None  # Structured form submission


class FarmConversation(BaseModel):
    """Renamed from ChatSession - represents a conversation with context"""
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    context: FarmContext = Field(default_factory=FarmContext)
    message_count: int = 0
