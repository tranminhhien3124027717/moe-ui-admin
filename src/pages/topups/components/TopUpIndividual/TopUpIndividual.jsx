import { Modal, Button, message } from "antd";
import { useState } from "react";
import StepHeader from "./components/StepHeader";
import AccountSelectList from "./components/AccountSelectList";
import DetailsForm from "./components/DetailsForm";
import PreviewPanel from "./components/PreviewPanel";
import styles from "./TopUpIndividual.module.scss";
import dayjs from "dayjs";
import useCreateTopUp from "../../../../hooks/topups/useCreateTopUp";

const TopUpIndividual = ({ open, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [formData, setFormData] = useState({
    description: "",
    remark: "",
    amount: 0,
    immediate: true,
    scheduledDateTime: null,
  });

  const handleStepChange = (newStep) => {
    setStep(newStep);
  };

  const handleClose = () => {
    // Reset state on modal close
    setStep(1);
    setSelectedAccounts([]);
    setFormData({
      description: "",
      remark: "",
      amount: 0,
      immediate: true,
      scheduledDateTime: null,
    });
    onClose();
  };
  
  const { createTopUp } = useCreateTopUp();

  const handleSubmit = async () => {
    // Final validation: scheduled time must be in the future
    if (!formData.immediate && formData.scheduledDateTime) {
      const scheduled = dayjs(formData.scheduledDateTime);
      if (scheduled.isBefore(dayjs())) {
        message.error("Scheduled time is in the past. Please adjust the schedule.");
        return;
      }
    }



    const body = {
      ruleName: null,
      topupAmount: parseFloat(formData.amount) || 0,
      ruleTargetType: 1,
      batchFilterType: null,
      scheduledTime: formData.immediate ? null : formData.scheduledDateTime,
      executeImmediately: !!formData.immediate,
      targetEducationAccountId: selectedAccounts.map(acc => acc.educationAccountId).filter(Boolean),
      minAge: null,
      maxAge: null,
      minBalance: null,
      maxBalance: null,
      educationLevelIds: [],
      schoolingStatusIds: [],
      description: formData.description || null,
      internalRemarks: formData.remark || null,
    };

    try {
      await createTopUp(body);
      message.success("Top-up created successfully");
      handleClose();
    } catch (err) {
      message.error(err?.message || "Failed to create top-up");
    }
  };

  return (
    <Modal
      open={open}
      footer={null}
      width={880}
      onCancel={handleClose}
      className={styles.topUpModal}
      centered
    >
      <div className={styles.container}>
        <h3 className={styles.title}>Top Up</h3>
        <p className={styles.subTitle}>Add funds to student accounts</p>

        <StepHeader step={step} />

        {step === 1 && (
          <AccountSelectList
            value={selectedAccounts}
            onChange={setSelectedAccounts}
            onNext={() => handleStepChange(2)}
          />
        )}

        {step === 2 && (
          <DetailsForm
            accounts={selectedAccounts}
            value={formData}
            onChange={setFormData}
            onBack={() => handleStepChange(1)}
            onNext={() => handleStepChange(3)}
          />
        )}

        {step === 3 && (
          <PreviewPanel
            accounts={selectedAccounts}
            data={formData}
            onBack={() => handleStepChange(2)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </Modal>
  );
};

export default TopUpIndividual;
