import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, Typography } from 'antd';
import { 
    SearchOutlined, LockOutlined, CheckOutlined, 
    CheckCircleOutlined, InfoCircleOutlined 
} from '@ant-design/icons';
import { 
    MODE_OPTIONS, PAYMENT_OPTIONS, BILLING_CYCLE_OPTIONS, PAYMENT_DUE_OPTIONS 
} from './constants';
import { 
    getBillingDateOptions, calculateCycles, getCourseDurationMonths, isBillingCycleValid,
    validateIntegerFee, validateFutureDate, validateEndDate 
} from './utils';
import styles from './AddCourseModal.module.scss';

const { Text } = Typography;

const AddCourseForm = ({ 
    form, 
    providers, 
    levels, 
    loading, 
    onSearchProvider 
}) => {
    const startDate = Form.useWatch('startDate', form);
    const endDate = Form.useWatch('endDate', form);
    const paymentOption = Form.useWatch('paymentOption', form);
    const billingCycle = Form.useWatch('billingCycle', form);
    const fee = Form.useWatch('fee', form);
    const selectedProvider = Form.useWatch('provider', form);

    const [startDateError, setStartDateError] = useState('');
    const [endDateError, setEndDateError] = useState('');

    // --- CẤU HÌNH NGÀY THÁNG ---
    const startOfToday = () => {
        const d = new Date(); d.setHours(0,0,0,0); return d;
    };

    // [UPDATED] Disable cả ngày hôm nay và quá khứ.
    // Logic: Nếu ngày trên lịch <= Hôm nay thì disable.
    const disabledStartDate = (current) => {
        return current && current.toDate() <= startOfToday();
    };
    
    const disabledEndDate = (current) => {
        if (!current) return false;
        const start = startDate ? startDate.toDate() : null;
        if (start) start.setHours(0,0,0,0);
        // End date phải sau Start date (hoặc sau hôm nay nếu chưa chọn start)
        return current.toDate() <= (start || startOfToday());
    };

    const handleDateChange = (type, date) => {
        if (type === 'start') {
            setStartDateError('');
            // Check nếu user cố tình nhập tay ngày hôm nay
            if (date && date.toDate() <= startOfToday()) {
                setStartDateError('Start date must be from tomorrow');
            }
        } else {
            setEndDateError('');
            if (date && startDate && date.toDate() <= startDate.toDate()) {
                setEndDateError('End date must be after start date');
            }
        }
    };

    // --- Helper chặn nhập ký tự không phải số ở ô Fee ---
    const handleFeeKeyPress = (e) => {
        // Chỉ cho phép số, chặn dấu chấm (.), dấu phẩy (,), dấu trừ (-)
        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
            e.preventDefault();
        }
    };

    const renderOption = (opt, fieldName) => {
        const option = opt.data || opt;
        const isSelected = form.getFieldValue(fieldName) === option.value;
        const isDisabled = option.disabled;
        let disabledReason = '';

        if (isDisabled && fieldName === 'billingCycle') {
            const months = getCourseDurationMonths(startDate, endDate);
            const needed = (target) => Math.ceil(target - months);
            if (option.value === 'Quarterly') disabledReason = `Need ${needed(3)} more mo`;
            else if (option.value === 'Biannually') disabledReason = `Need ${needed(6)} more mo`;
            else if (option.value === 'Yearly') disabledReason = `Need ${needed(12)} more mo`;
        }

        return (
            <div className={styles.customOption}>
                <div className={styles.optionLabel}>
                    {isDisabled ? <LockOutlined className={styles.disabledIcon} /> : (
                        <CheckOutlined style={{ visibility: isSelected ? 'visible' : 'hidden', color: 'teal' }} />
                    )}
                    <span className={isDisabled ? styles.textDisabled : ''}>{option.label}</span>
                </div>
                {isDisabled && disabledReason && <span className={styles.reasonTag}>{disabledReason}</span>}
            </div>
        );
    };

    return (
        <Form form={form} layout="vertical" className={styles.courseForm}>
            
            {/* Basic Info */}
            <Form.Item label="Course Name" name="courseName" rules={[{ required: true, message: 'Please enter course name' }]}>
                <Input placeholder="e.g., Python Programming"  />
            </Form.Item>

            <Form.Item label="Provider" name="provider" rules={[{ required: true, message: 'Please select a provider' }]}>
                <Select
                    showSearch
                    placeholder="Search provider"
                    onSearch={onSearchProvider}
                    options={providers.map(p => ({ label: p.providerName, value: p.providerId }))}
                    loading={loading.providers}
                    filterOption={false}
                    optionRender={(opt) => renderOption(opt, 'provider')}
                    popupClassNames={{ root: styles.selectDropdown }}
                    
                />
            </Form.Item>

            <Form.Item label="Education Level" name="educationLevel" rules={[{ required: true, message: 'Please select an education level' }]}>
                <Select
                    placeholder={selectedProvider ? "Select level" : "Select provider first"}
                    options={levels.map(sl => ({ label: sl.name, value: sl.id }))}
                    disabled={!selectedProvider}
                    loading={loading.levels}
                    optionRender={(opt) => renderOption(opt, 'educationLevel')}
                    popupClassNames={{ root: styles.selectDropdown }}
                    
                />
            </Form.Item>

            <div style={{ display: 'flex', gap: '16px' }}>
                <Form.Item label="Mode" name="mode" rules={[{ required: true, message: 'Please select a mode' }]} style={{ flex: 1 }}>
                    <Select options={MODE_OPTIONS} popupClassNames={{ root: styles.selectDropdown }} placeholder="Select mode"  />
                </Form.Item>
                <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select a status' }]} style={{ flex: 1 }}>
                    <Select options={[{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }]} popupClassNames={{ root: styles.selectDropdown }}  />
                </Form.Item>
            </div>

            {/* Date Section */}
            <div className={styles.dateRow}>
                <Form.Item 
                    label="Start Date" 
                    name="startDate" 
                    rules={[{ required: true, message: 'Please select start date' }, { validator: validateFutureDate }]} 
                    style={{ flex: 1 }}
                    {...(startDateError && { validateStatus: 'error', help: startDateError })}
                    className={styles.dateField}
                >
                    <DatePicker 
                        format="DD/MM/YYYY" 
                        placeholder="Select start date"
                        disabledDate={disabledStartDate} 
                        onChange={(d) => handleDateChange('start', d)} 
                        className={styles.datePicker}
                        style={{ width: '100%' }}
                        
                    />
                </Form.Item>

                <Form.Item 
                    label="End Date" 
                    name="endDate" 
                    dependencies={['startDate']}
                    rules={[
                            { required: true, message: 'Please select end date' },
                            { validator: validateEndDate(form) } 
                        ]}
                    style={{ flex: 1 }}
                    {...(endDateError && { validateStatus: 'error', help: endDateError })}
                    className={styles.dateField}
                >
                    <DatePicker 
                        format="DD/MM/YYYY" 
                        placeholder="Select end date"
                        disabledDate={disabledEndDate} 
                        onChange={(d) => handleDateChange('end', d)} 
                        className={styles.datePicker}
                        style={{ width: '100%' }}
                        
                    />
                </Form.Item>
            </div>

            {/* Fee Section */}
            <div className={styles.feeSection}>
                <div style={{ marginBottom: '1rem' }}>
                    <Text strong className={styles.sectionTitle}>Fee Configuration</Text>
                    {(!startDate || !endDate) && (
                        <div className={styles.infoBox}>
                            <InfoCircleOutlined /> <span>Select dates first to configure fees</span>
                        </div>
                    )}
                </div>

                <Form.Item label="Payment Type" name="paymentOption" rules={[{ required: true, message: 'Please select a payment type' }]}>
                    <Select options={PAYMENT_OPTIONS} disabled={!startDate || !endDate} popupClassNames={{ root: styles.selectDropdown }}  />
                </Form.Item>

                {paymentOption === 'Recurring' && (
                    <>
                        <Form.Item label="Billing Cycle" name="billingCycle" rules={[{ required: true, message: 'Please select a billing cycle' }]}>
                            <Select 
                                popupClassNames={{ root: styles.selectDropdown }}
                                options={BILLING_CYCLE_OPTIONS.map(opt => ({
                                    ...opt,
                                    disabled: !isBillingCycleValid(startDate, endDate, opt.value)
                                }))}
                                optionRender={(opt) => renderOption(opt, 'billingCycle')}
                                placeholder="Select billing cycle"
                                
                            />
                        </Form.Item>
                        
                        {/* Billing Date & Due */}
                        <div className={styles.dateRow}>
                            <Form.Item label="Billing Date" name="billingDate" rules={[{ required: true, message: 'Please select a billing date' }]} className={styles.dateField}>
                                <Select options={getBillingDateOptions()} popupClassNames={{ root: styles.selectDropdown }}  />
                            </Form.Item>
                            <Form.Item label="Payment Due" name="paymentDue" rules={[{ required: true, message: 'Please select payment due' }]} className={styles.dateField}>
                                <Select options={PAYMENT_DUE_OPTIONS} popupClassNames={{ root: styles.selectDropdown }}  />
                            </Form.Item>
                        </div>

                        {billingCycle && (
                            <div className={styles.feeToggleContainer}>
                                <Form.Item 
                                    label="Total Course Fee" 
                                    name="fee" 
                                    rules={[{ required: true, message: 'Please enter total course fee' }, { validator: validateIntegerFee }]}
                                >
                                    <Input 
                                        type="text" 
                                        inputMode="numeric" 
                                        prefix="S$" 
                                        placeholder="0" 
                                        maxLength={9}
                                        onKeyPress={handleFeeKeyPress} 
                                    />
                                </Form.Item>
                                {fee && !isNaN(fee) && Number(fee) > 0 && (
                                    <div className={styles.feeSummary}>
                                        <CheckCircleOutlined style={{ color: '#00b96b' }} />
                                        <span style={{ marginLeft: 8 }}>
                                            Fee per Cycle: <b>${(parseFloat(fee) / calculateCycles(startDate, endDate, billingCycle)).toFixed(2)}</b> ({calculateCycles(startDate, endDate, billingCycle) == 1 ? '1 cycle' : `${calculateCycles(startDate, endDate, billingCycle)} cycles`})
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {paymentOption === 'One-time' && (
                    <>
                        <Form.Item 
                            label="Course Fee" 
                            name="fee" 
                            rules={[{ required: true, message: 'Please enter course fee' }, { validator: validateIntegerFee }]}
                        >
                            <Input 
                                type="text"
                                inputMode="numeric"
                                prefix="S$" 
                                placeholder="0" 
                                maxLength={9}
                                onKeyPress={handleFeeKeyPress}
                            />
                        </Form.Item>
                        <div className={styles.dateRow}>
                            <Form.Item label="Billing Date" name="billingDate" rules={[{ required: true, message: 'Please select a billing date' }]} className={styles.dateField}>
                                <Select options={getBillingDateOptions()} popupClassNames={{ root: styles.selectDropdown }}  />
                            </Form.Item>
                            <Form.Item label="Payment Due" name="paymentDue" rules={[{ required: true, message: 'Please select payment due' }]} className={styles.dateField}>
                                <Select options={PAYMENT_DUE_OPTIONS} popupClassNames={{ root: styles.selectDropdown }}  />
                            </Form.Item>
                        </div>
                    </>
                )}
            </div>
        </Form>
    );
};

export default AddCourseForm;