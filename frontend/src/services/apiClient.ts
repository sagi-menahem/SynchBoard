// File: frontend/src/services/apiClient.ts

import axios from 'axios';

const apiClient = axios.create({
  // The base URL for all API requests, pointing to the Spring Boot backend.
  baseURL: 'http://localhost:8080/api',
  
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers.
apiClient.interceptors.request.use(
    (config) => {
        // Get the token from localStorage on every request.
        const token = localStorage.getItem('authToken');
        
        // If a token exists, add the Authorization header.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        // Do something with request error
        return Promise.reject(error);
    }
);

export default apiClient;
