"""
KrishiGPT Controller
Main orchestration logic for AI interactions.
RULE: Farmer safety over correctness, speed, or elegance.
"""

import json
import logging
from typing import Optional, List, Dict, Any, AsyncGenerator
import google.generativeai as genai
import os

from .types import FarmContext, ConfidenceLevel, CropStage, SoilType
from .prompt_builder import KrishiPromptBuilder
from .safety import SafetyValidator
from .forms import get_form, KRISHI_FORMS
from .tools_continued import get_tool, get_available_tools

logger = logging.getLogger(__name__)


class KrishiGPTController:
    """
    Main controller for KrishiGPT interactions.
    Implements the strict flow:
    1. Receive farmer message
    2. Validate minimum context
    3. If insufficient → show form
    4. Call AI with context + tools
    5. Validate tool calls
    6. Return farmer-safe response
    """
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def _detect_intent(self, message: str) -> Dict[str, Any]:
        """
        Detect farmer's intent from message.
        Returns intent type and any extracted entities.
        """
        message_lower = message.lower()
        
        # Intent detection keywords
        intents = {
            "diagnosis": ["problem", "disease", "pest", "yellow", "spots", "wilting", "insects", "dying", "help"],
            "fertilizer": ["fertilizer", "urea", "dap", "npk", "nutrient", "manure", "खाद"],
            "irrigation": ["water", "irrigation", "सिंचाई", "पानी", "when to water"],
            "weather": ["rain", "weather", "frost", "heat", "cold", "बारिश", "मौसम"],
            "price": ["price", "msp", "rate", "sell", "market", "मंडी", "भाव"],
            "pesticide": ["pesticide", "spray", "कीटनाशक", "दवाई"],
        }
        
        detected = []
        for intent, keywords in intents.items():
            if any(kw in message_lower for kw in keywords):
                detected.append(intent)
        
        return {
            "intents": detected if detected else ["general"],
            "needs_clarification": len(detected) == 0 or len(detected) > 2
        }
    
    def _check_context_sufficiency(
        self, 
        context: FarmContext, 
        intent: str
    ) -> tuple[bool, Optional[str]]:
        """
        Check if context is sufficient for the detected intent.
        For simple chat, always return sufficient - AI will ask follow-up questions naturally.
        """
        # Always sufficient - let AI handle clarification naturally in conversation
        return True, None
    
    async def process_message(
        self,
        user_message: str,
        context: FarmContext,
        conversation_history: List[Dict],
        form_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Main entry point for processing farmer messages.
        Returns structured response with optional form request.
        """
        # Step 1: Update context from form data if provided
        if form_data:
            context = self._update_context_from_form(context, form_data)
        
        # Step 2: Detect intent
        intent_result = self._detect_intent(user_message)
        primary_intent = intent_result["intents"][0] if intent_result["intents"] else "general"
        
        # Step 3: Check context sufficiency
        is_sufficient, form_id = self._check_context_sufficiency(context, primary_intent)
        
        if not is_sufficient and form_id:
            # Return form request instead of AI response
            form = get_form(form_id)
            if form:
                return {
                    "type": "form_request",
                    "form": form.model_dump(),
                    "message": "I need a bit more information to help you properly.",
                    "confidence": ConfidenceLevel.LOW.value
                }
        
        # Step 4: Build prompt and call AI
        full_prompt = KrishiPromptBuilder.build_full_prompt(
            user_message,
            context,
            conversation_history
        )
        
        if not self.model:
            return {
                "type": "error",
                "message": "AI service not configured",
                "confidence": ConfidenceLevel.LOW.value
            }
        
        try:
            response = self.model.generate_content(full_prompt)
            ai_content = response.text
            
            # Step 5: Sanitize response for safety
            ai_content = SafetyValidator.sanitize_ai_response(ai_content)
            
            # Step 6: Calculate confidence
            confidence = SafetyValidator.validate_response_confidence(
                has_crop=bool(context.crop),
                has_crop_stage=bool(context.crop_stage),
                has_location=bool(context.location),
                has_land_size=bool(context.land_size_acres),
                is_dosage_advice=primary_intent == "fertilizer"
            )
            
            return {
                "type": "response",
                "content": ai_content,
                "confidence": confidence.value,
                "context_used": {
                    "crop": context.crop,
                    "stage": context.crop_stage.value if context.crop_stage else None,
                    "location": context.location,
                },
                "intent": primary_intent
            }
            
        except Exception as e:
            logger.error(f"AI generation error: {e}")
            return {
                "type": "error",
                "message": "Unable to generate response. Please try again.",
                "confidence": ConfidenceLevel.LOW.value
            }
    
    async def process_message_stream(
        self,
        user_message: str,
        context: FarmContext,
        conversation_history: List[Dict],
        form_data: Optional[Dict[str, Any]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Streaming version of process_message.
        Yields SSE-formatted chunks.
        """
        # Update context from form data
        if form_data:
            context = self._update_context_from_form(context, form_data)
        
        # Detect intent and check context
        intent_result = self._detect_intent(user_message)
        primary_intent = intent_result["intents"][0] if intent_result["intents"] else "general"
        
        is_sufficient, form_id = self._check_context_sufficiency(context, primary_intent)
        
        if not is_sufficient and form_id:
            form = get_form(form_id)
            if form:
                data = json.dumps({
                    "type": "form_request",
                    "form": form.model_dump(),
                    "message": "I need a bit more information to help you properly.",
                    "done": True
                })
                yield f"data: {data}\n\n"
                return
        
        # Build prompt
        full_prompt = KrishiPromptBuilder.build_full_prompt(
            user_message,
            context,
            conversation_history
        )
        
        if not self.model:
            error_data = json.dumps({"error": "AI not configured", "done": True})
            yield f"data: {error_data}\n\n"
            return
        
        try:
            response = self.model.generate_content(full_prompt, stream=True)
            accumulated = ""
            
            for chunk in response:
                if chunk.text:
                    # Sanitize each chunk
                    safe_chunk = SafetyValidator.sanitize_ai_response(chunk.text)
                    accumulated += safe_chunk
                    
                    data = json.dumps({"chunk": safe_chunk, "done": False})
                    yield f"data: {data}\n\n"
            
            # Calculate final confidence
            confidence = SafetyValidator.validate_response_confidence(
                has_crop=bool(context.crop),
                has_crop_stage=bool(context.crop_stage),
                has_location=bool(context.location),
                has_land_size=bool(context.land_size_acres),
                is_dosage_advice=primary_intent == "fertilizer"
            )
            
            final_data = json.dumps({
                "chunk": "",
                "done": True,
                "full_text": accumulated,
                "confidence": confidence.value,
                "intent": primary_intent
            })
            yield f"data: {final_data}\n\n"
            
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            error_data = json.dumps({"error": str(e), "done": True})
            yield f"data: {error_data}\n\n"
    
    def _update_context_from_form(
        self, 
        context: FarmContext, 
        form_data: Dict[str, Any]
    ) -> FarmContext:
        """Update FarmContext from form submission"""
        updates = {}
        
        if "crop" in form_data:
            updates["crop"] = form_data["crop"]
        
        if "crop_stage" in form_data:
            try:
                updates["crop_stage"] = CropStage(form_data["crop_stage"])
            except ValueError:
                pass
        
        if "land_size" in form_data:
            try:
                updates["land_size_acres"] = float(form_data["land_size"])
            except (ValueError, TypeError):
                pass
        
        if "state" in form_data:
            location = form_data["state"]
            if "district" in form_data and form_data["district"]:
                location = f"{form_data['district']}, {location}"
            updates["location"] = location
        
        if "soil_type" in form_data:
            try:
                updates["soil_type"] = SoilType(form_data["soil_type"])
            except ValueError:
                pass
        
        if "irrigation_type" in form_data:
            updates["irrigation_method"] = form_data["irrigation_type"]
        
        # Create new context with updates
        return FarmContext(**{**context.model_dump(), **updates})
    
    async def execute_tool(
        self,
        tool_name: str,
        context: FarmContext,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a KrishiMCP tool with safety validation.
        """
        tool = get_tool(tool_name)
        
        if not tool:
            return {
                "success": False,
                "error": f"Tool '{tool_name}' not found"
            }
        
        # Validate context
        is_valid, missing = tool.validate_context(context)
        
        if not is_valid:
            # Return clarification form
            form = tool.clarification_form
            if form:
                return {
                    "success": False,
                    "requires_form": True,
                    "form": form.model_dump(),
                    "missing_fields": missing
                }
            return {
                "success": False,
                "error": f"Missing required context: {', '.join(missing)}"
            }
        
        # Execute tool
        result = await tool.execute(context, params)
        
        return {
            "success": result.success,
            "data": result.data,
            "confidence": result.confidence.value,
            "disclaimer": result.disclaimer_text if result.requires_disclaimer else None
        }
    
    def get_available_forms(self) -> List[Dict]:
        """Get all available forms for frontend"""
        return [form.model_dump() for form in KRISHI_FORMS.values()]
    
    def get_available_tool_names(self) -> List[str]:
        """Get list of available tool names"""
        return list(get_available_tools().keys())


# Singleton instance
_controller: Optional[KrishiGPTController] = None


def get_krishi_controller() -> KrishiGPTController:
    """Get or create the KrishiGPT controller singleton"""
    global _controller
    if _controller is None:
        _controller = KrishiGPTController()
    return _controller
