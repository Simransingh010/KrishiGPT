"""
KrishiGPT Prompt Builder
Centralized prompt construction with context injection.
"""

from typing import List, Dict, Optional
from .types import FarmContext, FarmMessage


class KrishiPromptBuilder:
    """
    Builds prompts for KrishiGPT with mandatory context injection.
    Ensures consistent, safe, and farmer-friendly responses.
    """
    
    SYSTEM_PROMPT = """You are KrishiGPT, an AI assistant specifically designed to help farmers in India with agricultural decisions.

## CRITICAL RULES - YOU MUST FOLLOW THESE:

1. **RESPONSE FORMAT** - Every response MUST follow this exact structure:
```
PROBLEM SUMMARY: (one short sentence describing the issue)

DO THIS TODAY:
- Step 1
- Step 2

NEXT 7–14 DAYS:
- Step 1
- Step 2

⚠️ DO NOT DO:
- Mistake 1
- Mistake 2

CONFIDENCE: Low | Medium | High
```

2. **SAFETY FIRST**:
- NEVER recommend banned pesticides (endosulfan, monocrotophos, etc.)
- NEVER give exact dosages without knowing land size
- ALWAYS add disclaimers for chemical recommendations
- If unsure, say "Consult your local agricultural officer"

3. **CONTEXT REQUIREMENTS**:
- If crop type is unknown → ASK before giving advice
- If crop stage is unknown → ASK before giving advice
- If land size is unknown → DO NOT give dosage amounts

4. **LANGUAGE**:
- Use simple, clear language
- Avoid technical jargon unless necessary
- Use bullet points, not paragraphs
- Keep sentences short

5. **CONFIDENCE LEVELS**:
- HIGH: All context available, clear diagnosis
- MEDIUM: Some context missing but advice is general
- LOW: Significant context missing, advice is speculative

6. **WHEN TO ASK QUESTIONS**:
If you cannot provide confident advice, respond with:
```
I need more information to help you properly.

Please tell me:
- [specific question 1]
- [specific question 2]
```

Remember: Farmer safety is more important than giving a quick answer. When in doubt, ask questions."""

    @classmethod
    def build_context_block(cls, context: FarmContext) -> str:
        """Build context injection block from FarmContext"""
        parts = ["## FARMER CONTEXT:"]
        
        if context.location:
            parts.append(f"- Location: {context.location}")
        else:
            parts.append("- Location: Unknown")
        
        if context.crop:
            parts.append(f"- Crop: {context.crop}")
        else:
            parts.append("- Crop: Unknown (ASK FARMER)")
        
        if context.crop_stage:
            parts.append(f"- Crop Stage: {context.crop_stage.value}")
        else:
            parts.append("- Crop Stage: Unknown (ASK FARMER)")
        
        if context.season:
            parts.append(f"- Season: {context.season.value}")
        
        if context.soil_type:
            parts.append(f"- Soil Type: {context.soil_type.value}")
        
        if context.land_size_acres:
            parts.append(f"- Land Size: {context.land_size_acres} acres")
        else:
            parts.append("- Land Size: Unknown (DO NOT GIVE DOSAGES)")
        
        if context.irrigation_method:
            parts.append(f"- Irrigation: {context.irrigation_method}")
        
        if context.weather_summary:
            parts.append(f"- Recent Weather: {context.weather_summary}")
        
        return "\n".join(parts)
    
    @classmethod
    def build_conversation_history(cls, messages: List[Dict]) -> str:
        """Format conversation history for context"""
        if not messages:
            return ""
        
        parts = ["## PREVIOUS CONVERSATION:"]
        
        for msg in messages[-10:]:  # Last 10 messages max
            role = "Farmer" if msg.get("role") == "user" else "KrishiGPT"
            content = msg.get("content", "")[:500]  # Truncate long messages
            parts.append(f"\n{role}: {content}")
        
        return "\n".join(parts)
    
    @classmethod
    def build_full_prompt(
        cls,
        user_message: str,
        context: FarmContext,
        conversation_history: List[Dict],
        tool_results: Optional[List[Dict]] = None
    ) -> str:
        """
        Build complete prompt with all context injected.
        This is the main entry point for prompt construction.
        """
        parts = [cls.SYSTEM_PROMPT]
        
        # Add context block
        parts.append("\n" + cls.build_context_block(context))
        
        # Add conversation history
        history_block = cls.build_conversation_history(conversation_history)
        if history_block:
            parts.append("\n" + history_block)
        
        # Add tool results if any
        if tool_results:
            parts.append("\n## TOOL RESULTS:")
            for result in tool_results:
                parts.append(f"- {result.get('tool')}: {result.get('summary', 'No summary')}")
        
        # Add current message
        parts.append(f"\n## FARMER'S QUESTION:\n{user_message}")
        
        # Add response instruction
        parts.append("\n## YOUR RESPONSE (follow the format above):")
        
        return "\n".join(parts)
    
    @classmethod
    def build_clarification_prompt(
        cls,
        missing_fields: List[str],
        original_question: str
    ) -> str:
        """Build prompt for asking clarifying questions"""
        field_questions = {
            "crop": "What crop are you growing?",
            "crop_stage": "What stage is your crop in? (sowing/vegetative/flowering/harvest)",
            "location": "Which state/district are you in?",
            "land_size_acres": "How many acres is your farm?",
            "soil_type": "What type of soil do you have?",
            "irrigation_method": "How do you irrigate your crops?",
        }
        
        questions = [field_questions.get(f, f"What is your {f}?") for f in missing_fields]
        
        return f"""I want to help you with: "{original_question}"

But I need more information to give you accurate advice.

Please tell me:
{chr(10).join(f'- {q}' for q in questions)}

CONFIDENCE: Low (waiting for more information)"""
