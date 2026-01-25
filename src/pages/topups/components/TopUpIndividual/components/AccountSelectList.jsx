// components/AccountSelectList.jsx
import { Input, Checkbox, Button, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useDebounce } from "../../../../../hooks/useDebounce";
import { useSingaporeCitizens } from "../../../../../hooks/topups/useSingaporeCitizens";
import styles from "../TopUpIndividual.module.scss";

const AccountSelectList = ({ value, onChange, onNext, onCancel }) => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 500);
  const { data, loading } = useSingaporeCitizens(debouncedSearch);

  const formatBalance = (balance) => {
    if (balance === null || balance === undefined) return "$0";
    return `$${parseFloat(balance).toLocaleString('en-US')}`;
  };

  const toggle = (acc) => {
    const accountId = acc?.educationAccountId;
    if (!accountId) {
      console.warn('Account missing educationAccountId:', acc);
      return;
    }
    
    const exists = value.some((x) => x.educationAccountId === accountId);
    onChange(exists ? value.filter((x) => x.educationAccountId !== accountId) : [...value, acc]);
  };

  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Search Account</label>
        <Input
          placeholder="Search by name or NRIC..."
          className={styles.searchInput}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Select Accounts</label>
        <Spin spinning={loading}>
          <div className={styles.accountList}>
            {data.map((acc) => (
              <div
                key={acc.educationAccountId || acc.id}
                className={`${styles.accountItem} ${
                  value.find((x) => x.educationAccountId === acc.educationAccountId)
                    ? styles.selected
                    : ""
                }`}
                onClick={() => toggle(acc)}
              >
                <Checkbox
                  checked={value.some(
                    (x) => x.educationAccountId === acc.educationAccountId
                  )}
                />
                <div>
                  <div className={styles.nameAcc}>{acc.fullName}</div>
                  <div className={styles.meta}>
                    {acc.nric}
                  </div>
                  <div className={styles.meta}>
                    Balance: {formatBalance(acc.balance)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Spin>
      </div>

      <div className={styles.footer}>
        <Button onClick={onCancel} type="default">
          Cancel
        </Button>
        <Button onClick={onNext} type="primary" disabled={value.length === 0}>
          Continue ({value.length} accounts)
        </Button>
      </div>
    </>
  );
};

export default AccountSelectList;
