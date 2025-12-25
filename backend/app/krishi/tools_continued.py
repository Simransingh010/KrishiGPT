"""
KrishiGPT MCP Tools - Continued
Additional agricultural tools.
"""

from typing import Dict, Any, Optional
from .types import FarmContext, ConfidenceLevel
from .types_continued import ToolResult, ToolDefinition, ToolParameter, FormSchema, FormField, FormFieldOption
from .safety import SafetyValidator
from .tools import KrishiMCPTool


class PesticideSafetyCheckTool(KrishiMCPTool):
    """Check pesticide safety and provide usage guidelines"""
    
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="pesticide_safety_check",
            description="Check if a pesticide is safe and provide usage guidelines",
            parameters=[
                ToolParameter(name="pesticide_name", type="string", description="Name of pesticide to check", required=True),
            ],
            requires_context=["location"],
            min_confidence=ConfidenceLevel.HIGH,  # Safety-critical
            safety_critical=True
        )
    
    async def execute(self, context: FarmContext, params: Dict[str, Any]) -> ToolResult:
        pesticide = params.get("pesticide_name", "")
        
        # Check if banned
        is_safe, warning = SafetyValidator.validate_chemical_name(
            pesticide, 
            context.location
        )
        
        if not is_safe:
            return ToolResult(
                success=True,
                data={
                    "pesticide": pesticide,
                    "is_banned": True,
                    "warning": warning,
                    "alternative": "Use neem-based or biological pest control"
                },
                confidence=ConfidenceLevel.HIGH,
                requires_disclaimer=True,
                disclaimer_text=warning
            )
        
        # Safe pesticide - provide guidelines
        return ToolResult(
            success=True,
            data={
                "pesticide": pesticide,
                "is_banned": False,
                "safety_guidelines": [
                    "Wear protective clothing and gloves",
                    "Do not spray against wind direction",
                    "Keep away from water sources",
                    "Follow label instructions for dosage",
                    "Maintain safe interval before harvest"
                ]
            },
            confidence=ConfidenceLevel.MEDIUM,
            requires_disclaimer=True,
            disclaimer_text="Always follow label instructions. Consult agricultural officer for specific guidance."
        )


class IrrigationScheduleTool(KrishiMCPTool):
    """Generate irrigation schedule based on crop and conditions"""
    
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="irrigation_schedule",
            description="Generate irrigation schedule for crop",
            parameters=[
                ToolParameter(name="irrigation_type", type="string", description="drip/flood/sprinkler", required=False),
            ],
            requires_context=["crop", "crop_stage"],
            min_confidence=ConfidenceLevel.MEDIUM,
            safety_critical=False
        )
    
    @property
    def clarification_form(self) -> FormSchema:
        return FormSchema(
            id="irrigation_form",
            title="Irrigation Details",
            title_hi="सिंचाई विवरण",
            fields=[
                FormField(
                    name="crop",
                    type="select",
                    label="Which crop?",
                    options=[
                        FormFieldOption(value="wheat", label="Wheat"),
                        FormFieldOption(value="rice", label="Rice"),
                        FormFieldOption(value="cotton", label="Cotton"),
                        FormFieldOption(value="vegetables", label="Vegetables"),
                    ]
                ),
                FormField(
                    name="irrigation_type",
                    type="radio",
                    label="Irrigation method",
                    label_hi="सिंचाई विधि",
                    options=[
                        FormFieldOption(value="flood", label="Flood/Surface", label_hi="बाढ़/सतह"),
                        FormFieldOption(value="drip", label="Drip", label_hi="टपक"),
                        FormFieldOption(value="sprinkler", label="Sprinkler", label_hi="फव्वारा"),
                    ]
                ),
            ],
            submit_action="irrigation_schedule"
        )
    
    async def execute(self, context: FarmContext, params: Dict[str, Any]) -> ToolResult:
        crop = context.crop.lower() if context.crop else "wheat"
        stage = context.crop_stage.value if context.crop_stage else "vegetative"
        irrigation_type = params.get("irrigation_type", "flood")
        
        # Basic irrigation schedules (would be weather-adjusted in production)
        schedules = {
            "wheat": {
                "sowing": {"interval_days": 21, "critical": "Crown root initiation"},
                "vegetative": {"interval_days": 21, "critical": "Tillering stage"},
                "flowering": {"interval_days": 10, "critical": "Flowering - most critical"},
            },
            "rice": {
                "sowing": {"interval_days": 3, "critical": "Keep flooded"},
                "vegetative": {"interval_days": 5, "critical": "Maintain 5cm water"},
                "flowering": {"interval_days": 3, "critical": "Critical for grain filling"},
            },
        }
        
        schedule = schedules.get(crop, {}).get(stage, {"interval_days": 7, "critical": "Monitor soil moisture"})
        
        return ToolResult(
            success=True,
            data={
                "crop": crop,
                "stage": stage,
                "irrigation_type": irrigation_type,
                "interval_days": schedule["interval_days"],
                "critical_note": schedule["critical"],
                "tips": [
                    "Irrigate in morning or evening, not midday",
                    "Check soil moisture before irrigating",
                    "Avoid waterlogging"
                ]
            },
            confidence=ConfidenceLevel.MEDIUM
        )


