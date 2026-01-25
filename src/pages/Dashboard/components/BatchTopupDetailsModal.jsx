import React, { useEffect, useState } from 'react';
import { Modal, Button, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { dashboardService } from '../../../services/dashboardService';
import StatusTag from '../../../components/common/StatusTag/StatusTag';
import AffectedAccountsModal from './AffectedAccountsModal';
import styles from './BatchTopupDetailsModal.module.scss';

const BatchTopupDetailsModal = ({ open, onCancel, ruleId, onGoToManagement }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [affectedAccountsModalOpen, setAffectedAccountsModalOpen] = useState(false);

    useEffect(() => {
        if (open && ruleId) {
            fetchTopupDetail();
        }
    }, [open, ruleId]);

    const fetchTopupDetail = async () => {
        setLoading(true);
        try {
            const response = await dashboardService.getTopUpDetail(ruleId);
            const detailData = response?.data || response;
            setData(detailData);
        } catch (error) {
            console.error('Failed to fetch top-up detail:', error);
        } finally {
            setLoading(false);
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

    const getTargetingCriteria = () => {
        if (!data?.criteria) return [];
        const criteria = [];
        const { educationLevel, schoolingStatus, minAge, maxAge } = data.criteria;
        
        if (educationLevel) {
            criteria.push(`Education: ${educationLevel.toLowerCase()}`);
        }
        if (schoolingStatus) {
            // Handle both comma-separated and single values
            const statusValue = schoolingStatus.includes(',') 
                ? schoolingStatus.split(',').map(s => s.trim()).join(', ')
                : schoolingStatus.toLowerCase();
            criteria.push(`Residential: ${statusValue}`);
        }
        if (minAge !== null && minAge !== undefined || maxAge !== null && maxAge !== undefined) {
            const ageRange = [];
            if (minAge !== null && minAge !== undefined) ageRange.push(`min: ${minAge}`);
            if (maxAge !== null && maxAge !== undefined) ageRange.push(`max: ${maxAge}`);
            if (ageRange.length > 0) {
                criteria.push(`Age: ${ageRange.join(', ')}`);
            }
        }
        return criteria;
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
                    <h2 className={styles.modalTitle}>Batch Top-up Details</h2>
                    <p className={styles.modalSubtitle}>
                        Detailed information about the scheduled batch top-up
                    </p>

                    {data && (
                        <>
                            {/* Rule Information Section */}
                            <div className={styles.section}>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <label>Rule Name</label>
                                        <div className={styles.value}>{data.ruleName || '-'}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Status</label>
                                        <StatusTag status={getStatusString(data.status)} />
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Amount per Account</label>
                                        <div className={styles.amountValue}>
                                            {formatCurrency(data.amountPerAccount)}
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Targeted Accounts</label>
                                        <div className={styles.valueWithButton}>
                                            <span className={styles.boldValue}>
                                                {data.eligibleAccounts || 0} accounts
                                            </span>
                                            <Button 
                                                type="link" 
                                                className={styles.viewListBtn}
                                                onClick={() => setAffectedAccountsModalOpen(true)}
                                            >
                                                View List
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description and Internal Remarks */}
                            <div className={styles.section}>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <label>Description</label>
                                        <div className={styles.value}>{data.description || '-'}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Internal Remarks</label>
                                        <div className={styles.value}>{data.internalRemarks || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Information */}
                            <div className={styles.section}>
                                <h3>Schedule Information</h3><br></br>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <label>Scheduled Date</label>
                                        <div className={styles.value}>{formatDate(data.scheduledDate)}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Scheduled Time</label>
                                        <div className={styles.value}>{formatTime(data.scheduledDate)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Total Disbursement */}
                            <div className={styles.totalDisbursementBox}>
                                <label>Total Disbursement</label>
                                <div className={styles.totalAmount}>
                                    {formatCurrency(data.totalDisbursement || (data.amountPerAccount * (data.eligibleAccounts || 0)))}
                                </div>
                                <div className={styles.calculation}>
                                    {data.eligibleAccounts || 0} accounts × {formatCurrency(data.amountPerAccount)}
                                </div>
                            </div>

                            {/* Targeting Type */}
                            {data.criteria && (
                                <div className={styles.section}>
                                    <div className={styles.infoItem}>
                                        <label>Targeting Type</label>
                                        <div className={styles.boldValue}>
                                            {data.criteria.targetingType || '-'}
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Summary</label>
                                        <div className={styles.value}>
                                            Targeting: {data.criteria.targetingType || 'Customized criteria'} ({data.eligibleAccounts || 0} accounts)
                                        </div>
                                    </div>
                                    {getTargetingCriteria().length > 0 && (
                                        <div className={styles.infoItem}>
                                            <label>Targeting Criteria</label>
                                            <ul className={styles.criteriaList}>
                                                {getTargetingCriteria().map((criterion, index) => (
                                                    <li key={index}>{criterion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
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
            
            <AffectedAccountsModal
                open={affectedAccountsModalOpen}
                onCancel={() => setAffectedAccountsModalOpen(false)}
                ruleId={ruleId}
                ruleName={data?.ruleName}
            />
        </Modal>
    );
};

export default BatchTopupDetailsModal;

