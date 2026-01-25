import React, { useEffect, useState } from 'react';
import { Modal, Button, Spin, Empty, Input } from 'antd';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { topupService } from '../../../services/topupService';
import styles from './AffectedAccountsModal.module.scss';

const AffectedAccountsModal = ({ open, onCancel, ruleId, ruleName }) => {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [totalAccounts, setTotalAccounts] = useState(0);
    const [amountPerAccount, setAmountPerAccount] = useState(0);

    useEffect(() => {
        if (open && ruleId) {
            fetchAffectedAccounts();
        }
    }, [open, ruleId]);

    useEffect(() => {
        if (open && ruleId) {
            fetchAffectedAccounts(searchText);
        }
    }, [searchText]);

    const fetchAffectedAccounts = async (search = '') => {
        setLoading(true);
        try {
            const response = await topupService.getBatchRuleAffectedAccounts(ruleId, {
                Search: search || undefined,
            });
            const data = response?.data || response;
            
            setAccounts(data.accounts || []);
            setTotalAccounts(data.totalAccounts || 0);
            setAmountPerAccount(data.amountPerAccount || 0);
        } catch (error) {
            console.error('Failed to fetch affected accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '-';
        return `S$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            closeIcon={<CloseOutlined />}
            centered
            width={900}
            className={styles.modal}
        >
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>Affected Accounts List</h2>
                <p className={styles.modalSubtitle}>
                    {ruleName || 'Batch Top-up'} - Complete list of accounts
                </p>

                <div className={styles.summaryBox}>
                    <div className={styles.summaryItem}>
                        <label>Total Accounts</label>
                        <div className={styles.summaryValue}>{totalAccounts}</div>
                    </div>
                    <div className={styles.summaryItem}>
                        <label>Amount per Account</label>
                        <div className={styles.summaryValue}>{formatCurrency(amountPerAccount)}</div>
                    </div>
                    <div className={styles.summaryItem}>
                        <label>Total Disbursement</label>
                        <div className={styles.summaryValue}>{formatCurrency(totalAccounts * amountPerAccount)}</div>
                    </div>
                </div>

                <div className={styles.searchBox}>
                    <Input
                        placeholder="Search by name or NRIC..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                </div>

                <Spin spinning={loading}>
                    <div className={styles.accountsList}>
                        {accounts.length === 0 ? (
                            <Empty description="No accounts found" />
                        ) : (
                            accounts.map((account, idx) => (
                                <div key={account.accountHolderId} className={styles.accountCard}>
                                    <div className={styles.accountHeader}>
                                        <span className={styles.accountNumber}>#{idx + 1}</span>
                                        <span className={styles.accountName}>{account.name}</span>
                                        <span className={styles.accountNric}>{account.nric}</span>
                                    </div>
                                    <div className={styles.accountDetails}>
                                        <div className={styles.detailRow}>
                                            <span className={styles.label}>Age:</span>
                                            <span className={styles.value}>{account.age} years</span>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span className={styles.label}>Education Level:</span>
                                            <span className={styles.value}>{account.educationLevel}</span>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <span className={styles.label}>Schooling Status:</span>
                                            <span className={styles.value}>{account.schoolingStatus}</span>
                                        </div>
                                    </div>
                                    <div className={styles.accountBalance}>
                                        <div className={styles.balanceItem}>
                                            <label>Current Balance</label>
                                            <span className={styles.balanceValue}>{formatCurrency(account.oldBalance)}</span>
                                        </div>
                                        <div className={styles.balanceItem}>
                                            <label>Top-up Amount</label>
                                            <span className={styles.topupValue}>+{formatCurrency(account.topupAmount)}</span>
                                        </div>
                                        <div className={styles.balanceItem}>
                                            <label>New Balance</label>
                                            <span className={styles.newBalanceValue}>{formatCurrency(account.newBalance)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Spin>

                <div className={styles.modalFooter}>
                    <Button
                        size="large"
                        onClick={onCancel}
                        className={styles.closeBtn}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AffectedAccountsModal;
