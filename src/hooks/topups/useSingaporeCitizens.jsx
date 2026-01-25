import { useEffect, useState } from "react";
import { topupService } from "../../services/topupService";

export const useSingaporeCitizens = (search = "") => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = search ? { Search: search } : {};
        const result = await topupService.getAllSingaporeCitizen(params);
        const citizens = Array.isArray(result) ? result : result?.data || [];
        setData(citizens);
      } catch (error) {
        console.error("Failed to fetch Singapore citizens:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search]);

  return {
    data,
    loading,
  };
};
