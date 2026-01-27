import React, { useState } from "react";
import AccountHeader from "./components/AccountHeader";
import AccountFilters from "./components/AccountFilters";
import AccountTable from "./components/AccountTable";
import AccountCreate from "../AccountCreate";
import { useAccountList } from "../../../hooks/accounts/useAccountList";
import styles from "./AccountManage.module.scss";

const AccountManage = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const { loading, data, total, filter, updateFilter, changePage, updateSort, fetchData } = useAccountList();

  const showInactive = filter.IsActive === false;

  const handleToggleInactive = () => {
    updateFilter({ IsActive: showInactive });
  };

  const handleAddAccount = () => {
    setOpenCreate(true);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
    fetchData();
  };

  return (
    <div className={styles.accountContainer}>
      <AccountHeader
        showInactive={showInactive}
        onToggleInactive={handleToggleInactive}
        onAddAccount={handleAddAccount}
      />

      <AccountFilters
        filter={filter}
        updateFilter={updateFilter}
        total={total}
        dataCount={data?.length || 0}
      />

      <AccountTable
        data={data}
        loading={loading}
        filter={filter}
        total={total}
        changePage={changePage}
        updateSort={updateSort}
      />

      <AccountCreate open={openCreate} onClose={handleCloseCreate} />
    </div>
  );
};

export default AccountManage;
