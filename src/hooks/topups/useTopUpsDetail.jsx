import { useEffect, useState } from "react";
import { topupService } from "../../services/topupService";

export const useTopUpDetail = (ruleId, educationAccountId = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (id, accId = null) => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await topupService.getTopUpDetail(id, accId);
      const detailData = result?.data || result || null;
      setData(detailData);
    } catch (error) {
      console.error("Failed to fetch top up detail:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(ruleId, educationAccountId);
  }, [ruleId, educationAccountId]);


  return {
    data,
    loading,
    refetch: (id, accId) => fetchData(id, accId),
  };
};