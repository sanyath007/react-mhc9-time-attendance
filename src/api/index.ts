import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

api.interceptors.request.use((config) => {
    const reqUrl = config.url;

    if (reqUrl.startsWith('/api/time-attendance/')) {
        /** Use API Key */
        const API_KEY = process.env.REACT_APP_API_KEY;

        config.headers.set('X-API-KEY', API_KEY);
    } else {
        /** Use Access Token */
        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        console.log('User unauthenticated, redirecting...');

        window.location.href = "/login";
    }

    return Promise.reject(error);
})

export default api;