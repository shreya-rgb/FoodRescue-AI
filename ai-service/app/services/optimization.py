from app.utils.helpers import haversine_distance
from datetime import datetime, timedelta
from typing import List, Dict, Any


def nearest_neighbor_tsp(start: Dict, pickups: List[Dict]) -> List[Dict]:
    """
    Nearest-neighbor heuristic for TSP route optimization.
    Returns ordered list of pickup points with ETAs.
    """
    if not pickups:
        return []

    unvisited = list(pickups)
    route = []
    current_lat = start["lat"]
    current_lng = start["lng"]
    current_time = datetime.now().replace(second=0, microsecond=0)
    total_distance = 0.0

    # Average speed: 30 km/h in city
    avg_speed_kmh = 30

    while unvisited:
        # Find nearest unvisited pickup
        nearest = None
        nearest_dist = float("inf")
        for pickup in unvisited:
            dist = haversine_distance(current_lat, current_lng, pickup["lat"], pickup["lng"])
            if dist < nearest_dist:
                nearest_dist = dist
                nearest = pickup

        if nearest is None:
            break

        # Calculate travel time
        travel_minutes = (nearest_dist / avg_speed_kmh) * 60
        current_time += timedelta(minutes=travel_minutes)
        total_distance += nearest_dist

        route.append({
            "lat": nearest["lat"],
            "lng": nearest["lng"],
            "type": "pickup",
            "id": nearest["id"],
            "eta": current_time.strftime("%H:%M"),
            "distance_from_prev": round(nearest_dist, 2),
        })

        current_lat = nearest["lat"]
        current_lng = nearest["lng"]
        unvisited.remove(nearest)

    return route, total_distance


def optimize_route(start: Dict, pickups: List[Dict]) -> Dict[str, Any]:
    """Full route optimization with output formatting."""
    if not pickups:
        return {
            "optimized_order": [],
            "total_distance_km": 0,
            "estimated_time_minutes": 0,
            "route_points": [{"lat": start["lat"], "lng": start["lng"], "type": "start"}],
        }

    route, total_distance = nearest_neighbor_tsp(start, pickups)

    # Build route points with start
    route_points = [{"lat": start["lat"], "lng": start["lng"], "type": "start"}] + route

    # Estimated time: distance / 30 km/h + 5 min per stop
    estimated_minutes = int((total_distance / 30) * 60) + len(pickups) * 5

    return {
        "optimized_order": [p["id"] for p in route],
        "total_distance_km": round(total_distance, 2),
        "estimated_time_minutes": estimated_minutes,
        "route_points": route_points,
    }
