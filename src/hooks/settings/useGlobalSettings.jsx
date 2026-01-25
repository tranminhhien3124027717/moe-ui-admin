import { useState, useEffect } from "react";
import { settingsService } from "../../services/settingsService";
import { message } from "antd";

export const useGlobalSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch global settings
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingsService.getGlobalSettings();
      const settingsData = response?.data;
      setSettings(settingsData);
      return settingsData;
    } catch (err) {
      console.error("Failed to fetch global settings:", err);
      const errorMsg = err.message || 'Failed to load global settings';
      setError(errorMsg);
      message.error(errorMsg);
      
      // Return default settings if API fails
      const defaultSettings = {
        billingDate: 5,
        dueToDate: 30,
        closureMonth: 12,
        closureDay: 31
      };
      setSettings(defaultSettings);
      return defaultSettings;
    } finally {
      setLoading(false);
    }
  };

  // Update global settings
  const updateSettings = async (data) => {
    try {
      const response = await settingsService.updateGlobalSettings(data);
      message.success('Settings updated successfully');
      const updatedSettings = response?.data;
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      console.error("Failed to update global settings:", err);
      const errorMsg = err.message || 'Failed to update settings';
      message.error(errorMsg);
      throw err;
    }
  };

  // Initialize default settings
  const initializeSettings = async () => {
    try {
      await settingsService.initializeDefaultSettings();
      message.success('Default settings initialized');
      await fetchSettings(); // Refresh after initialization
    } catch (err) {
      console.error("Failed to initialize settings:", err);
      const errorMsg = err.message || 'Failed to initialize settings';
      message.error(errorMsg);
      throw err;
    }
  };

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    initializeSettings,
  };
};
