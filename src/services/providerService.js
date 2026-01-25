import api from "./axiosClient";

export const providerService = {
    /**
     * Get all providers
     * @returns {Promise} List of all providers
     */
    async getAllProviders() {
        try {
            const url = "providers";
            const res = await api.get(url);
            return res;
        } catch (error) {
            console.error("Get all providers error:", error);
            throw {
                source: "API",
                message: error.response?.data?.message || "Failed to get providers",
                status: error.response?.status,
                raw: error,
            };
        }
    },

    /**
     * Get active providers only
     * @returns {Promise} List of active providers
     */
    async getActiveProviders() {
        try {
            const url = "providers/active";
            const res = await api.get(url);
            return res;
        } catch (error) {
            console.error("Get active providers error:", error);
            throw {
                source: "API",
                message: error.response?.data?.message || "Failed to get active providers",
                status: error.response?.status,
                raw: error,
            };
        }
    },

    /**
     * Get provider by ID
     * @param {string} id - Provider ID
     * @returns {Promise} Provider details
     */
    async getProviderById(id) {
        try {
            const url = `providers/${id}`;
            const res = await api.get(url);
            return res;
        } catch (error) {
            console.error("Get provider by ID error:", error);
            throw {
                source: "API",
                message: error.response?.data?.message || "Failed to get provider details",
                status: error.response?.status,
                raw: error,
            };
        }
    },

    /**
     * Get all schooling levels
     * @returns {Promise} List of all schooling levels
     */
    async getAllSchoolingLevels() {
        try {
            const url = "providers/schooling-levels";
            const res = await api.get(url);
            return res;
        } catch (error) {
            console.error("Get all schooling levels error:", error);
            throw {
                source: "API",
                message: error.response?.data?.message || "Failed to get schooling levels",
                status: error.response?.status,
                raw: error,
            };
        }
    },

    /**
     * Get schooling levels by provider ID
     * @param {string} id - Provider ID
     * @returns {Promise} List of schooling levels for the provider
     */
    async getSchoolingLevelsByProviderId(id) {
        try {
            const url = `providers/${id}/schooling-levels`;
            const res = await api.get(url);
            return res;
        } catch (error) {
            console.error("Get schooling levels by provider ID error:", error);
            throw {
                source: "API",
                message: error.response?.data?.message || "Failed to get schooling levels",
                status: error.response?.status,
                raw: error,
            };
        }
    },

    /**
     * Create a new provider
     * @param {Object} data - Provider data
     * @param {string} data.name - Provider name
     * @param {Array<string>} data.educationLevels - Education levels (e.g., ['primary', 'secondary'])
     * @returns {Promise} Created provider
     */
    async createProvider(data) {
        try {
            const url = "providers";
            const res = await api.post(url, data);
            return res;
        } catch (error) {
            console.error("Create provider error:", error);
            throw {
                source: "API",
                message: error.response?.data?.message || "Failed to create provider",
                status: error.response?.status,
                raw: error,
            };
        }
    },

    /**
     * Update an existing provider
     * @param {string} id - Provider ID
     * @param {Object} data - Provider data
     * @param {string} data.id - Provider ID (must match route parameter)
     * @param {string} data.name - Provider name
     * @param {Array<string>} data.educationLevels - Education levels
     * @returns {Promise} Updated provider
     */
    async updateProvider(id, data) {
        try {
            const url = `providers/${id}`;
            const res = await api.put(url, data);
            return res;
        } catch (error) {
            console.error("Update provider error:", error);
            throw {
                source: "API",
                message: error.response?.data?.message || "Failed to update provider",
                status: error.response?.status,
                raw: error,
            };
        }
    },

    /**
     * Delete a provider
     * @param {string} id - Provider ID
     * @returns {Promise} Deletion confirmation
     */
    async deleteProvider(id) {
        try {
            const url = `providers/${id}`;
            const res = await api.delete(url);
            return res;
        } catch (error) {
            console.error("Delete provider error:", error);
            throw {
                source: "API",
                message: error.response?.data?.message || "Failed to delete provider",
                status: error.response?.status,
                raw: error,
            };
        }
    },

    /**
     * Activate a provider
     * @param {string} id - Provider ID
     * @returns {Promise} Updated provider
     */
    async activateProvider(id) {
        try {
            const url = `providers/${id}/activate`;
            const res = await api.patch(url);
            return res;
        } catch (error) {
            console.error("Activate provider error:", error);
            throw {
                source: "API",
                message: error.response?.data?.message || "Failed to activate provider",
                status: error.response?.status,
                raw: error,
            };
        }
    },

    /**
     * Deactivate a provider
     * @param {string} id - Provider ID
     * @returns {Promise} Updated provider
     */
    async deactivateProvider(id) {
        try {
            const url = `providers/${id}/deactivate`;
            const res = await api.patch(url);
            return res;
        } catch (error) {
            console.error("Deactivate provider error:", error);
            throw {
                source: "API",
                message: error.response?.data?.message || "Failed to deactivate provider",
                status: error.response?.status,
                raw: error,
            };
        }
    },
};
