import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitforge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 - token expired → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fitforge_token');
      localStorage.removeItem('fitforge_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
};

// ── Profile ───────────────────────────────────────────
export const profileAPI = {
  save:            (data) => api.post('/profile', data),
  get:             ()     => api.get('/profile'),
  getDashboard:    ()     => api.get('/dashboard/summary'),
  logWeight:       (data) => api.post('/track/weight', data),
  getWeightHistory:()     => api.get('/track/weight/history'),
  updateWater:     (data) => api.post('/track/water', data),
  getTodayWater:   ()     => api.get('/track/water/today'),
};

// ── Nutrition ─────────────────────────────────────────
export const nutritionAPI = {
  generatePlan: () => api.post('/nutrition/generate'),
  getPlan:      () => api.get('/nutrition/plan'),
  logMeal:      (data) => api.post('/nutrition/log', data),
  getMealLogs:  (date) => api.get(`/nutrition/logs?date=${date}`),
  getProgress:  (from, to) => api.get(`/nutrition/progress?from=${from}&to=${to}`),
  getTodayCal:  () => api.get('/nutrition/today-calories'),
  deleteMealLog:(id) => api.delete(`/nutrition/log/${id}`),
};

// ── Workout ───────────────────────────────────────────
export const workoutAPI = {
  generatePlan:   (data) => api.post('/workout/generate', data),
  getPlan:        () => api.get('/workout/plan'),
  logWorkout:     (data) => api.post('/workout/log', data),
  getWorkoutLogs: (date) => api.get(`/workout/logs?date=${date}`),
  getProgress: (from, to) => api.get(`/workout/progress?from=${from}&to=${to}`),
  toggleComplete: (id) => api.put(`/workout/log/${id}/toggle`),
};

// ── Chat ──────────────────────────────────────────────
export const chatAPI = {
  sendMessage:  (message) => api.post('/chat/message', { message }),
  getHistory:   () => api.get('/chat/history'),
  clearHistory: () => api.delete('/chat/history'),
};

// ── Extras ────────────────────────────────────────────
export const extrasAPI = {
  logSleep:        (data) => api.post('/track/sleep', data),
  getSleepHistory: () => api.get('/track/sleep/history'),
  generateRecipes: (data) => api.post('/recipe/generate', data),
};

export default api;
