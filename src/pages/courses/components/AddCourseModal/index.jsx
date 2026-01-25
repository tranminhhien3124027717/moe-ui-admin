// index.jsx
import React from 'react';
import { Modal, Button } from 'antd';
import { CloseOutlined, ArrowRightOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAddCourseLogic } from './useAddCourseLogic';
import AddCourseForm from './AddCourseForm';
import AddCourseReview from './AddCourseReview';
import styles from './AddCourseModal.module.scss';

const AddCourseModal = ({ open, onClose, onAdd }) => {
    const { 
        form, contextHolder, state, setters, handlers 
    } = useAddCourseLogic(open, onAdd, onClose);

    const { isReviewStep, submitting, loadingData, providersList, schoolingLevelsList, formData } = state;

    // Render Footer Content dựa trên Step hiện tại
    const renderFooter = () => (
        <div className={styles.modalFooter}>
            {!isReviewStep ? (
                <>
                    <Button onClick={onClose} className={styles.cancelButton}>Cancel</Button>
                    <Button type="primary" onClick={handlers.handleProceedToReview} className={styles.submitButton}>
                        Review Course <ArrowRightOutlined />
                    </Button>
                </>
            ) : (
                <>
                    <Button onClick={() => state.setIsReviewStep(false)} className={styles.cancelButton}>
                        <ArrowLeftOutlined /> Back to Edit
                    </Button>
                    <Button type="primary" onClick={handlers.handleConfirmAdd} loading={submitting} className={styles.submitButton}>
                        Confirm & Create <CheckCircleOutlined />
                    </Button>
                </>
            )}
        </div>
    );

    return (
        <>
            {contextHolder}
            <Modal
                open={open}
                onCancel={onClose}
                footer={null} // Important: Disable default footer
                closeIcon={<CloseOutlined />}
                width={700} // Match SCSS width
                className={styles.addCourseModal}
                centered
                destroyOnClose
            >
                {/* Fixed Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {isReviewStep ? 'Review Course Details' : 'Add New Course'}
                    </h2>
                    <p className={styles.modalSubtitle}>
                        {isReviewStep ? 'Please review all information.' : 'Enter course details.'}
                    </p>
                </div>

                {/* Scrollable Body */}
                <div className={styles.modalContentScrollable}>
                    {!isReviewStep ? (
                        <AddCourseForm 
                            form={form}
                            providers={providersList}
                            levels={schoolingLevelsList}
                            loading={loadingData}
                            onSearchProvider={(val) => setters.setProviderSearchText(val)}
                        />
                    ) : (
                        <AddCourseReview 
                            data={formData} 
                            providers={providersList} 
                        />
                    )}
                </div>

                {/* Fixed Footer */}
                {renderFooter()}
            </Modal>
        </>
    );
};

export default AddCourseModal;