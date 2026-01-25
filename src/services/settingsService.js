import api from "./axiosClient";

export const settingsService = {
    /**
     * Get global settings (billing configuration and account closure settings)
     * @returns {Promise} Global settings object
     */
    async getGlobalSettings() {
        try {
            const url = "settings-global";
            const res = await api.get(url);
            return res;
        } catch (error) {
            console.error("Get global settings error:", error);
            throw {
                source: "API",
                message: error.response?.data?.message || "Failed to get global settings",
                status: error.response?.status,
                raw: error,
            };
        }
    },

    /**
     * Update global settings (billing date, due date, account closure)
     * @param {Object} data - Settings data
     * @param {number} data.billingDate - Day of month for billing (1-10)
     * @param {number} data.dueToDate - Days after billing date for payment due (14 or 30)
     * @param {number} data.closureMonth - Month for account closure (1-12)
     * @param {number} data.closureDay - Day of month for account closure (1-31)
     * @returns {Promise} Updated settings
     */
    async updateGlobalSettings(data) {
        try {
            const url = "settings-global";
            const res = await api.put(url, data);
            return res;
        } catch (error) {
            console.error("Update global settings error:", error);
            throw {
                source: "API",
                message: error.response?.data?.message || "Failed to update global settings",
                status: error.response?.status,
                raw: error,
            };
        }
    },

    /**
     * Initialize default global settings (only if no settings exist)
     * @returns {Promise} Initialization confirmation
     */
    async initializeDefaultSettings() {
        try {
            const url = "settings-global/initialize";
            const res = await api.post(url);
            return res;
        } catch (error) {
            console.error("Initialize default settings error:", error);
            throw {
                source: "API",
                message: error.response?.data?.message || "Failed to initialize default settings",
                status: error.response?.status,
                raw: error,
            };
        }
    },
};
