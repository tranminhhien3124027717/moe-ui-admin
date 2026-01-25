import { useState, useEffect } from "react";
import { providerService } from "../../services/providerService";
import { message } from "antd";

export const useProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all schooling levels
  const fetchAllSchoolingLevels = async () => {
    try {
      const response = await providerService.getAllSchoolingLevels();
      return response?.data || [];
    } catch (err) {
      console.error("Failed to fetch schooling levels:", err);
      const errorMsg = err.message || 'Failed to load schooling levels';
      message.error(errorMsg);
      return [];
    }
  };

  // Fetch all providers
  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await providerService.getAllProviders();
      console.log('API Response:', response);
      const providersData = response?.data || [];
      console.log('Providers Data:', providersData);
      setProviders(providersData);
      return providersData;
    } catch (err) {
      console.error("Failed to fetch providers:", err);
      const errorMsg = err.message || 'Failed to load providers';
      setError(errorMsg);
      message.error(errorMsg);
      setProviders([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new provider
  const createProvider = async (data) => {
    try {
      const response = await providerService.createProvider(data);
      message.success('Provider created successfully');
      await fetchProviders(); // Refresh the list
      return response?.data;
    } catch (err) {
      console.error("Failed to create provider:", err);
      const errorMsg = err.message || 'Failed to create provider';
      message.error(errorMsg);
      throw err;
    }
  };

  // Update an existing provider
  const updateProvider = async (id, data) => {
    try {
      const response = await providerService.updateProvider(id, data);
      message.success('Provider updated successfully');
      await fetchProviders(); // Refresh the list
      return response?.data;
    } catch (err) {
      console.error("Failed to update provider:", err);
      const errorMsg = err.message || 'Failed to update provider';
      message.error(errorMsg);
      throw err;
    }
  };

  // Delete a provider
  const deleteProvider = async (id) => {
    try {
      await providerService.deleteProvider(id);
      message.success('Provider deleted successfully');
      await fetchProviders(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete provider:", err);
      const errorMsg = err.message || 'Failed to delete provider';
      message.error(errorMsg);
      throw err;
    }
  };

  // Activate a provider
  const activateProvider = async (id) => {
    try {
      await providerService.activateProvider(id);
      message.success('Provider activated successfully');
      await fetchProviders(); // Refresh the list
    } catch (err) {
      console.error("Failed to activate provider:", err);
      const errorMsg = err.message || 'Failed to activate provider';
      message.error(errorMsg);
      throw err;
    }
  };

  // Deactivate a provider
  const deactivateProvider = async (id) => {
    try {
      await providerService.deactivateProvider(id);
      message.success('Provider deactivated successfully');
      await fetchProviders(); // Refresh the list
    } catch (err) {
      console.error("Failed to deactivate provider:", err);
      const errorMsg = err.message || 'Failed to deactivate provider';
      message.error(errorMsg);
      throw err;
    }
  };

  // Get schooling levels for a provider (with IDs)
  const getProviderSchoolingLevels = async (providerId) => {
    try {
      const response = await providerService.getSchoolingLevelsByProviderId(providerId);
      return response?.data || [];
    } catch (err) {
      console.error("Failed to fetch provider schooling levels:", err);
      const errorMsg = err.message || 'Failed to load schooling levels';
      message.error(errorMsg);
      throw err;
    }
  };

  // Load providers on mount
  useEffect(() => {
    fetchProviders();
  }, []);

  return {
    providers,
    loading,
    error,
    fetchProviders,
    fetchAllSchoolingLevels,
    createProvider,
    updateProvider,
    deleteProvider,
    activateProvider,
    deactivateProvider,
    getProviderSchoolingLevels,
  };
};
