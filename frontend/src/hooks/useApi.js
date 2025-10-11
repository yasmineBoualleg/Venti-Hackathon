// frontend/src/hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';

const useApi = (apiCall) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall();
            setData(response.data);
        } catch (err) {
            setError(err.response ? err.response.data : 'An unexpected error occurred.');
            console.error("API Error:", err);
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

export default useApi;