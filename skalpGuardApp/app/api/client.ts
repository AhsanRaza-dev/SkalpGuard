import AsyncStorage from '@react-native-async-storage/async-storage';
const BASE_URL = 'https://avelina-unstaunch-nonreflectively.ngrok-free.dev/api';

async function getAuthHeaders() {
    const token = await AsyncStorage.getItem('user_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

export const api = {
    async get(endpoint: string) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });
        return handleResponse(response);
    },

    async post(endpoint: string, body: any, isMultipart = false) {
        const token = await AsyncStorage.getItem('user_token');
        const headers: any = {
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };

        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: isMultipart ? body : JSON.stringify(body),
        });
        return handleResponse(response);
    },

    async put(endpoint: string, body: any, isMultipart = false) {
        const token = await AsyncStorage.getItem('user_token');
        const headers: any = {
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };

        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: isMultipart ? body : JSON.stringify(body),
        });
        return handleResponse(response);
    },

    async delete(endpoint: string) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });
        return handleResponse(response);
    },
};

async function handleResponse(response: Response) {
    let data;
    try {
        data = await response.json();
    } catch (e) {
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status} ${response.statusText}`);
        }
        return null;
    }

    if (!response.ok) {
        throw new Error(data.message || data.error || `Error ${response.status}: ${JSON.stringify(data)}`);
    }
    return data;
}
