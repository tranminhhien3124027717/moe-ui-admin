// constants.js

// Training modes
export const MODE_OPTIONS = [
    { label: 'Online', value: 'Online' },
    { label: 'In-Person', value: 'In-Person' },
    { label: 'Hybrid', value: 'Hybrid' }
];

// Payment types
export const PAYMENT_OPTIONS = [
    { label: 'One Time', value: 'One-time' },
    { label: 'Recurring', value: 'Recurring' }
];

// Recurring cycles
export const BILLING_CYCLE_OPTIONS = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Quarterly', value: 'Quarterly' },
    { label: 'Bi-annually', value: 'Biannually' },
    { label: 'Annually', value: 'Yearly' }
];

// Payment due durations
export const PAYMENT_DUE_OPTIONS = [
    { label: '14 days after billing date', value: 14 },
    { label: '30 days after billing date', value: 30 }
];

// Schooling Level Mapping (ID to Name/Enum)
export const SCHOOLING_LEVEL_MAPPING = {
    'SL-001': 'Primary',
    'SL-002': 'Secondary',
    'SL-003': 'PostSecondary',
    'SL-004': 'Tertiary',
    'SL-005': 'PostGraduate'
};