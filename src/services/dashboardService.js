import api from "./axiosClient";

export const dashboardService = {
    getScheduledTopups: (type) => {
        return api.get("/dashboard/scheduled-topups", {
            params: {
                type: type
            }
        });
    },

    getLatestAccountCreation: () => {
        return api.get("/dashboard/recent-activities");
    },
    
    getTopUpDetail: (ruleId) => {
        return api.get(`/top-ups/${ruleId}`);
    }
};