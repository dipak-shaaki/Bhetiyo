// API service to connect to the backend
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get auth token if available
    const token = localStorage.getItem('token');

    // Set default headers
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    // For FormData requests, let the browser set Content-Type automatically
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const config = {
        headers,
        ...options,
    };

    try {
        const response = await fetch(url, config);

        // Handle successful responses
        if (response.ok) {
            const data = await response.json();
            return { data, error: null };
        }

        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
            // Clear token from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login page
            window.location.href = '/signin';
            return { data: null, error: 'Session expired. Please log in again.' };
        }

        // Handle other error responses
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'An error occurred' };
    } catch (error) {
        console.error('API request failed:', error);
        return { data: null, error: 'Network error - please try again' };
    }
}

// Authentication API functions
export const authAPI = {
    // Register a new user
    register: async (userData) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    // Login user
    login: async (credentials) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    // Logout user
    logout: async () => {
        return apiRequest('/auth/logout', {
            method: 'POST',
        });
    },
};

// Items API functions
export const itemsAPI = {
    // Create a new item (lost or found)
    createItem: async (itemData) => {
        return apiRequest('/items', {
            method: 'POST',
            body: itemData,
        });
    },

    // Get all items
    getItems: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/items${queryString ? `?${queryString}` : ''}`;
        return apiRequest(endpoint);
    },

    // Get user's items
    getUserItems: async () => {
        return apiRequest('/items/my');
    },

    // Get a specific item
    getItem: async (id) => {
        return apiRequest(`/items/${id}`);
    },

    // Update an item
    updateItem: async (id, itemData) => {
        return apiRequest(`/items/${id}`, {
            method: 'PUT',
            body: itemData,
        });
    },

    // Delete an item
    deleteItem: async (id) => {
        return apiRequest(`/items/${id}`, {
            method: 'DELETE',
        });
    },
};

export default {
    authAPI,
    itemsAPI,
};