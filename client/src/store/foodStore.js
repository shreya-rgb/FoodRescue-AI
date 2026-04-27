import { create } from 'zustand';
import api from '../services/api';

const useFoodStore = create((set, get) => ({
  foods: [],
  expiringItems: [],
  stats: null,
  isLoading: false,
  total: 0,
  page: 1,

  fetchFoods: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/food', { params });
      set({ foods: data.foods, total: data.total, page: data.page, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchExpiring: async (days = 5) => {
    try {
      const { data } = await api.get('/food/expiring', { params: { days } });
      set({ expiringItems: data.expiringItems });
    } catch {}
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get('/food/stats');
      set({ stats: data.stats });
    } catch {}
  },

  addFood: async (foodData) => {
    const { data } = await api.post('/food', foodData);
    set((state) => ({ foods: [data.food, ...state.foods] }));
    return data.food;
  },

  updateFood: async (id, updates) => {
    const { data } = await api.put(`/food/${id}`, updates);
    set((state) => ({
      foods: state.foods.map((f) => (f._id === id ? data.food : f)),
    }));
    return data.food;
  },

  updateFoodStatus: async (id, status) => {
    const { data } = await api.put(`/food/${id}/status`, { status });
    set((state) => ({
      foods: state.foods.map((f) => (f._id === id ? data.food : f)),
      expiringItems: state.expiringItems.filter((f) => f._id !== id),
    }));
    return data.food;
  },

  deleteFood: async (id) => {
    await api.delete(`/food/${id}`);
    set((state) => ({
      foods: state.foods.filter((f) => f._id !== id),
      expiringItems: state.expiringItems.filter((f) => f._id !== id),
    }));
  },

  scanFood: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const { data } = await api.post('/food/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  bulkAddFood: async (items) => {
    const { data } = await api.post('/food/bulk', { items });
    set((state) => ({ foods: [...data.foods, ...state.foods] }));
    return data;
  },
}));

export default useFoodStore;
