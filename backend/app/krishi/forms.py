"""
KrishiGPT Form Definitions
Pre-defined forms for common farmer interactions.
"""

from typing import Dict
from .types_continued import FormSchema, FormField, FormFieldOption


# Pre-defined forms for common scenarios
KRISHI_FORMS: Dict[str, FormSchema] = {}


def get_crop_info_form() -> FormSchema:
    """Basic crop information form"""
    return FormSchema(
        id="crop_info",
        title="Tell me about your crop",
        title_hi="अपनी फसल के बारे में बताएं",
        description="This helps me give you better advice",
        fields=[
            FormField(
                name="crop",
                type="select",
                label="Which crop are you growing?",
                label_hi="आप कौन सी फसल उगा रहे हैं?",
                options=[
                    FormFieldOption(value="wheat", label="Wheat (गेहूं)"),
                    FormFieldOption(value="rice", label="Rice (चावल)"),
                    FormFieldOption(value="cotton", label="Cotton (कपास)"),
                    FormFieldOption(value="mustard", label="Mustard (सरसों)"),
                    FormFieldOption(value="sugarcane", label="Sugarcane (गन्ना)"),
                    FormFieldOption(value="maize", label="Maize (मक्का)"),
                    FormFieldOption(value="soybean", label="Soybean (सोयाबीन)"),
                    FormFieldOption(value="groundnut", label="Groundnut (मूंगफली)"),
                    FormFieldOption(value="potato", label="Potato (आलू)"),
                    FormFieldOption(value="onion", label="Onion (प्याज)"),
                    FormFieldOption(value="tomato", label="Tomato (टमाटर)"),
                    FormFieldOption(value="other", label="Other (अन्य)"),
                ]
            ),
            FormField(
                name="crop_stage",
                type="radio",
                label="What stage is your crop in?",
                label_hi="आपकी फसल किस अवस्था में है?",
                options=[
                    FormFieldOption(value="sowing", label="Just sowed / Sowing (बुवाई)"),
                    FormFieldOption(value="germination", label="Germination (अंकुरण)"),
                    FormFieldOption(value="vegetative", label="Growing / Vegetative (वानस्पतिक)"),
                    FormFieldOption(value="flowering", label="Flowering (फूल आना)"),
                    FormFieldOption(value="fruiting", label="Fruiting (फल लगना)"),
                    FormFieldOption(value="harvest", label="Ready for harvest (कटाई)"),
                ]
            ),
            FormField(
                name="land_size",
                type="slider",
                label="Farm size (acres)",
                label_hi="खेत का आकार (एकड़)",
                min_value=0.25,
                max_value=100,
                step=0.25,
                required=False
            ),
        ],
        submit_action="update_context",
        submit_label="Save",
        submit_label_hi="सहेजें"
    )


def get_problem_report_form() -> FormSchema:
    """Form for reporting crop problems"""
    return FormSchema(
        id="problem_report",
        title="What problem are you facing?",
        title_hi="आपको क्या समस्या है?",
        fields=[
            FormField(
                name="problem_type",
                type="radio",
                label="Type of problem",
                label_hi="समस्या का प्रकार",
                options=[
                    FormFieldOption(value="pest", label="Insects/Pests (कीड़े)"),
                    FormFieldOption(value="disease", label="Disease (रोग)"),
                    FormFieldOption(value="nutrient", label="Nutrient deficiency (पोषक तत्व की कमी)"),
                    FormFieldOption(value="water", label="Water problem (पानी की समस्या)"),
                    FormFieldOption(value="weed", label="Weeds (खरपतवार)"),
                    FormFieldOption(value="other", label="Other (अन्य)"),
                ]
            ),
            FormField(
                name="symptoms",
                type="checkbox",
                label="What do you see? (Select all that apply)",
                label_hi="आप क्या देख रहे हैं? (सभी चुनें)",
                options=[
                    FormFieldOption(value="yellow_leaves", label="Yellow leaves (पीले पत्ते)"),
                    FormFieldOption(value="brown_spots", label="Brown/black spots (भूरे/काले धब्बे)"),
                    FormFieldOption(value="wilting", label="Wilting/drooping (मुरझाना)"),
                    FormFieldOption(value="holes", label="Holes in leaves (पत्तों में छेद)"),
                    FormFieldOption(value="insects_visible", label="Insects visible (कीड़े दिखाई दे रहे)"),
                    FormFieldOption(value="white_powder", label="White powder/fungus (सफेद पाउडर/फफूंद)"),
                    FormFieldOption(value="stunted", label="Stunted growth (विकास रुका)"),
                    FormFieldOption(value="root_damage", label="Root damage (जड़ों में नुकसान)"),
                ]
            ),
            FormField(
                name="affected_area",
                type="radio",
                label="How much of your crop is affected?",
                label_hi="आपकी कितनी फसल प्रभावित है?",
                options=[
                    FormFieldOption(value="few_plants", label="Few plants (कुछ पौधे)"),
                    FormFieldOption(value="one_area", label="One area/patch (एक क्षेत्र)"),
                    FormFieldOption(value="half", label="About half (लगभग आधा)"),
                    FormFieldOption(value="most", label="Most of the field (अधिकांश खेत)"),
                ]
            ),
        ],
        submit_action="diagnose_crop_issue",
        submit_label="Get Help",
        submit_label_hi="मदद लें"
    )


