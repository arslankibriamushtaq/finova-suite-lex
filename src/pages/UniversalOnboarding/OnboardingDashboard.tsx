import React, { useState, useEffect } from 'react';
import PulseLoading from "../../components/Loader/PulseLoader";
import { Button, Input, Dropdown, Menu, Spin, Tooltip } from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined,
  GlobalOutlined,
  SettingOutlined,
  DownOutlined,
  CheckCircleFilled,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-hot-toast';

// API Services
import { 
  getWorkflows, 
  getSteps, 
  createStep, 
  deleteStep,
  addFieldToStep,
  deleteField,
  publishWorkflow,
  getSubmissionData
} from '../../redux/apis/apisUniversalOnboarding';
import NewCountryModal from '../../components/UniversalOnboarding/NewCountryModal';

type ViewState = 'REGIONS' | 'ORCHESTRATOR';

const OnboardingDashboard: React.FC = () => {
  const [view, setView] = useState<ViewState>('REGIONS');
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  // Modal States
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<any>(null);
  const [stepPayload, setStepPayload] = useState({ 
    stepName: '', 
    apiUrl: '', 
    apiMethod: 'POST', 
    orderIndex: 1,
    apiHeaders: '{}',
    apiParamsMapping: '{}',
    apiBodyMapping: '{}'
  });

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<any>(null);
  const [fieldPayload, setFieldPayload] = useState({ 
    fieldLabel: '', 
    fieldType: 'STRING', 
    isPii: false, 
    isMandatory: true,
    validationRegex: null as string | null,
    orderIndex: 0
  });

  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [submissionData, setSubmissionData] = useState<any>(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setIsLoading(true);
      const res = await getWorkflows();
      // Handle { data: [], message: "success" } wrapper
      setCountries(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (error) {
      toast.error('Failed to fetch workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = async (country: any) => {
    setSelectedCountry(country);
    fetchSteps(country.countryCode);
  };

  const fetchSteps = async (code: string) => {
    setIsLoading(true);
    try {
      const res = await getSteps(code);
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const normalized = list.map((s: any) => ({
        ...s,
        fields: Array.isArray(s.fields) ? s.fields : []
      }));
      setSteps(normalized);
      setView('ORCHESTRATOR');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load steps');
      setSteps([]);
      setView('ORCHESTRATOR');
    } finally {
      setIsLoading(false);
    }
  };

  const openStepModal = (step?: any) => {
    if (step) {
      setEditingStep(step);
      setStepPayload({ 
        ...step,
        apiHeaders: typeof step.apiHeaders === 'object' ? JSON.stringify(step.apiHeaders, null, 2) : '{}',
        apiParamsMapping: typeof step.apiParamsMapping === 'object' ? JSON.stringify(step.apiParamsMapping, null, 2) : '{}',
        apiBodyMapping: typeof step.apiBodyMapping === 'object' ? JSON.stringify(step.apiBodyMapping, null, 2) : '{}'
      });
    } else {
      setEditingStep(null);
      setStepPayload({ 
        stepName: '', 
        apiUrl: '', 
        apiMethod: 'POST', 
        orderIndex: steps.length + 1,
        apiHeaders: '{}',
        apiParamsMapping: '{}',
        apiBodyMapping: '{}'
      });
    }
    setShowStepModal(true);
  };

  const openFieldModal = (stepId: any) => {
    setSelectedStepId(stepId);
    setFieldPayload({ 
      fieldLabel: '', 
      fieldType: 'STRING', 
      isPii: false, 
      isMandatory: true,
      validationRegex: null,
      orderIndex: 0
    });
    setShowFieldModal(true);
  };

  const saveStep = async () => {
    if (!stepPayload.stepName) return toast.error('Step name is required');
    if (!selectedCountry?.countryCode) return toast.error('Country code is missing');

    try {
      setIsLoading(true);
      
      // Explicitly construct payload to avoid {} issues
      const finalPayload = {
        countryCode: selectedCountry.countryCode,
        stepName: stepPayload.stepName,
        orderIndex: stepPayload.orderIndex,
        apiUrl: stepPayload.apiUrl,
        apiMethod: stepPayload.apiMethod,
        apiHeaders: stepPayload.apiHeaders === '{}' ? null : JSON.parse(stepPayload.apiHeaders || 'null'),
        apiParamsMapping: stepPayload.apiParamsMapping === '{}' ? null : JSON.parse(stepPayload.apiParamsMapping || 'null'),
        apiBodyMapping: stepPayload.apiBodyMapping === '{}' ? null : JSON.parse(stepPayload.apiBodyMapping || 'null')
      };

      console.log("Sending Step Payload:", finalPayload);
      await createStep(finalPayload);
      
      toast.success(editingStep ? 'Step updated successfully' : 'Step created successfully');
      setShowStepModal(false);
      fetchSteps(selectedCountry.countryCode);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save step. Check JSON format.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveField = async () => {
    if (!fieldPayload.fieldLabel) return toast.error('Field label is required');
    if (!selectedStepId) return toast.error('Step reference missing');

    try {
      setIsLoading(true);

      // Explicitly construct field payload
      const finalFieldPayload = {
        stepId: selectedStepId,
        fieldKey: fieldPayload.fieldLabel.toLowerCase().replace(/\s+/g, '_'),
        fieldLabel: fieldPayload.fieldLabel,
        fieldType: fieldPayload.fieldType,
        isMandatory: fieldPayload.isMandatory,
        isPii: fieldPayload.isPii,
        validationRegex: fieldPayload.validationRegex,
        orderIndex: fieldPayload.orderIndex,
        actionApiUrl: null,
        buttonLabel: null,
        actionApiMethod: "POST"
      };

      console.log("Sending Field Payload:", finalFieldPayload);
      await addFieldToStep(finalFieldPayload);
      
      toast.success('Field added successfully');
      setShowFieldModal(false);
      fetchSteps(selectedCountry.countryCode);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add field');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStepLocal = async (id: any) => {
    if (!window.confirm("Are you sure you want to delete this step and all its fields?")) return;
    try {
      setIsLoading(true);
      await deleteStep(id);
      toast.success("Step removed successfully");
      fetchSteps(selectedCountry.countryCode);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to remove step");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFieldLocal = async (fieldId: any) => {
    try {
      setIsLoading(true);
      await deleteField(fieldId);
      toast.success("Field removed successfully");
      fetchSteps(selectedCountry.countryCode);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to remove field");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedCountry?.countryCode) return;
    try {
      setIsLoading(true);
      await publishWorkflow(selectedCountry.countryCode);
      toast.success("Workflow successfully synchronized and published to Production.");
      setView('REGIONS');
      fetchCountries();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to publish workflow. Ensure all steps are valid.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmission = async () => {
    if (!submissionId) return toast.error("Enter a session ID");
    try {
      setIsLoading(true);
      const res = await getSubmissionData(submissionId);
      setSubmissionData(res.data);
      setShowSubmissionModal(true);
    } catch (error: any) {
      toast.error("Submission not found");
      setSubmissionData({ mock: "No data found for this session. Showing debug mock.", status: 404 });
      setShowSubmissionModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const pageStyles = `
    .universal-onboarding-page .uo-btn-black,
    .universal-onboarding-page .uo-btn-black.ant-btn-primary,
    .universal-onboarding-page .uo-btn-black.ant-btn-default {
      background-color: #000000 !important;
      border-color: #000000 !important;
      color: #ffffff !important;
    }
    .universal-onboarding-page .uo-btn-black:hover:not(:disabled),
    .universal-onboarding-page .uo-btn-black.ant-btn-primary:hover:not(:disabled),
    .universal-onboarding-page .uo-btn-black.ant-btn-default:hover:not(:disabled) {
      background-color: #1a1a1a !important;
      border-color: #1a1a1a !important;
      color: #ffffff !important;
    }
    .universal-onboarding-page .uo-btn-black .anticon,
    .universal-onboarding-page .uo-btn-black svg {
      color: #ffffff !important;
    }
    .universal-onboarding-page .country-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }
    .universal-onboarding-page .country-card {
      background-color: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px;
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
      position: relative;
    }
    .universal-onboarding-page .country-card:hover {
      border-color: var(--primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }
    .universal-onboarding-page .country-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background-color: var(--muted);
      color: var(--primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .universal-onboarding-page .status-pill {
      padding: 5px 10px;
      border-radius: 32px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .universal-onboarding-page .country-card-cta {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .universal-onboarding-page .country-card:hover .country-card-cta {
      opacity: 1;
    }
    .universal-onboarding-page .step-empty {
      text-align: center;
      padding: 60px 16px;
      background: var(--surface-card);
      border-radius: 12px;
      border: 1px dashed var(--border);
    }
    .universal-onboarding-page .step-card {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      margin-bottom: 16px;
    }
    .universal-onboarding-page .step-card-header {
      padding: 16px;
      background: var(--theme-table-background-color);
      border-bottom: 1px solid var(--surface-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .universal-onboarding-page .step-card-header h6,
    .universal-onboarding-page .step-card-header .step-endpoint-label,
    .universal-onboarding-page .step-card-header .step-endpoint-code {
      color: #ffffff !important;
    }
    .universal-onboarding-page .step-card-header .step-endpoint-code {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
    }
    .universal-onboarding-page .step-card-header .step-divider {
      background: rgba(255, 255, 255, 0.3);
    }
    .universal-onboarding-page .step-card-body {
      padding: 16px;
      background: var(--surface-card);
    }
    .universal-onboarding-page .step-index-badge {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--surface-card);
      border: 1px solid var(--border);
      color: var(--foreground);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }
    .universal-onboarding-page .step-endpoint-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .universal-onboarding-page .step-endpoint-code {
      font-size: 11px;
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 2px 6px;
      color: var(--foreground);
    }
    .universal-onboarding-page .step-icon-btn {
      height: 32px !important;
      width: 32px !important;
      border-radius: 6px !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .universal-onboarding-page .step-divider {
      width: 1px;
      height: 24px;
      background: var(--border);
      margin: 0 4px;
    }
    .universal-onboarding-page .step-add-field {
      height: 32px !important;
      border-radius: 6px !important;
      padding: 0 12px !important;
    }
    .universal-onboarding-page .field-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface-card);
      transition: background-color 0.15s ease;
    }
    .universal-onboarding-page .field-row:hover {
      background: var(--muted);
    }
    .universal-onboarding-page .field-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: var(--muted);
      color: var(--foreground);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .universal-onboarding-page .field-tag {
      display: inline-flex;
      align-items: center;
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      line-height: 1.2;
      border: 1px solid transparent;
    }
    .universal-onboarding-page .field-tag-type {
      color: #475569;
      background: #f1f5f9;
      border-color: #e2e8f0;
    }
    .universal-onboarding-page .field-tag-pii {
      color: #047857;
      background: #ecfdf5;
      border-color: #a7f3d0;
    }
    .universal-onboarding-page .field-tag-action {
      color: #1d4ed8;
      background: #eff6ff;
      border-color: #bfdbfe;
    }
    .universal-onboarding-page .field-tag-regex {
      color: #b45309;
      background: #fffbeb;
      border-color: #fde68a;
    }
    @media (max-width: 575.98px) {
      .universal-onboarding-page .step-card-header { flex-direction: column; align-items: stretch; }
    }
    /* Themed modals (Step / Field / Submission) */
    .uo-modal .modal-content {
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
      overflow: hidden;
    }
    .uo-modal .modal-header {
      padding: 18px 22px;
      border-bottom: 1px solid var(--border);
      background: var(--surface-card);
    }
    .uo-modal .modal-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--foreground);
    }
    .uo-modal .modal-body {
      padding: 20px 22px;
      background: var(--surface-card);
    }
    .uo-modal .modal-footer {
      padding: 14px 22px 18px;
      border-top: 1px solid var(--border);
      gap: 8px;
    }
    .uo-modal .form-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--foreground);
      margin-bottom: 6px;
    }
    .uo-modal .uo-section-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 8px;
    }
    .uo-modal .form-control,
    .uo-modal .form-select {
      height: 42px;
      border-radius: 8px !important;
      border: 1px solid var(--border) !important;
      font-size: 14px;
      padding: 8px 12px;
      background: var(--surface-card);
      color: var(--foreground);
    }
    .uo-modal textarea.form-control {
      height: auto;
      min-height: 80px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
    }
    .uo-modal .form-control:focus,
    .uo-modal .form-select:focus {
      border-color: var(--primary) !important;
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06) !important;
      outline: none;
    }
    .uo-modal .uo-validation-box {
      background: var(--muted);
      border: 1px dashed var(--border);
      border-radius: 10px;
      padding: 14px;
    }
    .uo-modal .form-switch .form-check-input:checked {
      background-color: var(--primary);
      border-color: var(--primary);
    }
    .uo-modal .uo-btn-cancel,
    .uo-modal .uo-btn-cancel.ant-btn {
      height: 40px !important;
      padding: 0 18px !important;
      border-radius: 8px !important;
      border: 1px solid var(--border) !important;
      background-color: var(--surface-card) !important;
      color: var(--foreground) !important;
      font-weight: 500;
    }
    .uo-modal .uo-btn-cancel:hover:not(:disabled),
    .uo-modal .uo-btn-cancel.ant-btn:hover:not(:disabled) {
      background-color: var(--muted) !important;
      color: var(--foreground) !important;
    }
    .uo-modal .uo-btn-submit,
    .uo-modal .uo-btn-submit.ant-btn,
    .uo-modal .uo-btn-submit.ant-btn-primary {
      height: 40px !important;
      padding: 0 22px !important;
      border-radius: 8px !important;
      background-color: #000000 !important;
      border-color: #000000 !important;
      color: #ffffff !important;
      font-weight: 600;
      min-width: 140px;
    }
    .uo-modal .uo-btn-submit:hover:not(:disabled),
    .uo-modal .uo-btn-submit.ant-btn:hover:not(:disabled),
    .uo-modal .uo-btn-submit.ant-btn-primary:hover:not(:disabled) {
      background-color: #1a1a1a !important;
      border-color: #1a1a1a !important;
      color: #ffffff !important;
    }
    .uo-modal .uo-btn-submit .anticon,
    .uo-modal .uo-btn-submit svg {
      color: #ffffff !important;
    }
    .uo-modal .uo-json-viewer {
      background: #0f172a;
      color: #34d399;
      padding: 16px;
      border-radius: 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      overflow: auto;
      max-height: 500px;
    }
  `;

  if (view === 'REGIONS') {
    return (
      <div className="service universal-onboarding-page">
        <style>{pageStyles}</style>
        <div className="mb-3 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
            {/* <GlobalOutlined style={{ color: "var(--primary)" }} /> */}
            Universal Onboarding Workflow
          </h3>
          <p className="text-muted small mb-0 mt-1">
            Manage country-specific journey flows and dynamic field configurations.
          </p>
        </div>

        {/* Filters card */}
        <div
          className="bg-white p-3 mb-3"
          style={{
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="d-flex flex-wrap align-items-center gap-2 w-100">
            <Input
              allowClear
              placeholder="Search workflows..."
              prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
              style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
            />
            <Input
              placeholder="Session ID..."
              prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
              style={{ flex: "1 1 220px", minWidth: 180, borderRadius: 2, height: 40 }}
            />
            <Button
              onClick={fetchSubmission}
              className="uo-btn-black"
              style={{ height: 40, borderRadius: 2, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Track
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              className="uo-btn-black"
              style={{ height: 40, borderRadius: 2, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Add New Country
            </Button>
          </div>
        </div>

        {/* Country cards */}
        <div
          className="bg-white p-3"
          style={{
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            border: "1px solid var(--border)",
          }}
        >
          {isLoading ? (
            <div className="text-center py-5 text-muted">
              <PulseLoading size="sm" />
              Loading workflows...
            </div>
          ) : countries.length === 0 ? (
            <div className="text-center py-5">
              <ExclamationCircleOutlined style={{ fontSize: 40, color: "var(--muted-foreground)" }} />
              <p className="text-muted mt-3 mb-0">No country workflows found. Add your first one!</p>
            </div>
          ) : (
            <div className="country-grid">
              {countries
                .filter(c =>
                  (c.workflowName || c.countryName || '')
                    .toLowerCase()
                    .includes(searchCountry.toLowerCase()) ||
                  (c.countryCode || '')
                    .toLowerCase()
                    .includes(searchCountry.toLowerCase())
                )
                .map((country) => {
                  const active = country.isActive !== false;
                  return (
                    <div
                      key={country.countryCode}
                      onClick={() => handleCountrySelect(country)}
                      className="country-card"
                    >
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="country-icon">
                          <GlobalOutlined style={{ fontSize: 22 }} />
                        </div>
                        <span
                          className="status-pill"
                          style={{
                            backgroundColor: active ? "var(--color-success)" : "var(--color-warning)",
                            color: "var(--primary-foreground)",
                          }}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <h5 className="fw-bold mb-1 text-dark">
                        {country.workflowName || country.countryName}
                      </h5>
                      <p className="text-muted small mb-0" style={{ letterSpacing: 0.4 }}>
                        {country.countryCode} REGION
                      </p>
                      <div className="country-card-cta">
                        <span style={{ color: "var(--primary)", fontWeight: 600, fontSize: 12 }}>
                          Configure Workflow
                        </span>
                        <ArrowLeftOutlined style={{ transform: "rotate(180deg)", color: "var(--primary)" }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <NewCountryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchCountries} />
      </div>
    );
  }

  return (
    <div className="service universal-onboarding-page">
       <style>{pageStyles}</style>
       <div className="mb-3 pb-2 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-3">
             <Button
               icon={<ArrowLeftOutlined />}
               onClick={() => setView('REGIONS')}
               style={{ height: 40, width: 40, borderRadius: 2, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
             />
             <div>
                <h4 className="mb-0 fw-bold">{selectedCountry?.workflowName || selectedCountry?.countryName} ({selectedCountry?.countryCode})</h4>
                <p className="text-muted small mb-0">Add, configure, and manage onboarding steps and fields.</p>
             </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
             <Button
               icon={<PlusOutlined />}
               onClick={() => openStepModal()}
               className="uo-btn-black"
               style={{ height: 40, borderRadius: 2 }}
             >
               Add Step
             </Button>
             <Button
               type="primary"
               className="uo-btn-black"
               style={{ height: 40, borderRadius: 2 }}
               onClick={handlePublish}
               loading={isLoading}
             >
               Publish Changes
             </Button>
          </div>
       </div>

          {/* Orchestrator Content */}
          <Row>
            <Col lg={7} xl={8}>
              {/* Steps List */}
              <div className="space-y-6">
             {steps.length === 0 ? (
               <div className="step-empty">
                  <ExclamationCircleOutlined style={{ fontSize: 40, color: "var(--muted-foreground)" }} />
                  <p className="text-muted mt-3 mb-2">No steps found for this country.</p>
                  <Button type="link" onClick={() => openStepModal()}>Create your first step</Button>
               </div>
             ) : (
               steps.map((step, index) => (
                 <div key={step.id} className="step-card">
                    <div className="step-card-header">
                       <div className="d-flex align-items-center gap-3">
                          <div className="step-index-badge">{index + 1}</div>
                          <div>
                             <h6 className="mb-0 fw-bold text-dark">{step.stepName}</h6>
                             <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                                <span className="step-endpoint-label">Endpoint:</span>
                                <code className="step-endpoint-code">{step.apiMethod} {step.apiUrl}</code>
                             </div>
                          </div>
                       </div>
                       <div className="d-flex gap-2 align-items-center flex-shrink-0">
                          <Tooltip title="Edit Step">
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => openStepModal(step)}
                              className="step-icon-btn"
                            />
                          </Tooltip>
                          <Tooltip title="Delete Step">
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => deleteStepLocal(step.id)}
                              className="step-icon-btn"
                            />
                          </Tooltip>
                          <div className="step-divider" />
                          <Button
                            size="small"
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => openFieldModal(step.id)}
                            className="uo-btn-black step-add-field"
                          >
                            Add Field
                          </Button>
                       </div>
                    </div>

                    <div className="step-card-body">
                       {(step.fields || []).length === 0 ? (
                         <p className="text-center text-muted small py-4 mb-0">No fields configured in this step.</p>
                       ) : (
                         <div className="d-flex flex-column gap-2">
                           {step.fields.map((field: any, fIdx: number) => (
                             <div key={fIdx} className="field-row">
                                <div className="d-flex align-items-center gap-3">
                                   <div className="field-icon">
                                      {field.fieldType === 'BUTTON' ? <GlobalOutlined style={{ fontSize: 14 }} /> : <SettingOutlined style={{ fontSize: 14 }} />}
                                   </div>
                                   <div>
                                      <p className="mb-0 fw-bold" style={{ fontSize: 14, color: "var(--foreground)" }}>{field.fieldLabel || field.label}</p>
                                      <div className="d-flex align-items-center gap-1 flex-wrap mt-1">
                                        <span className="field-tag field-tag-type">{field.fieldType}</span>
                                        {field.isPii && <span className="field-tag field-tag-pii">PII VAULT</span>}
                                        {field.actionApiUrl && <span className="field-tag field-tag-action">API ACTION</span>}
                                        {field.validationRegex && <span className="field-tag field-tag-regex">REGEX</span>}
                                      </div>
                                   </div>
                                </div>
                                    <div className="d-flex gap-2">
                                       <Button 
                                          type="text" 
                                          danger 
                                          icon={<DeleteOutlined />} 
                                          size="small" 
                                          onClick={() => deleteFieldLocal(field.id)}
                                          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-red-50"
                                       />
                                    </div>
                                 </div>
                               ))}
                            </div>
                          )}
                    </div>
                 </div>
               ))
             )}
              </div>
            </Col>

            {/* Live Preview Panel */}
            <Col lg={5} xl={4} className="d-none d-lg-block">
               <div className="sticky-top" style={{ top: '2rem' }}>
                  <div className="bg-white rounded-3xl p-4 shadow-xl border-8 border-slate-900 mx-auto overflow-hidden relative" style={{ width: '280px', height: '560px' }}>
                     {/* Mobile UI Header */}
                     <div className="bg-slate-900 h-6 w-32 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-10" />
                     
                     <div className="h-full overflow-y-auto pt-8 px-2 space-y-4 custom-scrollbar">
                        <div className="text-center pb-4">
                           <h6 className="fw-black text-slate-900 mb-0">{selectedCountry?.workflowName || 'Dynamic Flow'}</h6>
                           <p className="text-[10px] text-muted uppercase tracking-tighter">Live Preview Mode</p>
                        </div>

                        {steps.length === 0 ? (
                          <div className="text-center py-10 opacity-30 italic text-xs">Add steps to see preview</div>
                        ) : (
                          steps.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)).map((step, sIdx) => (
                            <div key={sIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                               <p className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest">{step.stepName}</p>
                               <div className="space-y-3">
                                  {(step.fields || []).map((field: any, fIdx: number) => (
                                    <div key={fIdx} className="space-y-1">
                                       <label className="text-[9px] font-bold text-slate-500 ms-1 uppercase">{field.fieldLabel || field.label}</label>
                                       {field.fieldType === 'BUTTON' ? (
                                         <Button size="small" type="primary" block className="rounded-lg text-[10px] h-8">{field.fieldLabel || 'Action Button'}</Button>
                                       ) : field.fieldType === 'DOCUMENT_SCAN' ? (
                                         <div className="border border-dashed border-slate-300 rounded-lg p-2 text-center bg-white">
                                            <GlobalOutlined className="text-slate-300 block mb-1" style={{ fontSize: 12 }} />
                                            <span className="text-[8px] text-slate-400">Scan Required</span>
                                         </div>
                                       ) : (
                                         <Input size="small" placeholder="..." disabled className="rounded-lg bg-white border-slate-200 text-[10px] h-8" />
                                       )}
                                    </div>
                                  ))}
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
                  <p className="text-center text-muted small mt-4 font-bold uppercase tracking-widest" style={{ fontSize: '10px' }}>Real-time Orchestrator Preview</p>
               </div>
            </Col>
          </Row>

       {/* Step Edit/Add Modal */}
       <Modal backdrop="static" keyboard={false} show={showStepModal} onHide={() => setShowStepModal(false)} centered className="uo-modal">
          <Modal.Header closeButton>
             <Modal.Title>{editingStep ? 'Edit Step Configuration' : 'Add New Step'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
             <Form>
                <Form.Group className="mb-3">
                   <Form.Label>Step Name</Form.Label>
                   <Form.Control
                    type="text"
                    value={stepPayload.stepName}
                    onChange={(e) => setStepPayload({ ...stepPayload, stepName: e.target.value })}
                    placeholder="e.g. Identity Scan"
                   />
                </Form.Group>
                <Row className="mb-3">
                   <Col md={4}>
                      <Form.Group>
                        <Form.Label>Method</Form.Label>
                        <Form.Select
                          value={stepPayload.apiMethod}
                          onChange={(e) => setStepPayload({ ...stepPayload, apiMethod: e.target.value })}
                        >
                           <option value="POST">POST</option>
                           <option value="GET">GET</option>
                           <option value="PUT">PUT</option>
                        </Form.Select>
                      </Form.Group>
                   </Col>
                   <Col md={8}>
                      <Form.Group>
                        <Form.Label>API Endpoint</Form.Label>
                        <Form.Control
                          type="text"
                          value={stepPayload.apiUrl}
                          onChange={(e) => setStepPayload({ ...stepPayload, apiUrl: e.target.value })}
                          placeholder="/api/v1/..."
                        />
                      </Form.Group>
                   </Col>
                </Row>
                <Form.Group className="mb-3">
                   <Form.Label>Custom Headers (JSON)</Form.Label>
                   <Form.Control
                     as="textarea"
                     rows={3}
                     value={stepPayload.apiHeaders}
                     onChange={(e) => setStepPayload({ ...stepPayload, apiHeaders: e.target.value })}
                     placeholder='{"Authorization": "Bearer ..."}'
                   />
                </Form.Group>
                <Row className="mb-3">
                   <Col md={6}>
                      <Form.Group>
                        <Form.Label>Params Mapping (JSON)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={stepPayload.apiParamsMapping}
                          onChange={(e) => setStepPayload({ ...stepPayload, apiParamsMapping: e.target.value })}
                          placeholder='{"third_party_id": "cnic"}'
                        />
                      </Form.Group>
                   </Col>
                   <Col md={6}>
                      <Form.Group>
                        <Form.Label>Body Mapping (JSON)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={stepPayload.apiBodyMapping}
                          onChange={(e) => setStepPayload({ ...stepPayload, apiBodyMapping: e.target.value })}
                          placeholder='{"customer_name": "full_name"}'
                        />
                      </Form.Group>
                   </Col>
                </Row>
                <Form.Group>
                   <Form.Label>Order Index</Form.Label>
                   <Form.Control
                    type="number"
                    value={stepPayload.orderIndex}
                    onChange={(e) => setStepPayload({ ...stepPayload, orderIndex: parseInt(e.target.value) })}
                   />
                </Form.Group>
             </Form>
          </Modal.Body>
          <Modal.Footer>
             <Button onClick={() => setShowStepModal(false)} className="uo-btn-cancel">Cancel</Button>
             <Button type="primary" onClick={saveStep} className="uo-btn-submit">Save Step</Button>
          </Modal.Footer>
       </Modal>

       {/* Field Edit/Add Modal */}
       <Modal backdrop="static" keyboard={false} show={showFieldModal} onHide={() => setShowFieldModal(false)} centered className="uo-modal">
          <Modal.Header closeButton>
             <Modal.Title>Add Field to Step</Modal.Title>
          </Modal.Header>
          <Modal.Body>
             <Form>
                <Form.Group className="mb-3">
                   <Form.Label>Field Label</Form.Label>
                   <Form.Control
                    type="text"
                    value={fieldPayload.fieldLabel}
                    onChange={(e) => setFieldPayload({ ...fieldPayload, fieldLabel: e.target.value })}
                    placeholder="e.g. Full Name"
                   />
                </Form.Group>
                <Row className="mb-3">
                   <Col md={6}>
                      <Form.Group>
                        <Form.Label>Field Type</Form.Label>
                        <Form.Select
                          value={fieldPayload.fieldType}
                          onChange={(e) => setFieldPayload({ ...fieldPayload, fieldType: e.target.value })}
                        >
                           <option value="STRING">STRING</option>
                           <option value="TEXT">TEXT</option>
                           <option value="NUMBER">NUMBER</option>
                           <option value="PHONE_NUMBER">PHONE NUMBER</option>
                           <option value="DOCUMENT_SCAN">DOCUMENT SCAN</option>
                           <option value="DATE_PICKER">DATE PICKER</option>
                        </Form.Select>
                      </Form.Group>
                   </Col>
                   <Col md={6}>
                      <Form.Group>
                         <Form.Label>Order Index</Form.Label>
                         <Form.Control
                          type="number"
                          value={fieldPayload.orderIndex}
                          onChange={(e) => setFieldPayload({ ...fieldPayload, orderIndex: parseInt(e.target.value) || 0 })}
                         />
                      </Form.Group>
                   </Col>
                </Row>

                <div className="uo-validation-box mb-3">
                   <div className="uo-section-label">Field Validation</div>
                   <Form.Group>
                      <Form.Label>Validation Regex</Form.Label>
                      <Form.Control
                        type="text"
                        value={fieldPayload.validationRegex || ''}
                        onChange={(e) => setFieldPayload({ ...fieldPayload, validationRegex: e.target.value || null })}
                        placeholder="^[0-9]+$"
                      />
                   </Form.Group>
                </div>
                <div className="d-flex gap-4 pt-1">
                   <Form.Check
                    type="switch"
                    id="uo-field-pii"
                    label="Is PII? (Vault Encryption)"
                    checked={fieldPayload.isPii}
                    onChange={(e) => setFieldPayload({ ...fieldPayload, isPii: e.target.checked })}
                   />
                   <Form.Check
                    type="switch"
                    id="uo-field-mandatory"
                    label="Mandatory?"
                    checked={fieldPayload.isMandatory}
                    onChange={(e) => setFieldPayload({ ...fieldPayload, isMandatory: e.target.checked })}
                   />
                </div>
             </Form>
          </Modal.Body>
          <Modal.Footer>
             <Button onClick={() => setShowFieldModal(false)} className="uo-btn-cancel">Cancel</Button>
             <Button type="primary" onClick={saveField} className="uo-btn-submit">Add Field</Button>
          </Modal.Footer>
       </Modal>

       {/* Submission Modal */}
       <Modal backdrop="static" keyboard={false} show={showSubmissionModal} onHide={() => setShowSubmissionModal(false)} size="lg" centered className="uo-modal">
          <Modal.Header closeButton>
             <Modal.Title>Submission Inspection</Modal.Title>
          </Modal.Header>
          <Modal.Body>
             <div className="uo-json-viewer">
                <pre style={{ margin: 0, color: "inherit", background: "transparent" }}>{JSON.stringify(submissionData, null, 2)}</pre>
             </div>
          </Modal.Body>
          <Modal.Footer>
             <Button onClick={() => setShowSubmissionModal(false)} className="uo-btn-cancel">Close Inspector</Button>
          </Modal.Footer>
       </Modal>
    </div>
  );
};

export default OnboardingDashboard;
