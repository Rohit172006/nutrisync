import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getUserProfile = () => api.get('/users/profile').then(res => res.data);
export const saveUserProfile = (data) => api.post('/users/profile', data).then(res => res.data);

export const getVitalsHistory = () => api.get('/vitals/history').then(res => res.data);
export const syncWearable = () => api.post('/vitals/wearable-sync').then(res => res.data);
export const analyzeManualVitals = (data) => api.post('/vitals/manual', data).then(res => res.data);

export const analyzeFood = (foodName) => api.post('/food/analyze', { foodName }).then(res => res.data);
export const recommendMoodMeals = (mood) => api.post('/mood/recommend', { mood }).then(res => res.data);

export const processFridgeImage = (base64Image) => api.post('/food/vision', { image: base64Image }).then(res => res.data);

export const shuffleMeal = (type, calories) => api.get(`/food/shuffle?type=${type}&calories=${calories}`).then(res => res.data);

export const sendChatMessage = (message) => api.post('/chat', { message }).then(res => res.data);

export default api;