def get_location_form() -> FormSchema:
    """Form for collecting location information"""
    return FormSchema(
        id="location_info",
        title="Where is your farm?",
        title_hi="आपका खेत कहाँ है?",
        fields=[
            FormField(
                name="state",
                type="select",
                label="State",
                label_hi="राज्य",
                options=[
                    FormFieldOption(value="punjab", label="Punjab (पंजाब)"),
                    FormFieldOption(value="haryana", label="Haryana (हरियाणा)"),
                    FormFieldOption(value="uttar_pradesh", label="Uttar Pradesh (उत्तर प्रदेश)"),
                    FormFieldOption(value="madhya_pradesh", label="Madhya Pradesh (मध्य प्रदेश)"),
                    FormFieldOption(value="rajasthan", label="Rajasthan (राजस्थान)"),
                    FormFieldOption(value="gujarat", label="Gujarat (गुजरात)"),
                    FormFieldOption(value="maharashtra", label="Maharashtra (महाराष्ट्र)"),
                    FormFieldOption(value="karnataka", label="Karnataka (कर्नाटक)"),
                    FormFieldOption(value="andhra_pradesh", label="Andhra Pradesh (आंध्र प्रदेश)"),
                    FormFieldOption(value="telangana", label="Telangana (तेलंगाना)"),
                    FormFieldOption(value="tamil_nadu", label="Tamil Nadu (तमिल नाडु)"),
                    FormFieldOption(value="kerala", label="Kerala (केरल)"),
                    FormFieldOption(value="west_bengal", label="West Bengal (पश्चिम बंगाल)"),
                    FormFieldOption(value="bihar", label="Bihar (बिहार)"),
                    FormFieldOption(value="odisha", label="Odisha (ओडिशा)"),
                    FormFieldOption(value="other", label="Other (अन्य)"),
                ]
            ),
            FormField(
                name="district",
                type="text",
                label="District (optional)",
                label_hi="जिला (वैकल्पिक)",
                required=False,
                placeholder="Enter district name"
            ),
        ],
        submit_action="update_context",
        submit_label="Save Location",
        submit_label_hi="स्थान सहेजें"
    )


def get_soil_info_form() -> FormSchema:
    """Form for soil information"""
    return FormSchema(
        id="soil_info",
        title="Tell me about your soil",
        title_hi="अपनी मिट्टी के बारे में बताएं",
        fields=[
            FormField(
                name="soil_type",
                type="radio",
                label="What type of soil do you have?",
                label_hi="आपके पास किस प्रकार की मिट्टी है?",
                options=[
                    FormFieldOption(value="alluvial", label="Alluvial (जलोढ़)"),
                    FormFieldOption(value="black", label="Black/Cotton soil (काली मिट्टी)"),
                    FormFieldOption(value="red", label="Red soil (लाल मिट्टी)"),
                    FormFieldOption(value="sandy", label="Sandy (रेतीली)"),
                    FormFieldOption(value="clay", label="Clay (चिकनी मिट्टी)"),
                    FormFieldOption(value="loamy", label="Loamy (दोमट)"),
                    FormFieldOption(value="dont_know", label="Don't know (पता नहीं)"),
                ]
            ),
            FormField(
                name="soil_test_done",
                type="radio",
                label="Have you done a soil test recently?",
                label_hi="क्या आपने हाल ही में मिट्टी परीक्षण कराया है?",
                options=[
                    FormFieldOption(value="yes_recent", label="Yes, in last 6 months"),
                    FormFieldOption(value="yes_old", label="Yes, more than 6 months ago"),
                    FormFieldOption(value="no", label="No"),
                ],
                required=False
            ),
        ],
        submit_action="update_context",
        submit_label="Save",
        submit_label_hi="सहेजें"
    )


# Register all forms
KRISHI_FORMS["crop_info"] = get_crop_info_form()
KRISHI_FORMS["problem_report"] = get_problem_report_form()
KRISHI_FORMS["location_info"] = get_location_form()
KRISHI_FORMS["soil_info"] = get_soil_info_form()


def get_form(form_id: str) -> FormSchema:
    """Get a form by ID"""
    return KRISHI_FORMS.get(form_id)


def get_all_forms() -> Dict[str, FormSchema]:
    """Get all available forms"""
    return KRISHI_FORMS
