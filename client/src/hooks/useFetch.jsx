import { useState, useCallback } from "react";

// Hook personalizado para hacer requests con header de autorización de JWT
function useFetch(baseUrl = "") {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (endpoint = "", method = "GET", body = null) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");

            const options = {
                method: method.toUpperCase(),
                headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                },
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(baseUrl + endpoint, options);
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                }
                throw new Error(result.message || `HTTP ${response.status}`);
            }

            setData(result);
            return result;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [baseUrl]);

    return { data, loading, error, request };
}

export default useFetch;
