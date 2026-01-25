import React, { useState, useMemo } from "react";
import { Modal, Input, Button, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useAffectedAccounts } from "../../../../../hooks/topups/useAffectedAccounts";
import { useDebounce } from "../../../../../hooks/useDebounce";
import { formatNumberWithCommas } from "../../../../../utils/formatters";
import { getEducationLevelLabel, getSchoolingStatusLabel } from "../../../../../constants/educationMappings";
import modalStyles from "./EligibleAccountsModal.module.scss";

const EligibleAccountsModal = ({ data, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Debounce search term to avoid too many API calls
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // Fetch affected accounts using the hook with data.id as ruleId
  const { data: affectedData, loading } = useAffectedAccounts(data?.id, debouncedSearch);

  const accounts = useMemo(() => affectedData?.accounts || [], [affectedData]);
  const totalAccounts = affectedData?.totalAccounts || 0;
  const amountPerAccount = affectedData?.amountPerAccount || 0;
  const totalDisbursement = affectedData?.totalDisbursement || 0;

  return (
    <Modal
      open={true}
      onCancel={onClose}
      footer={null}
      width={920}
      centered
      destroyOnClose
      className={modalStyles.accountsModal}
      title="Eligible Accounts Details"
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', maxHeight: 'calc(80vh - 110px)' } }}
    >
      <div className={modalStyles.modalBody}>
        <div className={modalStyles.description}>
          <p>
            <strong>{data.ruleName}</strong> - Complete list of accounts matching
            the targeting criteria in real-time. The system identifies eligible
            accounts based on top-up rules.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className={modalStyles.summarySection}>
            <div className={modalStyles.summaryCard}>
              <label className={modalStyles.summaryLabel}>Total Accounts</label>
              <span className={modalStyles.summaryValue}>
                {totalAccounts}
              </span>
            </div>
            <div className={modalStyles.summaryCard}>
              <label className={modalStyles.summaryLabel}>Amount per Account</label>
              <span className={modalStyles.summaryValue}>
                S${formatNumberWithCommas(amountPerAccount, 0)}
              </span>
            </div>
            <div className={modalStyles.summaryCard}>
              <label className={modalStyles.summaryLabel}>
                Total Disbursement
              </label>
              <span className={modalStyles.summaryValue}>
                S${formatNumberWithCommas(totalDisbursement, 0)}
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className={modalStyles.searchSection}>
            <Input
              placeholder="Search by Name or NRIC..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={modalStyles.searchInput}
            />
          </div>

            {/* Accounts List */}
            <div className={modalStyles.accountsList}>
              {accounts.map((account, idx) => (
                <div key={account.accountHolderId || idx} className={modalStyles.accountItem}>
                <div className={modalStyles.accountHeader}>
                  <div>
                    <span className={modalStyles.accountNumber}>
                      #{idx + 1} {account.name}
                    </span>
                    <div className={modalStyles.nricText}>{account.nric}</div>
                  </div>
                  <span className={modalStyles.balance}>
                    Current Balance
                    <br />
                    <strong>S${formatNumberWithCommas(account.currentBalance, 0)}</strong>
                  </span>
                </div>

                <div className={modalStyles.accountDetails}>
                  <div className={modalStyles.detailRow}>
                    <span className={modalStyles.detailLabel}>Age:</span>
                    <span className={modalStyles.detailValue}>
                      {account.age} years
                    </span>
                  </div>
                  <div className={modalStyles.detailRow}>
                    <span className={modalStyles.detailLabel}>
                      Education Level:
                    </span>
                    <span className={modalStyles.detailValue}>
                      {getEducationLevelLabel(account.educationLevel)}
                    </span>
                  </div>
                  <div className={modalStyles.detailRow}>
                    <span className={modalStyles.detailLabel}>Schooling Status:</span>
                    <span className={modalStyles.detailValue}>
                      {getSchoolingStatusLabel(account.schoolingStatus)}
                    </span>
                  </div>
                </div>

                <div className={modalStyles.bottomRow}>
                  <div className={modalStyles.topUpInfo}>
                    <span className={modalStyles.topUpLabel}>Top-up Amount:</span>
                    <span className={modalStyles.topUpValue}>
                      +S${formatNumberWithCommas(account.topupAmount, 0)}
                    </span>
                  </div>
                  <div className={modalStyles.newBalanceInfo}>
                    <span className={modalStyles.newBalanceLabel}>
                      New Balance:
                    </span>
                    <span className={modalStyles.newBalanceValue}>
                      S${formatNumberWithCommas(account.newBalance, 0)}
                    </span>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className={modalStyles.footer}>
        <Button onClick={onClose} type="primary">
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default EligibleAccountsModal;
