import json
import re
import google.generativeai as genai
from app.utils.config import GOOGLE_API_KEY

# Configure Gemini
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)


def get_gemini_model(vision: bool = False):
    model_name = "gemini-1.5-flash" if vision else "gemini-1.5-flash"
    return genai.GenerativeModel(model_name)


def extract_json(text: str) -> any:
    """Extract JSON from LLM response text."""
    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Try extracting from markdown code block
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass
    # Try finding JSON array or object
    match = re.search(r"(\[[\s\S]*\]|\{[\s\S]*\})", text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    return None


async def recognize_food_with_gemini(image_url: str) -> list:
    """Use Gemini Vision to identify food items in an image."""
    import requests
    from PIL import Image
    from io import BytesIO

    try:
        response = requests.get(image_url, timeout=15)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        img = img.resize((640, 640), Image.LANCZOS)

        model = get_gemini_model(vision=True)
        prompt = """Identify all food items visible in this image.
For each food item, return a JSON array with objects containing:
- "name": lowercase food name (e.g., "tomato", "milk", "apple")
- "category": one of [fruits, vegetables, dairy, meat, grains, beverages, snacks, condiments, frozen, bakery, canned, other]
- "confidence": confidence score between 0 and 1

Return ONLY the JSON array, no other text. Example:
[{"name": "tomato", "category": "vegetables", "confidence": 0.95}]"""

        result = model.generate_content([prompt, img])
        items = extract_json(result.text)
        if isinstance(items, list):
            return items
        return []
    except Exception as e:
        print(f"Gemini vision error: {e}")
        return []


async def generate_recipes_with_llm(
    ingredients: list,
    preferences: dict,
    servings: int,
    priority_ingredients: list
) -> list:
    """Generate recipes using Gemini."""
    try:
        model = get_gemini_model()
        pref_str = ""
        if preferences.get("is_vegetarian"):
            pref_str += "vegetarian only, "
        if preferences.get("is_vegan"):
            pref_str += "vegan only, "
        if preferences.get("max_cook_time"):
            pref_str += f"max {preferences['max_cook_time']} minutes cook time, "
        if preferences.get("cuisine") and preferences["cuisine"] != "any":
            pref_str += f"{preferences['cuisine']} cuisine, "

        prompt = f"""You are a helpful chef AI. Generate 3-5 practical recipes using these available ingredients: {', '.join(ingredients)}.

Preferences: {pref_str or 'none'}
Servings: {servings}
Priority ingredients (expiring soon, must use): {', '.join(priority_ingredients) if priority_ingredients else 'none'}

Return a JSON object with a "recipes" array. Each recipe must have:
- "title": recipe name
- "description": 1-2 sentence description
- "uses_priority": list of priority ingredients used
- "ingredients": array of {{"name": str, "amount": str, "available": bool}}
- "missing_ingredients": list of ingredient names not in the available list
- "instructions": array of step strings
- "cook_time_minutes": integer
- "difficulty": "easy", "medium", or "hard"
- "nutrition": {{"calories": int, "protein": int, "carbs": int, "fat": int}}

Return ONLY valid JSON, no markdown."""

        result = model.generate_content(prompt)
        data = extract_json(result.text)
        if isinstance(data, dict) and "recipes" in data:
            return data["recipes"]
        if isinstance(data, list):
            return data
        return []
    except Exception as e:
        print(f"Recipe generation error: {e}")
        return []


async def get_expiry_from_llm(item_name: str, storage: str) -> dict:
    """Fallback: use LLM to estimate expiry for unknown items."""
    try:
        model = get_gemini_model()
        prompt = f"""How many days does "{item_name}" last when stored in a {storage}?
Return JSON: {{"estimated_days": <integer>, "storage_tip": "<one sentence tip>"}}
Return ONLY JSON."""
        result = model.generate_content(prompt)
        data = extract_json(result.text)
        if isinstance(data, dict) and "estimated_days" in data:
            return data
        return {"estimated_days": 5, "storage_tip": "Store properly and check regularly."}
    except Exception as e:
        print(f"LLM expiry error: {e}")
        return {"estimated_days": 5, "storage_tip": "Store properly and check regularly."}


async def forecast_waste_with_llm(history: list, category_stats: dict) -> dict:
    """Generate personalized waste reduction recommendations."""
    try:
        model = get_gemini_model()
        prompt = f"""Based on this food waste history data: {json.dumps(category_stats)},
generate personalized recommendations to reduce food waste.

Return JSON:
{{
  "pattern": "<one sentence describing the user's waste pattern>",
  "recommendations": ["<tip 1>", "<tip 2>", "<tip 3>"]
}}
Return ONLY JSON."""
        result = model.generate_content(prompt)
        data = extract_json(result.text)
        if isinstance(data, dict):
            return data
        return {"pattern": "Review your shopping habits.", "recommendations": ["Plan meals weekly", "Buy smaller quantities", "Use FIFO storage"]}
    except Exception as e:
        print(f"Forecast LLM error: {e}")
        return {"pattern": "Review your shopping habits.", "recommendations": ["Plan meals weekly", "Buy smaller quantities"]}
