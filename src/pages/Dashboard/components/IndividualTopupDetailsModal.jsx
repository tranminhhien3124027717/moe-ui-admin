import React, { useEffect, useState } from 'react';
import { Modal, Button, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { dashboardService } from '../../../services/dashboardService';
import { accountService } from '../../../services/accountService';
import StatusTag from '../../../components/common/StatusTag/StatusTag';
import styles from './IndividualTopupDetailsModal.module.scss';

const IndividualTopupDetailsModal = ({ open, onCancel, ruleId, accountId, onGoToManagement }) => {
    const [loading, setLoading] = useState(false);
    const [topupData, setTopupData] = useState(null);
    const [accountData, setAccountData] = useState(null);

    useEffect(() => {
        if (open && ruleId) {
            fetchTopupDetail();
        }
    }, [open, ruleId]);

    useEffect(() => {
        // Fetch account detail if we have accountId from topupData or prop
        const targetAccountId = topupData?.accountId || accountId;
        if (open && targetAccountId) {
            fetchAccountDetail(targetAccountId);
        }
    }, [open, topupData?.accountId, accountId]);

    const fetchTopupDetail = async () => {
        setLoading(true);
        try {
            const response = await dashboardService.getTopUpDetail(ruleId);
            const detailData = response?.data || response;
            setTopupData(detailData);
        } catch (error) {
            console.error('Failed to fetch top-up detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAccountDetail = async (targetAccountId) => {
        try {
            const response = await accountService.getAccountById(targetAccountId);
            const accountDetail = response?.data || response;
            setAccountData(accountDetail);
        } catch (error) {
            console.error('Failed to fetch account detail:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '-';
        return `S$${amount.toLocaleString('en-US')}`;
    };

    const getStatusString = (status) => {
        // Handle null, undefined, or empty values
        if (status === null || status === undefined || status === '') {
            return 'Scheduled';
        }
        // Convert numeric status to string
        if (typeof status === 'number') {
            const statusMap = {
                0: 'Scheduled',
                1: 'Cancelled',
                2: 'Completed',
                3: 'Failed'
            };
            return statusMap[status] || 'Scheduled';
        }
        // Ensure it's a string
        return String(status) || 'Scheduled';
    };

    const getAccountHolderName = () => {
        return topupData?.accountName || accountData?.fullName || '-';
    };

    const getNRIC = () => {
        return accountData?.nric || accountData?.studentInformation?.nric || '-';
    };

    const getCurrentBalance = () => {
        return accountData?.balance || accountData?.educationAccount?.balance || 0;
    };

    const getAccountStatus = () => {
        const status = accountData?.status || accountData?.educationAccount?.status;
        // Ensure it's always a string
        if (status === null || status === undefined) {
            return 'Active';
        }
        return String(status);
    };

    const getBalanceAfterTopup = () => {
        const currentBalance = getCurrentBalance();
        const topupAmount = topupData?.amountPerAccount || 0;
        return currentBalance + topupAmount;
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            closeIcon={<CloseOutlined />}
            centered
            width={720}
            className={styles.modal}
        >
            <Spin spinning={loading}>
                <div className={styles.modalContent}>
                    <h2 className={styles.modalTitle}>Individual Top-up Details</h2>
                    <p className={styles.modalSubtitle}>
                        Detailed information about the scheduled individual top-up
                    </p>

                    {topupData && (
                        <>
                            {/* Top-up and Account Holder Information */}
                            <div className={styles.section}>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <label>Account Holder</label>
                                        <div className={styles.value}>{getAccountHolderName()}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Status</label>
                                        <StatusTag status={getStatusString(topupData.status)} />
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Top-up Amount</label>
                                        <div className={styles.amountValue}>
                                            {formatCurrency(topupData.amountPerAccount)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description and Internal Remarks */}
                            <div className={styles.section}>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <label>Description</label>
                                        <div className={styles.value}>{topupData.description || '-'}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Internal Remarks</label>
                                        <div className={styles.value}>{topupData.internalRemarks || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Information */}
                            <div className={styles.section}>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <label>Scheduled Date</label>
                                        <div className={styles.value}>{formatDate(topupData.scheduledDate)}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Scheduled Time</label>
                                        <div className={styles.value}>{formatTime(topupData.scheduledDate)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className={styles.section}>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <label>NRIC</label>
                                        <div className={styles.value}>{getNRIC()}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Current Balance</label>
                                        <div className={styles.value}>
                                            {formatCurrency(getCurrentBalance())}
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Account Status</label>
                                        <StatusTag status={getAccountStatus()} />
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Balance After Top-up</label>
                                        <div className={styles.balanceAfterValue}>
                                            {formatCurrency(getBalanceAfterTopup())}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Footer Actions */}
                    <div className={styles.modalFooter}>
                        <Button
                            size="large"
                            onClick={onCancel}
                            className={styles.closeBtn}
                        >
                            Close
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            onClick={onGoToManagement}
                            className={styles.goToBtn}
                        >
                            Go to Top-Up Management
                        </Button>
                    </div>
                </div>
            </Spin>
        </Modal>
    );
};

export default IndividualTopupDetailsModal;

