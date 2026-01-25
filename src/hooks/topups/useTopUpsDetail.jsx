import { useEffect, useState } from "react";
import { topupService } from "../../services/topupService";

export const useTopUpDetail = (ruleId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await topupService.getTopUpDetail(id);
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
    fetchData(ruleId);
  }, [ruleId]);


  return {
    data,
    loading,
    refetch: fetchData,
  };
};