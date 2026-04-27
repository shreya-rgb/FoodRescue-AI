// Impact calculation constants (WRAP UK data)
const CO2_PER_KG_FOOD = 2.5;       // kg CO2 per kg food
const WATER_PER_KG_FOOD = 1000;    // liters per kg food
const KG_PER_MEAL = 0.4;           // kg food per meal
const COST_PER_KG = 80;            // INR per kg

const POINTS = {
  DONATE_FOOD: 10,              // per kg donated
  RESCUE_FOOD: 5,               // per kg rescued (NGO)
  CONSUME_BEFORE_EXPIRY: 3,     // per item consumed before expiry
  USE_RECIPE: 2,                // per AI recipe used
  DAILY_LOGIN: 1,
  SCAN_FOOD: 1,                 // per scan
};

const calculateImpact = (foodWeightKg) => {
  return {
    co2Saved: parseFloat((foodWeightKg * CO2_PER_KG_FOOD).toFixed(2)),
    waterSaved: parseFloat((foodWeightKg * WATER_PER_KG_FOOD).toFixed(0)),
    mealsEquivalent: Math.round(foodWeightKg / KG_PER_MEAL),
    moneySaved: parseFloat((foodWeightKg * COST_PER_KG).toFixed(2)),
  };
};

const calculatePoints = (action, weightKg = 0) => {
  switch (action) {
    case 'donated': return Math.round(weightKg * POINTS.DONATE_FOOD);
    case 'rescued': return Math.round(weightKg * POINTS.RESCUE_FOOD);
    case 'consumed_before_expiry': return POINTS.CONSUME_BEFORE_EXPIRY;
    case 'recipe_used': return POINTS.USE_RECIPE;
    case 'scan_food': return POINTS.SCAN_FOOD;
    case 'daily_login': return POINTS.DAILY_LOGIN;
    default: return 0;
  }
};

module.exports = { calculateImpact, calculatePoints, POINTS };
