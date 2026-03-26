import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5001/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('innoventure_token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
