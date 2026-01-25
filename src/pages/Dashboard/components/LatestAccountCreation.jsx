import React, { useState, useEffect } from 'react';
import { Spin, Table } from 'antd';
import { FieldTimeOutlined } from '@ant-design/icons';
import { dashboardService } from '../../../services/dashboardService';
import styles from './LatestAccountCreation.module.scss';

const LatestAccountCreation = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const response = await dashboardService.getLatestAccountCreation();
            const dataArray = Array.isArray(response) ? response : (response?.data || []);
            setData(dataArray);
        } catch (error) {
            console.error("Failed to fetch Latest Account Creation: ", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const formatDate = (isoString) => {
        if (!isoString) return '-';
        const dateObj = new Date(isoString);
        // Format: 15/01/2026 (dd/mm/yyyy)
        return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
            render: (text) => <span className={styles.nameText}>{text}</span>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '35%',
            render: (text) => <span className={styles.emailText}>{text}</span>,
        },
        {
            title: 'Created by',
            dataIndex: 'createdBy',
            key: 'createdBy',
            width: '20%',
            render: (text) => <span className={styles.creatorText}>{text || 'Admin'}</span>,
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '20%',
            align: 'left', // Align Left for created date
            render: (createdAt) => <span className={styles.dateText}>{formatDate(createdAt)}</span>,
        },
    ];

    return (
        <div className={styles.cardContainer}>
            <div className={styles.cardHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconBox}>
                        <FieldTimeOutlined />
                    </div>
                    <div>
                        <h3 className={styles.title}>Latest Account Creation</h3>
                        <p className={styles.subTitle}>Accounts created within the last 7 days</p>
                    </div>
                </div>
            </div>

            <Spin spinning={loading}>
                <div className={styles.tableWrapper}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey={(record) => record.key || record.accountId || Math.random()}
                        pagination={false}
                        className={styles.customTable}
                    />
                </div>
            </Spin>
        </div>
    );
};

export default LatestAccountCreation;