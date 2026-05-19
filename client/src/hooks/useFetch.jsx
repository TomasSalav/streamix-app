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
            // Recuperamos el token de localStorage para la autenticación
            const token = localStorage.getItem("token");

            // Detectamos si el cuerpo es FormData (para subida de archivos)
            // Si es FormData, no ponemos Content-Type para que el navegador lo haga automáticamente con el boundary
            const isFormData = body instanceof FormData;
            const options = {
                method: method.toUpperCase(),
                headers: {
                    ...(isFormData ? {} : { "Content-Type": "application/json" }),
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            };

            // Preparamos el cuerpo de la petición
            if (body) {
                options.body = isFormData ? body : JSON.stringify(body);
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