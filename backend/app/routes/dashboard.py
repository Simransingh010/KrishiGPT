"""
Dashboard API Routes
Provides weather, prices, and farm insights for the dashboard.
Now pulls real data from Supabase database.
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, date
import httpx
import os
import logging

from ..db.supabase import get_supabase

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
logger = logging.getLogger(__name__)

# API Keys from environment
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")


# === Response Models ===

class ForecastDay(BaseModel):
    day: str
    temp: int
    icon: str


class WeatherResponse(BaseModel):
    location: str
    temperature: int
    condition: str
    humidity: int
    windSpeed: int
    uvIndex: int
    rainProbability: int
    forecast: List[ForecastDay]


class PriceItem(BaseModel):
    id: str
    name: str
    icon: str
    price: int
    change: int
    changePercent: float
    trend: List[int]


class StatusChip(BaseModel):
    id: str
    label: str
    value: str
    status: str  # good, warning, danger
    icon: str


class TimelineItem(BaseModel):
    id: str
    type: str  # opportunity, weather, insight, warning, harvest
    title: str
    message: str
    time: str
    actionable: bool = False


class InsightData(BaseModel):
    title: str
    subtitle: str
    value: str
    unit: str
    trend: Optional[Dict[str, Any]] = None
    gradient: str


class DashboardResponse(BaseModel):
    weather: WeatherResponse
    prices: List[PriceItem]
    statusChips: List[StatusChip]
    timeline: List[TimelineItem]
    insights: List[InsightData]
    quickStats: Dict[str, Any]


# === Weather Condition Mapping ===
WEATHER_ICONS = {
    "clear": "☀️",
    "clouds": "☁️",
    "few clouds": "⛅",
    "scattered clouds": "⛅",
    "broken clouds": "☁️",
    "shower rain": "🌧️",
    "rain": "🌧️",
    "thunderstorm": "⛈️",
    "snow": "❄️",
    "mist": "🌫️",
    "haze": "🌫️",
    "fog": "🌫️",
}

WEATHER_CONDITIONS = {
    "clear sky": "Sunny",
    "few clouds": "Partly Cloudy",
    "scattered clouds": "Partly Cloudy",
    "broken clouds": "Cloudy",
    "overcast clouds": "Cloudy",
    "light rain": "Rainy",
    "moderate rain": "Rainy",
    "heavy rain": "Rainy",
    "thunderstorm": "Stormy",
    "snow": "Snowy",
    "mist": "Misty",
    "haze": "Hazy",
    "fog": "Foggy",
}

DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


# === MSP Data - Now pulled from database ===

async def get_db_prices(crop_ids: List[str] = None) -> List[PriceItem]:
    """Get prices from database with trend data"""
    db = get_supabase()
    
    # Get active crops
    crops_query = db.table("crops").select("*").eq("is_active", True)
    crops_result = crops_query.execute()
    crops = {c["id"]: c for c in crops_result.data}
    
    if not crops:
        return []
    
    # Filter by crop_ids if provided
    if crop_ids:
        crops = {k: v for k, v in crops.items() if k in crop_ids}
    
    prices = []
    today = date.today()
    week_ago = today - timedelta(days=7)
    
    for crop_id, crop in crops.items():
        # Get price history for last 7 days
        price_query = db.table("crop_prices").select("price, recorded_at").eq("crop_id", crop_id).gte("recorded_at", week_ago.isoformat()).order("recorded_at").execute()
        
        price_history = price_query.data
        
        if price_history:
            # Build trend from actual data
            trend = [int(p["price"]) for p in price_history]
            current_price = trend[-1] if trend else int(crop.get("msp_price") or 0)
            
            # Calculate change from first to last
            if len(trend) >= 2:
                prev_price = trend[0]
                change = current_price - prev_price
                change_percent = round((change / prev_price) * 100, 1) if prev_price else 0
            else:
                change = 0
                change_percent = 0
            
            # Pad trend to 7 points if needed
            while len(trend) < 7:
                trend.insert(0, trend[0] if trend else current_price)
        else:
            # No price history - use MSP as baseline
            msp = int(crop.get("msp_price") or 0)
            current_price = msp
            change = 0
            change_percent = 0
            trend = [msp] * 7
        
        prices.append(PriceItem(
            id=crop_id,
            name=crop["name"],
            icon=crop.get("icon", "🌾"),
            price=current_price,
            change=change,
            changePercent=change_percent,
            trend=trend
        ))
    
    return prices


async def get_db_insights() -> List[TimelineItem]:
    """Get published insights from database"""
    db = get_supabase()
    
    now = datetime.utcnow().isoformat()
    
    # Get published, non-expired insights
    result = db.table("insights").select("*, insight_types(name, icon, color)").eq("is_published", True).lte("publish_at", now).order("priority", desc=True).order("created_at", desc=True).limit(10).execute()
    
    items = []
    for insight in result.data:
        # Check expiry
        if insight.get("expires_at") and insight["expires_at"] < now:
            continue
        
        insight_type = insight.get("insight_types", {})
        type_name = insight_type.get("name", "insight") if insight_type else "insight"
        
        # Calculate relative time
        created = datetime.fromisoformat(insight["created_at"].replace("Z", "+00:00"))
        delta = datetime.utcnow().replace(tzinfo=created.tzinfo) - created
        
        if delta.days > 1:
            time_str = f"{delta.days} days ago"
        elif delta.days == 1:
            time_str = "Yesterday"
        elif delta.seconds > 3600:
            time_str = f"{delta.seconds // 3600}h ago"
        elif delta.seconds > 60:
            time_str = f"{delta.seconds // 60}m ago"
        else:
            time_str = "Just now"
        
        items.append(TimelineItem(
            id=insight["id"],
            type=type_name,
            title=insight["title"],
            message=insight["message"],
            time=time_str,
            actionable=insight.get("is_actionable", False)
        ))
    
    return items[:6]


async def fetch_weather_data(lat: float, lon: float, location_name: str) -> WeatherResponse:
    """Fetch weather data from OpenWeatherMap API"""
    
    if not OPENWEATHER_API_KEY:
        # Return mock data if no API key
        return get_mock_weather(location_name)
    
    try:
        async with httpx.AsyncClient() as client:
            # Current weather
            current_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
            current_resp = await client.get(current_url, timeout=10.0)
            current_data = current_resp.json()
            
            # 5-day forecast
            forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
            forecast_resp = await client.get(forecast_url, timeout=10.0)
            forecast_data = forecast_resp.json()
            
            # Parse current weather
            weather_desc = current_data.get("weather", [{}])[0].get("description", "clear sky")
            condition = WEATHER_CONDITIONS.get(weather_desc, "Partly Cloudy")
            
            # Get icon for condition (weather_desc already captured condition)
            
            # Parse forecast - get one entry per day
            forecast_list = []
            seen_days = set()
            
            for item in forecast_data.get("list", [])[:40]:
                dt = datetime.fromtimestamp(item["dt"])
                day_name = DAY_NAMES[dt.weekday()]
                
                if day_name not in seen_days and len(forecast_list) < 7:
                    seen_days.add(day_name)
                    temp = round(item["main"]["temp"])
                    weather_main = item["weather"][0]["main"].lower()
                    icon = WEATHER_ICONS.get(weather_main, "⛅")
                    forecast_list.append(ForecastDay(day=day_name, temp=temp, icon=icon))
            
            # Calculate rain probability from forecast
            rain_prob = 0
            for item in forecast_data.get("list", [])[:8]:  # Next 24 hours
                pop = item.get("pop", 0) * 100
                rain_prob = max(rain_prob, pop)
            
            return WeatherResponse(
                location=location_name,
                temperature=round(current_data["main"]["temp"]),
                condition=condition,
                humidity=current_data["main"]["humidity"],
                windSpeed=round(current_data["wind"]["speed"] * 3.6),  # m/s to km/h
                uvIndex=5,  # Would need UV API
                rainProbability=round(rain_prob),
                forecast=forecast_list
            )
            
    except Exception as e:
        logger.error(f"Weather API error: {e}")
        return get_mock_weather(location_name)


def get_mock_weather(location: str) -> WeatherResponse:
    """Return mock weather data"""
    today = datetime.now()
    forecast = []
    for i in range(7):
        day = today + timedelta(days=i)
        day_name = DAY_NAMES[day.weekday()]
        forecast.append(ForecastDay(
            day=day_name,
            temp=28 + (i % 3) - 1,
            icon=["☀️", "⛅", "🌧️", "⛅", "☀️", "☀️", "⛅"][i]
        ))
    
    return WeatherResponse(
        location=location,
        temperature=28,
        condition="Partly Cloudy",
        humidity=65,
        windSpeed=12,
        uvIndex=6,
        rainProbability=20,
        forecast=forecast
    )


def get_status_chips(weather: WeatherResponse) -> List[StatusChip]:
    """Generate status chips based on conditions"""
    import random
    
    chips = []
    
    # AQI chip
    aqi = random.randint(80, 180)
    aqi_status = "good" if aqi < 100 else "warning" if aqi < 150 else "danger"
    chips.append(StatusChip(
        id="aqi",
        label="Air Quality",
        value=f"AQI {aqi}",
        status=aqi_status,
        icon="🌬️"
    ))
    
    # Soil moisture
    moisture = random.randint(55, 80)
    moisture_status = "good" if 60 <= moisture <= 75 else "warning"
    chips.append(StatusChip(
        id="soil_moisture",
        label="Soil Moisture",
        value=f"{moisture}%",
        status=moisture_status,
        icon="💧"
    ))
    
    # Soil pH
    ph = round(random.uniform(6.2, 7.5), 1)
    ph_status = "good" if 6.5 <= ph <= 7.2 else "warning"
    chips.append(StatusChip(
        id="soil_ph",
        label="Soil pH",
        value=str(ph),
        status=ph_status,
        icon="🧪"
    ))
    
    # Rain probability from weather
    rain_status = "good" if weather.rainProbability < 30 else "warning" if weather.rainProbability < 60 else "danger"
    chips.append(StatusChip(
        id="rain",
        label="Rain Chance",
        value=f"{weather.rainProbability}%",
        status=rain_status,
        icon="🌧️"
    ))
    
    # Market sentiment
    sentiments = ["bullish", "neutral", "bearish"]
    sentiment = random.choice(sentiments)
    sentiment_status = "good" if sentiment == "bullish" else "warning" if sentiment == "neutral" else "danger"
    chips.append(StatusChip(
        id="market",
        label="Market",
        value=sentiment.capitalize(),
        status=sentiment_status,
        icon="📈" if sentiment == "bullish" else "📊" if sentiment == "neutral" else "📉"
    ))
    
    return chips


def get_timeline_items(weather: WeatherResponse, prices: List[PriceItem]) -> List[TimelineItem]:
    """Generate timeline items based on current data"""
    items = []
    
    # Price opportunity
    best_price = max(prices, key=lambda p: p.changePercent)
    if best_price.changePercent > 2:
        items.append(TimelineItem(
            id="price_opp",
            type="opportunity",
            title=f"{best_price.name} prices are favorable",
            message=f"Prices up {best_price.changePercent}% this week. Consider selling for optimal returns.",
            time="Just now",
            actionable=True
        ))
    
    # Weather alert
    if weather.rainProbability > 40:
        items.append(TimelineItem(
            id="rain_alert",
            type="weather",
            title="Rain expected soon",
            message=f"{weather.rainProbability}% chance of rain. Plan irrigation and field work accordingly.",
            time="2h ago"
        ))
    
    # Irrigation insight
    items.append(TimelineItem(
        id="irrigation",
        type="insight",
        title="Optimal irrigation window",
        message="Based on soil moisture and weather, consider irrigating in the next 2 days.",
        time="4h ago",
        actionable=True
    ))
    
    # Temperature warning
    if weather.temperature > 35:
        items.append(TimelineItem(
            id="heat_warning",
            type="warning",
            title="High temperature alert",
            message=f"Temperature at {weather.temperature}°C. Ensure adequate water for crops.",
            time="6h ago"
        ))
    
    # Harvest reminder
    items.append(TimelineItem(
        id="harvest",
        type="harvest",
        title="Upcoming harvest season",
        message="Wheat harvest window approaching. Prepare storage and transportation.",
        time="Yesterday"
    ))
    
    # Market update
    items.append(TimelineItem(
        id="market_update",
        type="insight",
        title="Weekly market summary",
        message="Overall commodity prices showing upward trend. Good time for selling stored produce.",
        time="2 days ago"
    ))
    
    return items[:6]  # Limit to 6 items


# === API Endpoints ===

@router.get("/weather")
async def get_weather(
    lat: float = Query(30.9, description="Latitude"),
    lon: float = Query(75.85, description="Longitude"),
    location: str = Query("Ludhiana, Punjab", description="Location name")
) -> WeatherResponse:
    """Get weather data for a location"""
    return await fetch_weather_data(lat, lon, location)


@router.get("/prices")
async def get_prices(
    crops: str = Query(None, description="Comma-separated crop IDs")
) -> List[PriceItem]:
    """Get prices for crops from database"""
    crop_list = crops.split(",") if crops else None
    return await get_db_prices(crop_list)


@router.get("/prices/all")
async def get_all_crops_info():
    """Get all crops information from database"""
    db = get_supabase()
    result = db.table("crops").select("*, crop_categories(name)").eq("is_active", True).execute()
    return {
        "crops": result.data,
        "lastUpdated": "2024-25 Season",
        "source": "Government of India"
    }


@router.get("")
async def get_dashboard(
    lat: float = Query(30.9, description="Latitude"),
    lon: float = Query(75.85, description="Longitude"),
    location: str = Query("Ludhiana, Punjab", description="Location name")
) -> DashboardResponse:
    """Get complete dashboard data from database"""
    
    # Fetch weather
    weather = await fetch_weather_data(lat, lon, location)
    
    # Get prices from database
    prices = await get_db_prices()
    
    # Generate status chips
    status_chips = get_status_chips(weather)
    
    # Get insights from database
    db_insights = await get_db_insights()
    
    # If no insights in DB, generate dynamic ones based on prices/weather
    if db_insights:
        timeline = db_insights
    else:
        timeline = get_timeline_items(weather, prices)
    
    # Insights cards
    insights = [
        InsightData(
            title="Expected Yield",
            subtitle="Based on current conditions",
            value="42",
            unit="q/ha",
            trend={"value": 11, "isPositive": True},
            gradient="from-emerald-500 to-teal-600"
        ),
        InsightData(
            title="Crop Health",
            subtitle="Overall field status",
            value="85",
            unit="%",
            gradient="from-blue-500 to-indigo-600"
        )
    ]
    
    # Quick stats
    db = get_supabase()
    crops_count = db.table("crops").select("id", count="exact").eq("is_active", True).execute()
    
    quick_stats = {
        "hectares": 25.5,
        "activeCrops": crops_count.count or 4,
        "harvestsSoon": 2
    }
    
    return DashboardResponse(
        weather=weather,
        prices=prices,
        statusChips=status_chips,
        timeline=timeline,
        insights=insights,
        quickStats=quick_stats
    )


# === Location Search ===

INDIAN_LOCATIONS = [
    {"name": "Ludhiana, Punjab", "lat": 30.9, "lon": 75.85},
    {"name": "Amritsar, Punjab", "lat": 31.63, "lon": 74.87},
    {"name": "Chandigarh", "lat": 30.73, "lon": 76.78},
    {"name": "Delhi", "lat": 28.61, "lon": 77.23},
    {"name": "Jaipur, Rajasthan", "lat": 26.92, "lon": 75.78},
    {"name": "Lucknow, UP", "lat": 26.85, "lon": 80.95},
    {"name": "Bhopal, MP", "lat": 23.26, "lon": 77.41},
    {"name": "Nagpur, Maharashtra", "lat": 21.15, "lon": 79.09},
    {"name": "Hyderabad, Telangana", "lat": 17.38, "lon": 78.49},
    {"name": "Bangalore, Karnataka", "lat": 12.97, "lon": 77.59},
    {"name": "Chennai, Tamil Nadu", "lat": 13.08, "lon": 80.27},
    {"name": "Kolkata, West Bengal", "lat": 22.57, "lon": 88.36},
    {"name": "Patna, Bihar", "lat": 25.59, "lon": 85.14},
    {"name": "Ahmedabad, Gujarat", "lat": 23.02, "lon": 72.57},
    {"name": "Indore, MP", "lat": 22.72, "lon": 75.86},
]


@router.get("/locations")
async def search_locations(q: str = Query("", description="Search query")):
    """Search for locations"""
    if not q:
        return INDIAN_LOCATIONS[:10]
    
    q_lower = q.lower()
    matches = [loc for loc in INDIAN_LOCATIONS if q_lower in loc["name"].lower()]
    return matches[:10]


@router.get("/reverse-geocode")
async def reverse_geocode(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Get location name from coordinates using multiple geocoding services"""
    
    async with httpx.AsyncClient() as client:
        # Try OpenWeatherMap first if key exists
        if OPENWEATHER_API_KEY:
            try:
                url = f"http://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&appid={OPENWEATHER_API_KEY}"
                response = await client.get(url, timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    if data and len(data) > 0:
                        loc = data[0]
                        name_parts = [loc.get("name", "")]
                        if loc.get("state"):
                            name_parts.append(loc["state"])
                        name = ", ".join(filter(None, name_parts))
                        if name:
                            return {"name": name, "lat": lat, "lon": lon}
            except Exception as e:
                logger.warning(f"OpenWeatherMap geocode failed: {e}")
        
        # Fallback: Try Nominatim (OpenStreetMap) - free, no API key
        try:
            url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"
            headers = {"User-Agent": "KrishiGPT/1.0"}
            response = await client.get(url, headers=headers, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                address = data.get("address", {})
                city = address.get("city") or address.get("town") or address.get("village") or address.get("municipality")
                state = address.get("state")
                country = address.get("country")
                
                if city and state:
                    return {"name": f"{city}, {state}", "lat": lat, "lon": lon}
                elif city and country:
                    return {"name": f"{city}, {country}", "lat": lat, "lon": lon}
                elif city:
                    return {"name": city, "lat": lat, "lon": lon}
        except Exception as e:
            logger.warning(f"Nominatim geocode failed: {e}")
        
        # Final fallback: nearest known location
        nearest = min(
            INDIAN_LOCATIONS,
            key=lambda loc: ((loc["lat"] - lat) ** 2 + (loc["lon"] - lon) ** 2)
        )
        return {"name": nearest["name"], "lat": lat, "lon": lon}
