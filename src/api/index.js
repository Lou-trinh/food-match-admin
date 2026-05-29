import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fm_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // /uploads/ → served by API (Render)
  if (path.startsWith('/uploads/')) return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${path}`;
  // /images/ → served by user FE (Netlify)
  return `${import.meta.env.VITE_FE_URL || 'https://magnificent-manatee-295dfb.netlify.app'}${path}`;
}

export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  me:    ()     => api.get('/api/auth/me'),
};

export const foodsApi = {
  getAll: (params) => api.get('/api/foods', { params }),
  getOne: (id)     => api.get(`/api/foods/${id}`),
  create: (data)   => api.post('/api/foods', data),
  update: (id, data) => api.put(`/api/foods/${id}`, data),
  remove: (id)     => api.delete(`/api/foods/${id}`),
};

export const drinksApi = {
  getAll: (params) => api.get('/api/drinks', { params }),
  getOne: (id)     => api.get(`/api/drinks/${id}`),
  create: (data)   => api.post('/api/drinks', data),
  update: (id, data) => api.put(`/api/drinks/${id}`, data),
  remove: (id)     => api.delete(`/api/drinks/${id}`),
};

export default api;
