from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.llm_service import forecast_waste_with_llm

router = APIRouter()


class WasteHistoryEntry(BaseModel):
    date: str
    items_wasted: int
    kg_wasted: float
    categories: List[str]


class ForecastRequest(BaseModel):
    user_id: str
    history: List[WasteHistoryEntry]


@router.post("/forecast-waste")
async def forecast_waste(request: ForecastRequest):
    history = request.history

    if len(history) < 7:
        return {
            "forecast": {
                "next_week_predicted_waste": 0.5,
                "high_risk_categories": [],
                "pattern": "Not enough data yet. Keep tracking your food usage!",
                "recommendations": [
                    "Plan your meals for the week before shopping",
                    "Store food properly to extend shelf life",
                    "Use the FIFO method — first in, first out",
                ],
            }
        }

    # Calculate category stats
    category_counts: Dict[str, int] = {}
    total_kg = 0.0
    for entry in history:
        total_kg += entry.kg_wasted
        for cat in entry.categories:
            category_counts[cat] = category_counts.get(cat, 0) + 1

    high_risk = sorted(category_counts, key=category_counts.get, reverse=True)[:3]
    avg_weekly_waste = (total_kg / len(history)) * 7

    llm_result = await forecast_waste_with_llm(
        [e.model_dump() for e in history],
        {"category_counts": category_counts, "total_kg": total_kg, "high_risk": high_risk},
    )

    return {
        "forecast": {
            "next_week_predicted_waste": round(avg_weekly_waste, 2),
            "high_risk_categories": high_risk,
            "pattern": llm_result.get("pattern", ""),
            "recommendations": llm_result.get("recommendations", []),
        }
    }
