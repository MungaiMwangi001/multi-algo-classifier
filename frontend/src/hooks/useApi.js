import { useState } from "react";

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (apiFunc, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunc(...args);
      return response.data;
    } catch (err) {
      console.error("API call failed:", err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, callApi };
};

export default useApi;  // ✅ default export
