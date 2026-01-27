import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, Tag, Table, Input, Modal, Checkbox, message, Spin, Empty, Popconfirm, Select, Form, DatePicker } from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    UserAddOutlined,
    SearchOutlined,
    UserDeleteOutlined,
    CheckOutlined,
    CloseOutlined,
    ExclamationCircleOutlined,
    DollarOutlined,
    BookOutlined,
    BankOutlined,
    CalendarOutlined,
    CreditCardOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    LockOutlined
} from '@ant-design/icons';
import { courseService } from '../../../services/courseService';
import { useCourseDetail } from '../../../hooks/courses/useCourseDetail';
import StatusTag from '../../../components/common/StatusTag/StatusTag';
import styles from './index.module.scss';

const { Search } = Input;

// Utility function to format enum values by adding spaces between words
const formatEnumValue = (value) => {
    if (!value) return '-';
    // Add space before capital letters and trim
    return value.replace(/([A-Z])/g, ' $1').trim();
};

const CourseDetail = () => {
    const { courseCode } = useParams();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    // Use custom hook for course detail
    const { course, enrolledStudents, loading, error, refetch } = useCourseDetail(courseCode);

    // State
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [enrolledSearchQuery, setEnrolledSearchQuery] = useState('');
    const [isRemoveMode, setIsRemoveMode] = useState(false);
    const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm] = Form.useForm();
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [schoolingLevels, setSchoolingLevels] = useState([]);
    const [loadingSchoolingLevels, setLoadingSchoolingLevels] = useState(false);

    // Show error message if fetch failed
    useEffect(() => {
        if (error) {
            messageApi.error(error);
        }
    }, [error, messageApi]);

    // Fetch available students (non-enrolled)
    const fetchAvailableStudents = async () => {
        if (!course) return;
        try {
            const response = await courseService.getNonEnrolledAccounts(course.courseId);
            setAvailableStudents(response.nonEnrolledAccounts || []);
        } catch (error) {
            messageApi.error('Failed to load available students');
            console.error('Error fetching available students:', error);
        }
    };

    useEffect(() => {
        if (isAddStudentModalOpen && course) {
            fetchAvailableStudents();
        }
    }, [isAddStudentModalOpen, course]);

    // Calculate stats
    const totalCollected = useMemo(() => {
        return enrolledStudents.reduce((sum, student) => sum + (student.totalPaid || 0), 0);
    }, [enrolledStudents]);

    const totalOutstanding = useMemo(() => {
        return enrolledStudents.reduce((sum, student) => sum + (student.totalDue || 0), 0);
    }, [enrolledStudents]);

    // Filter available students
    const filteredAvailableStudents = useMemo(() => {
        if (!studentSearchQuery.trim()) return availableStudents;
        const query = studentSearchQuery.toLowerCase();
        return availableStudents.filter(student =>
            student.fullName?.toLowerCase().includes(query) ||
            student.nric?.toLowerCase().includes(query)
        );
    }, [availableStudents, studentSearchQuery]);

    // Filter enrolled students
    const filteredEnrolledStudents = useMemo(() => {
        if (!enrolledSearchQuery.trim()) return enrolledStudents;
        const query = enrolledSearchQuery.toLowerCase();
        return enrolledStudents.filter(student =>
            (student.studentName || student.userName)?.toLowerCase().includes(query) ||
            student.nric?.toLowerCase().includes(query)
        );
    }, [enrolledStudents, enrolledSearchQuery]);

    // Toggle student selection
    const toggleStudentSelection = (studentId) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    // Toggle enrollment selection
    const toggleEnrollmentSelection = (studentId) => {
        console.log('Toggling student ID:', studentId);
        setSelectedEnrollmentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    // Select all enrollments
    const toggleSelectAllEnrollments = () => {
        if (selectedEnrollmentIds.length === filteredEnrolledStudents.length) {
            setSelectedEnrollmentIds([]);
        } else {
            const ids = filteredEnrolledStudents.map(s => {
                const id = s.educationAccountId || s.EducationAccountId;
                if (!id) {
                    console.warn('Missing educationAccountId for student:', s);
                }
                return id;
            }).filter(Boolean);
            setSelectedEnrollmentIds(ids);
        }
    };

    // Handle add students
    const handleAddStudents = async () => {
        if (selectedStudentIds.length === 0 || !course) return;

        setSubmitting(true);
        try {
            await courseService.bulkEnrollStudents(courseCode, {
                accountIds: selectedStudentIds
            });

            messageApi.success(`Successfully enrolled ${selectedStudentIds.length} student(s)`);
            setIsAddStudentModalOpen(false);
            setSelectedStudentIds([]);
            setStudentSearchQuery('');

            // Refresh course detail
            refetch();
        } catch (error) {
            messageApi.error(error.message || 'Failed to enroll students');
            console.error('Error enrolling students:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle remove students
    const handleRemoveStudents = async () => {
        if (selectedEnrollmentIds.length === 0 || !course) return;

        console.log('Selected Education Account IDs:', selectedEnrollmentIds);

        setSubmitting(true);
        try {
            await courseService.bulkRemoveStudents(courseCode, {
                EducationAccountIds: selectedEnrollmentIds
            });

            messageApi.success(`Successfully removed ${selectedEnrollmentIds.length} student(s)`);
            setSelectedEnrollmentIds([]);
            setIsRemoveMode(false);

            // Refresh course detail
            refetch();
        } catch (error) {
            console.error('Remove students error:', error);
            messageApi.error(error.message || 'Failed to remove students');
            console.error('Error removing students:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete course
    const handleDeleteCourse = async () => {
        // Implement if needed
        messageApi.info('Delete course functionality not implemented');
    };

    // Handle edit course
    // Handle edit course
    const handleEditCourse = async () => {
        if (!course) return;

        // Populate form with current values
        editForm.setFieldsValue({
            courseName: course.courseName,
            // [QUAN TRỌNG] Chỗ này phải đảm bảo course.educationLevel là ID (ví dụ 'SL-001') 
            // hoặc Name tùy theo cách backend lưu. 
            // Nếu Select bên dưới dùng ID thì ở đây phải là ID.
            educationLevel: course.educationLevel || undefined,
            endDate: course.endDate ? new Date(course.endDate) : null,
            mode: course.mode || 'Online',
            status: course.status,
        });

        setIsEditModalOpen(true);

        // Fetch schooling levels
        // [SỬA KHÚC NÀY]
        if (course.providerId) {
            setLoadingSchoolingLevels(true);
            try {
                const response = await courseService.getProviderSchoolingLevels(course.providerId);
                // API returns { data: [...] } so we need to access response.data
                // setSchoolingLevels(response.data || []);
                console.log("API Response Raw:", response);
                setSchoolingLevels(response.data || []);
            } catch (error) {
                messageApi.error('Failed to load education levels');
                console.error('Error fetching schooling levels:', error);
            } finally {
                setLoadingSchoolingLevels(false);
            }
        }
    };

    const handleSaveEdit = async () => {
        try {
            const values = await editForm.validateFields();
            setEditSubmitting(true);

            const updateData = {
                courseName: values.courseName,
                educationLevel: values.educationLevel || null,
                learningType: values.mode,
                status: values.status || null,
            };

            await courseService.updateCourse(courseCode, updateData);
            messageApi.success('Course updated successfully');
            setIsEditModalOpen(false);

            // Refresh course detail
            refetch();
        } catch (error) {
            if (error.errorFields) {
                messageApi.error('Please fill in all required fields');
            } else {
                messageApi.error(error.message || 'Failed to update course');
            }
        } finally {
            setEditSubmitting(false);
        }
    };

    // Enrolled students table columns
    const enrolledColumns = [
        ...(isRemoveMode ? [{
            title: (
                <Checkbox
                    checked={selectedEnrollmentIds.length === filteredEnrolledStudents.length && filteredEnrolledStudents.length > 0}
                    onChange={toggleSelectAllEnrollments}
                />
            ),
            dataIndex: 'select',
            key: 'select',
            width: 50,
            render: (_, record) => {
                const id = record.educationAccountId || record.EducationAccountId;
                if (!id) {
                    console.warn('Missing educationAccountId for record:', record);
                    return null;
                }
                return (
                    <Checkbox
                        checked={selectedEnrollmentIds.includes(id)}
                        onChange={() => toggleEnrollmentSelection(id)}
                        onClick={(e) => e.stopPropagation()}
                    />
                );
            }
        }] : []),
        {
            title: 'Student Name',
            dataIndex: 'studentName',
            key: 'studentName',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{record.studentName || record.userName || text}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{record.nric || '-'}</div>
                </div>
            )
        },
        {
            title: 'Enrolled Date',
            dataIndex: 'enrolledAt',
            key: 'enrolledAt',
            render: (date) => date ? new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }) : '-'
        }
    ];

    // Available students table columns
    const availableColumns = [
        {
            title: (
                <Checkbox
                    checked={selectedStudentIds.length === filteredAvailableStudents.length && filteredAvailableStudents.length > 0}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedStudentIds(filteredAvailableStudents.map(s => s.educationAccountId));
                        } else {
                            setSelectedStudentIds([]);
                        }
                    }}
                />
            ),
            dataIndex: 'select',
            key: 'select',
            width: 50,
            render: (_, record) => (
                <Checkbox
                    checked={selectedStudentIds.includes(record.educationAccountId)}
                    onChange={() => toggleStudentSelection(record.educationAccountId)}
                />
            )
        },
        {
            title: 'Student Name',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{record.nric || '-'}</div>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className={styles.emptyContainer}>
                <Empty description="Course not found" />
                <Button type="primary" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>
                    Back to Courses
                </Button>
            </div>
        );
    }

    const billingCycleLabels = {
        'Monthly': 'Monthly',
        'Quarterly': 'Quarterly',
        'Biannually': 'Bi-annually',
        'Yearly': 'Annually'
    };

    return (
        <div className={styles.courseDetailContainer}>
            {contextHolder}

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        type="text"
                        className={styles.backBtn}
                    />
                    <div>
                        <div className={styles.titleRow}>
                            <h1 className={styles.pageTitle}>{course.courseName}</h1>
                            <StatusTag status={course.status} />
                        </div>
                        <span className={styles.subtitle}>{course.courseCode}</span>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <Button icon={<EditOutlined />} onClick={handleEditCourse}>
                        Edit
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsContainer}>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#e0f2fe' }}>
                            <UserAddOutlined style={{ color: '#0284c7', fontSize: 24 }} />
                        </div>
                        <div className={styles.statDetails}>
                            <div className={styles.statLabel}>Total Enrolled</div>
                            <div className={styles.statValue}>{enrolledStudents.length}</div>
                        </div>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#eef7ec' }}>
                            <DollarOutlined style={{ color: '#66b30e', fontSize: 24 }} />
                        </div>
                        <div className={styles.statDetails}>
                            <div className={styles.statLabel}>Total Fee</div>
                            <div className={styles.statValue}>${(course?.totalFee || course?.fee || 0).toFixed(2)}</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Course Details */}
            <Card title="Course Details" className={styles.detailsCard}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', padding: '4px 0' }}>
                    {/* Course Name */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <BookOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Course Name</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{course.courseName}</div>
                        </div>
                    </div>

                    {/* Provider */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <BankOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Provider</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{course.providerName}</div>
                        </div>
                    </div>

                    {/* Education Level */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <BookOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Education Level</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{formatEnumValue(course.educationLevel)}</div>
                        </div>
                    </div>

                    {/* Payment Type */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CreditCardOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Payment Type</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{course.paymentType || 'One Time'}</div>
                        </div>
                    </div>

                    {/* Course Start */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CalendarOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Course Start</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                {course.startDate ? new Date(course.startDate).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                }) : '-'}
                            </div>
                        </div>
                    </div>

                    {/* Course End */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CalendarOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Course End</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                {course.endDate ? new Date(course.endDate).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                }) : '-'}
                            </div>
                        </div>
                    </div>

                    {/* Billing Cycle */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <ReloadOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Billing Cycle</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                {course.paymentType === 'Recurring'
                                    ? (course.billingCycle ? billingCycleLabels[course.billingCycle] || course.billingCycle : '-')
                                    : '—'
                                }
                            </div>
                        </div>
                    </div>

                    {/* Fee per Cycle */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <DollarOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Fee per Cycle</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                {course.paymentType === 'Recurring' && course.feePerCycle
                                    ? `$${course.feePerCycle.toFixed(2)} / ${course.billingCycle ? billingCycleLabels[course.billingCycle] || course.billingCycle : 'Cycle'}`
                                    : '—'
                                }
                            </div>
                        </div>
                    </div>

                    {/* Billing Day */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CalendarOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Billing Date</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                {course.billingDate
                                    ? `${course.billingDate}${course.billingDate === 1 ? 'st' : course.billingDate === 2 ? 'nd' : course.billingDate === 3 ? 'rd' : 'th'} of the month`
                                    : '-'
                                }
                            </div>
                        </div>
                    </div>

                    {/* Payment Due */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CreditCardOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Payment Due</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                {course.paymentDue ? `${course.paymentDue} days after billing` : '-'}
                            </div>
                        </div>
                    </div>

                    {/* Course Status */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CheckCircleOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Course Status</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                <Tag color={course.status === 'Active' ? 'green' : 'red'}>
                                    {course.status}
                                </Tag>
                            </div>
                        </div>
                    </div>

                    {/* Mode of Training */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <BookOutlined style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Mode of Training</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{formatEnumValue(course.mode)}</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Enrolled Students */}
            <Card
                title="Enrolled Students"
                className={styles.studentsCard}
                extra={
                    <div className={styles.studentsActions}>
                        {isRemoveMode ? (
                            <>
                                <Button
                                    onClick={() => {
                                        setIsRemoveMode(false);
                                        setSelectedEnrollmentIds([]);
                                    }}
                                    icon={<CloseOutlined />}
                                >
                                    Cancel
                                </Button>
                                <Popconfirm
                                    title="Remove Accounts"
                                    description={`Are you sure you want to remove ${selectedEnrollmentIds.length} account(s)?`}
                                    onConfirm={handleRemoveStudents}
                                    okText="Remove"
                                    cancelText="Cancel"
                                    okButtonProps={{ danger: true }}
                                    disabled={selectedEnrollmentIds.length === 0}
                                >
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<UserDeleteOutlined />}
                                        loading={submitting}
                                        disabled={selectedEnrollmentIds.length === 0}
                                    >
                                        Remove Selected ({selectedEnrollmentIds.length})
                                    </Button>
                                </Popconfirm>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setIsRemoveMode(true)}
                                    icon={<UserDeleteOutlined />}
                                    disabled={enrolledStudents.length === 0}
                                >
                                    Remove Accounts
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<UserAddOutlined />}
                                    onClick={() => setIsAddStudentModalOpen(true)}
                                    disabled={course?.status === 'Inactive'}
                                >
                                    Add Accounts
                                </Button>
                            </>
                        )}
                    </div>
                }
            >
                <Search
                    placeholder="Search by name or NRIC..."
                    value={enrolledSearchQuery}
                    onChange={(e) => setEnrolledSearchQuery(e.target.value)}
                    style={{ marginBottom: 16, width: 300 }}
                    allowClear
                />
                <Table
                    columns={enrolledColumns}
                    dataSource={filteredEnrolledStudents}
                    rowKey={(record) => record.educationAccountId || record.EducationAccountId || `fallback-${record.accountHolderId}`}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: 'No students enrolled' }}
                    onRow={(record) => ({
                        onClick: () => {
                            if (!isRemoveMode) {
                                navigate(`/accounts/${record.accountHolderId}`);
                            }
                        },
                        style: { cursor: isRemoveMode ? 'default' : 'pointer' }
                    })}
                />
            </Card>

            {/* Add Accounts Modal */}
            <Modal
                title="Add Accounts to Course"
                open={isAddStudentModalOpen}
                onCancel={() => {
                    setIsAddStudentModalOpen(false);
                    setSelectedStudentIds([]);
                    setStudentSearchQuery('');
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setIsAddStudentModalOpen(false);
                            setSelectedStudentIds([]);
                            setStudentSearchQuery('');
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="add"
                        type="primary"
                        onClick={handleAddStudents}
                        loading={submitting}
                        disabled={selectedStudentIds.length === 0}
                    >
                        Add {selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ''} Account(s)
                    </Button>
                ]}
                width={700}
            >
                <Search
                    placeholder="Search by name or NRIC..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    style={{ marginBottom: 16 }}
                    allowClear
                />
                <Table
                    columns={availableColumns}
                    dataSource={filteredAvailableStudents}
                    rowKey="educationAccountId"
                    pagination={{ pageSize: 8 }}
                    locale={{ emptyText: 'No available students' }}
                    scroll={{ y: 400 }}
                />
            </Modal>

            {/* Edit Course Modal */}
            <Modal
                title="Edit Course"
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    editForm.resetFields();
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setIsEditModalOpen(false);
                            editForm.resetFields();
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        onClick={handleSaveEdit}
                        loading={editSubmitting}
                    >
                        Save Changes
                    </Button>
                ]}
                width={700}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    style={{ marginTop: 24 }}
                >
                    {/* Course Name */}
                    <Form.Item
                        label="Course Name"
                        name="courseName"
                        rules={[{ required: true, message: 'Please enter course name' }]}
                    >
                        <Input placeholder="Enter course name" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {/* Provider - Locked */}
                        <Form.Item
                            label={
                                <span>
                                    Provider <LockOutlined style={{ fontSize: '12px', color: '#8c8c8c', marginLeft: '4px' }} />
                                </span>
                            }
                        >
                            <Input
                                value={course.providerName}
                                disabled
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                        </Form.Item>

                        {/* Education Level - Editable */}
                        <Form.Item
                            label="Education Level"
                            name="educationLevel"
                            rules={[{ required: false }]}
                        >
                            <Select
                                placeholder="Select education level"
                                loading={loadingSchoolingLevels}
                                disabled={loadingSchoolingLevels}
                            >
                                {schoolingLevels.map((level) => (
                                    <Select.Option key={level.id} value={level.name}>
                                        {level.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    {/* Course Start and End - Locked */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            label={
                                <span>
                                    Course Start <LockOutlined style={{ fontSize: '12px', color: '#8c8c8c', marginLeft: '4px' }} />
                                </span>
                            }
                        >
                            <Input
                                value={course.startDate ? new Date(course.startDate).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                }) : '-'}
                                disabled
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span>
                                    Course End <LockOutlined style={{ fontSize: '12px', color: '#8c8c8c', marginLeft: '4px' }} />
                                </span>
                            }
                        >
                            <Input
                                value={course.endDate ? new Date(course.endDate).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                }) : '-'}
                                disabled
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {/* Billing Cycle - Locked */}
                        <Form.Item
                            label={
                                <span>
                                    Billing Cycle <LockOutlined style={{ fontSize: '12px', color: '#8c8c8c', marginLeft: '4px' }} />
                                </span>
                            }
                        >
                            <Input
                                value={course.paymentType === 'Recurring'
                                    ? (course.billingCycle ? billingCycleLabels[course.billingCycle] || course.billingCycle : '-')
                                    : '—'
                                }
                                disabled
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                        </Form.Item>

                        {/* Fee per Cycle - Locked */}
                        <Form.Item
                            label={
                                <span>
                                    Fee per Cycle <LockOutlined style={{ fontSize: '12px', color: '#8c8c8c', marginLeft: '4px' }} />
                                </span>
                            }
                        >
                            <Input
                                value={course.paymentType === 'Recurring' && course.feePerCycle
                                    ? `$${course.feePerCycle.toFixed(2)}`
                                    : '—'
                                }
                                disabled
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {/* Mode of Training */}
                        <Form.Item
                            label="Mode of Training"
                            name="mode"
                            rules={[{ required: true, message: 'Please select mode of training' }]}
                        >
                            <Select placeholder="Select mode">
                                <Select.Option value="Online">Online</Select.Option>
                                <Select.Option value="In-Person">In-Person</Select.Option>
                                <Select.Option value="Hybrid">Hybrid</Select.Option>
                            </Select>
                        </Form.Item>

                        {/* Status */}
                        <Form.Item
                            label={
                                course.endDate && new Date(course.endDate) < new Date() ? (
                                    <span>
                                        Status <LockOutlined style={{ fontSize: '12px', color: '#8c8c8c', marginLeft: '4px' }} />
                                    </span>
                                ) : (
                                    'Status'
                                )
                            }
                            name="status"
                            rules={[{ required: true, message: 'Please select status' }]}
                            tooltip={course.endDate && new Date(course.endDate) < new Date() ? 'Status cannot be changed after course end date' : ''}
                        >
                            <Select
                                placeholder="Select status"
                                disabled={course.endDate && new Date(course.endDate) < new Date()}
                                style={course.endDate && new Date(course.endDate) < new Date() ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                            >
                                <Select.Option value="Active">Active</Select.Option>
                                <Select.Option value="Inactive">Inactive</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default CourseDetail;
