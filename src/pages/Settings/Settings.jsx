import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Table,
  Modal,
  Checkbox,
  Tag,
  Pagination,
  Space,
  message,
  Spin,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BuildOutlined,
  CalendarOutlined,
  UserDeleteOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useProviders } from '../../hooks/settings/useProviders';
import { useGlobalSettings } from '../../hooks/settings/useGlobalSettings';
import styles from './Settings.module.scss';

const { Option } = Select;

const Settings = () => {
  // Use custom hooks
  const { 
    providers, 
    loading: providersLoading, 
    createProvider: createProviderAPI,
    updateProvider: updateProviderAPI,
    deleteProvider: deleteProviderAPI,
    activateProvider: activateProviderAPI,
    deactivateProvider: deactivateProviderAPI,
    getProviderSchoolingLevels,
    fetchAllSchoolingLevels,
    fetchProviders 
  } = useProviders();
  console.log('Providers:', providers);
  
  const { 
    settings, 
    loading: settingsLoading, 
    updateSettings: updateSettingsAPI 
  } = useGlobalSettings();

  // Loading state for operations
  const [loading, setLoading] = useState(false);
  const [allSchoolingLevels, setAllSchoolingLevels] = useState([]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderEducationLevels, setNewProviderEducationLevels] = useState([]);
  const [editingProvider, setEditingProvider] = useState(null);
  const [toggleStatusProvider, setToggleStatusProvider] = useState(null);
  const [deleteProvider, setDeleteProvider] = useState(null);

  const [billingDay, setBillingDay] = useState('5');
  const [billingDueDaysAfter, setBillingDueDaysAfter] = useState('30');
  const [isBillingEditMode, setIsBillingEditMode] = useState(false);
  const [originalBillingDay, setOriginalBillingDay] = useState('5');
  const [originalBillingDueDaysAfter, setOriginalBillingDueDaysAfter] = useState('30');

  // Account Creation Configuration
  const [creationMonth, setCreationMonth] = useState('1');
  const [creationDay, setCreationDay] = useState('5');
  const [originalCreationMonth, setOriginalCreationMonth] = useState('1');
  const [originalCreationDay, setOriginalCreationDay] = useState('5');

  // Account Closure Configuration
  const [closureMonth, setClosureMonth] = useState('12');
  const [closureDay, setClosureDay] = useState('31');
  const [originalClosureMonth, setOriginalClosureMonth] = useState('12');
  const [originalClosureDay, setOriginalClosureDay] = useState('31');
  
  // Unified edit mode for both creation and closure
  const [isAccountLifecycleEditMode, setIsAccountLifecycleEditMode] = useState(false);

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setBillingDay(settings.billingDate?.toString() || '5');
      setBillingDueDaysAfter(settings.dueToDate?.toString() || '30');
      setOriginalBillingDay(settings.billingDate?.toString() || '5');
      setOriginalBillingDueDaysAfter(settings.dueToDate?.toString() || '30');
      
      setCreationMonth(settings.creationMonth?.toString() || '1');
      setCreationDay(settings.creationDay?.toString() || '5');
      setOriginalCreationMonth(settings.creationMonth?.toString() || '1');
      setOriginalCreationDay(settings.creationDay?.toString() || '5');
      
      setClosureMonth(settings.closureMonth?.toString() || '12');
      setClosureDay(settings.closureDay?.toString() || '31');
      setOriginalClosureMonth(settings.closureMonth?.toString() || '12');
      setOriginalClosureDay(settings.closureDay?.toString() || '31');
    }
  }, [settings]);

  // Fetch all schooling levels on mount
  useEffect(() => {
    const loadSchoolingLevels = async () => {
      const levels = await fetchAllSchoolingLevels();
      setAllSchoolingLevels(levels);
    };
    loadSchoolingLevels();
  }, []);

  // Provider search and pagination
  const [providerSearchQuery, setProviderSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and paginate providers
  const filteredProviders = useMemo(() => {
    if (!Array.isArray(providers)) {
      return [];
    }
    
    const filtered = providers
      .filter(provider => 
        provider && 
        provider.providerName && 
        provider.providerName.toLowerCase().includes(providerSearchQuery.toLowerCase())
      )
      .sort((a, b) => (a.providerName || '').localeCompare(b.providerName || ''));
    
    return filtered;
  }, [providers, providerSearchQuery]);

  const paginatedProviders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filteredProviders.slice(startIndex, startIndex + itemsPerPage);
    return paginated;
  }, [filteredProviders, currentPage]);

  const handleSearchChange = (e) => {
    setProviderSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleAddProvider = async () => {
    if (!newProviderName.trim()) {
      message.error('Please enter a provider name');
      return;
    }

    if (newProviderEducationLevels.length === 0) {
      message.error('Please select at least one education level');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: newProviderName.trim(),
        status: 'Active',
        schoolingLevelIds: newProviderEducationLevels,
      };

      await createProviderAPI(payload);
      setNewProviderName('');
      setNewProviderEducationLevels([]);
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleEditProvider = async () => {
    if (!editingProvider || !editingProvider.providerName.trim()) {
      message.error('Please enter a provider name');
      return;
    }

    if (editingProvider.educationLevels.length === 0) {
      message.error('Please select at least one education level');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: editingProvider.providerId,
        name: editingProvider.providerName.trim(),
        status: editingProvider.status || 'Active',
        schoolingLevelIds: editingProvider.educationLevels || [],
      };

      await updateProviderAPI(editingProvider.providerId, payload);
      setEditingProvider(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProviderStatus = async () => {
    if (!toggleStatusProvider) return;

    setLoading(true);
    try {
      // Check both status string and isActive boolean
      const isCurrentlyActive = toggleStatusProvider.status === 'Active' || 
                                toggleStatusProvider.status === 'active' || 
                                toggleStatusProvider.isActive === true;
      
      if (isCurrentlyActive) {
        await deactivateProviderAPI(toggleStatusProvider.providerId);
      } else {
        await activateProviderAPI(toggleStatusProvider.providerId);
      }

      setToggleStatusProvider(null);
      setIsToggleStatusDialogOpen(false);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = async (provider) => {
    try {
      // Check if provider already has schoolingLevels data (from list response)
      if (provider.schoolingLevels && provider.schoolingLevels.length > 0) {
        const schoolingLevelIds = provider.schoolingLevels.map(level => level.id);
        setEditingProvider({ 
          ...provider, 
          educationLevels: schoolingLevelIds,
          schoolingLevelsData: provider.schoolingLevels
        });
        setIsEditDialogOpen(true);
      } else {
        // Fallback: fetch schooling levels if not included in list response
        setLoading(true);
        const schoolingLevels = await getProviderSchoolingLevels(provider.providerId);
        const schoolingLevelIds = schoolingLevels.map(level => level.id);
        
        setEditingProvider({ 
          ...provider, 
          educationLevels: schoolingLevelIds,
          schoolingLevelsData: schoolingLevels
        });
        setIsEditDialogOpen(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load provider details for editing:', error);
      setLoading(false);
    }
  };

  const openToggleStatusDialog = (provider) => {
    setToggleStatusProvider(provider);
    setIsToggleStatusDialogOpen(true);
  };

  const openDeleteDialog = (provider) => {
    setDeleteProvider(provider);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProvider = async () => {
    if (!deleteProvider) return;

    setLoading(true);
    try {
      await deleteProviderAPI(deleteProvider.providerId);
      setDeleteProvider(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBillingDate = async () => {
    setLoading(true);
    try {
      const payload = {
        billingDate: parseInt(billingDay),
        dueToDate: parseInt(billingDueDaysAfter),
        closureMonth: parseInt(closureMonth),
        closureDay: parseInt(closureDay),
      };

      await updateSettingsAPI(payload);
      setOriginalBillingDay(billingDay);
      setOriginalBillingDueDaysAfter(billingDueDaysAfter);
      setIsBillingEditMode(false);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBillingEdit = () => {
    setBillingDay(originalBillingDay);
    setBillingDueDaysAfter(originalBillingDueDaysAfter);
    setIsBillingEditMode(false);
  };

  const handleSaveAccountLifecycleConfig = async () => {
    setLoading(true);
    try {
      const payload = {
        billingDate: parseInt(billingDay),
        dueToDate: parseInt(billingDueDaysAfter),
        creationMonth: parseInt(creationMonth),
        creationDay: parseInt(creationDay),
        closureMonth: parseInt(closureMonth),
        closureDay: parseInt(closureDay),
      };

      await updateSettingsAPI(payload);
      setOriginalCreationMonth(creationMonth);
      setOriginalCreationDay(creationDay);
      setOriginalClosureMonth(closureMonth);
      setOriginalClosureDay(closureDay);
      setIsAccountLifecycleEditMode(false);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAccountLifecycleEdit = () => {
    setCreationMonth(originalCreationMonth);
    setCreationDay(originalCreationDay);
    setClosureMonth(originalClosureMonth);
    setClosureDay(originalClosureDay);
    setIsAccountLifecycleEditMode(false);
  };

  const providerColumns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      title: 'Provider Name',
      dataIndex: 'providerName',
      key: 'providerName',
    },
    {
      title: 'Education Levels',
      dataIndex: 'educationLevels',
      key: 'educationLevels',
      render: (levels) => (
        <Space size={[4, 4]} wrap>
          {(Array.isArray(levels) ? levels : []).map((level, index) => (
            <Tag 
              key={`${level}-${index}`}
              style={{
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {level}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => {
        // API might return 'status' as string or 'isActive' as boolean
        const isActive = status === 'Active' || status === 'active' || record.isActive === true;
        return (
          <Tag 
            style={{
              backgroundColor: isActive ? '#f0fdf4' : '#f8fafc',
              color: isActive ? '#15803d' : '#64748b',
              border: isActive ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space size={8}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditDialog(record)}
            style={{
              height: '32px',
              borderRadius: '6px',
              borderColor: '#e2e8f0',
              color: '#475569',
            }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => openDeleteDialog(record)}
            style={{
              height: '32px',
              borderRadius: '6px',
              borderColor: '#fecaca',
              color: '#b91c1c',
            }}
          />
          <Button
            size="small"
            danger={record.status === 'Active' || record.status === 'active' || record.isActive === true}
            type={(record.status === 'Active' || record.status === 'active' || record.isActive === true) ? 'default' : 'primary'}
            onClick={() => openToggleStatusDialog(record)}
            style={{
              height: '32px',
              borderRadius: '6px',
              minWidth: '90px',
              fontWeight: 500,
              fontSize: '13px',
              ...((record.status === 'Active' || record.status === 'active' || record.isActive === true)
                ? { borderColor: '#fecaca', color: '#b91c1c' }
                : { backgroundColor: '#15803d', borderColor: '#15803d' }
              )
            }}
          >
            {(record.status === 'Active' || record.status === 'active' || record.isActive === true) ? 'Deactivate' : 'Activate'}
          </Button>
        </Space>
      ),
    },
  ];

  const getDaySuffix = (day) => {
    const d = parseInt(day);
    if (d === 1) return 'st';
    if (d === 2) return 'nd';
    if (d === 3) return 'rd';
    return 'th';
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(month) - 1];
  };

  return (
    <div className={styles.settingsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1>System Settings</h1>
        <p>Configure course providers, billing settings, and account management</p>
      </div>

      {/* Course Providers */}
      <Card className={styles.settingsCard}>
        <Spin spinning={providersLoading}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.iconWrapper}>
                <BuildOutlined className={styles.icon} />
              </div>
              <div>
                <h2>Course Providers</h2>
                <p>Manage available course providers</p>
              </div>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setIsAddDialogOpen(true)}
              className={styles.addButton}
              disabled={providersLoading}
            >
              Add Provider
            </Button>
          </div>

        <div className={styles.searchBar}>
          <Input
            placeholder="Search providers by name..."
            prefix={<SearchOutlined />}
            value={providerSearchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className={styles.tableWrapper}>
          <Table
            columns={providerColumns}
            dataSource={paginatedProviders}
            rowKey="id"
            pagination={false}
            locale={{
              emptyText: providerSearchQuery
                ? 'No providers found matching your search.'
                : 'No course providers found. Add one to get started.'
            }}
          />
        </div>

        {filteredProviders.length > 0 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProviders.length)} of {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''}
            </div>
            <Pagination
              current={currentPage}
              total={filteredProviders.length}
              pageSize={itemsPerPage}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          </div>
        )}
        </Spin>
      </Card>

      {/* Billing Configuration */}
      <Card className={styles.settingsCard}>
        <Spin spinning={settingsLoading}>
          <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#e6f7f1' }}>
              <CalendarOutlined className={styles.icon} style={{ color: '#52c41a' }} />
            </div>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                Billing Configuration
                <Tooltip 
                  title="The system generates bills on the configured day of each billing cycle month (e.g., for quarterly billing, bills are generated in January, April, July, and October). Payment deadlines are calculated based on the number of days after the billing date."
                  overlayStyle={{ maxWidth: '400px' }}
                >
                  <QuestionCircleOutlined style={{ fontSize: '14px', color: '#8c8c8c', cursor: 'help' }} />
                </Tooltip>
              </h2>
              <p>Set site-wide billing date and due date</p>
            </div>
          </div>
          {!isBillingEditMode && (
            <Button icon={<EditOutlined />} onClick={() => setIsBillingEditMode(true)}>
              Edit
            </Button>
          )}
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formItem}>
            <label>Billing Date (Day of Month)</label>
            <Select
              value={billingDay}
              onChange={setBillingDay}
              disabled={!isBillingEditMode}
              style={{ width: '100%' }}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map(day => (
                <Option key={day} value={day.toString()}>
                  {day}{getDaySuffix(day.toString())} of the month
                </Option>
              ))}
            </Select>
            <p className={styles.fieldHint}>Date when bills are generated</p>
          </div>

          <div className={styles.formItem}>
            <label>Payment Due</label>
            <Select
              value={billingDueDaysAfter}
              onChange={setBillingDueDaysAfter}
              disabled={!isBillingEditMode}
              style={{ width: '100%' }}
            >
              <Option value="15">15 days after billing date</Option>
              <Option value="30">30 days after billing date</Option>
            </Select>
            <p className={styles.fieldHint}>Days after billing date for payment deadline</p>
          </div>
        </div>

        {isBillingEditMode && (
          <div className={styles.actionButtons}>
            <Button type="primary" onClick={handleSaveBillingDate} loading={loading}>
              Save Billing Configuration
            </Button>
            <Button onClick={handleCancelBillingEdit}>Cancel</Button>
          </div>
        )}
        </Spin>
      </Card>

      {/* Auto Education Account Creation & Closure Configuration */}
      <Card className={styles.settingsCard}>
        <Spin spinning={settingsLoading}>
          <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#e6f7ff' }}>
              <UserAddOutlined className={styles.icon} style={{ color: '#1890ff' }} />
            </div>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                Auto Education Creation & Closure
                <Tooltip 
                  title="The system automatically creates Education Accounts for Singapore Citizens turning 16 on the configured creation date each year. Accounts are automatically closed on the configured closure date for those turning 30. Both actions are based on calendar year, not individual birthdays."
                  overlayStyle={{ maxWidth: '400px' }}
                >
                  <QuestionCircleOutlined style={{ fontSize: '14px', color: '#8c8c8c', cursor: 'help' }} />
                </Tooltip>
              </h2>
              <p>Configure automatic Education Account creation and closure for Singapore Citizens</p>
            </div>
          </div>
          {!isAccountLifecycleEditMode && (
            <Button icon={<EditOutlined />} onClick={() => setIsAccountLifecycleEditMode(true)}>
              Edit
            </Button>
          )}
        </div>

        {/* Account Creation Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <UserAddOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Account Creation</h3>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formItem}>
              <label>Creation Month</label>
              <Select
                value={creationMonth}
                onChange={setCreationMonth}
                disabled={!isAccountLifecycleEditMode}
                style={{ width: '100%' }}
              >
                <Option value="1">January</Option>
                <Option value="2">February</Option>
                <Option value="3">March</Option>
                <Option value="4">April</Option>
                <Option value="5">May</Option>
                <Option value="6">June</Option>
                <Option value="7">July</Option>
                <Option value="8">August</Option>
                <Option value="9">September</Option>
                <Option value="10">October</Option>
                <Option value="11">November</Option>
                <Option value="12">December</Option>
              </Select>
              <p className={styles.fieldHint}>Month when accounts are automatically created</p>
            </div>

            <div className={styles.formItem}>
              <label>Day of Month</label>
              <Select
                value={creationDay}
                onChange={setCreationDay}
                disabled={!isAccountLifecycleEditMode}
                style={{ width: '100%' }}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <Option key={day} value={day.toString()}>
                    {day}{getDaySuffix(day.toString())}
                  </Option>
                ))}
              </Select>
              <p className={styles.fieldHint}>Day when accounts are automatically created</p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', margin: '24px 0' }} />

        {/* Account Closure Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <UserDeleteOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Account Closure</h3>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formItem}>
              <label>Closure Month</label>
              <Select
                value={closureMonth}
                onChange={setClosureMonth}
                disabled={!isAccountLifecycleEditMode}
                style={{ width: '100%' }}
              >
                <Option value="1">January</Option>
                <Option value="2">February</Option>
                <Option value="3">March</Option>
                <Option value="4">April</Option>
                <Option value="5">May</Option>
                <Option value="6">June</Option>
                <Option value="7">July</Option>
                <Option value="8">August</Option>
                <Option value="9">September</Option>
                <Option value="10">October</Option>
                <Option value="11">November</Option>
                <Option value="12">December</Option>
              </Select>
              <p className={styles.fieldHint}>Month when accounts are automatically closed</p>
            </div>

            <div className={styles.formItem}>
              <label>Day of Month</label>
              <Select
                value={closureDay}
                onChange={setClosureDay}
                disabled={!isAccountLifecycleEditMode}
                style={{ width: '100%' }}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <Option key={day} value={day.toString()}>
                    {day}{getDaySuffix(day.toString())}
                  </Option>
                ))}
              </Select>
              <p className={styles.fieldHint}>Day when accounts are automatically closed</p>
            </div>
          </div>
        </div>

        {isAccountLifecycleEditMode && (
          <div className={styles.actionButtons}>
            <Button type="primary" onClick={handleSaveAccountLifecycleConfig} loading={loading}>
              Save Configuration
            </Button>
            <Button onClick={handleCancelAccountLifecycleEdit}>Cancel</Button>
          </div>
        )}
        </Spin>
      </Card>

      {/* Add Provider Modal */}
      <Modal
        title="Add Course Provider"
        open={isAddDialogOpen}
        onOk={handleAddProvider}
        onCancel={() => {
          setIsAddDialogOpen(false);
          setNewProviderName('');
          setNewProviderEducationLevels([]);
        }}
        okText="Add Provider"
        confirmLoading={loading}
      >
        <div className={styles.modalContent}>
          <div className={styles.formItem}>
            <label>Provider Name <span style={{ color: 'red' }}>*</span></label>
            <Input
              value={newProviderName}
              onChange={(e) => setNewProviderName(e.target.value)}
              placeholder="e.g., Singapore Institute of Technology"
            />
          </div>
          <div className={styles.formItem}>
            <label>Education Levels <span style={{ color: 'red' }}>*</span></label>
            <Checkbox.Group
              options={allSchoolingLevels.map(level => ({ value: level.id, label: level.name }))}
              value={newProviderEducationLevels}
              onChange={setNewProviderEducationLevels}
              className={styles.checkboxGroup}
            />
            <p className={styles.fieldHint}>Select all education levels this provider offers courses for</p>
          </div>
        </div>
      </Modal>

      {/* Edit Provider Modal */}
      <Modal
        title="Edit Course Provider"
        open={isEditDialogOpen}
        onOk={handleEditProvider}
        onCancel={() => setIsEditDialogOpen(false)}
        okText="Save Changes"
        confirmLoading={loading}
      >
        <div className={styles.modalContent}>
          <div className={styles.formItem}>
            <label>Provider Name <span style={{ color: 'red' }}>*</span></label>
            <Input
              value={editingProvider?.providerName || ''}
              onChange={(e) => setEditingProvider({ ...editingProvider, providerName: e.target.value })}
              placeholder="e.g., Singapore Institute of Technology"
            />
          </div>
          <div className={styles.formItem}>
            <label>Education Levels <span style={{ color: 'red' }}>*</span></label>
            <Checkbox.Group
              options={allSchoolingLevels.map(level => ({ value: level.id, label: level.name }))}
              value={editingProvider?.educationLevels || []}
              onChange={(values) => setEditingProvider({ ...editingProvider, educationLevels: values })}
              className={styles.checkboxGroup}
            />
            <p className={styles.fieldHint}>Select all education levels this provider offers courses for</p>
          </div>
        </div>
      </Modal>

      {/* Toggle Status Modal */}
      <Modal
        title={`${(toggleStatusProvider?.status === 'Active' || toggleStatusProvider?.status === 'active' || toggleStatusProvider?.isActive === true) ? 'Deactivate' : 'Reactivate'} Course Provider`}
        open={isToggleStatusDialogOpen}
        onOk={handleToggleProviderStatus}
        onCancel={() => setIsToggleStatusDialogOpen(false)}
        okText={(toggleStatusProvider?.status === 'Active' || toggleStatusProvider?.status === 'active' || toggleStatusProvider?.isActive === true) ? 'Deactivate' : 'Reactivate'}
        okButtonProps={{ danger: (toggleStatusProvider?.status === 'Active' || toggleStatusProvider?.status === 'active' || toggleStatusProvider?.isActive === true) }}
        confirmLoading={loading}
      >
        <p>
          {(toggleStatusProvider?.status === 'Active' || toggleStatusProvider?.status === 'active' || toggleStatusProvider?.isActive === true) ? (
            <>
              Are you sure you want to deactivate "{toggleStatusProvider?.providerName}"? 
              This provider will no longer appear in dropdown selections, but existing course data will be preserved.
            </>
          ) : (
            <>
              Are you sure you want to reactivate "{toggleStatusProvider?.providerName}"? 
              This provider will be available for selection again.
            </>
          )}
        </p>
      </Modal>

      {/* Delete Provider Modal */}
      <Modal
        title="Delete Course Provider"
        open={isDeleteDialogOpen}
        onOk={handleDeleteProvider}
        onCancel={() => setIsDeleteDialogOpen(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
        confirmLoading={loading}
      >
        <p>
          Are you sure you want to delete "{deleteProvider?.providerName}"? 
          This action cannot be undone. All courses associated with this provider will need to be updated or removed.
        </p>
      </Modal>
    </div>
  );
};

export default Settings;
