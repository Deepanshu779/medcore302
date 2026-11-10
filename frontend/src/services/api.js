/**
 * Unified API Client for MedCore 302
 */

const API_BASE = (typeof window !== 'undefined' && (window.location.port === '5173' || window.location.protocol === 'file:'))
    ? (window.location.protocol === 'file:' ? 'http://localhost:3000' : '')
    : '';

export async function request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const defaultHeaders = {
        'Accept': 'application/json'
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        const res = await fetch(url, config);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            const errorMsg = data.error || `HTTP error ${res.status}: ${res.statusText}`;
            const error = new Error(errorMsg);
            error.status = res.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        if (!err.status && err.message && err.message.includes('Failed to fetch')) {
            throw new Error('Cannot connect to the MedCore server. Ensure the backend is running on port 3000.');
        }
        throw err;
    }
}

export const api = {
    get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
    put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
    delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' })
};

export default api;

