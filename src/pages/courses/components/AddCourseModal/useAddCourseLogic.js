import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { courseService } from '../../../../services/courseService';
import { providerService } from '../../../../services/providerService';
import { settingsService } from '../../../../services/settingsService';
import { 
    calculateCycles, 
    formatForBackend, 
    mapSchoolingLevelIdToEducationLevel,
    isBillingCycleValid 
} from './utils';

export const useAddCourseLogic = (open, onAdd, onClose) => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    // -- State Management --
    const [isReviewStep, setIsReviewStep] = useState(false);
    const [providersList, setProvidersList] = useState([]);
    const [schoolingLevelsList, setSchoolingLevelsList] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState({ providers: false, levels: false });
    const [providerSearchText, setProviderSearchText] = useState('');
    
    // Snapshot dữ liệu đã validate để hiển thị ở bước Review
    const [formData, setFormData] = useState({});

    // -- Watchers (Theo dõi thay đổi để xử lý side-effect) --
    const selectedProvider = Form.useWatch('provider', form);
    const courseStartDate = Form.useWatch('startDate', form);
    const courseEndDate = Form.useWatch('endDate', form);
    const billingCycle = Form.useWatch('billingCycle', form);
    const paymentOption = Form.useWatch('paymentOption', form);

    // -- Effects --


    useEffect(() => {
        if (open) {
            fetchProviders();
            fetchGlobalSettings();
        } else {
            form.resetFields();
            setIsReviewStep(false);
            setSchoolingLevelsList([]);
            setProviderSearchText('');
            setFormData({});
        }
    }, [open]);


    useEffect(() => {
        const timer = setTimeout(() => {
            if (providerSearchText !== undefined) fetchProviders(providerSearchText);
        }, 300);
        return () => clearTimeout(timer);
    }, [providerSearchText]);


    useEffect(() => {
        if (selectedProvider) {
            fetchSchoolingLevels(selectedProvider);
        } else {
            setSchoolingLevelsList([]);
            form.setFieldValue('educationLevel', undefined);
        }
    }, [selectedProvider]);


    useEffect(() => {
        if (paymentOption === 'Recurring' && billingCycle) {
            if (!isBillingCycleValid(courseStartDate, courseEndDate, billingCycle)) {
                form.setFieldValue('billingCycle', undefined);
            }
        }
    }, [courseStartDate, courseEndDate]);

    // -- API Functions --

    const fetchProviders = async (search = '') => {
        setLoadingData(prev => ({ ...prev, providers: true }));
        try {
            const res = await courseService.getProviders(search);
            setProvidersList(res?.data || []);
        } catch {
            messageApi.error('Failed to load providers');
        } finally {
            setLoadingData(prev => ({ ...prev, providers: false }));
        }
    };

    const fetchSchoolingLevels = async (id) => {
        setLoadingData(prev => ({ ...prev, levels: true }));
        try {
            const res = await providerService.getSchoolingLevelsByProviderId(id);
            setSchoolingLevelsList(res?.data || []);
        } catch {
            messageApi.error('Failed to load schooling levels');
        } finally {
            setLoadingData(prev => ({ ...prev, levels: false }));
        }
    };

    const fetchGlobalSettings = async () => {
        try {
            const res = await settingsService.getGlobalSettings();
            if (res?.data) {
                form.setFieldsValue({
                    status: 'Active',
                    paymentOption: 'One-time', 
                    billingDate: res.data.billingDate,
                    paymentDue: res.data.dueToDate
                });
            } else {
                form.setFieldsValue({ status: 'Active', paymentOption: 'One-time' });
            }
        } catch {
            form.setFieldsValue({ status: 'Active', paymentOption: 'One-time' });
        }
    };

    // -- Helper: Xử lý lỗi từ Backend --
    const handleApiError = (error) => {
        console.error("API Error:", error);


        if (error.response && error.response.data && error.response.data.errors) {
            const apiErrors = error.response.data.errors;
            const formErrors = [];

            Object.keys(apiErrors).forEach((key) => {

                let fieldName = key.charAt(0).toLowerCase() + key.slice(1);
                if (key === 'ModeOfTraining') fieldName = 'mode';
                if (key === 'PaymentType') fieldName = 'paymentOption';

                formErrors.push({
                    name: fieldName,
                    errors: apiErrors[key] 
                });
            });

            if (formErrors.length > 0) {
                form.setFields(formErrors); 
                messageApi.error('Please fix the errors highlighted in the form.');
            } else {
                messageApi.error(error.message || 'Validation failed.');
            }
        } 

        else {
            messageApi.error(error.message || 'Something went wrong. Please try again.');
        }
    };

    // -- Handlers (User Actions) --

    // 1. Chuyển sang bước Review
    const handleProceedToReview = async () => {
        try {
            await form.validateFields();
            
            const values = form.getFieldsValue(true);
            const feeValue = values.fee;


            let calculatedFeePerCycle = '0.00';
            if (feeValue && values.billingCycle && values.startDate && values.endDate) {
                const cycles = calculateCycles(values.startDate, values.endDate, values.billingCycle);
                calculatedFeePerCycle = (parseFloat(feeValue) / cycles).toFixed(2);
            }

            setFormData({
                ...values,
                calculatedFeePerCycle,
                calculatedTotalFee: feeValue
            });
            setIsReviewStep(true);
        } catch (error) {
            console.log("Form validation failed:", error);
        }
    };

    // 2. Xác nhận tạo khóa học (Gửi API)
    const handleConfirmAdd = async () => {
        const values = formData;


        const selectedProv = providersList.find(p => p.providerId === values.provider);
        let educationLevel = mapSchoolingLevelIdToEducationLevel(values.educationLevel);
        let finalTotalFee = Number(values.calculatedTotalFee); 

        if (!finalTotalFee || finalTotalFee <= 0 || isNaN(finalTotalFee)) {
            messageApi.error('Invalid Total Fee');
            return;
        }

        // Tạo Payload chuẩn Backend
        const data = {
            courseName: values.courseName,
            providerId: values.provider,
            providerName: selectedProv ? selectedProv.providerName : '',
            
            modeOfTraining: values.mode,
            
            // Format ngày về ISO String (Start of day)
            courseStartDate: formatForBackend(values.startDate),
            courseEndDate: formatForBackend(values.endDate),       
            paymentOption: values.paymentOption,            
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
        } catch (err) {

            setIsReviewStep(false); 
            setTimeout(() => handleApiError(err), 100); 
        } finally {
            setSubmitting(false);
        }
    };

    return {
        form,
        contextHolder,
        messageApi,
        state: {
            isReviewStep,
            setIsReviewStep,
            submitting,
            loadingData,
            providersList,
            schoolingLevelsList,
            formData,
            providerSearchText
        },
        setters: {
            setProviderSearchText
        },
        handlers: {
            handleProceedToReview,
            handleConfirmAdd,
            fetchProviders
        }
    };
};