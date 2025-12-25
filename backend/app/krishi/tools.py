"""
KrishiGPT MCP Tools (FarmActions)
Agricultural tools with safety validation.
"""

from typing import Dict, Any, Optional, List, Callable
from abc import ABC, abstractmethod
from .types import FarmContext, ConfidenceLevel
from .types_continued import ToolResult, ToolDefinition, ToolParameter, FormSchema, FormField, FormFieldOption
from .safety import SafetyValidator


class KrishiMCPTool(ABC):
    """
    Base class for all KrishiGPT tools (FarmActions).
    Each tool must implement execute() and define its schema.
    """
    
    @property
    @abstractmethod
    def definition(self) -> ToolDefinition:
        """Return tool definition with parameters and requirements"""
        pass
    
    @property
    def clarification_form(self) -> Optional[FormSchema]:
        """Return form to show if context is insufficient"""
        return None
    
    @abstractmethod
    async def execute(
        self,
        context: FarmContext,
        params: Dict[str, Any]
    ) -> ToolResult:
        """Execute the tool with given context and parameters"""
        pass
    
    def validate_context(self, context: FarmContext) -> tuple[bool, List[str]]:
        """Check if context has required fields"""
        return SafetyValidator.validate_context_for_tool(
            context,
            self.definition.name,
            self.definition.requires_context
        )


class DiagnoseCropIssueTool(KrishiMCPTool):
    """Diagnose crop issues based on symptoms"""
    
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="diagnose_crop_issue",
            description="Diagnose crop problems based on visible symptoms",
            parameters=[
                ToolParameter(name="symptoms", type="list", description="List of observed symptoms", required=True),
                ToolParameter(name="affected_area", type="string", description="Which part of plant is affected", required=False),
            ],
            requires_context=["crop", "crop_stage"],
            min_confidence=ConfidenceLevel.MEDIUM,
            safety_critical=False
        )
    
    @property
    def clarification_form(self) -> FormSchema:
        return FormSchema(
            id="diagnose_crop_form",
            title="Tell me about your crop problem",
            title_hi="अपनी फसल की समस्या बताएं",
            fields=[
                FormField(
                    name="crop",
                    type="select",
                    label="Which crop?",
                    label_hi="कौन सी फसल?",
                    options=[
                        FormFieldOption(value="wheat", label="Wheat", label_hi="गेहूं"),
                        FormFieldOption(value="rice", label="Rice", label_hi="चावल"),
                        FormFieldOption(value="cotton", label="Cotton", label_hi="कपास"),
                        FormFieldOption(value="mustard", label="Mustard", label_hi="सरसों"),
                        FormFieldOption(value="sugarcane", label="Sugarcane", label_hi="गन्ना"),
                        FormFieldOption(value="maize", label="Maize", label_hi="मक्का"),
                        FormFieldOption(value="soybean", label="Soybean", label_hi="सोयाबीन"),
                        FormFieldOption(value="groundnut", label="Groundnut", label_hi="मूंगफली"),
                        FormFieldOption(value="other", label="Other", label_hi="अन्य"),
                    ]
                ),
                FormField(
                    name="crop_stage",
                    type="radio",
                    label="Crop stage",
                    label_hi="फसल की अवस्था",
                    options=[
                        FormFieldOption(value="sowing", label="Sowing", label_hi="बुवाई"),
                        FormFieldOption(value="vegetative", label="Vegetative", label_hi="वानस्पतिक"),
                        FormFieldOption(value="flowering", label="Flowering", label_hi="फूल आना"),
                        FormFieldOption(value="harvest", label="Ready for harvest", label_hi="कटाई के लिए तैयार"),
                    ]
                ),
                FormField(
                    name="symptoms",
                    type="checkbox",
                    label="What do you see?",
                    label_hi="आप क्या देख रहे हैं?",
                    options=[
                        FormFieldOption(value="yellow_leaves", label="Yellow leaves", label_hi="पीले पत्ते"),
                        FormFieldOption(value="brown_spots", label="Brown spots", label_hi="भूरे धब्बे"),
                        FormFieldOption(value="wilting", label="Wilting", label_hi="मुरझाना"),
                        FormFieldOption(value="insects", label="Insects visible", label_hi="कीड़े दिखाई दे रहे"),
                        FormFieldOption(value="holes", label="Holes in leaves", label_hi="पत्तों में छेद"),
                        FormFieldOption(value="white_powder", label="White powder", label_hi="सफेद पाउडर"),
                        FormFieldOption(value="stunted", label="Stunted growth", label_hi="विकास रुका हुआ"),
                    ]
                ),
            ],
            submit_action="diagnose_crop_issue",
            submit_label="Get Diagnosis",
            submit_label_hi="निदान प्राप्त करें"
        )
    
    async def execute(self, context: FarmContext, params: Dict[str, Any]) -> ToolResult:
        """Execute crop diagnosis"""
        symptoms = params.get("symptoms", [])
        
        # This would integrate with actual diagnosis logic/ML model
        # For now, return structured guidance
        diagnosis_map = {
            "yellow_leaves": {
                "likely_cause": "Nitrogen deficiency or overwatering",
                "action": "Check soil drainage, consider urea application after soil test"
            },
            "brown_spots": {
                "likely_cause": "Fungal infection (possibly leaf blight)",
                "action": "Apply copper-based fungicide, improve air circulation"
            },
            "wilting": {
                "likely_cause": "Water stress or root rot",
                "action": "Check irrigation, inspect roots for damage"
            },
            "insects": {
                "likely_cause": "Pest infestation",
                "action": "Identify pest type, consider neem-based treatment first"
            },
        }
        
        findings = []
        for symptom in symptoms:
            if symptom in diagnosis_map:
                findings.append(diagnosis_map[symptom])
        
        result = ToolResult(
            success=True,
            data={
                "crop": context.crop,
                "stage": context.crop_stage.value if context.crop_stage else "unknown",
                "symptoms": symptoms,
                "findings": findings,
            },
            confidence=ConfidenceLevel.MEDIUM if findings else ConfidenceLevel.LOW
        )
        
        return SafetyValidator.add_mandatory_disclaimer("diagnose_crop_issue", result)


