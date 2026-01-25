import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Typography, message } from 'antd';
import {
    CloseOutlined,
    CheckOutlined,
    DollarOutlined,
    CreditCardOutlined,
    ArrowRightOutlined,
    ArrowLeftOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    LockOutlined,
    SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './AddCourseModal.module.scss';

import { courseService } from '../../../../services/courseService';
import { providerService } from '../../../../services/providerService';
import { settingsService } from '../../../../services/settingsService';

const { Text } = Typography;

const AddCourseModal = ({ open, onClose, onAdd }) => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    // State
    const [isReviewStep, setIsReviewStep] = useState(false);
    const [providersList, setProvidersList] = useState([]);
    const [schoolingLevelsList, setSchoolingLevelsList] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loadingSchoolingLevels, setLoadingSchoolingLevels] = useState(false);
    const [loadingProviders, setLoadingProviders] = useState(false);
    const [providerSearchText, setProviderSearchText] = useState('');

    // Watch form values
    const selectedProvider = Form.useWatch('provider', form);
    const courseStartDate = Form.useWatch('startDate', form);
    const courseEndDate = Form.useWatch('endDate', form);
    const billingCycle = Form.useWatch('billingCycle', form);
    const paymentOption = Form.useWatch('paymentOption', form);
    const inputValue = Form.useWatch('fee', form);
    
    // Date validation states
    const [startDateError, setStartDateError] = useState('');
    const [endDateError, setEndDateError] = useState('');

    const modeOptions = [
        { label: 'Online', value: 'Online' },
        { label: 'In-Person', value: 'In-Person' },
        { label: 'Hybrid', value: 'Hybrid' }
    ];

    const paymentOptions = [
        { label: 'One Time', value: 'One-time' },
        { label: 'Recurring', value: 'Recurring' }
    ];

    const billingCycleOptions = [
        { label: 'Monthly', value: 'Monthly' },
        { label: 'Quarterly', value: 'Quarterly' },
        { label: 'Bi-annually', value: 'Biannually' },
        { label: 'Annually', value: 'Yearly' }
    ];

    // Helper: Generate billing date options (1st - 28th of the month)
    const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    const billingDateOptions = Array.from({ length: 28 }, (_, i) => {
        const day = i + 1;
        return {
            label: `${day}${getOrdinalSuffix(day)} of the month`,
            value: day
        };
    });

    // Helper: Generate payment due options (common durations)
    const paymentDueOptions = [
        { label: '14 days after billing date', value: 14 },
        { label: '30 days after billing date', value: 30 }
    ];

    // Helper: Reset State when modal closes
    useEffect(() => {
        if (!open) {
            form.resetFields();
            setIsReviewStep(false);
            setSchoolingLevelsList([]);
            setStartDateError('');
            setEndDateError('');
            setProviderSearchText('');
        } else {
            fetchProviders();
            fetchGlobalSettings();
        }
    }, [open, form]);

    const fetchProviders = async (searchTerm = '') => {
        setLoadingProviders(true);
        try {
            const res = await courseService.getProviders(searchTerm);
            setProvidersList(res?.data || []);
        } catch (error) {
            messageApi.error('Failed to load providers');
            setProvidersList([]);
        } finally {
            setLoadingProviders(false);
        }
    };

    // Debounce provider search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (providerSearchText !== undefined) {
                fetchProviders(providerSearchText);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [providerSearchText]);

    const fetchGlobalSettings = async () => {
        try {
            const res = await settingsService.getGlobalSettings();
            if (res?.data) {
                // Set default values from global settings
                form.setFieldsValue({
                    status: 'Active',
                    paymentOption: 'One-time',
                    billingDate: res.data.billingDate,
                    paymentDue: res.data.dueToDate
                });
            } else {
                form.setFieldsValue({
                    status: 'Active',
                    paymentOption: 'One-time'
                });
            }
        } catch (error) {
            console.error('Failed to load global settings:', error);
            form.setFieldsValue({
                status: 'Active',
                paymentOption: 'One-time'
            });
        }
    };

    // Fetch schooling levels when provider changes
    useEffect(() => {
        if (selectedProvider) {
            fetchSchoolingLevels(selectedProvider);
        } else {
            setSchoolingLevelsList([]);
            form.setFieldsValue({ educationLevel: undefined });
        }
    }, [selectedProvider]);

    // Reset billing cycle when dates change and make current selection invalid
    useEffect(() => {
        if (paymentOption === 'Recurring' && billingCycle) {
            if (!isBillingCycleValid(billingCycle)) {
                form.setFieldsValue({ billingCycle: undefined });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseStartDate, courseEndDate]);

    const fetchSchoolingLevels = async (providerId) => {
        setLoadingSchoolingLevels(true);
        try {
            const res = await providerService.getSchoolingLevelsByProviderId(providerId);
            setSchoolingLevelsList(res?.data || []);
        } catch (error) {
            messageApi.error('Failed to load schooling levels');
            setSchoolingLevelsList([]);
        } finally {
            setLoadingSchoolingLevels(false);
        }
    };

    const [formData, setFormData] = useState({});

    // Unified Values (Fix for useWatch undefined when Form unmounts)
    const activeStartDate = isReviewStep ? formData.startDate : courseStartDate;
    const activeEndDate = isReviewStep ? formData.endDate : courseEndDate;
    const activeBillingCycle = isReviewStep ? formData.billingCycle : billingCycle;
    const activePaymentOption = isReviewStep ? formData.paymentOption : paymentOption;
    const activeFee = isReviewStep ? formData.fee : inputValue;

    // Helper: Logic from scan.tsx
    const calculateCycles = (start, end, cycle) => {
        if (!start || !end) return 1;
        const startDate = dayjs(start);
        const endDate = dayjs(end);
        // Count calendar months touched (regardless of day)
        const monthsDiff = (endDate.year() - startDate.year()) * 12 + (endDate.month() - startDate.month()) + 1;

        if (monthsDiff <= 0) return 1;

        switch (cycle) {
            case 'Monthly': return monthsDiff;
            case 'Quarterly': return Math.ceil(monthsDiff / 3);
            case 'Biannually': return Math.ceil(monthsDiff / 6);
            case 'Yearly': return Math.ceil(monthsDiff / 12);
            default: return 1;
        }
    };

    const getCourseDurationMonths = () => {
        if (!activeStartDate || !activeEndDate) return 0;
        const startDate = dayjs(activeStartDate);
        const endDate = dayjs(activeEndDate);
        // Count calendar months touched (regardless of day)
        return (endDate.year() - startDate.year()) * 12 + (endDate.month() - startDate.month()) + 1;
    };

    const isBillingCycleValid = (cycle) => {
        const months = getCourseDurationMonths();
        if (months === 0) return false;
        switch (cycle) {
            case 'Monthly': return months >= 1;
            case 'Quarterly': return months >= 3;
            case 'Biannually': return months >= 6;
            case 'Yearly': return months >= 12;
            default: return true;
        }
    };

    // Date validation helpers (same as CourseFilter)
    const startOfToday = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const disabledStartDate = (date) => {
        if (!date) return false;
        const d = date.toDate();
        d.setHours(0, 0, 0, 0);
        return d < startOfToday();
    };

    const disabledEndDate = (date) => {
        if (!date) return false;
        if (!courseStartDate) return false;
        const d = date.toDate();
        d.setHours(0, 0, 0, 0);
        const s = courseStartDate.toDate();
        s.setHours(0, 0, 0, 0);
        return d <= s;
    };

    const handleStartDateChange = (date) => {
        form.setFieldsValue({ startDate: date });
        setStartDateError('');
        setEndDateError('');
        if (date) {
            const d = date.toDate();
            d.setHours(0, 0, 0, 0);
            if (d < startOfToday()) {
                setStartDateError('Start date cannot be in the past');
            }
            if (courseEndDate) {
                const end = courseEndDate.toDate();
                end.setHours(0, 0, 0, 0);
                if (d >= end) {
                    setStartDateError('Start date must be before end date');
                }
            }
        }
    };

    const handleEndDateChange = (date) => {
        form.setFieldsValue({ endDate: date });
        setEndDateError('');
        setStartDateError('');
        if (date && courseStartDate) {
            const end = date.toDate();
            end.setHours(0, 0, 0, 0);
            const start = courseStartDate.toDate();
            start.setHours(0, 0, 0, 0);
            if (end <= start) {
                setEndDateError('End date must be after start date');
            }
        }
    };

    const calculateFeePerCycle = () => {
        if (!activeFee || !activeBillingCycle || !activeStartDate || !activeEndDate) return '0.00';
        const cycles = calculateCycles(activeStartDate, activeEndDate, activeBillingCycle);
        return (parseFloat(activeFee) / cycles).toFixed(2);
    };

    // Helper: Format billing date for display
    const formatBillingDateDisplay = (day) => {
        if (!day) return '-';
        const suffix = getOrdinalSuffix(day);
        return `${day}${suffix} of the month`;
    };

    // Helper: Format payment due for display
    const formatPaymentDueDisplay = (days) => {
        if (!days) return '-';
        return `${days} days after billing date`;
    };

    // Helper: Map schooling level ID to education level enum
    const mapSchoolingLevelIdToEducationLevel = (schoolingLevelId) => {
        const mapping = {
            'SL-001': 'Primary',
            'SL-002': 'Secondary',
            'SL-003': 'PostSecondary',
            'SL-004': 'Tertiary',
            'SL-005': 'PostGraduate'
        };
        return mapping[schoolingLevelId] || null;
    };

    const handleProceedToReview = async () => {
        try {
            await form.validateFields();
            
            // Check for date errors
            if (startDateError || endDateError) {
                messageApi.error('Please fix date validation errors');
                return;
            }
            
            if (!inputValue || parseFloat(inputValue) <= 0) {
                messageApi.error('Please enter a valid fee amount');
                return;
            }
            if (paymentOption === 'Recurring' && !billingCycle) {
                messageApi.error('Please select a billing cycle');
                return;
            }

            // Store the calculated values before switching to review step
            const formValues = form.getFieldsValue(true);
            setFormData({
                ...formValues,
                calculatedFeePerCycle: calculateFeePerCycle(),
                calculatedTotalFee: inputValue
            });
            setIsReviewStep(true);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleConfirmAdd = async () => {
        const values = formData;

        const selectedProvider = providersList.find(p => p.providerId === values.provider);
        const selectedSchoolingLevel = values.educationLevel;
        const finalTotalFee = parseFloat(values.calculatedTotalFee);

        // Map schooling level ID to education level enum
        let educationLevel = null;
        educationLevel = mapSchoolingLevelIdToEducationLevel(selectedSchoolingLevel);

        const data = {
            name: values.courseName,
            providerId: values.provider,
            providerName: selectedProvider ? selectedProvider.providerName : '',
            mode: values.mode,
            startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : null,
            endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : null,
            payment: { Type: values.paymentOption },
            billingCycle: values.paymentOption === 'One-time' ? null : values.billingCycle,
            feePerCycle: null,
            totalFee: finalTotalFee,
            status: values.status,
            educationLevel: educationLevel,
            billingDate: values.billingDate ? parseInt(values.billingDate) : null,
            paymentDue: values.paymentDue ? parseInt(values.paymentDue) : null
        };
        setSubmitting(true);
        try {
            await onAdd(data);
        } finally {
            setSubmitting(false);
        }
    };

    const renderOption = (opt, fieldName) => {
        // Ant Design optionRender receives { data, label, value } - we need opt.data for the full option
        const option = opt.data || opt;
        const isSelected = form.getFieldValue(fieldName) === option.value;
        const isDisabled = option.disabled;
        
        // Get disabled reason for billing cycle
        let disabledReason = '';
        if (isDisabled && fieldName === 'billingCycle') {
            const months = getCourseDurationMonths();
            if (option.value === 'Quarterly' && months < 3) {
                disabledReason = `Need ${3 - months} more month${3 - months > 1 ? 's' : ''}`;
            } else if (option.value === 'Biannually' && months < 6) {
                disabledReason = `Need ${6 - months} more month${6 - months > 1 ? 's' : ''}`;
            } else if (option.value === 'Yearly' && months < 12) {
                disabledReason = `Need ${12 - months} more month${12 - months > 1 ? 's' : ''}`;
            }
        }
        
        return (
            <div
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '8px', 
                    width: '100%',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    padding: '8px 12px',
                    backgroundColor: isDisabled ? '' : 'transparent',
                    borderRadius: '6px',
                    margin: '-4px -8px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isDisabled ? (
                        <LockOutlined style={{ color: '#6b7280', fontSize: '14px' }} />
                    ) : (
                        <CheckOutlined className={styles.checkoutIcon} style={{ visibility: isSelected ? 'visible' : 'hidden', color: 'teal' }} />
                    )}
                    <span style={{ 
                        color: isDisabled ? '#9ca3af' : 'inherit',
                        textDecoration: isDisabled ? 'line-through' : 'none',
                        fontWeight: isDisabled ? '400' : '500'
                    }}>
                        {option.label}
                    </span>
                </div>
                {isDisabled && disabledReason && (
                    <span style={{ 
                        fontSize: '0.7rem', 
                        color: '#eff6ff',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                        backgroundColor: '#0f766e',
                        padding: '3px 8px',
                        borderRadius: '4px'
                    }}>
                        {disabledReason}
                    </span>
                )}
            </div>
        );
    };

    return (
        <>
            {contextHolder}
            <Modal
                open={open}
                onCancel={onClose}
                footer={null}
                closeIcon={<CloseOutlined />}
                width={600}
                
                className={styles.addCourseModal}
                wrapClassName={styles.addCourseModal}
                styles={{ mask: { backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(0px)', } }}
                centered
            >
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <h2 className={styles.modalTitle}>{isReviewStep ? 'Review Course Details' : 'Add New Course'}</h2>
                        <p className={styles.modalSubtitle}>
                            {isReviewStep
                                ? 'Please review all the information before creating the course.'
                                : 'Enter course details to create a new course.'}
                        </p>
                    </div>

                    {!isReviewStep ? (
                        <Form form={form} layout="vertical" className={styles.courseForm}>
                            <Form.Item label="Course Name" name="courseName" rules={[{ required: true, message: 'Required' }]} required>
                                <Input placeholder="e.g., Python Programming" />
                            </Form.Item>

                            <Form.Item label="Provider" name="provider" rules={[{ required: true, message: 'Required' }]} required>
                                <Select
                                    showSearch={{
                                        onSearch: (value) => setProviderSearchText(value)
                                    }}
                                    placeholder="Search and select provider"
                                    optionRender={(opt) => renderOption(opt, 'provider')}
                                    options={Array.isArray(providersList) ? providersList.map(p => ({ label: p.providerName, value: p.providerId })) : []}
                                    popupClassNames={{ root: styles.selectDropdown }}
                                    loading={loadingProviders}
                                    filterOption={false}
                                    notFoundContent={loadingProviders ? 'Loading...' : 'No providers found'}
                                    popupRender={(menu) => (
                                        <>
                                            <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
                                                <Input
                                                    placeholder="Search providers..."
                                                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                                    value={providerSearchText}
                                                    onChange={(e) => setProviderSearchText(e.target.value)}
                                                    style={{ width: '100%' }}
                                                    allowClear
                                                />
                                            </div>
                                            {menu}
                                        </>
                                    )}
                                />
                            </Form.Item>

                            <Form.Item label="Education Level" name="educationLevel" rules={[{ required: true, message: 'Required' }]} required>
                                <Select
                                    placeholder={selectedProvider ? "Select education level" : "Select provider first"}
                                    optionRender={(opt) => renderOption(opt, 'educationLevel')}
                                    options={schoolingLevelsList.map(sl => ({ label: sl.name, value: sl.id }))}
                                    popupClassNames={{ root: styles.selectDropdown }}
                                    disabled={!selectedProvider}
                                    loading={loadingSchoolingLevels}
                                />
                            </Form.Item>

                            <Form.Item label="Mode of Training" name="mode" rules={[{ required: true, message: 'Required' }]} required>
                                <Select
                                    placeholder="Select mode"
                                    optionRender={(opt) => renderOption(opt, 'mode')}
                                    options={modeOptions}
                                    popupClassNames={{ root: styles.selectDropdown }}
                                />
                            </Form.Item>

                            <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Required' }]} required>
                                <Select
                                    placeholder="Select status"
                                    optionRender={(opt) => renderOption(opt, 'status')}
                                    options={[
                                        { label: 'Active', value: 'Active' },
                                        { label: 'Inactive', value: 'Inactive' }
                                    ]}
                                    popupClassNames={{ root: styles.selectDropdown }}
                                />
                            </Form.Item>

                            <div className={styles.dateRow}>
                                <Form.Item 
                                    label="Start Date" 
                                    name="startDate" 
                                    rules={[{ required: true, message: 'Required' }]} 
                                    required 
                                    className={styles.dateField}
                                    validateStatus={startDateError ? 'error' : ''}
                                    help={startDateError}
                                >
                                    <DatePicker 
                                        format="DD/MM/YYYY" 
                                        placeholder="DD/MM/YYYY" 
                                        className={styles.datePicker}
                                        disabledDate={disabledStartDate}
                                        onChange={handleStartDateChange}
                                    />
                                </Form.Item>
                                <Form.Item 
                                    label="End Date" 
                                    name="endDate" 
                                    rules={[{ required: true, message: 'Required' }]} 
                                    required 
                                    className={styles.dateField}
                                    validateStatus={endDateError ? 'error' : ''}
                                    help={endDateError}
                                >
                                    <DatePicker 
                                        format="DD/MM/YYYY" 
                                        placeholder="DD/MM/YYYY" 
                                        className={styles.datePicker}
                                        disabledDate={disabledEndDate}
                                        onChange={handleEndDateChange}
                                    />
                                </Form.Item>
                            </div>

                            <div className={styles.feeSection}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <Text strong className={styles.sectionTitle}>Fee Configuration</Text>
                                    {(!courseStartDate || !courseEndDate) && (
                                        <div style={{ 
                                            fontSize: '0.85rem', 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            gap: '6px',
                                            marginTop: '0.5rem', 
                                            padding: '0.5rem 0.75rem',
                                            backgroundColor: '#fef3c7',
                                            border: '1px solid #fbbf24',
                                            borderRadius: '6px',
                                            color: '#92400e'
                                        }}>
                                            <InfoCircleOutlined style={{ fontSize: '14px' }} />
                                            <span>Please select course start and end dates first to configure fees</span>
                                        </div>
                                    )}
                                </div>

                                <Form.Item label="Payment Type" name="paymentOption" rules={[{ required: true }]} required>
                                    <Select
                                        placeholder="Select payment type"
                                        options={paymentOptions}
                                        optionRender={(opt) => renderOption(opt, 'paymentOption')}
                                        popupClassNames={{ root: styles.selectDropdown }}
                                        disabled={!courseStartDate || !courseEndDate}
                                    />
                                </Form.Item>

                                {paymentOption === 'Recurring' && (
                                    <>
                                        <Form.Item label="Billing Cycle" name="billingCycle" rules={[{ required: true }]} required>
                                            <Select
                                                placeholder="Select billing cycle"
                                                popupClassNames={{ root: styles.selectDropdown }}
                                                optionRender={(opt) => renderOption(opt, 'billingCycle')}
                                                options={billingCycleOptions.map(opt => ({
                                                    ...opt,
                                                    disabled: !isBillingCycleValid(opt.value)
                                                }))}
                                            />
                                        </Form.Item>
                                        {courseStartDate && courseEndDate && getCourseDurationMonths() < 3 && (
                                            <div style={{ 
                                                fontSize: '0.8rem', 
                                                color: '#64748b',
                                                marginTop: '-0.5rem',
                                                marginBottom: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <InfoCircleOutlined style={{ fontSize: '12px' }} />
                                                <span>Some billing cycles are disabled due to short course duration ({getCourseDurationMonths()} month{getCourseDurationMonths() !== 1 ? 's' : ''})</span>
                                            </div>
                                        )}

                                        <div className={styles.dateRow}>
                                            <Form.Item 
                                                label="Billing Date" 
                                                name="billingDate" 
                                                rules={[{ required: true, message: 'Required' }]} 
                                                required 
                                                className={styles.dateField}
                                                tooltip="Day of the month when billing occurs"
                                            >
                                                <Select
                                                    placeholder="Select billing date"
                                                    options={billingDateOptions}
                                                    optionRender={(opt) => renderOption(opt, 'billingDate')}
                                                    popupClassNames={{ root: styles.selectDropdown }}
                                                />
                                            </Form.Item>
                                            <Form.Item 
                                                label="Payment Due" 
                                                name="paymentDue" 
                                                rules={[{ required: true, message: 'Required' }]} 
                                                required 
                                                className={styles.dateField}
                                                tooltip="Days after billing date when payment is due"
                                            >
                                                <Select
                                                    placeholder="Select payment due period"
                                                    options={paymentDueOptions}
                                                    optionRender={(opt) => renderOption(opt, 'paymentDue')}
                                                    popupClassNames={{ root: styles.selectDropdown }}
                                                />
                                            </Form.Item>
                                        </div>
                                    </>
                                )}

                                {paymentOption === 'Recurring' && billingCycle && (
                                    <div className={styles.feeToggleContainer}>
                                        <Form.Item
                                            label="Total Course Fee"
                                            name="fee"
                                            rules={[{ required: true, message: 'Please enter total fee' }]}
                                        >
                                            <Input
                                                type="number"
                                                prefix="$"
                                                placeholder="0.00"
                                                disabled={!courseStartDate || !courseEndDate}
                                            />
                                        </Form.Item>

                                        {inputValue && courseStartDate && courseEndDate && (
                                            <div className={styles.feeSummary}>
                                                <CheckCircleOutlined style={{ color: '#00b96b' }} />
                                                <span style={{ marginLeft: 8 }}>
                                                    Fee per Cycle: <b>${calculateFeePerCycle()}</b> ({calculateCycles(courseStartDate, courseEndDate, billingCycle)} cycles)
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {paymentOption === 'One-time' && (
                                    <>
                                        <Form.Item label="Course Fee" name="fee" rules={[{ required: true }]}>
                                            <Input type="number" prefix="$" placeholder="0.00" />
                                        </Form.Item>
                                        <div className={styles.dateRow}>
                                            <Form.Item 
                                                label="Billing Date" 
                                                name="billingDate" 
                                                rules={[{ required: true, message: 'Required' }]} 
                                                required 
                                                className={styles.dateField}
                                                tooltip="Day of the month when billing occurs"
                                            >
                                                <Select
                                                    placeholder="Select billing date"
                                                    options={billingDateOptions}
                                                    optionRender={(opt) => renderOption(opt, 'billingDate')}
                                                    popupClassNames={{ root: styles.selectDropdown }}
                                                />
                                            </Form.Item>
                                            <Form.Item 
                                                label="Payment Due" 
                                                name="paymentDue" 
                                                rules={[{ required: true, message: 'Required' }]} 
                                                required 
                                                className={styles.dateField}
                                                tooltip="Days after billing date when payment is due"
                                            >
                                                <Select
                                                    placeholder="Select payment due period"
                                                    options={paymentDueOptions}
                                                    optionRender={(opt) => renderOption(opt, 'paymentDue')}
                                                    popupClassNames={{ root: styles.selectDropdown }}
                                                />
                                            </Form.Item>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className={styles.modalFooter}>
                                <Button onClick={onClose} className={styles.cancelButton}>Cancel</Button>
                                <Button type="primary" onClick={handleProceedToReview} className={styles.submitButton}>
                                    Review Course <ArrowRightOutlined />
                                </Button>
                            </div>
                        </Form>
                    ) : (
                        <div className={styles.reviewStep}>
                            <div className={styles.reviewContent}>

                                <div className={styles.reviewSectionGroup}>
                                    <div className={styles.groupHeader}>
                                        <div style={{ transform: 'rotate(-10deg)', display: 'inline-block' }}>🎓</div> Course Information
                                    </div>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Course Name:</span>
                                            <span className={styles.value}>{formData.courseName}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Provider:</span>
                                            <span className={styles.value}>
                                                {providersList.find(p => p.providerId === formData.provider)?.providerName || formData.provider}
                                            </span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Mode of Training:</span>
                                            <span className={styles.value}>{formData.mode}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Status:</span>
                                            <span className={`${styles.statusBadge} ${formData.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                                                {formData.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.reviewSectionGroup}>
                                    <div className={styles.groupHeader}>
                                        <CalendarOutlined /> Course Schedule
                                    </div>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Start Date:</span>
                                            <span className={styles.value}>{activeStartDate ? dayjs(activeStartDate).format('DD/MM/YY') : '-'}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>End Date:</span>
                                            <span className={styles.value}>{activeEndDate ? dayjs(activeEndDate).format('DD/MM/YY') : '-'}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Duration:</span>
                                            <span className={styles.value}>
                                                {getCourseDurationMonths()} month{getCourseDurationMonths() !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${styles.reviewSectionGroup} ${styles.feeCard}`}>
                                    <div className={styles.groupHeader}>
                                        <DollarOutlined /> Fee Information
                                    </div>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Payment Type:</span>
                                            <span className={styles.value}>
                                                {paymentOptions.find(p => p.value === activePaymentOption)?.label || activePaymentOption}
                                            </span>
                                        </div>
                                        {activePaymentOption === 'Recurring' && (
                                            <>
                                                <div className={styles.infoRow}>
                                                    <span className={styles.label}>Billing Cycle:</span>
                                                    <span className={styles.value}>
                                                        {billingCycleOptions.find(b => b.value === activeBillingCycle)?.label || activeBillingCycle}
                                                    </span>
                                                </div>
                                                <div className={styles.infoRow}>
                                                    <span className={styles.label}>Number of Cycles:</span>
                                                    <span className={styles.value}>{calculateCycles(activeStartDate, activeEndDate, activeBillingCycle)}</span>
                                                </div>
                                                <div className={styles.infoRow}>
                                                    <span className={styles.label}>Fee per Cycle:</span>
                                                    <span className={styles.value} style={{ fontWeight: 'bold', color: '#162f69' }}>${formData.calculatedFeePerCycle}</span>
                                                </div>
                                                <div className={styles.infoRow}>
                                                    <span className={styles.label}>Billing Date:</span>
                                                    <span className={styles.value}>{formatBillingDateDisplay(formData.billingDate)}</span>
                                                </div>
                                                <div className={styles.infoRow}>
                                                    <span className={styles.label}>Payment Due:</span>
                                                    <span className={styles.value}>{formatPaymentDueDisplay(formData.paymentDue)}</span>
                                                </div>
                                            </>
                                        )}
                                        {activePaymentOption === 'One-time' && (
                                            <>
                                                <div className={styles.infoRow}>
                                                    <span className={styles.label}>Billing Date:</span>
                                                    <span className={styles.value}>{formatBillingDateDisplay(formData.billingDate)}</span>
                                                </div>
                                                <div className={styles.infoRow}>
                                                    <span className={styles.label}>Payment Due:</span>
                                                    <span className={styles.value}>{formatPaymentDueDisplay(formData.paymentDue)}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Total Course Fee:</span>
                                            <span className={styles.value}>${parseFloat(formData.calculatedTotalFee || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <Button onClick={() => setIsReviewStep(false)} className={styles.cancelButton}>
                                    <ArrowLeftOutlined /> Back to Edit
                                </Button>
                                <Button type="primary" onClick={handleConfirmAdd} loading={submitting} className={styles.submitButton}>
                                    Confirm & Create <CheckCircleOutlined />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default AddCourseModal;
