import { useState, useCallback } from "react";
import { topupService } from "../../services/topupService";

export default function useCreateTopUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const createTopUp = useCallback(async (body) => {
    setLoading(true);
    setError(null);
    try {
      const res = await topupService.createScheduledTopUp(body);
      setData(res?.data);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createTopUp, loading, error, data };
}
