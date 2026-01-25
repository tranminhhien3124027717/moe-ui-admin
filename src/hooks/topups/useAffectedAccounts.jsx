import { useEffect, useState, useCallback } from "react";
import { topupService } from "../../services/topupService";

export const useAffectedAccounts = (ruleId, searchTerm = "") => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (id, search = "") => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const params = search ? { Search: search } : {};
      const result = await topupService.getBatchRuleAffectedAccounts(id, params);
      console.log("Affected accounts result:", result);
      const responseData = result?.data || result || null;
      setData(responseData);
    } catch (err) {
      console.error("Failed to fetch affected accounts:", err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ruleId) {
      fetchData(ruleId, searchTerm);
    }
  }, [ruleId, searchTerm, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: (search) => fetchData(ruleId, search),
  };
};
