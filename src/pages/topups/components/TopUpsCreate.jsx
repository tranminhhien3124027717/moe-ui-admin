import React, { useState } from "react";
import {
 Modal,
 notification,
} from "antd";
import dayjs from "dayjs";
import useCreateTopUp from "../../../hooks/topups/useCreateTopUp";
import { TeamOutlined, UserOutlined } from "@ant-design/icons";
import StepHeader from "./TopUpIndividual/components/StepHeader";
import AccountSelectList from "./TopUpIndividual/components/AccountSelectList";
import DetailsForm from "./TopUpIndividual/components/DetailsForm";
import PreviewPanel from "./TopUpIndividual/components/PreviewPanel";
import TopUpBatch from "./TopUpBatch/TopUpBatch";
import styles from "./TopUpsCreate.module.scss";


const TopUpsCreate = ({ open, onClose, onSuccess }) => {
 const [activeTab, setActiveTab] = useState("individual");
 const [submitting, setSubmitting] = useState(false);


 // Individual tab state
 const [step, setStep] = useState(1);
 const [selectedAccounts, setSelectedAccounts] = useState([]);
 const [formData, setFormData] = useState({
   description: "",
   remark: "",
   amount: 0,
   immediate: true,
 });


 // Batch tab state - lifted up to preserve when switching tabs
 const [batchStep, setBatchStep] = useState(1);
 const [batchFormData, setBatchFormData] = useState({
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
 const [batchValidationValid, setBatchValidationValid] = useState(true);


 const closeHandle = () => {
   setActiveTab("individual");
   // Reset individual state
   setStep(1);
   setSelectedAccounts([]);
   setFormData({
     description: "",
     remark: "",
     amount: 0,
     immediate: true,
   });
   // Reset batch state
   setBatchStep(1);
   setBatchFormData({
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
   setBatchValidationValid(true);
   onClose();
 };


 const { createTopUp } = useCreateTopUp();


 const submitIndividual = async () => {
   if (submitting) return;
  
   // Final validation for scheduled time
   if (!formData.immediate && formData.scheduledDateTime) {
     const scheduled = dayjs(formData.scheduledDateTime);
     if (scheduled.isBefore(dayjs())) {
       notification.error({ message: "Scheduled time is in the past. Please adjust the schedule." });
       return;
     }
   }


   const body = {
     ruleName: "Individual Rule",
     topupAmount: parseFloat(formData.amount) || 0,
     ruleTargetType: 1,
     batchFilterType: null,
     scheduledTime: formData.immediate ? null : formData.scheduledDateTime || null,
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


   setSubmitting(true);
   try {
     await createTopUp(body);
     notification.success({ message: "Success", description: "Individual top-up created successfully" });
     closeHandle();
     onSuccess?.();
   } catch (err) {
     notification.error({ message: "Error", description: err?.message || "Failed to create top-up" });
   } finally {
     setSubmitting(false);
   }
 };


 return (
   <Modal
     open={open}
     onCancel={closeHandle}
     footer={null}
     width={880}
     centered
     destroyOnClose
     closable={false}
     className={styles.createModal}
     bodyStyle={{ maxHeight: "85vh", overflowY: "auto", padding: "24px" }}
   
   >
     <div className={styles.header}>
       <h2>Top Up</h2>
       <p>Add funds to education accounts</p>
     </div>


     {/* Tab Toggle */}
     <div className={styles.tabToggle}>
       <button
         className={`${styles.tabBtn} ${activeTab === "individual" ? styles.active : ""}`}
         onClick={() => {
           setActiveTab("individual");
         }}
       >
         <UserOutlined /> Individual
       </button>
       <button
         className={`${styles.tabBtn} ${activeTab === "batch" ? styles.active : ""}`}
         onClick={() => {
           setActiveTab("batch");
         }}
       >
         <TeamOutlined /> Batch
       </button>
     </div>


     {/* Individual Tab */}
     {activeTab === "individual" && (
       <div className={styles.tabContent}>
         <StepHeader step={step} />


         {step === 1 && (
           <AccountSelectList
             value={selectedAccounts}
             onChange={setSelectedAccounts}
             onNext={() => setStep(2)}
             onCancel={closeHandle}
           />
         )}


         {step === 2 && (
           <DetailsForm
             accounts={selectedAccounts}
             value={formData}
             onChange={setFormData}
             onBack={() => setStep(1)}
             onNext={() => setStep(3)}
           />
         )}


         {step === 3 && (
           <PreviewPanel
             accounts={selectedAccounts}
             data={formData}
             onBack={() => setStep(2)}
             onSubmit={submitIndividual}
             loading={submitting}
           />
         )}
       </div>
     )}


     {/* Batch Tab */}
     {activeTab === "batch" && (
       <TopUpBatch
         step={batchStep}
         onStepChange={setBatchStep}
         formData={batchFormData}
         onFormDataChange={setBatchFormData}
         isValidationValid={batchValidationValid}
         onValidationChange={setBatchValidationValid}
         onSubmit={async (data) => {
           if (submitting) return;
          
           const body = {
             ruleName: data.ruleName || null,
             topupAmount: parseFloat(data.amount) || 0,
             ruleTargetType: 0,
             batchFilterType: data.targetAccounts,
             scheduledTime: data.immediate ? null : data.scheduledDateTime || null,
             executeImmediately: !!data.immediate,
             targetEducationAccountId: [],
             minAge: data.targetAccounts === 1 ? (data.minAge ? parseInt(data.minAge) : null) : null,
             maxAge: data.targetAccounts === 1 ? (data.maxAge ? parseInt(data.maxAge) : null) : null,
             minBalance: data.targetAccounts === 1 ? (data.minBalance ? parseFloat(data.minBalance) : null) : null,
             maxBalance: data.targetAccounts === 1 ? (data.maxBalance ? parseFloat(data.maxBalance) : null) : null,
             educationLevelIds: data.educationStatus || [],
             schoolingStatusIds: data.SchoolingStatuses || [],
             description: data.description || null,
             internalRemarks: data.remark || null,
           };


           setSubmitting(true);
           try {
             await createTopUp(body);
             notification.success({ message: "Success", description: "Batch top-up created successfully" });
             closeHandle();
             onSuccess?.();
           } catch (err) {
             notification.error({ message: "Error", description: err?.message || "Failed to create top-up" });
           } finally {
             setSubmitting(false);
           }
         }}
         onClose={closeHandle}
         loading={submitting}
       />
     )}
   </Modal>
 );
};


export default TopUpsCreate;





