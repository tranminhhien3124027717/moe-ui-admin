import React from 'react';
import ScheduledTopups from './components/ScheduledTopups.jsx';
import LatestAccountCreation from './components/LatestAccountCreation.jsx'

import styles from "./Dashboard.module.scss";

const DashboardPage = () => {
    return (
        <div className={styles.adminDashboardLayout}>
            <div className={styles.dashboardContainer}>
                <div className={styles.dashboardHeader}>
                    <h1 className={styles.title}>Admin Dashboard</h1>
                    <p className={styles.subtitle}>Overview of education account system</p>
                </div>

                <div className={styles.contentWrapper}>
                    <ScheduledTopups />
                    <LatestAccountCreation />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;