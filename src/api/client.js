import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

// Adjunta automáticamente el token JWT en cada petición
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('mitaller_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;