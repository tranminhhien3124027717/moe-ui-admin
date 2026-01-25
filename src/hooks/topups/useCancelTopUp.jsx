import { useState } from "react";
import { topupService } from "../../services/topupService";

export const useCancelTopUp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cancelTopUp = async (ruleId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await topupService.cancelTopUp(ruleId);
      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to cancel top up");
      return { success: false, error: err.message || "Failed to cancel top up" };
    }
  };

  return { cancelTopUp, loading, error };
};
