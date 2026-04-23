import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { username: string; password: string; role?: string }) =>
    api.post('/auth/register', userData),
};

export const clinicsAPI = {
  getAll: () => api.get('/clinics'),
  getById: (id: string) => api.get(`/clinics/${id}`),
  create: (data: any) => api.post('/clinics', data),
  update: (id: string, data: any) => api.put(`/clinics/${id}`, data),
  delete: (id: string) => api.delete(`/clinics/${id}`),
};

export const studentsAPI = {
  getAll: (params?: any) => api.get('/students', { params }),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
  getByClinic: (clinicId: string, params?: any) => 
    api.get(`/students/clinic/${clinicId}`, { params }),
};

export const attendanceAPI = {
  getAll: (params?: any) => api.get('/attendance', { params }),
  getByStudentMonth: (studentId: string, month: number, year: number) =>
    api.get(`/attendance/student/${studentId}/month/${month}/${year}`),
  create: (data: any) => api.post('/attendance', data),
  createBulk: (data: any) => api.post('/attendance/bulk', data),
};

export const evaluationsAPI = {
  getAll: (params?: any) => api.get('/evaluations', { params }),
  getLatestByStudent: (studentId: string) =>
    api.get(`/evaluations/student/${studentId}/latest`),
  create: (data: any) => api.post('/evaluations', data),
  update: (id: string, data: any) => api.put(`/evaluations/${id}`, data),
  delete: (id: string) => api.delete(`/evaluations/${id}`),
};

export const reportsAPI = {
  getGeneralSummary: () => api.get('/reports/general-summary'),
  getClinicReport: (clinicId: string) => api.get(`/reports/clinic/${clinicId}`),
  getStudentReport: (studentId: string) => api.get(`/reports/student/${studentId}`),
  getClinicAttendance: (clinicId: string, month: number, year: number) =>
    api.get(`/reports/clinic/${clinicId}/attendance/${month}/${year}`),
};

export default api;
