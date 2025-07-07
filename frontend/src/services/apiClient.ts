// File: frontend/src/services/apiClient.ts

import axios from 'axios';

const apiClient = axios.create({
  // The base URL for all API requests, pointing to the Spring Boot backend.
  baseURL: 'http://localhost:8080',
  
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: Implement an interceptor to attach the authentication token (e.g., JWT)
// to the headers of outgoing requests after the login functionality is complete.
//
// apiClient.interceptors.request.use(config => {
//   const token = localStorage.getItem('authToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default apiClient;
