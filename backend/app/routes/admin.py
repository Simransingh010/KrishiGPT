"""
Admin API Routes
CRUD operations for crops, prices, and insights management.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
import logging

from ..db.supabase import get_supabase

router = APIRouter(prefix="/api/admin", tags=["admin"])
logger = logging.getLogger(__name__)


# === Request/Response Models ===

class CropCategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = None
    display_order: int = 0


class CropCategoryResponse(BaseModel):
    id: str
    name: str
    icon: Optional[str]
    display_order: int
    created_at: datetime


class CropCreate(BaseModel):
    category_id: Optional[str] = None
    name: str
    name_hindi: Optional[str] = None
    icon: str = "🌾"
    unit: str = "per quintal"
    msp_price: Optional[float] = None
    msp_year: Optional[str] = None
    is_active: bool = True


class CropUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = None
    name_hindi: Optional[str] = None
    icon: Optional[str] = None
    unit: Optional[str] = None
    msp_price: Optional[float] = None
    msp_year: Optional[str] = None
    is_active: Optional[bool] = None


class CropResponse(BaseModel):
    id: str
    category_id: Optional[str]
    name: str
    name_hindi: Optional[str]
    icon: str
    unit: str
    msp_price: Optional[float]
    msp_year: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    category: Optional[dict] = None


class PriceCreate(BaseModel):
    crop_id: str
    price: float
    price_type: str = "market"
    market_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    recorded_at: Optional[date] = None
    source: str = "manual"


class PriceResponse(BaseModel):
    id: str
    crop_id: str
    price: float
    price_type: str
    market_name: Optional[str]
    state: Optional[str]
    district: Optional[str]
    recorded_at: date
    source: str
    created_at: datetime
    crop: Optional[dict] = None


class InsightTypeResponse(BaseModel):
    id: str
    name: str
    icon: Optional[str]
    color: Optional[str]
    display_order: int


class InsightCreate(BaseModel):
    type_id: Optional[str] = None
    title: str
    message: str
    is_actionable: bool = False
    action_url: Optional[str] = None
    priority: int = 0
    target_states: Optional[List[str]] = None
    target_crops: Optional[List[str]] = None
    publish_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_published: bool = False
    is_pinned: bool = False


class InsightUpdate(BaseModel):
    type_id: Optional[str] = None
    title: Optional[str] = None
    message: Optional[str] = None
    is_actionable: Optional[bool] = None
    action_url: Optional[str] = None
    priority: Optional[int] = None
    target_states: Optional[List[str]] = None
    target_crops: Optional[List[str]] = None
    publish_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_published: Optional[bool] = None
    is_pinned: Optional[bool] = None


class InsightResponse(BaseModel):
    id: str
    type_id: Optional[str]
    title: str
    message: str
    is_actionable: bool
    action_url: Optional[str]
    priority: int
    target_states: Optional[List[str]]
    target_crops: Optional[List[str]]
    publish_at: Optional[datetime]
    expires_at: Optional[datetime]
    is_published: bool
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    insight_type: Optional[dict] = None


# === Crop Categories ===

@router.get("/categories", response_model=List[CropCategoryResponse])
async def list_categories():
    """List all crop categories"""
    db = get_supabase()
    result = db.table("crop_categories").select("*").order("display_order").execute()
    return result.data


@router.post("/categories", response_model=CropCategoryResponse)
async def create_category(data: CropCategoryCreate):
    """Create a new crop category"""
    db = get_supabase()
    result = db.table("crop_categories").insert(data.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create category")
    return result.data[0]


# === Crops ===

@router.get("/crops", response_model=List[CropResponse])
async def list_crops(
    active_only: bool = Query(False, description="Only return active crops"),
    category_id: Optional[str] = Query(None, description="Filter by category")
):
    """List all crops with optional filters"""
    db = get_supabase()
    query = db.table("crops").select("*, crop_categories(name, icon)")
    
    if active_only:
        query = query.eq("is_active", True)
    if category_id:
        query = query.eq("category_id", category_id)
    
    result = query.order("name").execute()
    
    # Transform the response to include category info
    crops = []
    for crop in result.data:
        category = crop.pop("crop_categories", None)
        crop["category"] = category
        crops.append(crop)
    
    return crops


@router.get("/crops/{crop_id}", response_model=CropResponse)
async def get_crop(crop_id: str):
    """Get a single crop by ID"""
    db = get_supabase()
    result = db.table("crops").select("*, crop_categories(name, icon)").eq("id", crop_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    crop = result.data[0]
    category = crop.pop("crop_categories", None)
    crop["category"] = category
    return crop


@router.post("/crops", response_model=CropResponse)
async def create_crop(data: CropCreate):
    """Create a new crop"""
    db = get_supabase()
    result = db.table("crops").insert(data.model_dump(exclude_none=True)).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create crop")
    
    return result.data[0]


@router.patch("/crops/{crop_id}", response_model=CropResponse)
async def update_crop(crop_id: str, data: CropUpdate):
    """Update a crop"""
    db = get_supabase()
    
    update_data = data.model_dump(exclude_none=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    result = db.table("crops").update(update_data).eq("id", crop_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    return result.data[0]


@router.delete("/crops/{crop_id}")
async def delete_crop(crop_id: str):
    """Delete a crop (soft delete by setting is_active=False)"""
    db = get_supabase()
    result = db.table("crops").update({"is_active": False, "updated_at": datetime.utcnow().isoformat()}).eq("id", crop_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    return {"message": "Crop deactivated successfully"}


# === Prices ===

@router.get("/prices", response_model=List[PriceResponse])
async def list_prices(
    crop_id: Optional[str] = Query(None),
    days: int = Query(30, description="Number of days of history"),
    limit: int = Query(100, description="Max records to return")
):
    """List price history"""
    db = get_supabase()
    query = db.table("crop_prices").select("*, crops(name, icon)")
    
    if crop_id:
        query = query.eq("crop_id", crop_id)
    
    result = query.order("recorded_at", desc=True).limit(limit).execute()
    
    prices = []
    for price in result.data:
        crop = price.pop("crops", None)
        price["crop"] = crop
        prices.append(price)
    
    return prices


@router.post("/prices", response_model=PriceResponse)
async def create_price(data: PriceCreate):
    """Add a new price entry"""
    db = get_supabase()
    
    price_data = data.model_dump(exclude_none=True)
    if not price_data.get("recorded_at"):
        price_data["recorded_at"] = date.today().isoformat()
    else:
        price_data["recorded_at"] = price_data["recorded_at"].isoformat()
    
    result = db.table("crop_prices").insert(price_data).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create price entry")
    
    return result.data[0]


@router.post("/prices/bulk")
async def bulk_create_prices(prices: List[PriceCreate]):
    """Bulk insert price entries"""
    db = get_supabase()
    
    price_data = []
    for p in prices:
        d = p.model_dump(exclude_none=True)
        if not d.get("recorded_at"):
            d["recorded_at"] = date.today().isoformat()
        else:
            d["recorded_at"] = d["recorded_at"].isoformat()
        price_data.append(d)
    
    result = db.table("crop_prices").insert(price_data).execute()
    
    return {"inserted": len(result.data)}


@router.delete("/prices/{price_id}")
async def delete_price(price_id: str):
    """Delete a price entry"""
    db = get_supabase()
    result = db.table("crop_prices").delete().eq("id", price_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Price entry not found")
    
    return {"message": "Price entry deleted"}


# === Insight Types ===

@router.get("/insight-types", response_model=List[InsightTypeResponse])
async def list_insight_types():
    """List all insight types"""
    db = get_supabase()
    result = db.table("insight_types").select("*").order("display_order").execute()
    return result.data


# === Insights ===

@router.get("/insights", response_model=List[InsightResponse])
async def list_insights(
    published_only: bool = Query(False),
    type_id: Optional[str] = Query(None),
    limit: int = Query(50)
):
    """List all insights"""
    db = get_supabase()
    query = db.table("insights").select("*, insight_types(name, icon, color)")
    
    if published_only:
        query = query.eq("is_published", True)
    if type_id:
        query = query.eq("type_id", type_id)
    
    result = query.order("created_at", desc=True).limit(limit).execute()
    
    insights = []
    for insight in result.data:
        insight_type = insight.pop("insight_types", None)
        insight["insight_type"] = insight_type
        insights.append(insight)
    
    return insights


@router.get("/insights/{insight_id}", response_model=InsightResponse)
async def get_insight(insight_id: str):
    """Get a single insight"""
    db = get_supabase()
    result = db.table("insights").select("*, insight_types(name, icon, color)").eq("id", insight_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    insight = result.data[0]
    insight_type = insight.pop("insight_types", None)
    insight["insight_type"] = insight_type
    return insight


@router.post("/insights", response_model=InsightResponse)
async def create_insight(data: InsightCreate):
    """Create a new insight"""
    db = get_supabase()
    
    insight_data = data.model_dump(exclude_none=True)
    if insight_data.get("publish_at"):
        insight_data["publish_at"] = insight_data["publish_at"].isoformat()
    if insight_data.get("expires_at"):
        insight_data["expires_at"] = insight_data["expires_at"].isoformat()
    
    result = db.table("insights").insert(insight_data).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create insight")
    
    return result.data[0]


@router.patch("/insights/{insight_id}", response_model=InsightResponse)
async def update_insight(insight_id: str, data: InsightUpdate):
    """Update an insight"""
    db = get_supabase()
    
    update_data = data.model_dump(exclude_none=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    if update_data.get("publish_at"):
        update_data["publish_at"] = update_data["publish_at"].isoformat()
    if update_data.get("expires_at"):
        update_data["expires_at"] = update_data["expires_at"].isoformat()
    
    result = db.table("insights").update(update_data).eq("id", insight_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    return result.data[0]


@router.delete("/insights/{insight_id}")
async def delete_insight(insight_id: str):
    """Delete an insight"""
    db = get_supabase()
    result = db.table("insights").delete().eq("id", insight_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    return {"message": "Insight deleted"}


@router.post("/insights/{insight_id}/publish")
async def publish_insight(insight_id: str):
    """Publish an insight"""
    db = get_supabase()
    result = db.table("insights").update({
        "is_published": True,
        "publish_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", insight_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    return {"message": "Insight published"}


@router.post("/insights/{insight_id}/unpublish")
async def unpublish_insight(insight_id: str):
    """Unpublish an insight"""
    db = get_supabase()
    result = db.table("insights").update({
        "is_published": False,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", insight_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    return {"message": "Insight unpublished"}


# === Dashboard Stats ===

@router.get("/stats")
async def get_admin_stats():
    """Get admin dashboard statistics"""
    db = get_supabase()
    
    crops = db.table("crops").select("id", count="exact").eq("is_active", True).execute()
    prices = db.table("crop_prices").select("id", count="exact").execute()
    insights = db.table("insights").select("id", count="exact").execute()
    published = db.table("insights").select("id", count="exact").eq("is_published", True).execute()
    
    return {
        "total_crops": crops.count,
        "total_prices": prices.count,
        "total_insights": insights.count,
        "published_insights": published.count
    }
