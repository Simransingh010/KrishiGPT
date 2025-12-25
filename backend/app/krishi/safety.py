"""
KrishiGPT Safety Validator
Implements safety-first design for agricultural advice.
RULE: Farmer safety over correctness, speed, or elegance.
"""

from typing import Optional, List, Dict, Tuple
from .types import FarmContext, ConfidenceLevel
from .types_continued import ToolResult


# Banned pesticides by region (partial list - expand as needed)
# Source: Central Insecticides Board & Registration Committee (CIB&RC)
BANNED_CHEMICALS_INDIA = {
    "endosulfan",
    "monocrotophos",
    "phosphamidon", 
    "methyl parathion",
    "triazophos",
    "dichlorvos",
    "phorate",
    "carbofuran",
    "methomyl",
    "alachlor",
    "dicofol",
    "mancozeb",  # Restricted in some states
}

# State-specific restrictions (expand as needed)
BANNED_BY_STATE: Dict[str, set] = {
    "kerala": {"endosulfan", "monocrotophos"},
    "karnataka": {"endosulfan"},
    "punjab": {"monocrotophos", "triazophos"},
}

# Maximum safe dosages (kg/acre) - conservative limits
MAX_DOSAGE_LIMITS = {
    "urea": 50,
    "dap": 25,
    "mop": 20,
    "npk": 30,
    "zinc_sulphate": 5,
    "borax": 2,
    "gypsum": 100,
}

# Pesticide concentration limits (ml or g per liter of water)
MAX_PESTICIDE_CONCENTRATION = {
    "neem_oil": 5,
    "imidacloprid": 0.5,
    "chlorpyrifos": 2,
    "cypermethrin": 1,
    "mancozeb": 2.5,
}


class SafetyValidator:
    """
    Centralized safety validation for all agricultural advice.
    Implements hard limits and regional restrictions.
    """
    
    @staticmethod
    def validate_chemical_name(chemical: str, state: Optional[str] = None) -> Tuple[bool, Optional[str]]:
        """
        Check if a chemical is banned nationally or in specific state.
        Returns (is_safe, warning_message)
        """
        chemical_lower = chemical.lower().strip()
        
        # Check national ban
        if chemical_lower in BANNED_CHEMICALS_INDIA:
            return False, f"⚠️ {chemical} is BANNED in India. Do not use."
        
        # Check state-specific ban
        if state:
            state_lower = state.lower().strip()
            state_bans = BANNED_BY_STATE.get(state_lower, set())
            if chemical_lower in state_bans:
                return False, f"⚠️ {chemical} is BANNED in {state}. Do not use."
        
        return True, None
    
    @staticmethod
    def validate_dosage(
        chemical_type: str,
        dosage_kg_per_acre: float,
        land_size_acres: Optional[float] = None
    ) -> Tuple[bool, Optional[str], Optional[float]]:
        """
        Validate fertilizer/pesticide dosage against safe limits.
        Returns (is_safe, warning_message, capped_dosage)
        """
        chemical_lower = chemical_type.lower().strip()
        max_limit = MAX_DOSAGE_LIMITS.get(chemical_lower)
        
        if max_limit is None:
            # Unknown chemical - be conservative
            return False, f"⚠️ Cannot verify safe dosage for {chemical_type}. Consult local agricultural officer.", None
        
        if dosage_kg_per_acre > max_limit:
            return False, f"⚠️ Dosage {dosage_kg_per_acre} kg/acre exceeds safe limit of {max_limit} kg/acre for {chemical_type}.", max_limit
        
        return True, None, dosage_kg_per_acre
    
    @staticmethod
    def validate_context_for_tool(
        context: FarmContext,
        tool_name: str,
        required_fields: List[str]
    ) -> Tuple[bool, List[str]]:
        """
        Check if FarmContext has required fields for tool execution.
        Returns (is_valid, missing_fields)
        """
        missing = []
        
        for field in required_fields:
            value = getattr(context, field, None)
            if value is None:
                missing.append(field)
        
        return len(missing) == 0, missing
    
    @staticmethod
    def should_block_tool_execution(
        confidence: ConfidenceLevel,
        min_required: ConfidenceLevel = ConfidenceLevel.MEDIUM
    ) -> bool:
        """
        Block tool execution if confidence is too low.
        RULE: If AI confidence < Medium → tool execution forbidden
        """
        confidence_order = {
            ConfidenceLevel.LOW: 0,
            ConfidenceLevel.MEDIUM: 1,
            ConfidenceLevel.HIGH: 2,
        }
        
        return confidence_order[confidence] < confidence_order[min_required]
    
    @staticmethod
    def add_mandatory_disclaimer(
        tool_name: str,
        result: ToolResult
    ) -> ToolResult:
        """
        Add mandatory disclaimers for safety-critical tools.
        """
        disclaimer_map = {
            "recommend_fertilizer": "Dosage is approximate. Soil test recommended for accurate application.",
            "pesticide_safety_check": "Always wear protective equipment. Follow label instructions.",
            "diagnose_crop_issue": "Visual diagnosis has limitations. Consult agricultural officer for confirmation.",
        }
        
        if tool_name in disclaimer_map:
            result.requires_disclaimer = True
            result.disclaimer_text = disclaimer_map[tool_name]
        
        return result
    
    @staticmethod
    def validate_response_confidence(
        has_crop: bool,
        has_crop_stage: bool,
        has_location: bool,
        has_land_size: bool,
        is_dosage_advice: bool
    ) -> ConfidenceLevel:
        """
        Calculate response confidence based on available context.
        """
        score = 0
        
        if has_crop:
            score += 2
        if has_crop_stage:
            score += 2
        if has_location:
            score += 1
        if has_land_size:
            score += 1
        
        # Dosage advice requires more context
        if is_dosage_advice and not has_land_size:
            return ConfidenceLevel.LOW
        
        if score >= 5:
            return ConfidenceLevel.HIGH
        elif score >= 3:
            return ConfidenceLevel.MEDIUM
        else:
            return ConfidenceLevel.LOW
    
    @staticmethod
    def sanitize_ai_response(response: str) -> str:
        """
        Remove potentially dangerous advice from AI response.
        """
        # Check for banned chemicals mentioned
        response_lower = response.lower()
        
        for chemical in BANNED_CHEMICALS_INDIA:
            if chemical in response_lower:
                response = response.replace(
                    chemical, 
                    f"[BANNED: {chemical}]"
                )
                response = response.replace(
                    chemical.title(),
                    f"[BANNED: {chemical.title()}]"
                )
        
        return response
