from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.llm_service import generate_recipes_with_llm

router = APIRouter()


class RecipePreferences(BaseModel):
    is_vegetarian: Optional[bool] = False
    is_vegan: Optional[bool] = False
    cuisine: Optional[str] = "any"
    max_cook_time: Optional[int] = None


class GenerateRecipesRequest(BaseModel):
    ingredients: List[str]
    preferences: Optional[RecipePreferences] = None
    servings: Optional[int] = 2
    priority_ingredients: Optional[List[str]] = []


@router.post("/generate-recipes")
async def generate_recipes(request: GenerateRecipesRequest):
    if not request.ingredients:
        raise HTTPException(status_code=400, detail="ingredients list is required")

    prefs = request.preferences.model_dump() if request.preferences else {}
    recipes = await generate_recipes_with_llm(
        request.ingredients,
        prefs,
        request.servings or 2,
        request.priority_ingredients or [],
    )

    return {"recipes": recipes}
