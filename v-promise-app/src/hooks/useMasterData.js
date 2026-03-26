import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook to dynamically fetch general configuration and master data
 * such as Dropdown Options (Conditions, Types) directly from the backend API.
 */
export const useMasterData = () => {
  const [data, setData] = useState({
    vehicleTypes: [],
    conditions: [],
    purchaseTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMasterData = async () => {
      try {
        setLoading(true);
        // Assuming your backend exposes an endpoint like /api/master-data
        // We pass a cache buster timestamp query parameter just in case
        const response = await api.get(`/api/master-data?t=${Date.now()}`);
        
        if (response.data && isMounted) {
            setData({
                // Safe fallbacks to empty arrays if endpoint doesn't return one of the fields
                vehicleTypes: response.data.vehicleTypes || [],
                conditions: response.data.conditions || [],
                purchaseTypes: response.data.purchaseTypes || [],
            });
        }
      } catch (err) {
        console.error("Failed to fetch master data from DB:", err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMasterData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
};
