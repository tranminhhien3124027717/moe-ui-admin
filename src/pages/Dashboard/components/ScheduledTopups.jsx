import React, { useState, useEffect } from 'react';
import { Table, Button, Spin } from "antd";
import { CalendarOutlined, UserOutlined, TeamOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../../services/dashboardService';
import StatusTag from '../../../components/common/StatusTag/StatusTag';
import BatchTopupDetailsModal from './BatchTopupDetailsModal';
import IndividualTopupDetailsModal from './IndividualTopupDetailsModal';
import styles from "./ScheduledTopups.module.scss";

const ScheduledTopups = () => {
    const navigate = useNavigate();
    const [viewType, setViewType] = useState('batch'); // 'batch' or 'individual'
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBatchRuleId, setSelectedBatchRuleId] = useState(null);
    const [selectedIndividualRuleId, setSelectedIndividualRuleId] = useState(null);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const typeId = viewType === 'batch' ? 0 : 1;
            const response = await dashboardService.getScheduledTopups(typeId);
            // Handle response - could be direct array or wrapped in data property
            let dataArray = [];
            if (Array.isArray(response)) {
                dataArray = response;
            } else if (response?.data) {
                dataArray = Array.isArray(response.data) ? response.data : [];
            }
            
            console.log(`[${viewType}] API response:`, response);
            console.log(`[${viewType}] Data array:`, dataArray);
            
            // Map the response to include id field for compatibility
            const mappedData = dataArray.map(item => {
                // Handle both camelCase and PascalCase field names
                const numberOfAccounts = item.numberOfAccountsAffected ?? 
                                        item.NumberOfAccountsAffected ?? 
                                        item.numberOfAccounts ?? 
                                        item.NumberOfAccounts ?? 
                                        null;
                
                const mappedItem = {
                    ...item,
                    id: item.topupRuleId || item.id || item.TopupRuleId,
                    name: item.name || item.Name,
                    topUpAmount: item.topUpAmount || item.TopUpAmount,
                    scheduledTime: item.scheduledTime || item.ScheduledTime,
                    status: item.status || item.Status,
                    numberOfAccountsAffected: numberOfAccounts
                };
                
                // For individual top-ups, fetch detail to get account holder name
                if (viewType === 'individual' && mappedItem.id) {
                    dashboardService.getTopUpDetail(mappedItem.id)
                        .then(detailResponse => {
                            const detailData = detailResponse?.data || detailResponse;
                            if (detailData?.accountName) {
                                setData(prevData => prevData.map(prevItem => 
                                    prevItem.id === mappedItem.id 
                                        ? { ...prevItem, name: detailData.accountName }
                                        : prevItem
                                ));
                            }
                        })
                        .catch(error => {
                            console.error(`Failed to fetch account name for ${mappedItem.id}:`, error);
                        });
                }
                
                // If numberOfAccountsAffected is 0 or null for batch top-ups, fetch detail to get accurate count
                if (viewType === 'batch' && (!numberOfAccounts || numberOfAccounts === 0) && mappedItem.id) {
                    dashboardService.getTopUpDetail(mappedItem.id)
                        .then(detailResponse => {
                            const detailData = detailResponse?.data || detailResponse;
                            if (detailData?.eligibleAccounts !== null && detailData?.eligibleAccounts !== undefined) {
                                setData(prevData => prevData.map(prevItem => 
                                    prevItem.id === mappedItem.id 
                                        ? { ...prevItem, numberOfAccountsAffected: detailData.eligibleAccounts }
                                        : prevItem
                                ));
                            }
                        })
                        .catch(error => {
                            console.error(`Failed to fetch account count for ${mappedItem.id}:`, error);
                        });
                }
                
                return mappedItem;
            });
            setData(mappedData); 
        } catch (error) {
            console.error("Failed to fetch Scheduled Top-ups: ", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [viewType]);

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
    
    const formatDateTime = (isoString) => {
        if (!isoString) return { date: '-', time: '-' };
        const dateObj = new Date(isoString);
        
        // Format: dd/mm/yyyy
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const date = `${day}/${month}/${year}`;

        // Format: HH:mm
        const hour = String(dateObj.getHours()).padStart(2, '0');
        const minute = String(dateObj.getMinutes()).padStart(2, '0');
        const time = `${hour}:${minute}`;

        return { date, time };
    };

    const batchColumns = [
        {
            title: 'Rule Name',
            dataIndex: 'name',
            key: 'name',
            width: '40%',
            render: (text, record) => {
                // Use numberOfAccountsAffected from API, but if it's 0 or null, 
                // it might not be calculated yet. We'll show what we have.
                const accountCount = record.numberOfAccountsAffected ?? record.NumberOfAccountsAffected ?? null;
                const displayCount = accountCount !== null && accountCount !== undefined ? accountCount : 0;
                return (
                    <div className={styles.ruleCell}>
                        <span className={styles.ruleName}>{text}</span>
                        <span className={styles.accountCount}>
                            {displayCount > 0 ? `${displayCount} accounts` : '0 accounts'}
                        </span>
                    </div>
                );
            },
        },
        {
            title: 'Amount',
            dataIndex: 'topUpAmount',
            key: 'topUpAmount',
            render: (amount) => <span className={styles.amountText}>${(amount || 0).toLocaleString('en-US')}</span>,
        },
        {
            title: 'Scheduled',
            dataIndex: 'scheduledTime',
            key: 'scheduledTime',
            align: 'center',
            render: (text) => {
                const { date, time } = formatDateTime(text);
                return (
                    <div className={styles.dateTimeCell}>
                        <span className={styles.date}>{date}</span>
                        <span className={styles.time}>{time}</span>
                    </div>
                );
            },
        },
        {
            title: 'Top up Status',
            dataIndex: 'status',
            key: 'status',
            align: 'left',
            render: (status) => (
                <StatusTag status={getStatusString(status)} />
            ),
        },
    ];

    const handleRowClick = async (record) => {
        if (viewType === 'batch') {
            setSelectedBatchRuleId(record.id);
            setIsBatchModalOpen(true);
            
            // If numberOfAccountsAffected is 0 or null, fetch detail to get accurate count
            if ((!record.numberOfAccountsAffected || record.numberOfAccountsAffected === 0) && record.id) {
                try {
                    const detailResponse = await dashboardService.getTopUpDetail(record.id);
                    const detailData = detailResponse?.data || detailResponse;
                    if (detailData?.eligibleAccounts !== null && detailData?.eligibleAccounts !== undefined) {
                        // Update the record in data array with accurate count
                        setData(prevData => prevData.map(item => 
                            item.id === record.id 
                                ? { ...item, numberOfAccountsAffected: detailData.eligibleAccounts }
                                : item
                        ));
                    }
                } catch (error) {
                    console.error('Failed to fetch account count:', error);
                }
            }
        } else {
            // For individual, we'll get accountId from the detail API response
            setSelectedIndividualRuleId(record.id);
            setSelectedAccountId(record.accountId || record.accountHolderId || null);
            setIsIndividualModalOpen(true);
        }
    };

    const handleGoToManagement = () => {
        navigate('/topup');
    };

    const individualColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '30%',
            render: (text) => <span className={styles.ruleName}>{text}</span>,
        },
        {
            title: 'Amount',
            dataIndex: 'topUpAmount',
            key: 'topUpAmount',
            render: (amount) => <span className={styles.amountText}>${(amount || 0).toLocaleString('en-US')}</span>,
        },
        {
            title: 'Scheduled',
            dataIndex: 'scheduledTime',
            key: 'scheduledTime',
            align: 'center',
            render: (text) => {
                const { date, time } = formatDateTime(text);
                return (
                    <div className={styles.dateTimeCell}>
                        <span className={styles.date}>{date}</span>
                        <span className={styles.time}>{time}</span>
                    </div>
                );
            },
        },
        {
            title: 'Top up Status',
            dataIndex: 'status',
            key: 'status',
            align: 'left',
            render: (status) => (
                <StatusTag status={getStatusString(status)} />
            ),
        },
    ];

    return (
        <div className={styles.cardContainer}>
            <div className={styles.cardHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconBox}>
                        <CalendarOutlined />
                    </div>
                    <div>
                        <h3 className={styles.title}>Scheduled Top-ups</h3>
                        <p className={styles.subTitle}>Scheduled top-ups within the next 30 days</p>
                    </div>
                </div>
                <Button className={styles.viewAllBtn} onClick={() => navigate('/topup')}>
                    View All <ArrowRightOutlined style={{ fontSize: '12px' }} />
                </Button>
            </div>

            <div className={styles.filterControl}>
                <button 
                    className={`${styles.toggleBtn} ${viewType === 'batch' ? styles.active : ''}`}
                    onClick={() => setViewType('batch')}
                >
                    <TeamOutlined /> Batch
                </button>
                <button 
                    className={`${styles.toggleBtn} ${viewType === 'individual' ? styles.active : ''}`}
                    onClick={() => setViewType('individual')}
                >
                    <UserOutlined /> Individual
                </button>
            </div>
            
            <Spin spinning={loading}>
                <div className={styles.tableWrapper}>
                    <Table
                        columns={viewType === 'batch' ? batchColumns : individualColumns}
                        dataSource={data}
                        rowKey={(record, index) => {
                            const id = record.id || record.topupRuleId || record.TopupRuleId;
                            return id ? `${id}-${index}` : `row-${index}`;
                        }}
                        pagination={false}
                        className={styles.customTable}
                        onRow={(record) => ({
                            onClick: () => handleRowClick(record),
                            style: { cursor: 'pointer' }
                        })}
                    />
                </div>
            </Spin>

            <BatchTopupDetailsModal
                open={isBatchModalOpen}
                onCancel={() => {
                    setIsBatchModalOpen(false);
                    setSelectedBatchRuleId(null);
                }}
                ruleId={selectedBatchRuleId}
                onGoToManagement={handleGoToManagement}
            />

            <IndividualTopupDetailsModal
                open={isIndividualModalOpen}
                onCancel={() => {
                    setIsIndividualModalOpen(false);
                    setSelectedIndividualRuleId(null);
                    setSelectedAccountId(null);
                }}
                ruleId={selectedIndividualRuleId}
                accountId={selectedAccountId}
                onGoToManagement={handleGoToManagement}
            />
        </div>
    );
}

export default ScheduledTopups;