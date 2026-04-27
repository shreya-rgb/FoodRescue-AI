import json
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from app.services.llm_service import get_expiry_from_llm

router = APIRouter()

# Load expiry defaults
_data_path = os.path.join(os.path.dirname(__file__), "../data/expiry_defaults.json")
with open(_data_path) as f:
    EXPIRY_DEFAULTS = json.load(f)

STORAGE_TIPS = {
    "fridge": "Keep in the refrigerator at 4°C or below.",
    "freezer": "Store in airtight container in freezer.",
    "counter": "Keep at room temperature away from direct sunlight.",
    "pantry": "Store in a cool, dry, dark place.",
}


class FoodItemInput(BaseModel):
    name: str
    category: Optional[str] = None
    storage: Optional[str] = "fridge"


class PredictExpiryRequest(BaseModel):
    items: List[FoodItemInput]


@router.post("/predict-expiry")
async def predict_expiry(request: PredictExpiryRequest):
    predictions = []

    for item in request.items:
        name_lower = item.name.lower().replace(" ", "_")
        storage = item.storage or "fridge"

        # Look up in defaults
        expiry_data = EXPIRY_DEFAULTS.get(name_lower) or EXPIRY_DEFAULTS.get(name_lower.split("_")[0])

        if expiry_data:
            days = expiry_data.get(storage, expiry_data.get("fridge", 5))
            tip = STORAGE_TIPS.get(storage, "Store properly.")
        else:
            # LLM fallback
            llm_result = await get_expiry_from_llm(item.name, storage)
            days = llm_result.get("estimated_days", 5)
            tip = llm_result.get("storage_tip", STORAGE_TIPS.get(storage, "Store properly."))

        expiry_date = (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d")
        predictions.append({
            "name": item.name,
            "estimated_days": days,
            "expiry_date": expiry_date,
            "storage_tip": tip,
        })

    return {"predictions": predictions}
