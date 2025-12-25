"""
KrishiGPT Type Definitions - Continued
Response structures, forms, and tool definitions.
"""

from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from .types import ConfidenceLevel


# === Structured Response ===
class KrishiResponse(BaseModel):
    """
    MANDATORY response structure for all AI outputs.
    Every response MUST follow this format.
    """
    problem_summary: str = Field(..., description="One short sentence summary")
    do_today: List[str] = Field(default_factory=list, description="Immediate action steps")
    next_7_14_days: List[str] = Field(default_factory=list, description="Near-term actions")
    do_not_do: List[str] = Field(default_factory=list, description="Common mistakes to avoid")
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.LOW)
    disclaimer: Optional[str] = Field(None, description="Safety disclaimer if applicable")
    requires_form: Optional[str] = Field(None, description="Form ID if more info needed")
    raw_content: Optional[str] = Field(None, description="Original AI response for fallback")
    
    def to_markdown(self) -> str:
        """Convert structured response to farmer-friendly markdown"""
        lines = []
        
        lines.append(f"**PROBLEM SUMMARY:** {self.problem_summary}\n")
        
        if self.do_today:
            lines.append("**DO THIS TODAY:**")
            for step in self.do_today:
                lines.append(f"- {step}")
            lines.append("")
        
        if self.next_7_14_days:
            lines.append("**NEXT 7–14 DAYS:**")
            for step in self.next_7_14_days:
                lines.append(f"- {step}")
            lines.append("")
        
        if self.do_not_do:
            lines.append("⚠️ **DO NOT DO:**")
            for mistake in self.do_not_do:
                lines.append(f"- {mistake}")
            lines.append("")
        
        lines.append(f"**CONFIDENCE:** {self.confidence.value}")
        
        if self.disclaimer:
            lines.append(f"\n⚠️ *{self.disclaimer}*")
        
        return "\n".join(lines)


# === Dynamic Forms ===
class FormFieldOption(BaseModel):
    """Option for select/radio/checkbox fields"""
    value: str
    label: str
    label_hi: Optional[str] = None  # Hindi label


class FormField(BaseModel):
    """Single form field definition"""
    name: str
    type: Literal["select", "radio", "checkbox", "slider", "text", "number"]
    label: str
    label_hi: Optional[str] = None  # Hindi label
    options: Optional[List[FormFieldOption]] = None
    min_value: Optional[float] = None  # For slider/number
    max_value: Optional[float] = None
    step: Optional[float] = None
    required: bool = True
    placeholder: Optional[str] = None


class FormSchema(BaseModel):
    """
    Dynamic form schema for collecting structured data from farmers.
    Forms are shown when AI needs clarification before tool execution.
    """
    id: str
    title: str
    title_hi: Optional[str] = None  # Hindi title
    description: Optional[str] = None
    fields: List[FormField]
    submit_action: str  # Tool to execute on submit
    submit_label: str = "Submit"
    submit_label_hi: Optional[str] = "जमा करें"


# === Tool Definitions ===
class ToolParameter(BaseModel):
    """Parameter definition for a tool"""
    name: str
    type: str
    description: str
    required: bool = True
    enum: Optional[List[str]] = None


class ToolResult(BaseModel):
    """Result from tool execution"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    confidence: ConfidenceLevel = ConfidenceLevel.MEDIUM
    requires_disclaimer: bool = False
    disclaimer_text: Optional[str] = None


class ToolDefinition(BaseModel):
    """Definition of a KrishiMCP tool"""
    name: str
    description: str
    parameters: List[ToolParameter]
    requires_context: List[str] = Field(default_factory=list)  # Required FarmContext fields
    min_confidence: ConfidenceLevel = ConfidenceLevel.MEDIUM
    safety_critical: bool = False  # If True, extra validation required
