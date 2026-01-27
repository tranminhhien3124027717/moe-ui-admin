import { useState, useCallback } from "react";
import { Button, message } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import BatchStepHeader from "./components/BatchStepHeader";
import BatchForm from "./components/BatchForm";
import BatchPreview from "./components/BatchPreview";
import { useAllAccountsList, useFilterBatchList } from "../../../../hooks/topups/useFilteredAccounts";




import styles from "./TopUpBatch.module.scss";




dayjs.extend(utc);
dayjs.extend(timezone);




const TopUpBatch = ({
 onSubmit,
 onClose,
 loading,
 // Props from parent for state preservation
 step: propStep,
 onStepChange,
 formData: propFormData,
 onFormDataChange,
 isValidationValid: propIsValidationValid,
 onValidationChange: propOnValidationChange,
}) => {
 // Use props if provided, otherwise use local state (backward compatibility)
 const [localStep, setLocalStep] = useState(1);
 const [localFormData, setLocalFormData] = useState({
   ruleName: "",
   amount: "",
   description: "",
   remark: "",
   targetAccounts: 0,
   minAge: "",
   maxAge: "",
   minBalance: "",
   maxBalance: "",
   educationStatus: [],
   SchoolingStatuses: [],
   immediate: true,
   scheduleDate: "",
   scheduleTime: "",
   eligibleAccountsCount: 0,
   educationLevels: [],
   schoolingStatuses: [],
 });
 const [localIsValidationValid, setLocalIsValidationValid] = useState(true);


 // Determine which state to use
 const step = propStep !== undefined ? propStep : localStep;
 const setStep = onStepChange || setLocalStep;
 const formData = propFormData !== undefined ? propFormData : localFormData;
 const setFormData = onFormDataChange || setLocalFormData;
 const isValidationValid = propIsValidationValid !== undefined ? propIsValidationValid : localIsValidationValid;
 const setIsValidationValid = propOnValidationChange || setLocalIsValidationValid;




// Use the new hook for fetching all accounts when "Everyone" is selected
const { total: allAccountsTotal } = useAllAccountsList();
 // Use the hook for fetching filtered accounts when "Customized" is selected
const { data: filteredAccounts, total: filteredTotal, fetchData: fetchFilteredAccounts, loading: filterLoading } = useFilterBatchList();




const hasAnyFilterValue = (value) => {
return (
  !!value.minAge ||
  !!value.maxAge ||
  !!value.minBalance ||
  !!value.maxBalance ||
  (value.educationStatus && value.educationStatus.length > 0) ||
  (value.SchoolingStatuses && value.SchoolingStatuses.length > 0)
);
};




const handleFormChange = (updatedData) => {
  setFormData((prev) => ({
    ...prev,
    ...updatedData,
  }));
};




// Callback from BatchForm when validation state changes
const handleValidationChange = useCallback((isValid) => {
  setIsValidationValid(isValid);
}, [setIsValidationValid]);




// Compute eligible accounts count - use allAccountsTotal for Everyone option, filteredTotal for Customized
const effectiveEligibleCount = formData.targetAccounts === 0
  ? allAccountsTotal
  : filteredTotal;




const handleNext = async () => {
  // If customized targeting, fetch eligible accounts before going to preview
  if (formData.targetAccounts === 1 && hasAnyFilterValue(formData)) {
    const filterParams = {
      MinAge: formData.minAge || undefined,
      MaxAge: formData.maxAge || undefined,
      MinBalance: formData.minBalance || undefined,
      MaxBalance: formData.maxBalance || undefined,
      EducationLevelsIds: formData.educationStatus?.length > 0 ? formData.educationStatus : undefined,
      SchoolingStatusesIds: formData.SchoolingStatuses?.length > 0 ? formData.SchoolingStatuses : undefined,
    };
    await fetchFilteredAccounts(filterParams);
  }
  setStep(2);
};




const handleBack = () => {
  setStep(1);
};




const handleSubmit = () => {
  // Validate eligible accounts for customized targeting
  if (formData.targetAccounts === 1 && filteredTotal <= 0) {
    message.error("Eligible accounts must be greater than 0 to submit");
    return;
  }
   let submitData = { ...formData };




  // If scheduled (not immediate), combine date and time and convert to UTC
  if (!formData.immediate && formData.scheduleDate && formData.scheduleTime) {
    // Parse the date and time separately
    const dateObj = dayjs(formData.scheduleDate, "DD/MM/YYYY");
    const timeObj = dayjs(formData.scheduleTime, "HH:mm");




    // Validate that both date and time are valid
    if (!dateObj.isValid() || !timeObj.isValid()) {
      console.error("Invalid date or time format");
      return;
    }




    // Combine date and time
    const combinedDateTime = dateObj
      .hour(timeObj.hour())
      .minute(timeObj.minute())
      .second(0)
      .millisecond(0);




    // Validate combined date is valid before converting to ISO
    if (!combinedDateTime.isValid()) {
      console.error("Invalid combined date/time");
      return;
    }




    // Convert to UTC
    const utcDateTime = combinedDateTime.utc().toISOString();




    submitData = {
      ...submitData,
      scheduledDateTime: utcDateTime,
      scheduleDate: undefined,
      scheduleTime: undefined,
    };
  }




  if (onSubmit) {
    onSubmit(submitData);
  }
  if (onClose) {
    onClose();
  }
};




// Check if form is valid for button state
const isFormValid = () => {
  // 1️⃣ Required fields
  const hasRequiredFields =
    !!formData.ruleName &&
    !!formData.amount &&
    parseFloat(formData.amount) > 0 &&
    !!formData.description;




  if (!hasRequiredFields) return false;




  // 2️⃣ Validation errors from BatchForm
  if (!isValidationValid) return false;




  // 3️⃣ Customized logic - only check if at least one filter is set (eligible count will be checked on submit)
  if (formData.targetAccounts === 1) {
    const hasCustomizedFilter = hasAnyFilterValue(formData);
    if (!hasCustomizedFilter) return false;
  }




  // 4️⃣ Schedule
  if (!formData.immediate) {
    return !!formData.scheduleDate && !!formData.scheduleTime;
  }




  return true;
};












return (
  <div className={styles.container}>
    <BatchStepHeader step={step} />
    <div className={styles.content}>
      <div className={styles.formContent}>
        {step === 1 ? (
          <BatchForm
            value={formData}
            onChange={handleFormChange}
            onNext={handleNext}
            onValidationChange={handleValidationChange}
          />
        ) : (
          <BatchPreview
            data={formData}
            onBack={handleBack}
            onSubmit={handleSubmit}
            matchingAccounts={effectiveEligibleCount || 0}
            eligibleAccounts={filteredAccounts}
            educationLevels={formData.educationLevels}
            schoolingStatuses={formData.schoolingStatuses}
          />
        )}
      </div>
      <div className={styles.footer}>
        {step === 1 && (
          <Button onClick={onClose} type="default" disabled={loading}>
            Cancel
          </Button>
        )}
        {step === 2 && (
          <Button onClick={handleBack} type="default" disabled={loading}>
            Back
          </Button>
        )}
        <Button
          type="primary"
          onClick={step === 1 ? handleNext : handleSubmit}
          disabled={
            (step === 1 && !isFormValid()) ||
            (step === 2 && (effectiveEligibleCount === 0 || loading)) ||
            filterLoading
          }
          loading={(step === 1 && filterLoading) || (step === 2 && loading)}
        >
          {step === 1 ? "Continue & Preview" : "Confirm & Submit"}
        </Button>
      </div>
    </div>
  </div>
);
};




export default TopUpBatch;





