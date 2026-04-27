from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import food_recognition, expiry_prediction, recipe_generator, waste_forecast, route_optimizer

app = FastAPI(
    title="FoodRescue AI Service",
    description="AI microservice for food recognition, expiry prediction, recipe generation, and route optimization",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(food_recognition.router, prefix="/api", tags=["Food Recognition"])
app.include_router(expiry_prediction.router, prefix="/api", tags=["Expiry Prediction"])
app.include_router(recipe_generator.router, prefix="/api", tags=["Recipe Generation"])
app.include_router(waste_forecast.router, prefix="/api", tags=["Waste Forecast"])
app.include_router(route_optimizer.router, prefix="/api", tags=["Route Optimization"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "models_loaded": True, "version": "1.0.0"}


@app.get("/")
async def root():
    return {"message": "FoodRescue AI Service is running", "docs": "/docs"}
