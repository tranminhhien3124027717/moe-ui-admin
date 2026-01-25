import { useEffect, useState } from "react";
import { courseService } from "../../services/courseService";

export const useCourseDetail = (courseCode) => {
    const [course, setCourse] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCourseDetail = async () => {
        if (!courseCode) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const response = await courseService.getCourseDetail(courseCode);
            console.log('Fetched course detail:', response);
            // Map backend response to frontend state
            const mappedCourse = {
                courseId: response.data.courseId,
                courseCode: response.data.courseCode,
                courseName: response.data.courseName,
                providerId: response.data.providerId,
                providerName: response.data.providerName,
                educationLevel: response.data.educationLevel,
                mode: response.data.modeOfTraining,
                status: response.data.status,
                startDate: response.data.startDate,
                endDate: response.data.endDate,
                paymentType: response.data.paymentType,
                billingCycle: response.data.billingCycle,
                totalFee: response.data.totalFee,
                fee: response.data.totalFee, // Alias for compatibility
                feePerCycle: response.data.feePerCycle,
                billingDate: response.data.billingDate,
                paymentDue: response.data.paymentDue
            };
            setCourse(mappedCourse);
            
            // Map enrolled students
            const mappedStudents = (response.data.enrolledStudents || []).map(student => ({
                educationAccountId: student.educationAccountId || student.EducationAccountId,
                accountHolderId: student.accountHolderId || student.AccountHolderId,
                studentName: student.studentName || student.StudentName,
                userName: student.studentName || student.StudentName,
                nric: student.nric || student.NRIC || '-',
                enrolledAt: student.enrolledAt || student.EnrolledAt,
                totalPaid: student.totalPaid || student.TotalPaid || 0,
                totalDue: student.totalDue || student.TotalDue || 0
            }));
            setEnrolledStudents(mappedStudents);
        } catch (err) {
            console.error('Error fetching course detail:', err);
            setError(err.message || 'Failed to load course details');
            setCourse(null);
            setEnrolledStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseDetail();
    }, [courseCode]);

    return {
        course,
        enrolledStudents,
        loading,
        error,
        refetch: fetchCourseDetail
    };
};
