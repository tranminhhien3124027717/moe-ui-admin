
import api from "./axiosClient";

export const accountService = {
  async getListAccount(params) {
    try {

      const url = "account-holders";
      const res = await api.get(url,{params});
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message: error.response?.data?.message || "API getAll account failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },

  async getAccountById(id, params) {
    try {
      const url = `account-holders/${id}`;
      const res = await api.get(url, { params });
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message:
          error.response?.data?.message || "API get account by id failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },

  async getAccountByResident(id) {
    try {
      const url = `account-holders/resident-info?nric=${id}`;
      const res = await api.get(url);
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message:
          error.response?.data?.message || "API  account by resident failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },

  async addNewAccount(params) {
    try {
      const data = {
        nric: params.nric,
        fullName: params.fullName,
        dateOfBirth: params.dateOfBirth,
        email: params.email,
        contactNumber: params.contactNumber,
        educationLevel: params.educationLevel,
        registeredAddress: params.registeredAddress,
        mailingAddress: params.mailingAddress,
        residentialStatus: params.residentialStatus,
      };
      const url = `account-holders`;
      const res = await api.post(url, data);
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message: error.response?.data?.message || "API add new account failed",
        errorMessage: error.response?.data?.errorMessage || error.response?.data?.message || "API add new account failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },

  async updateAccount(accountHolderId, params) {
    try {
      const data = {
        AccountHolderId: accountHolderId,
        Email: params.email,
        PhoneNumber: params.phone,
        RegisteredAddress: params.registeredAddress,
        MailingAddress: params.mailingAddress,
        EducationLevel: params.educationLevel,
      };
      const url = `account-holders`;
      const res = await api.put(url, data);
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message:
          error.response?.data?.message || "API update account failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },

  async deactivateAccount(accountHolderId) {
    try {
      const url = `account-holders/${accountHolderId}/deactivate`;
      const res = await api.post(url);
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message:
          error.response?.data?.message || "API deactivate account failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },

  async activateAccount(accountHolderId) {
    try {
      const url = `account-holders/${accountHolderId}/activate`;
      const res = await api.post(url);
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message:
          error.response?.data?.message || "API activate account failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },

  async getStudentCourseDetail(accountHolderId, courseId) {
    try {
      const url = `account-holders/${accountHolderId}/courses/${courseId}`;
      const res = await api.get(url);
      return res;
    } catch (error) {
      console.log(error);
      throw {
        source: "API",
        message:
          error.response?.data?.message || "API get student course detail failed",
        status: error.response?.status,
        raw: error,
      };
    }
  },
};
