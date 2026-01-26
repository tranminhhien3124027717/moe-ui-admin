import { useState, useCallback } from "react";
import { message } from "antd";
import { topupService } from "../../services/topupService";

export const useTopupConfigs = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all topup configs
  const fetchConfigs = useCallback(async (searchTerm = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = searchTerm ? { searchTerm } : {};
      const result = await topupService.getTopupConfigs(params);
      const data = result?.data || result || [];
      setConfigs(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Failed to fetch topup configs:", err);
      setError(err);
      setConfigs([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new topup config
  const createConfig = useCallback(async (configData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await topupService.createTopupConfig(configData);
      message.success("Template saved successfully!");
      // Refresh configs list after creating
      await fetchConfigs();
      return result;
    } catch (err) {
      console.error("Failed to create topup config:", err);
      setError(err);
      message.error(err.message || "Failed to save template");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConfigs]);

  // Delete a topup config by id
  const deleteConfig = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await topupService.deleteTopupConfig(id);
      message.success("Template deleted successfully!");
      // Refresh configs list after deleting
      await fetchConfigs();
      return true;
    } catch (err) {
      console.error("Failed to delete topup config:", err);
      setError(err);
      message.error(err.message || "Failed to delete template");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConfigs]);

  return {
    configs,
    loading,
    error,
    fetchConfigs,
    createConfig,
    deleteConfig,
  };
};
