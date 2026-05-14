import React, { useState, useEffect } from 'react';
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

  if (view === 'REGIONS') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="d-flex justify-content-between align-items-center mb-6 border-bottom pb-4 bg-white p-6 rounded-xl shadow-sm">
            <div>
              <h3 className="mb-0 fw-bold text-dark flex items-center gap-2">
                <GlobalOutlined className="text-blue-600" />
                Universal Onboarding Workflow
              </h3>
              <p className="text-muted small mb-0 mt-1">Manage country-specific journey flows and dynamic field configurations.</p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setIsModalOpen(true)}
              className="gradient-btn h-10 px-6 rounded-lg"
            >
              Add New Country
            </Button>
          </div>

          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 border-bottom bg-white d-flex gap-3">
              <Input
                allowClear
                placeholder="Search workflows..."
                prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                style={{ borderRadius: 8, height: 42 }}
              />
              <div className="d-flex gap-2 align-items-center bg-slate-50 border rounded-lg px-2">
                 <Input 
                   placeholder="Session ID..." 
                   className="border-0 bg-transparent" 
                   value={submissionId}
                   onChange={(e) => setSubmissionId(e.target.value)}
                 />
                 <Button type="text" icon={<SearchOutlined />} onClick={fetchSubmission}>Track</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
               {isLoading ? (
                 <div className="col-span-3 text-center py-16 text-muted">
                   <div className="spinner-border spinner-border-sm me-2" />
                   Loading workflows...
                 </div>
               ) : countries.length === 0 ? (
                 <div className="col-span-3 text-center py-16">
                   <ExclamationCircleOutlined style={{ fontSize: 40, color: '#d1d5db' }} />
                   <p className="text-muted mt-3">No country workflows found. Add your first one!</p>
                 </div>
               ) : (
                 countries
                   .filter(c =>
                     (c.workflowName || c.countryName || '')
                       .toLowerCase()
                       .includes(searchCountry.toLowerCase()) ||
                     (c.countryCode || '')
                       .toLowerCase()
                       .includes(searchCountry.toLowerCase())
                   )
                   .map((country) => (
                     <div
                      key={country.countryCode}
                      onClick={() => handleCountrySelect(country)}
                      className="bg-white border rounded-xl p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group relative"
                     >
                        <div className="d-flex justify-content-between align-items-start mb-4">
                           <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                              <GlobalOutlined style={{ fontSize: 24 }} />
                           </div>
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                             country.isActive !== false ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                           }`}>
                              {country.isActive !== false ? 'Active' : 'Inactive'}
                           </span>
                        </div>
                        <h4 className="fw-bold mb-1">{country.workflowName || country.countryName}</h4>
                        <p className="text-muted small mb-0 uppercase tracking-wider">{country.countryCode} Region</p>
                        <div className="mt-4 pt-4 border-top d-flex justify-content-between align-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-blue-600 font-bold text-xs">Configure Workflow</span>
                           <ArrowLeftOutlined className="rotate-180" />
                        </div>
                     </div>
                   ))
               )}
            </div>
          </Card>
        </div>
        <NewCountryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchCountries} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
       <div className="max-w-6xl mx-auto">
          {/* Orchestrator Header */}
          <div className="d-flex justify-content-between align-items-center mb-6 border-bottom pb-4 bg-white p-6 rounded-xl shadow-sm">
             <div className="d-flex align-items-center gap-4">
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => setView('REGIONS')}
                  className="rounded-lg h-10 w-10 flex items-center justify-center"
                />
                <div>
                   <h4 className="mb-0 fw-bold">{selectedCountry?.workflowName || selectedCountry?.countryName} ({selectedCountry?.countryCode})</h4>
                   <p className="text-muted small mb-0">Add, configure, and manage onboarding steps and fields.</p>
                </div>
             </div>
             <div className="d-flex gap-3">
                <Button 
                  icon={<PlusOutlined />} 
                  onClick={() => openStepModal()}
                  className="h-10 px-4 rounded-lg"
                >
                  Add Step
                </Button>
                <Button 
                  type="primary" 
                  className="gradient-btn h-10 px-6 rounded-lg"
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
               <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                  <ExclamationCircleOutlined style={{ fontSize: 40, color: '#d1d5db' }} className="mb-4" />
                  <p className="text-muted font-medium">No steps found for this country.</p>
                  <Button type="link" onClick={() => openStepModal()}>Create your first step</Button>
               </div>
             ) : (
               steps.map((step, index) => (
                 <Card key={step.id} className="border-0 shadow-sm rounded-xl overflow-hidden mb-4">
                    <div className="p-4 border-bottom bg-slate-50/50 d-flex justify-between align-items-center">
                       <div className="d-flex align-items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-blue-600 border shadow-sm">
                             {index + 1}
                          </div>
                          <div>
                             <h6 className="mb-0 fw-bold text-dark">{step.stepName}</h6>
                             <div className="d-flex align-items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-tight">Endpoint:</span>
                                <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border">{step.apiMethod} {step.apiUrl}</code>
                             </div>
                          </div>
                       </div>
                       <div className="d-flex gap-2">
                          <Tooltip title="Edit Step">
                            <Button 
                              size="small" 
                              icon={<EditOutlined />} 
                              onClick={() => openStepModal(step)}
                              className="flex items-center justify-center h-8 w-8"
                            />
                          </Tooltip>
                          <Tooltip title="Delete Step">
                            <Button 
                              size="small" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => deleteStepLocal(step.id)}
                              className="flex items-center justify-center h-8 w-8"
                            />
                          </Tooltip>
                          <div className="w-px h-8 bg-gray-200 mx-1" />
                          <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => openFieldModal(step.id)} className="h-8 px-4 rounded-lg">Add Field</Button>
                       </div>
                    </div>

                    <div className="p-0 bg-white">
                       <div className="p-6">
                          {(step.fields || []).length === 0 ? (
                            <p className="text-center text-muted small py-4 mb-0">No fields configured in this step.</p>
                          ) : (
                            <div className="space-y-3">
                               {step.fields.map((field: any, fIdx: number) => (
                                 <div key={fIdx} className="d-flex justify-between items-center p-4 border rounded-lg bg-gray-50/50 hover:bg-white transition-all group">
                                    <div className="d-flex align-items-center gap-4">
                                       <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                                          {field.fieldType === 'BUTTON' ? <GlobalOutlined style={{ fontSize: 14 }} /> : <SettingOutlined style={{ fontSize: 14 }} />}
                                       </div>
                                       <div>
                                          <p className="mb-0 font-bold text-sm text-slate-900">{field.fieldLabel || field.label}</p>
                                          <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
                                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">{field.fieldType}</span>
                                            {field.isPii && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded tracking-wider uppercase">PII VAULT</span>}
                                            {field.actionApiUrl && <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded tracking-wider uppercase">API ACTION</span>}
                                            {field.validationRegex && <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded tracking-wider uppercase">REGEX</span>}
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
                 </Card>
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
                                       <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">{field.fieldLabel || field.label}</label>
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
       </div>

       {/* Step Edit/Add Modal */}
       <Modal show={showStepModal} onHide={() => setShowStepModal(false)} centered>
          <Modal.Header closeButton>
             <Modal.Title>{editingStep ? 'Edit Step Configuration' : 'Add New Step'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
             <Form className="space-y-4">
                <Form.Group>
                   <Form.Label className="small fw-bold">Step Name</Form.Label>
                   <Form.Control 
                    type="text" 
                    value={stepPayload.stepName}
                    onChange={(e) => setStepPayload({ ...stepPayload, stepName: e.target.value })}
                    placeholder="e.g. Identity Scan"
                    className="h-11 rounded-lg"
                   />
                </Form.Group>
                <Row>
                   <Col md={4}>
                      <Form.Group>
                        <Form.Label className="small fw-bold">Method</Form.Label>
                        <Form.Select 
                          value={stepPayload.apiMethod}
                          onChange={(e) => setStepPayload({ ...stepPayload, apiMethod: e.target.value })}
                          className="h-11 rounded-lg"
                        >
                           <option value="POST">POST</option>
                           <option value="GET">GET</option>
                           <option value="PUT">PUT</option>
                        </Form.Select>
                      </Form.Group>
                   </Col>
                   <Col md={8}>
                      <Form.Group>
                        <Form.Label className="small fw-bold">API Endpoint</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={stepPayload.apiUrl}
                          onChange={(e) => setStepPayload({ ...stepPayload, apiUrl: e.target.value })}
                          placeholder="/api/v1/..."
                          className="h-11 rounded-lg"
                        />
                      </Form.Group>
                   </Col>
                </Row>
                <Row>
                   <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Custom Headers (JSON)</Form.Label>
                        <Form.Control 
                          as="textarea"
                          rows={3}
                          value={stepPayload.apiHeaders}
                          onChange={(e) => setStepPayload({ ...stepPayload, apiHeaders: e.target.value })}
                          placeholder='{"Authorization": "Bearer ..."}'
                          className="font-mono text-xs rounded-lg"
                        />
                      </Form.Group>
                   </Col>
                </Row>
                <Row>
                   <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Params Mapping (JSON)</Form.Label>
                        <Form.Control 
                          as="textarea"
                          rows={3}
                          value={stepPayload.apiParamsMapping}
                          onChange={(e) => setStepPayload({ ...stepPayload, apiParamsMapping: e.target.value })}
                          placeholder='{"third_party_id": "cnic"}'
                          className="font-mono text-xs rounded-lg"
                        />
                      </Form.Group>
                   </Col>
                   <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Body Mapping (JSON)</Form.Label>
                        <Form.Control 
                          as="textarea"
                          rows={3}
                          value={stepPayload.apiBodyMapping}
                          onChange={(e) => setStepPayload({ ...stepPayload, apiBodyMapping: e.target.value })}
                          placeholder='{"customer_name": "full_name"}'
                          className="font-mono text-xs rounded-lg"
                        />
                      </Form.Group>
                   </Col>
                </Row>
                <Form.Group>
                   <Form.Label className="small fw-bold">Order Index</Form.Label>
                   <Form.Control 
                    type="number" 
                    value={stepPayload.orderIndex}
                    onChange={(e) => setStepPayload({ ...stepPayload, orderIndex: parseInt(e.target.value) })}
                    className="h-11 rounded-lg"
                   />
                </Form.Group>
             </Form>
          </Modal.Body>
          <Modal.Footer>
             <Button onClick={() => setShowStepModal(false)}>Cancel</Button>
             <Button type="primary" className="gradient-btn h-10 px-6 rounded-lg" onClick={saveStep}>Save Step</Button>
          </Modal.Footer>
       </Modal>

       {/* Field Edit/Add Modal */}
       <Modal show={showFieldModal} onHide={() => setShowFieldModal(false)} centered>
          <Modal.Header closeButton>
             <Modal.Title>Add Field to Step</Modal.Title>
          </Modal.Header>
          <Modal.Body>
             <Form className="space-y-4">
                 <Form.Group>
                   <Form.Label className="small fw-bold">Field Label</Form.Label>
                   <Form.Control 
                    type="text" 
                    value={fieldPayload.fieldLabel}
                    onChange={(e) => setFieldPayload({ ...fieldPayload, fieldLabel: e.target.value })}
                    placeholder="e.g. Full Name"
                    className="h-11 rounded-lg"
                   />
                </Form.Group>
                <Row>
                   <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold">Field Type</Form.Label>
                        <Form.Select 
                          value={fieldPayload.fieldType}
                          onChange={(e) => setFieldPayload({ ...fieldPayload, fieldType: e.target.value })}
                          className="h-11 rounded-lg"
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
                         <Form.Label className="small fw-bold">Order Index</Form.Label>
                         <Form.Control 
                          type="number" 
                          value={fieldPayload.orderIndex}
                          onChange={(e) => setFieldPayload({ ...fieldPayload, orderIndex: parseInt(e.target.value) || 0 })}
                          className="h-11 rounded-lg"
                         />
                      </Form.Group>
                   </Col>
                </Row>
                
                <div className="bg-slate-50 p-3 rounded-lg border border-dashed space-y-3">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Field Validation</p>
                   <Form.Group>
                      <Form.Label className="text-[11px] fw-bold">Validation Regex</Form.Label>
                      <Form.Control 
                        type="text" 
                        size="sm"
                        value={fieldPayload.validationRegex || ''}
                        onChange={(e) => setFieldPayload({ ...fieldPayload, validationRegex: e.target.value || null })}
                        placeholder="^[0-9]+$"
                        className="rounded-md"
                      />
                   </Form.Group>
                </div>
                <div className="d-flex gap-4 pt-2">
                   <Form.Check 
                    type="switch" 
                    label="Is PII? (Vault Encryption)" 
                    checked={fieldPayload.isPii}
                    onChange={(e) => setFieldPayload({ ...fieldPayload, isPii: e.target.checked })}
                   />
                   <Form.Check 
                    type="switch" 
                    label="Mandatory?" 
                    checked={fieldPayload.isMandatory}
                    onChange={(e) => setFieldPayload({ ...fieldPayload, isMandatory: e.target.checked })}
                   />
                </div>
             </Form>
          </Modal.Body>
          <Modal.Footer>
             <Button onClick={() => setShowFieldModal(false)}>Cancel</Button>
             <Button type="primary" className="gradient-btn h-10 px-6 rounded-lg" onClick={saveField}>Add Field</Button>
          </Modal.Footer>
       </Modal>

       {/* Submission Modal */}
       <Modal show={showSubmissionModal} onHide={() => setShowSubmissionModal(false)} size="lg" centered>
          <Modal.Header closeButton>
             <Modal.Title>Submission Inspection</Modal.Title>
          </Modal.Header>
          <Modal.Body>
             <div className="bg-dark text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-auto max-h-[500px]">
                <pre>{JSON.stringify(submissionData, null, 2)}</pre>
             </div>
          </Modal.Body>
          <Modal.Footer>
             <Button onClick={() => setShowSubmissionModal(false)}>Close Inspector</Button>
          </Modal.Footer>
       </Modal>
    </div>
  );
};

export default OnboardingDashboard;
