import api from "./axiosClient";

export const topupService = {
  async getListTopUps(params) {
    try {
      const url = "top-ups/schedules";
      const res = await api.get(url, { params });
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message: error.response?.data?.message || "API getAll top up failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },

  async getListAccountTopUps(params) {
    try {
      const url = "top-ups/account-holders/filtered";
      const res = await api.get(url, { params });
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message: error.response?.data?.message || "API getAll top up failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },


  async getAllSingaporeCitizen(params) {
    try {
      const url = `top-ups/account-holders/singapore-citizens`;
      const res = await api.get(url, { params });
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message:
          error.response?.data?.message || "API get account SingaporeCitizen failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },

  async getTopUpDetail(ruleId, educationAccountId = null) {
    try {
      const url = `top-ups/${ruleId}`;
      const params = educationAccountId ? { educationAccountId } : {};
      const res = await api.get(url, { params });
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message:
          error.response?.data?.message || "API get top up by id failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },
  async createScheduledTopUp(body) {
    try {
      const url = `top-ups/scheduled`;
      const res = await api.post(url, body);
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message:
          error.response?.data?.message || "API create scheduled top up failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },
  async getCustomizeFilters() {
    try {
      const url = `top-ups/customize-filters`;
      const res = await api.get(url);
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message:
          error.response?.data?.message || "API get customize filters failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },
  
  async getBatchRuleAffectedAccounts(ruleId, params = {}) {
    try {
      const url = `top-ups/${ruleId}/affected-accounts`;
      const res = await api.get(url, { params });
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message:
          error.response?.data?.message || "API get affected accounts failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },

  async cancelTopUp(ruleId, body) {
    try {
      const url = `top-ups/scheduled/${ruleId}/cancel`;
      const res = await api.post(url, body);
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message:
          error.response?.data?.title || "API cancel top up failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },
};
