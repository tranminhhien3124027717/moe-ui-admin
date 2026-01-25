import { useEffect, useState } from "react";
import { topupService } from "../../services/topupService";

export const useCustomizeFilters = () => {
  const [educationLevels, setEducationLevels] = useState([]);
  const [schoolingStatuses, setSchoolingStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilters = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await topupService.getCustomizeFilters();
        const data = result?.data || result;
        setEducationLevels(data?.educationLevels || []);
        setSchoolingStatuses(data?.schoolingStatuses || []);
      } catch (err) {
        console.error("Failed to fetch customize filters:", err);
        setError(err);
        setEducationLevels([]);
        setSchoolingStatuses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  return {
    educationLevels,
    schoolingStatuses,
    loading,
    error,
  };
};
