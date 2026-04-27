from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.optimization import optimize_route

router = APIRouter()


class Coordinate(BaseModel):
    lat: float
    lng: float


class PickupPoint(BaseModel):
    id: str
    lat: float
    lng: float
    time_window: Optional[List[str]] = None


class OptimizeRouteRequest(BaseModel):
    start: Coordinate
    pickups: List[PickupPoint]


@router.post("/optimize-route")
async def optimize_pickup_route(request: OptimizeRouteRequest):
    if not request.pickups:
        raise HTTPException(status_code=400, detail="At least one pickup point required")

    pickups = [p.model_dump() for p in request.pickups]
    start = request.start.model_dump()

    result = optimize_route(start, pickups)
    return result
