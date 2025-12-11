import axios from 'axios';
import { API_CONFIG } from '../cosntants/api';

export const http = axios.create({
  baseURL: `${API_CONFIG.API_SERVER}/api`,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');

  if (token && !config.headers?.Authorization) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});


