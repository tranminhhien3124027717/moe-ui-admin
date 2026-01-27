import dayjs from 'dayjs';

// Helper: Add suffix to days (1st, 2nd, 3rd)
export const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};

// Helper: Generate billing date options (1-28)
export const getBillingDateOptions = () => {
    return Array.from({ length: 28 }, (_, i) => {
        const day = i + 1;
        return {
            label: `${day}${getOrdinalSuffix(day)} of the month`,
            value: day
        };
    });
};

// Helper: Calculate duration in months (Exact float)
export const getCourseDurationMonths = (start, end) => {
    if (!start || !end) return 0;
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    return Math.max(0, endDate.diff(startDate, 'month', true));
};

// Helper: Calculate number of billing cycles
export const calculateCycles = (start, end, cycle) => {
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

// Helper: Check if a billing cycle is valid for the duration
export const isBillingCycleValid = (start, end, cycle) => {
    const months = getCourseDurationMonths(start, end);
    const threshold = 0.9;
    if (months <= 0) return false;
    switch (cycle) {
        case 'Monthly': return months >= 1 * threshold;
        case 'Quarterly': return months >= 3 * threshold;
        case 'Biannually': return months >= 6 * threshold;
        case 'Yearly': return months >= 12 * threshold;
        default: return true;
    }
};

// Helper: Format date for Backend
export const formatForBackend = (date) => {
    if (!date) return null;
    return dayjs(date).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
};

// Helper: Map Level ID to Name
export const mapSchoolingLevelIdToEducationLevel = (id) => {
    const mapping = {
        'SL-001': 'Primary',
        'SL-002': 'Secondary',
        'SL-003': 'PostSecondary',
        'SL-004': 'Tertiary',
        'SL-005': 'PostGraduate'
    };
    return mapping[id] || null;
};

export const formatBillingDateDisplay = (day) => {
    if (!day) return '-';
    return `${day}${getOrdinalSuffix(day)} of the month`;
};

export const formatPaymentDueDisplay = (days) => {
    if (!days) return '-';
    return `${days} days after billing date`;
};

export const formatDuration = (start, end) => {
    if (!start || !end) return '';
    const startDate = dayjs(start).startOf('day');
    const endDate = dayjs(end).endOf('day');
    const totalDays = endDate.diff(startDate, 'day') + 1; 

    if (totalDays < 30) {
        return `${totalDays} day${totalDays > 1 ? 's' : ''}`;
    }

    const totalMonths = endDate.diff(startDate, 'month', true);
    if (Math.abs(Math.round(totalMonths) - totalMonths) < 0.1) {
         const round = Math.round(totalMonths);
         return `${round} month${round > 1 ? 's' : ''}`;
    }
    const fixedMonths = parseFloat(totalMonths.toFixed(1));
    return `${fixedMonths} month${fixedMonths !== 1 ? 's' : ''}`;
};

// --- VALIDATORS ---

// [NEW] Validator số nguyên dương (không cho nhập số thập phân)
export const validateIntegerFee = (_, value) => {
    if (!value) return Promise.resolve(); // Để rule required lo
    
    // Check nếu có dấu chấm hoặc phẩy (số thập phân)
    if (value.toString().includes('.') || value.toString().includes(',')) {
        return Promise.reject(new Error('Decimals are not allowed'));
    }

    const num = Number(value);
    if (isNaN(num)) {
        return Promise.reject(new Error('Invalid number'));
    }
    if (num <= 0) {
        return Promise.reject(new Error('Fee must be greater than 0'));
    }
    return Promise.resolve();
};

export const validateFutureDate = (_, value) => {
    if (!value) return Promise.resolve();
    // Logic này sẽ được cover bởi disabledDate ở UI, nhưng validate thêm cho chắc
    const tomorrow = dayjs().add(1, 'day').startOf('day');
    if (value.isBefore(tomorrow)) {
        return Promise.reject(new Error('Start date must be from tomorrow onwards'));
    }
    return Promise.resolve();
};

export const validateEndDate = (form) => (_, value) => {
    if (!value) return Promise.resolve();
    const startDate = form.getFieldValue('startDate');
    if (!startDate) return Promise.resolve();

    if (value.isBefore(startDate) || value.isSame(startDate)) {
        return Promise.reject(new Error('End date must be after start date'));
    }
    return Promise.resolve();
};