class WeatherBasedAdviceTool(KrishiMCPTool):
    """Provide weather-based agricultural advice"""
    
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="weather_based_advice",
            description="Provide advice based on weather conditions",
            parameters=[
                ToolParameter(name="weather_event", type="string", description="rain/heat/cold/storm", required=False),
            ],
            requires_context=["crop"],
            min_confidence=ConfidenceLevel.MEDIUM,
            safety_critical=False
        )
    
    async def execute(self, context: FarmContext, params: Dict[str, Any]) -> ToolResult:
        weather_event = params.get("weather_event", "normal")
        crop = context.crop or "general"
        
        advice_map = {
            "rain": {
                "do": ["Ensure drainage channels are clear", "Delay fertilizer application", "Check for waterlogging"],
                "dont": ["Do not spray pesticides", "Avoid field operations", "Do not irrigate"]
            },
            "heat": {
                "do": ["Irrigate in evening", "Apply mulch to retain moisture", "Provide shade for nurseries"],
                "dont": ["Do not spray during peak heat", "Avoid transplanting", "Do not apply urea in hot conditions"]
            },
            "cold": {
                "do": ["Light irrigation before frost", "Cover nurseries", "Smoke/fire for frost protection"],
                "dont": ["Do not irrigate during frost", "Avoid pruning", "Do not apply nitrogen"]
            },
        }
        
        advice = advice_map.get(weather_event, {
            "do": ["Monitor crop regularly", "Follow normal schedule"],
            "dont": ["Do not ignore weather forecasts"]
        })
        
        return ToolResult(
            success=True,
            data={
                "weather_event": weather_event,
                "crop": crop,
                "do_this": advice["do"],
                "avoid_this": advice["dont"],
            },
            confidence=ConfidenceLevel.MEDIUM
        )


class MarketPriceLookupTool(KrishiMCPTool):
    """Look up current market prices for crops"""
    
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="market_price_lookup",
            description="Get current market prices and MSP for crops",
            parameters=[
                ToolParameter(name="commodity", type="string", description="Crop/commodity name", required=True),
            ],
            requires_context=["location"],
            min_confidence=ConfidenceLevel.MEDIUM,
            safety_critical=False
        )
    
    async def execute(self, context: FarmContext, params: Dict[str, Any]) -> ToolResult:
        commodity = params.get("commodity", "wheat").lower()
        
        # MSP 2024-25 (would be fetched from API in production)
        msp_data = {
            "wheat": {"msp": 2275, "unit": "per quintal"},
            "rice": {"msp": 2300, "unit": "per quintal"},
            "cotton": {"msp": 7121, "unit": "per quintal (medium staple)"},
            "mustard": {"msp": 5650, "unit": "per quintal"},
            "sugarcane": {"msp": 315, "unit": "per quintal (FRP)"},
            "maize": {"msp": 2225, "unit": "per quintal"},
            "soybean": {"msp": 4892, "unit": "per quintal"},
        }
        
        data = msp_data.get(commodity, {"msp": "Not available", "unit": ""})
        
        return ToolResult(
            success=True,
            data={
                "commodity": commodity,
                "msp_rs": data["msp"],
                "unit": data["unit"],
                "note": "MSP rates for 2024-25. Actual market prices may vary by location.",
                "tip": "Check local mandi prices before selling"
            },
            confidence=ConfidenceLevel.HIGH if commodity in msp_data else ConfidenceLevel.LOW
        )