class RecommendFertilizerTool(KrishiMCPTool):
    """Recommend fertilizer based on crop and stage"""
    
    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="recommend_fertilizer",
            description="Recommend fertilizer type and dosage for crop",
            parameters=[
                ToolParameter(name="target_nutrient", type="string", description="N/P/K or specific nutrient", required=False),
            ],
            requires_context=["crop", "crop_stage", "land_size_acres"],
            min_confidence=ConfidenceLevel.MEDIUM,
            safety_critical=True  # Dosage is safety-critical
        )
    
    @property
    def clarification_form(self) -> FormSchema:
        return FormSchema(
            id="fertilizer_form",
            title="Tell me about your farm",
            title_hi="अपने खेत के बारे में बताएं",
            fields=[
                FormField(
                    name="crop",
                    type="select",
                    label="Which crop?",
                    label_hi="कौन सी फसल?",
                    options=[
                        FormFieldOption(value="wheat", label="Wheat", label_hi="गेहूं"),
                        FormFieldOption(value="rice", label="Rice", label_hi="चावल"),
                        FormFieldOption(value="cotton", label="Cotton", label_hi="कपास"),
                        FormFieldOption(value="sugarcane", label="Sugarcane", label_hi="गन्ना"),
                    ]
                ),
                FormField(
                    name="crop_stage",
                    type="radio",
                    label="Crop stage",
                    label_hi="फसल की अवस्था",
                    options=[
                        FormFieldOption(value="sowing", label="Sowing", label_hi="बुवाई"),
                        FormFieldOption(value="vegetative", label="Vegetative", label_hi="वानस्पतिक"),
                        FormFieldOption(value="flowering", label="Flowering", label_hi="फूल आना"),
                    ]
                ),
                FormField(
                    name="land_size",
                    type="slider",
                    label="Farm size (acres)",
                    label_hi="खेत का आकार (एकड़)",
                    min_value=0.5,
                    max_value=50,
                    step=0.5
                ),
            ],
            submit_action="recommend_fertilizer",
            submit_label="Get Recommendation",
            submit_label_hi="सिफारिश प्राप्त करें"
        )
    
    async def execute(self, context: FarmContext, params: Dict[str, Any]) -> ToolResult:
        """Execute fertilizer recommendation"""
        if not context.land_size_acres:
            return ToolResult(
                success=False,
                error="Land size required for dosage calculation",
                confidence=ConfidenceLevel.LOW
            )
        
        # Basic recommendation logic (would be more sophisticated in production)
        recommendations = {
            "wheat": {
                "sowing": {"urea": 25, "dap": 50},
                "vegetative": {"urea": 50},
                "flowering": {"mop": 25},
            },
            "rice": {
                "sowing": {"dap": 40},
                "vegetative": {"urea": 40},
                "flowering": {"mop": 20},
            },
        }
        
        crop = context.crop.lower() if context.crop else "wheat"
        stage = context.crop_stage.value if context.crop_stage else "vegetative"
        
        base_rec = recommendations.get(crop, {}).get(stage, {"urea": 30})
        
        # Scale by land size and validate
        scaled_rec = {}
        warnings = []
        
        for fertilizer, kg_per_acre in base_rec.items():
            total_kg = kg_per_acre * context.land_size_acres
            
            # Validate against safety limits
            is_safe, warning, capped = SafetyValidator.validate_dosage(
                fertilizer, kg_per_acre, context.land_size_acres
            )
            
            if not is_safe and capped:
                total_kg = capped * context.land_size_acres
                warnings.append(warning)
            
            scaled_rec[fertilizer] = {
                "per_acre_kg": kg_per_acre,
                "total_kg": total_kg,
                "for_acres": context.land_size_acres
            }
        
        result = ToolResult(
            success=True,
            data={
                "crop": crop,
                "stage": stage,
                "recommendations": scaled_rec,
                "warnings": warnings,
            },
            confidence=ConfidenceLevel.MEDIUM
        )
        
        return SafetyValidator.add_mandatory_disclaimer("recommend_fertilizer", result)
