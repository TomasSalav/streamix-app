import { useState, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hook to make HTTP requests
function useFetch(baseUrl = process.env.EXPO_PUBLIC_API_URL) {

    // Data, loading and error states
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Request callback
    const request = useCallback(async (endpoint = '', method = 'GET', body = null) => {
        setLoading(true);
        setError(null);

        // If token is avaiable in async storage, it adds it to the headers
        try {
            const token = await AsyncStorage.getItem('token');

            // Config the method, headers and body
            const options = {
                method: method.toUpperCase(),
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(baseUrl + endpoint, options);
            const result = await response.json();

            // Error handling
            if (!response.ok) {
                if (response.status === 401) {
                    AsyncStorage.removeItem('token');
                }
                throw new Error(result.msg || `HTTP ${response.status}`);
            }

            setData(result);
            return result;

        } catch (error) {
            setError(error.message);
            return { success: false, msg: error.message };
        } finally {
            setLoading(false);
        }
    }, [baseUrl]);

    return { data, loading, error, request };
}

export default useFetch;
