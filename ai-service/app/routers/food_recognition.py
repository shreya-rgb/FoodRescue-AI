from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.llm_service import recognize_food_with_gemini

router = APIRouter()


class RecognizeRequest(BaseModel):
    image_url: str


@router.post("/recognize-food")
async def recognize_food(request: RecognizeRequest):
    if not request.image_url:
        raise HTTPException(status_code=400, detail="image_url is required")

    items = await recognize_food_with_gemini(request.image_url)
    return {"items": items}
