// src/api/client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://phronesis-backend-app.azurewebsites.net/api/v1',
  withCredentials: true,
});

export default api;
