import { useState } from "react";
import { accountService } from "../../services/accountService";

export const useAccounts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [data, setData] = useState();
  const [accountInfo, setAccountInfo] = useState(null);

  const getAccountNRIC = async (id) => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const res = await accountService.getAccountByResident(id);
      console.log("verify:", res.data)
      return res.data;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  const createAccount = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await accountService.addNewAccount(params);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAccountByID = async (id, params) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await accountService.getAccountById(id, params);
      console.log(res);
      setAccountInfo(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, data, error, accountInfo, reset, getAccountNRIC, createAccount, getAccountByID };
};
