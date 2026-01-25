import React, { useState } from "react";
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useTopUpList } from "../../hooks/topups/useTopUpList";
import TopUpsHeader from "./components/TopUpsHeader";
import TopUpsFilter from "./components/TopUpsFilter";
import TopUpsTable from "./components/TopUpsTable";
import TopUpsCreate from "./components/TopUpsCreate";
import TopUpDetail from "./components/TopUpDetail";
import styles from "./TopUpsManagement.module.scss";
import { useTopUpDetail } from "../../hooks/topups/useTopUpsDetail";

const TopUpsManagement = () => {
  // State Management
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTopUp, setSelectedTopUp] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Use the hook
  const { data, total, loading, filter, updateFilter, changePage, updateSort, resetAndFetch } = useTopUpList();

  const educationAccountId = selectedRecord?.type === 1 ? selectedRecord?.targetEducationAccountId : null;
  const { data: topUpDetail } = useTopUpDetail(selectedTopUp, educationAccountId);
  // Handlers
  const handleCreateTopUp = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleCreateSuccess = () => {
    // Refresh data after creation with sort by CreatedDate descending
    resetAndFetch();
  };

  const handleRowClick = (record) => {
    setSelectedTopUp(record.id);
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedTopUp(null);
    setSelectedRecord(null);
  };

  const handleCancelSuccess = () => {
    setDetailModalOpen(false);
    setSelectedTopUp(null);
    setSelectedRecord(null);
    resetAndFetch();
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <TopUpsHeader onCreateTopUp={handleCreateTopUp} />

        {/* Filter Section */}
        <>
          <TopUpsFilter
            filter={filter}
            updateFilter={updateFilter}
            total={total}
            dataCount={data.length}
          />

          {/* Table Section */}
          <TopUpsTable
            data={data}
            loading={loading}
            filter={filter}
            total={total}
            changePage={changePage}
            updateSort={updateSort}
            onRowClick={handleRowClick}
          />
        </>
      </div>

      {/* Create Modal */}
      <TopUpsCreate
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />

      {/* Detail Modal */}
      {detailModalOpen && selectedTopUp && (
        <TopUpDetail 
          data={topUpDetail} 
          onClose={handleCloseDetailModal} 
          onCancelSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
};

export default TopUpsManagement;