class SoilHealthAnalysisTool(KrishiMCPTool):
    """Analyze soil health and provide recommendations"""
    
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="soil_health_analysis",
            description="Analyze soil health based on type and provide improvement recommendations",
            parameters=[
                ToolParameter(name="ph_level", type="number", description="Soil pH if known", required=False),
                ToolParameter(name="organic_matter", type="string", description="low/medium/high", required=False),
            ],
            requires_context=["soil_type"],
            min_confidence=ConfidenceLevel.MEDIUM,
            safety_critical=False
        )
    
    @property
    def clarification_form(self) -> FormSchema:
        return FormSchema(
            id="soil_health_form",
            title="Tell me about your soil",
            title_hi="अपनी मिट्टी के बारे में बताएं",
            fields=[
                FormField(
                    name="soil_type",
                    type="radio",
                    label="Soil type",
                    label_hi="मिट्टी का प्रकार",
                    options=[
                        FormFieldOption(value="alluvial", label="Alluvial", label_hi="जलोढ़"),
                        FormFieldOption(value="black", label="Black/Cotton", label_hi="काली"),
                        FormFieldOption(value="red", label="Red", label_hi="लाल"),
                        FormFieldOption(value="sandy", label="Sandy", label_hi="रेतीली"),
                        FormFieldOption(value="clay", label="Clay", label_hi="चिकनी"),
                        FormFieldOption(value="loamy", label="Loamy", label_hi="दोमट"),
                    ]
                ),
                FormField(
                    name="soil_test",
                    type="radio",
                    label="Have you done a soil test?",
                    label_hi="क्या मिट्टी परीक्षण कराया है?",
                    options=[
                        FormFieldOption(value="yes", label="Yes"),
                        FormFieldOption(value="no", label="No"),
                    ],
                    required=False
                ),
            ],
            submit_action="soil_health_analysis"
        )
    
    async def execute(self, context: FarmContext, params: Dict[str, Any]) -> ToolResult:
        soil_type = context.soil_type.value if context.soil_type else "unknown"
        
        # Soil-specific recommendations
        soil_recommendations = {
            "alluvial": {
                "characteristics": "Fertile, good water retention, rich in potash",
                "suitable_crops": ["wheat", "rice", "sugarcane", "vegetables"],
                "improvements": [
                    "Add organic matter to maintain fertility",
                    "Practice crop rotation",
                    "Avoid waterlogging"
                ],
                "ph_range": "6.5-7.5"
            },
            "black": {
                "characteristics": "High clay content, good moisture retention, cracks when dry",
                "suitable_crops": ["cotton", "soybean", "wheat", "jowar"],
                "improvements": [
                    "Add gypsum to improve drainage",
                    "Deep ploughing before monsoon",
                    "Add organic matter to prevent cracking"
                ],
                "ph_range": "7.0-8.5"
            },
            "red": {
                "characteristics": "Low fertility, good drainage, iron-rich",
                "suitable_crops": ["groundnut", "millets", "pulses", "tobacco"],
                "improvements": [
                    "Add lime if too acidic",
                    "Regular organic matter addition",
                    "Use phosphatic fertilizers"
                ],
                "ph_range": "5.5-6.5"
            },
            "sandy": {
                "characteristics": "Low water retention, good drainage, low fertility",
                "suitable_crops": ["groundnut", "watermelon", "carrots", "potatoes"],
                "improvements": [
                    "Add organic matter to improve retention",
                    "Frequent but light irrigation",
                    "Mulching to reduce evaporation"
                ],
                "ph_range": "6.0-7.0"
            },
            "clay": {
                "characteristics": "High water retention, poor drainage, sticky when wet",
                "suitable_crops": ["rice", "wheat", "cotton"],
                "improvements": [
                    "Add sand and organic matter",
                    "Improve drainage",
                    "Avoid working when too wet"
                ],
                "ph_range": "6.5-7.5"
            },
            "loamy": {
                "characteristics": "Ideal mix, good drainage and retention, fertile",
                "suitable_crops": ["most crops", "vegetables", "fruits"],
                "improvements": [
                    "Maintain organic matter levels",
                    "Regular soil testing",
                    "Balanced fertilization"
                ],
                "ph_range": "6.0-7.0"
            },
        }
        
        rec = soil_recommendations.get(soil_type, {
            "characteristics": "Unknown soil type",
            "suitable_crops": [],
            "improvements": ["Get soil tested at local agricultural office"],
            "ph_range": "Unknown"
        })
        
        return ToolResult(
            success=True,
            data={
                "soil_type": soil_type,
                "characteristics": rec["characteristics"],
                "suitable_crops": rec["suitable_crops"],
                "improvements": rec["improvements"],
                "ideal_ph_range": rec["ph_range"],
                "recommendation": "Get a soil test done for accurate nutrient analysis"
            },
            confidence=ConfidenceLevel.MEDIUM if soil_type != "unknown" else ConfidenceLevel.LOW
        )


# Tool registry
AVAILABLE_TOOLS: Dict[str, KrishiMCPTool] = {}


def register_tool(tool: KrishiMCPTool):
    """Register a tool in the global registry"""
    AVAILABLE_TOOLS[tool.definition.name] = tool


def get_available_tools() -> Dict[str, KrishiMCPTool]:
    """Get all registered tools"""
    return AVAILABLE_TOOLS


def get_tool(name: str) -> Optional[KrishiMCPTool]:
    """Get a specific tool by name"""
    return AVAILABLE_TOOLS.get(name)


# Register all tools - imports at end to avoid circular imports
# ruff: noqa: E402
from .tools import DiagnoseCropIssueTool, RecommendFertilizerTool  # noqa: E402

register_tool(DiagnoseCropIssueTool())
register_tool(RecommendFertilizerTool())
register_tool(PesticideSafetyCheckTool())
register_tool(IrrigationScheduleTool())
register_tool(WeatherBasedAdviceTool())
register_tool(MarketPriceLookupTool())
register_tool(SoilHealthAnalysisTool())
