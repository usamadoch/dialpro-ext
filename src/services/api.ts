import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
});

// Attach token from chrome.storage
api.interceptors.request.use(async (config) => {
    try {
        const result = await chrome.storage.local.get('dialpro_token') as { dialpro_token?: string };
        if (result.dialpro_token) {
            config.headers.Authorization = `Bearer ${result.dialpro_token}`;
        }
    } catch {
        // Fallback to localStorage if chrome.storage is unavailable
        const token = localStorage.getItem('dialpro_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Auth
export const verifyLicense = (license_key: string, device_id: string) =>
    api.post('/auth/verify-license', { license_key, device_id });

// Agent
export const getLeads = () => api.get('/agent/leads');

export const logCall = (data: {
    lead_id: string;
    list_id: string;
    outcome: string;
    notes?: string;
    callback_date?: string;
}) => api.post('/agent/log', data);

export const updatePosition = (assignment_id: string, position: number) =>
    api.put('/agent/position', { assignment_id, position });

export const getCallbacks = () => api.get('/agent/callbacks');
export const getSummary = () => api.get('/agent/summary');

export default api;
