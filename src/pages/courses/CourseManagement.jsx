import { useState } from 'react';
import dayjs from 'dayjs';
import { Button, Table, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AddCourseModal from './components/AddCourseModal/AddCourseModal';
import CourseFilter from './components/CourseFilter/CourseFilter';
import { useCourseList } from '../../hooks/courses/useCourseList';
import { courseService } from '../../services/courseService';
import styles from './CourseManagement.module.scss';

const CourseManagement = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { loading, data, total, filter, updateFilter, changePage, updateSort, fetchData } = useCourseList();

    const dataSource = data.map((course) => ({
        key: course.courseCode || course.courseId,
        courseId: course.courseId,
        courseCode: course.courseCode,
        courseName: course.courseName,
        provider: course.providerName || '',
        mode: course.modeOfTraining || '',
        startDate: course.startDate ? dayjs(course.startDate).format("DD/MM/YY") : '',
        endDate: course.endDate ? dayjs(course.endDate).format("DD/MM/YY") : '',
        paymentType: course.paymentType || '-',
        billingCycle: course.billingCycle || '-',
        totalFee: course.totalFee ? `$${course.totalFee.toLocaleString()}` : '$0.00',
        enrolled: course.enrolledCount !== undefined ? course.enrolledCount : 0
    }));

    const handleAddCourse = async (values) => {
        try {
            // Validate total fee
            const totalFee = parseFloat(values.totalFee);
            if (!totalFee || totalFee <= 0) {
                messageApi.error('Total fee must be greater than 0');
                return;
            }

            const payload = {
                courseName: values.name,
                providerId: values.providerId,
                providerName: values.providerName,
                modeOfTraining: values.mode,
                courseStartDate: values.startDate ? dayjs(values.startDate).toISOString() : null,
                courseEndDate: values.endDate ? dayjs(values.endDate).toISOString() : null,
                paymentOption: values.payment?.Type,
                billingCycle: values.billingCycle,
                totalFee: totalFee,
                feePerCycle: parseFloat(values.feePerCycle),
                status: values.status,
                educationLevel: values.educationLevel,
                billingDate: values.billingDate,
                paymentDue: values.paymentDue
            };

            await courseService.createCourse(payload);
            messageApi.success('Course added successfully');
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
            messageApi.error(err.message || 'Failed to create course');
        }
    };

    const handleTableChange = (pagination, filters, sorter) => {
        if (pagination.current !== filter.PageNumber || pagination.pageSize !== filter.PageSize) {
            changePage(pagination.current, pagination.pageSize);
        }

        if (sorter.field) {
            updateSort(sorter.field, sorter.order);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const columns = [
        {
            title: 'Course Code',
            dataIndex: 'courseCode',
            key: 'courseCode',
            width: 160,
            className: styles.columnCourseId,
            render: (text) => <span style={{ color: '#64748b' }}>{text}</span>
        },
        {
            title: 'Course Name',
            dataIndex: 'courseName',
            key: 'courseName',
            className: styles.columnCourseName,
            sorter: true,
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
        },
        {
            title: 'Provider',
            dataIndex: 'provider',
            key: 'provider',
            className: styles.ColumnProvider,
            sorter: true,
            render: (text) => <span className={styles.providerText}>{text}</span>
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            width: 160,
            className: styles.columnDate,
            sorter: true,
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 160,
            className: styles.columnDate,
            sorter: true,
        },
        {
            title: 'Payment Type',
            dataIndex: 'paymentType',
            key: 'paymentType',
            width: 160,
            className: styles.columnPaymentType,
        },
        {
            title: 'Billing Cycle',
            dataIndex: 'billingCycle',
            key: 'billingCycle',
            width: 160,
        },
        {
            title: 'Total Fee',
            dataIndex: 'totalFee',
            key: 'totalFee',
            className: styles.columnTotalFee,
            sorter: true,
            width: 160,
            render: (text) => <span style={{ fontWeight: 600 ,color: '#0f766e'}}>S{text}</span>
        },
        {
            title: 'Mode of Training',
            dataIndex: 'mode',
            key: 'mode',
            className: styles.columnMode,
        },
        {
            title: 'Enrolled',
            dataIndex: 'enrolled',
            key: 'enrolled',
            width: 110,
            className: styles.columnEnrolled,
            align: 'left'
        },
    ]

    return (
        <div className={styles.courseManagementContainer}>
            {contextHolder}
            <div className={styles.pageHeader}>
                <div className={styles.headerTop}>
                    <h1 className={styles.pageTitle}>Course Management</h1>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className={styles.addButton}
                        onClick={handleOpenModal}
                    >
                        Add Course
                    </Button>
                </div>
                <p className={styles.pageDescription}>
                    Manage courses and student enrollments. Click on a course to view details.
                </p>
            </div>

            <CourseFilter
                filter={filter}
                updateFilter={updateFilter}
                total={total}
                dataCount={data?.length || 0}
            />

            <div className={styles.tableSection}>
                <Table
                    loading={loading}
                    dataSource={dataSource}
                    columns={columns}
                    pagination={{
                        current: filter.PageNumber,
                        pageSize: filter.PageSize,
                        total: total,
                        showSizeChanger: true
                    }}
                    onChange={handleTableChange}
                    className={styles.courseTable}
                    onRow={(record) => ({
                        onClick: () => navigate(`/courses/${record.courseId}`),
                        style: { cursor: 'pointer' }
                    })}
                    rowKey="courseId"
                    scroll={{ x: 'max-content' }}
                />
            </div>

            <AddCourseModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onAdd={handleAddCourse}
            />
        </div>
    );
};

export default CourseManagement