const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const recognizeFood = async (imageUrl) => {
  const response = await axios.post(`${AI_SERVICE_URL}/api/recognize-food`, {
    image_url: imageUrl,
  }, { timeout: 30000 });
  return response.data;
};

const predictExpiry = async (items) => {
  const response = await axios.post(`${AI_SERVICE_URL}/api/predict-expiry`, {
    items,
  }, { timeout: 15000 });
  return response.data;
};

const generateRecipes = async (ingredients, preferences = {}, servings = 2, priorityIngredients = []) => {
  const response = await axios.post(`${AI_SERVICE_URL}/api/generate-recipes`, {
    ingredients,
    preferences,
    servings,
    priority_ingredients: priorityIngredients,
  }, { timeout: 60000 });
  return response.data;
};

const forecastWaste = async (userId, history) => {
  const response = await axios.post(`${AI_SERVICE_URL}/api/forecast-waste`, {
    user_id: userId,
    history,
  }, { timeout: 30000 });
  return response.data;
};

const optimizeRoute = async (start, pickups) => {
  const response = await axios.post(`${AI_SERVICE_URL}/api/optimize-route`, {
    start,
    pickups,
  }, { timeout: 30000 });
  return response.data;
};

module.exports = { recognizeFood, predictExpiry, generateRecipes, forecastWaste, optimizeRoute };
