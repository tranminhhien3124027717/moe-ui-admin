import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, Empty, Table, Tag } from 'antd';
import {
    ArrowLeftOutlined,
    DollarOutlined,
    UserOutlined,
    BookOutlined,
    BankOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import { accountService } from '../../../services/accountService';
import StatusTag from '../../../components/common/StatusTag/StatusTag';
import styles from './index.module.scss';
import { formatCurrency2 } from '../../../utils/formatters';

const StudentCourseDetail = () => {
    const { accountHolderId, courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStudentCourseDetail();
    }, [accountHolderId, courseId]);

    const fetchStudentCourseDetail = async () => {
        try {
            setLoading(true);
            const response = await accountService.getStudentCourseDetail(accountHolderId, courseId);
            setData(response.data);
        } catch (err) {
            setError(err.message || 'Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '-';
        return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        
        // Convert UTC to UTC+7
        const utcTime = date.getTime();
        const utcOffset = date.getTimezoneOffset() * 60000;
        const utc7Offset = 7 * 60 * 60000;
        const localTime = new Date(utcTime + utcOffset + utc7Offset);
        
        return localTime.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getBillingCycleLabel = (cycle) => {
        const labels = {
            'Monthly': 'Monthly',
            'Quarterly': 'Quarterly',
            'Biannually': 'Bi-annually',
            'Yearly': 'Annually'
        };
        return labels[cycle] || cycle;
    };

    const getPaymentStatusTag = (status) => {
        const statusMap = {
            'Outstanding': { color: 'warning', text: 'Outstanding' },
            'PartiallyPaid': { color: 'processing', text: 'Partially Paid' },
            'Clear': { color: 'success', text: 'Paid' },
            'Overdue': { color: 'error', text: 'Overdue' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const formatPaymentMethod = (method) => {
        if (!method) return '-';
        // Special case for Combined payment method
        if (method === 'Combined') return 'Balance + Bank Transfer';
        // Add space before capital letters for better readability
        return method
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
            .trim();
    };

    // Outstanding Fees table columns
    const outstandingFeeColumns = [
        {
            title: 'Billing Cycle',
            dataIndex: 'billingCycle',
            key: 'billingCycle',
            render: (cycle) => cycle || '-'
        },
        {
            title: 'Billing Date',
            dataIndex: 'billingDate',
            key: 'billingDate',
            render: (date) => formatDate(date)
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date) => formatDate(date)
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => <span style={{ fontWeight: 600 }}>{formatCurrency2(amount)}</span>
        },
        {
            title: 'Paid',
            dataIndex: 'paid',
            key: 'paid',
            render: (amount) => <span style={{ fontWeight: 600, color: '#66b30e' }}>{formatCurrency2(amount)}</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getPaymentStatusTag(status)
        }
    ];

    // Payment History table columns
    const paymentHistoryColumns = [
        {
            title: 'Payment Date',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            render: (date) => formatDate(date)
        },
        {
            title: 'Course Name',
            dataIndex: 'courseName',
            key: 'courseName'
        },
        {
            title: 'Paid Cycle',
            dataIndex: 'paidCycle',
            key: 'paidCycle'
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => <span style={{ fontWeight: 600 }}>S${formatCurrency(amount)}</span>
        },
        {
            title: 'Payment Method',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => formatPaymentMethod(method)
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getPaymentStatusTag(status)
        }
    ];

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className={styles.emptyContainer}>
                <Empty description={error || "Course details not found"} />
                <Button type="primary" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>
                    <ArrowLeftOutlined /> Back to Student
                </Button>
            </div>
        );
    }

    const { 
        accountHolder, 
        course, 
        enrollment, 
        paymentSummary, 
        outstandingFees = [], 
        paymentHistory = [] 
    } = data;

    return (
        <div className={styles.studentCourseDetailContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        type="text"
                        className={styles.backBtn}
                    />
                    <div>
                        <div className={styles.titleRow}>
                            <h1 className={styles.pageTitle}>{course.courseName}</h1>
                            <StatusTag status={course.status} />
                        </div>
                        <div className={styles.subtitle}>
                            <UserOutlined style={{ marginRight: 8 }} />
                            <span>{accountHolder.fullName}</span>
                            <span style={{ margin: '0 8px' }}>•</span>
                            <span>{course.providerName}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className={styles.statsContainer}>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#e0f2fe' }}>
                            <DollarOutlined style={{ color: '#0284c7', fontSize: 24 }} />
                        </div>
                        <div className={styles.statDetails}>
                            <div className={styles.statLabel}>Total Fee</div>
                            <div className={styles.statValue}>S${formatCurrency(course.totalFee)}</div>
                        </div>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#eef7ec' }}>
                            <DollarOutlined style={{ color: '#66b30e', fontSize: 24 }} />
                        </div>
                        <div className={styles.statDetails}>
                            <div className={styles.statLabel}>Total Paid</div>
                            <div className={styles.statValue} style={{ color: '#66b30e' }}>S${formatCurrency(paymentSummary.totalPaid)}</div>
                        </div>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7' }}>
                            <DollarOutlined style={{ color: '#f59e0b', fontSize: 24 }} />
                        </div>
                        <div className={styles.statDetails}>
                            <div className={styles.statLabel}>Outstanding</div>
                            <div className={styles.statValue} style={{ color: '#f59e0b' }}>S${formatCurrency(paymentSummary.outstanding)}</div>
                        </div>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#f0f9ff' }}>
                            <ClockCircleOutlined style={{ color: '#0891b2', fontSize: 24 }} />
                        </div>
                        <div className={styles.statDetails}>
                            <div className={styles.statLabel}>Billing Cycle</div>
                            <div className={styles.statValue} style={{ fontSize: '18px' }}>{getBillingCycleLabel(course.billingCycle)}</div>
                        </div>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#f3e8ff' }}>
                            <BookOutlined style={{ color: '#9333ea', fontSize: 24 }} />
                        </div>
                        <div className={styles.statDetails}>
                            <div className={styles.statLabel}>Total Enrolled</div>
                            <div className={styles.statValue} style={{ color: '#9333ea' }}>{accountHolder.totalEnrolledCourses || 0}</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Course Information */}
            <Card title="Course Information" className={styles.infoCard}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', padding: '4px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <BookOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Course Name</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{course.courseName}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <BankOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Provider</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{course.providerName}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <BookOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Education Level</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{course.educationLevel || 'Not Set'}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CheckCircleOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Status</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                <StatusTag status={course.status} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CalendarOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Course Start Date</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                {formatDate(course.startDate)}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CalendarOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Course End Date</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                {course.endDate ? formatDate(course.endDate) : 'Ongoing'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <BookOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Mode of Training</div>
                            <div style={{ fontWeight: 500, color: '#0f172a', textTransform: 'capitalize' }}>{course.modeOfTraining || 'Online'}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CalendarOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Enrolled Since</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{formatDate(enrollment.enrollmentDate)}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CalendarOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Billing Date</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                {course.billingDate
                                    ? `${course.billingDate}${course.billingDate === 1 ? 'st' : course.billingDate === 2 ? 'nd' : course.billingDate === 3 ? 'rd' : 'th'} of the month`
                                    : '-'
                                }
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CreditCardOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Payment Due</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                {course.paymentDue ? `${course.paymentDue} days after billing` : '-'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <DollarOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Fee per Cycle</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                S${formatCurrency(course.feePerCycle)} / {getBillingCycleLabel(course.billingCycle)}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Outstanding Fees */}
            {outstandingFees.length > 0 && (
                <Card title="Outstanding Fees" className={styles.chargesCard}>
                    <Table
                        columns={outstandingFeeColumns}
                        dataSource={outstandingFees}
                        rowKey="id"
                        pagination={false}
                        locale={{ emptyText: 'No outstanding fees' }}
                    />
                </Card>
            )}

            {/* Payment History */}
            <Card title="Payment History" className={styles.chargesCard}>
                <Table
                    columns={paymentHistoryColumns}
                    dataSource={paymentHistory}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: 'No payment history yet' }}
                />
            </Card>
        </div>
    );
};

export default StudentCourseDetail;
