// AddCourseReview.jsx
import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
    calculateCycles, getCourseDurationMonths, formatBillingDateDisplay, formatPaymentDueDisplay, formatDuration
} from './utils';
import { PAYMENT_OPTIONS, BILLING_CYCLE_OPTIONS } from './constants';
import styles from './AddCourseModal.module.scss';

// Helper component for rows
const InfoRow = ({ label, value, highlight }) => (
    <div className={styles.infoRow}>
        <span className={styles.label}>{label}:</span>
        <span className={`${styles.value} ${highlight ? styles.highlightText : ''}`}>{value}</span>
    </div>
);

const AddCourseReview = ({ 
    data, 
    providers, 
    onBack, 
    onConfirm, 
    submitting 
}) => {
    // Values from data snapshot
    const { 
        courseName, provider, mode, status, startDate, endDate, 
        paymentOption, billingCycle, calculatedFeePerCycle, calculatedTotalFee, 
        billingDate, paymentDue 
    } = data;

    const providerName = providers.find(p => p.providerId === provider)?.providerName || provider;
    
    // Display Formatters
    const paymentLabel = PAYMENT_OPTIONS.find(p => p.value === paymentOption)?.label || paymentOption;
    const cycleLabel = BILLING_CYCLE_OPTIONS.find(b => b.value === billingCycle)?.label || billingCycle;
    const duration = getCourseDurationMonths(startDate, endDate);

    return (
        <div className={styles.reviewStep}>
            <div className={styles.reviewContent}>
                
                {/* 1. General Info */}
                <div className={styles.reviewSectionGroup}>
                    <div className={styles.groupHeader}>Course Information
                    </div>
                    <div className={styles.infoGrid}>
                        <InfoRow label="Course Name" value={courseName} />
                        <InfoRow label="Provider" value={providerName} />
                        <InfoRow label="Mode" value={mode} />
                        <InfoRow label="Status" value={<span className={`${styles.statusBadge} ${status === 'Active' ? styles.statusActive : styles.statusInactive}`}>{status}</span>} />
                    </div>
                </div>

                {/* 2. Schedule */}
                <div className={styles.reviewSectionGroup}>
                    <div className={styles.groupHeader}><CalendarOutlined /> Course Schedule</div>
                    <div className={styles.infoGrid}>
                        <InfoRow label="Start Date" value={startDate ? dayjs(startDate).format('DD/MM/YYYY') : '-'} />
                        <InfoRow label="End Date" value={endDate ? dayjs(endDate).format('DD/MM/YYYY') : '-'} />
                        <InfoRow label="Duration" value={formatDuration(startDate, endDate)} />
                    </div>
                </div>

                {/* 3. Fees */}
                <div className={`${styles.reviewSectionGroup} ${styles.feeCard}`}>
                    <div className={styles.groupHeader}><DollarOutlined /> Fee Information</div>
                    <div className={styles.infoGrid}>
                        <InfoRow label="Payment Type" value={paymentLabel} />
                        
                        {paymentOption === 'Recurring' && (
                            <>
                                <InfoRow label="Billing Cycle" value={cycleLabel} />
                                <InfoRow label="Cycles" value={calculateCycles(startDate, endDate, billingCycle)} />
                                <InfoRow label="Fee per Cycle" value={`$${calculatedFeePerCycle}`} highlight />
                            </>
                        )}
                        
                        <InfoRow label="Billing Date" value={formatBillingDateDisplay(billingDate)} />
                        <InfoRow label="Payment Due" value={formatPaymentDueDisplay(paymentDue)} />
                        
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e5e7eb' }}>
                            <InfoRow label="Total Course Fee" value={`$S${parseFloat(calculatedTotalFee)}`} highlight />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AddCourseReview;