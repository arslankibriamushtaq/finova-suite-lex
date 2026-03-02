import React, { useState, useEffect } from 'react';
import { getDeptWiseApplications, assignDepartment, addComment, getComments } from '../../redux/apis/apisCrud';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import Loader from '../Loader/Loader';
import { Form, Input, Modal, Select } from 'antd';
import AssignmentPanel from './AssignmentPanel';
import ManagerInfo from '../ApplicationDetails/ManagerInfo';
import BusinessInfo from '../ApplicationDetails/BusinessInfo';
import FactoringInfoModal from '../ApplicationDetails/FactoringInfo';
import BayanDetails from '../ApplicationDetails/BayanDetails';
import RevenueDetails from '../ApplicationDetails/RevenueDetails';
import ComplianceCheck from '../ApplicationDetails/ComplianceCheck';
import ApprovalStatus from '../ApplicationDetails/ApprovalStatus';
import CreditCheck from '../ApplicationDetails/CreditCheck';

interface LoanApplication {
  id: string;
  loan_application_number: string;
  company_name: string;
  amount: string;
  status_id?: string;
}
// const initialDummyData: Record<string, LoanApplication[]> = { ... };

const { TextArea } = Input
const ApplicationBoard = () => {
  const [applicationData, setApplicationData] = useState<Record<string, LoanApplication[]>>({});
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, LoanApplication[]> | null>(null);
  const [, setIsPreviewing] = useState(false);
  const [pendingMove, setPendingMove] = useState<(DropResult & { movedApp?: LoanApplication }) | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [dept, setDept] = useState<any>([])
  const [comment, setComment] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getApplications = async () => {
    setSkelitonLoading(true);
    try {
      const res = await getDeptWiseApplications();
      if (res?.data?.data) {
        const deptNames = res.data.data.map((dept: any) => dept);
        setDept(deptNames);
      }
      if (res?.data?.data /* && res?.data?.data?.loan_applications?.length > 0 */) {
        const formattedData: any = {};
        res.data.data.forEach((dept: any) => {
          const apps = Array.isArray(dept.loan_applications) ? dept.loan_applications : [];
          formattedData[dept.name] = apps
            .filter((app: any) => app)
            .map((app: any) => ({
              id: String(app.id ?? app.app_id ?? app.loan_application_id ?? ''),
              loan_application_number: String(app.loan_application_number ?? app.applicationNo ?? ''),
              company_name: String(app.company_name ?? app.customerName ?? ''),
              amount: String(app.amount ?? ''),
              status_id: String(app.status_id ?? ''),
            }))
            .filter((app: any) => app.id);
        });
        setApplicationData(formattedData);
      } else {
        toast.error(res?.data?.data)
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getApplications();
  }, []);

  const ApplicationCard = React.forwardRef<HTMLDivElement, { loan_application_number: string, company_name: string, amount: any, id: string, status_id?: string, draggableProps?: any, dragHandleProps?: any }>(({ loan_application_number, company_name, amount, id, status_id, draggableProps, dragHandleProps }, ref) => (
    <div
      ref={ref}
      className='application-card'
      onClick={() => {
        if (isDragging) return;
        setSelectedApplication({ id, loan_application_number, company_name, amount, status_id });
        setSidebarVisible(true);
      }}
      style={{ cursor: 'pointer' }}
      {...draggableProps}
      {...dragHandleProps}
    >
      <div style={{
        background: 'var(--theme-header-background-color)',
        padding: "16px",
        fontWeight: 700,
        fontSize: "14px",
        borderBottom: '1px solid var(--theme-header-background-color)',
        display: 'flex',
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
        justifyContent: 'space-between',
      }}>
        Application No: <span style={{ fontSize: "12px", fontWeight: 500 }}>{loan_application_number}</span>
      </div>
      <div style={{
        background: 'var(--background)',
        padding: "16px",
        fontSize: "14px",
        fontWeight: 700,
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        Customer: <span style={{fontSize: "13px", fontWeight: 500 }}>{company_name}</span>
      </div>
      <div style={{
        background: 'var(--background)',
        padding: "16px",
        fontWeight: 700,
        fontSize: "14px",
        display: 'flex',
        borderRadius: '10px',
        justifyContent: 'space-between',
      }}>
        Amount: <span style={{ fontSize: "13px", fontWeight: 500 }}>{amount}</span>
      </div>
    </div>
  ));

  const getHeaderColor = (dept: string) => {
    const colors: { [key: string]: string } = {
      Operations: "var(--dept-operations)",
      Accounts:   "var(--dept-accounts)",
      Compliance: "var(--dept-compliance)",
      HR:         "var(--dept-hr)",
      Sales:      "var(--dept-sales)",
      Risk:       "var(--dept-risk)",
      Credit:     "var(--dept-credit)",
      Marketing:  "var(--dept-marketing)",
    };
    return colors[dept] || "var(--theme-header-background-color)";
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    // Slight delay before allowing clicks again so a post-drag click doesn't trigger card open
    setTimeout(() => setIsDragging(false), 150);

    if (!destination || source.droppableId === destination.droppableId) {
      return;
    }
    // Don't optimistically move; wait for server confirmation
    const movedApp = applicationData[source.droppableId][source.index];
    setPreviewData(null);
    setPendingMove({ ...result, movedApp });
    setIsPreviewing(false);
    // Initialize dropdown to the dept ID of the drop target (map column name -> id)
    const destDeptObj = dept.find((d: any) => String(d?.name) === String(destination.droppableId));
    const destDeptId = destDeptObj ? String(destDeptObj.id) : String(destination.droppableId);
    setSelectedDepartment(destDeptId);
    setShowModal(true);
  };

  const confirmMove = async () => {
    if (!pendingMove || !pendingMove.destination || !pendingMove.movedApp) return;

    const { destination, movedApp } = pendingMove;
    // Use the dropdown-selected department id (string). Fallback to column's mapped id.
    const destDept = dept.find((d: any) => String(d?.name) === String(destination.droppableId));
    const fallbackDeptId = String(destDept?.id ?? destination.droppableId);
    const resolvedDeptId = String(selectedDepartment || fallbackDeptId);
    try {
        app_id: movedApp.id,
        department_id: resolvedDeptId,
      });
      const body = {
        app_id: movedApp.id,
        department_id: resolvedDeptId,
        comment: comment,
        user_id: "1",
        assignee_id: 1,
        comment_status: true,
        assignee_status: true,
        loan_application_number: movedApp.loan_application_number,
      }
      const res = await assignDepartment(body);

      // Update the applicationData with the new department assignment
      if (res?.data?.success) {
        // Move card to the department actually chosen in dropdown (resolvedDeptId)
        const targetDeptObj = dept.find((d: any) => String(d?.id) === String(resolvedDeptId));
        const targetDeptName = targetDeptObj ? String(targetDeptObj.name) : String(destination.droppableId);
        const sourceDeptName = String(pendingMove.source.droppableId);

        const nextData: any = JSON.parse(JSON.stringify(applicationData));
        // Remove from source
        const fromList = Array.from(nextData[sourceDeptName] ?? []);
        const idx = fromList.findIndex((a: any) => String(a?.id) === String(movedApp.id));
        if (idx > -1) fromList.splice(idx, 1);
        nextData[sourceDeptName] = fromList;
        // Add to target (avoid dupes)
        const toList = Array.from(nextData[targetDeptName] ?? []);
        if (!toList.find((a: any) => String(a?.id) === String(movedApp.id))) {
          toList.unshift(movedApp);
        }
        nextData[targetDeptName] = toList;

      setApplicationData(nextData);
      setPreviewData(null);
      setShowSuccessModal(true);
    } else {
      console.error("API failed:", res?.data?.message);
      toast.error("Failed to move application. Reverting...");
      // Revert by restoring the original applicationData snapshot to avoid duplication
      setApplicationData(applicationData);
      setPendingMove(null);
      setShowModal(false);
      setPreviewData(null);
      setIsPreviewing(false); 
      setComment('');
      setSelectedDepartment('')
    }} catch (err) {
    // Revert to the original department if the API call fails
    toast.error("Failed to move application. Reverting...");
    // Revert by restoring the original snapshot to avoid duplication
    setApplicationData(applicationData);
    setPendingMove(null); // Clear the pending move after resetting
    setShowModal(false); // Close the modal
    setPreviewData(null); // Clear preview data
    setIsPreviewing(false); 
    setComment('');
    setSelectedDepartment('')
  } finally {
    // Hide modal and clean up state
    setShowModal(false);
    setPendingMove(null);
    setPreviewData(null);
    setIsPreviewing(false);
    setComment('');
    setSelectedDepartment('')
  }
};


const cancelMove = () => {
    setShowModal(false);
    setPendingMove(null);
    setPreviewData(null);
    setIsPreviewing(false);
    setComment('');
    setSelectedDepartment('')
  };

  const ApplicationDetailsSidebar = () => {
    const [activeTab, setActiveTab] = useState('details');
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showFactoringModal, setShowFactoringModal] = useState(false);
    const [sidebarComment, setSidebarComment] = useState('');
    const [comments, setComments] = useState<any[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    const fetchComments = async () => {
      if (!selectedApplication?.id) return;
      try {
        setLoadingComments(true);
        const res = await getComments(selectedApplication.id);
        if (res?.data?.success && res?.data?.data) {
          // Convert the object to array
          const commentsArray = Object.values(res.data.data);
          setComments(commentsArray);
        }
      } catch (err: any) {
        console.error('Failed to fetch comments:', err);
      } finally {
        setLoadingComments(false);
      }
    };

    const handleSubmitSidebarComment = async () => {
      if (!selectedApplication || !sidebarComment?.trim()) return;
      try {
        const body: any = {
          loan_application_number: selectedApplication.loan_application_number,
          comment: sidebarComment.trim(),
        };
        const res = await addComment(body);
        if (res?.data?.message) {
          toast.success(res.data.message);
        } else {
          toast.success('Comment added successfully');
        }
        setSidebarComment('');
        // Refetch comments after adding new one
        fetchComments();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to add comment');
      }
    };


    // Trigger animation after component mounts
    useEffect(() => {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }, []);

    // Fetch comments when sidebar opens or application changes
    useEffect(() => {
      if (selectedApplication?.id) {
        fetchComments();
      }
    }, [selectedApplication?.id]);

    const sections = [
      'Business Information',
      'Manager Information',
      'Factoring Information',
      'Revenue Details',
      'Bayan Check',
      'Simah Check',
      'Compliance Check',
      'Credit Check',
      'Approval'
    ];

    return (
      <div className="sidebar-container" style={{
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)'
      }}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-tabs">
            <button
              onClick={() => setActiveTab('details')}
              className={`sidebar-tab ${activeTab === 'details' ? 'active' : 'inactive'}`}
            >
              Application Details
            </button>
            <button
              onClick={() => setActiveTab('assignment')}
              className={`sidebar-tab ${activeTab === 'assignment' ? 'active' : 'inactive'}`}
            >
              Assignment
            </button>
          </div>
          <button
            onClick={() => setSidebarVisible(false)}
            className="sidebar-close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="sidebar-body">
          {activeTab === 'assignment' && selectedApplication ? (
            <AssignmentPanel dept={dept} selectedApplication={selectedApplication} />
          ) : (
            <div className="sections-list">
              {sections.map((section) => (
                <div key={section}>
                  <div
                    className={`section-item ${activeSection === section ? 'active' : ''}`}
                    onClick={() => setActiveSection(section === activeSection ? null : section)}
                  >
                    <span className="section-label">{section}</span>
                    <span className="section-chevron">{activeSection === section ? '▲' : '▼'}</span>
                  </div>
                  {activeSection === section && section === 'Business Information' && selectedApplication && (
                    <div className="section-content">
                      <BusinessInfo applicationId={selectedApplication.id} />
                    </div>
                  )}
                  {activeSection === section && section === 'Manager Information' && selectedApplication && (
                    <div className="section-content">
                      <ManagerInfo applicationId={selectedApplication.id} />
                    </div>
                  )}
                  {activeSection === section && section === 'Factoring Information' && selectedApplication && (
                    <div className="section-content" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setShowFactoringModal(true)}
                        style={{
                          background: 'var(--primary)',
                          color: 'var(--primary-foreground)',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        View Factoring Details
                      </button>
                    </div>
                  )}
                  {selectedApplication && section === 'Factoring Information' && (
                    <FactoringInfoModal
                      open={showFactoringModal}
                      onClose={() => setShowFactoringModal(false)}
                      applicationId={selectedApplication.id} // <- pass the ID you already have
                    />
                  )}
                  {activeSection === section && section === 'Revenue Details' && selectedApplication && (
                    <div className="section-content">
                      <RevenueDetails applicationId={selectedApplication.id} />
                    </div>
                  )}
                  {activeSection === section && section === 'Compliance Check' && selectedApplication && (
                    <div className="section-content">
                      <ComplianceCheck applicationId={selectedApplication.id} applicationNo={selectedApplication.loan_application_number} />
                    </div>
                  )}
                  {activeSection === section && section === 'Credit Check' && selectedApplication && (
                    <div className="section-content">
                      <CreditCheck applicationId={selectedApplication.id} applicationNo={selectedApplication.loan_application_number} />
                    </div>
                  )}
                  {activeSection === section && section === 'Approval' && selectedApplication && (
                    <div className="section-content">
                      <ApprovalStatus 
                        applicationNo={selectedApplication.loan_application_number}
                        statusId={selectedApplication.status_id || ''}
                      />
                    </div>
                  )}
                  {activeSection === section && section === 'Bayan Check' && selectedApplication && (
                    <div className="section-content" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <BayanDetails applicationId={selectedApplication.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Section */}
        <div className="sidebar-comment-section">
          {/* All Comments Section - Only visible when input is focused */}
          {showComments && (
            <div style={{ 
              background: 'var(--muted)',
              borderRadius: '8px',
              marginBottom: '12px',
              overflow: 'hidden',
              border: '1px solid var(--border)'
            }}>
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--border)',
                  borderBottom: '1px solid var(--border)'
                }}
              >
                <h6 style={{ margin: 0, fontWeight: 600, fontSize: '15px', color: 'var(--foreground)' }}>All Comments</h6>
                <span
                  onClick={() => setShowComments(false)}
                  style={{ fontSize: '20px', fontWeight: 400, color: 'var(--muted-foreground)', cursor: 'pointer' }}
                >
                  —
                </span>
              </div>

              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                background: 'var(--background)',
                padding: '16px'
              }}>
                {loadingComments ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                    Loading comments...
                  </div>
                ) : comments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {comments.map((comment: any, idx: number) => (
                      <div 
                        key={comment.id || idx}
                        style={{
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'flex-start',
                          marginLeft: 'auto',
                          maxWidth: '95%'
                        }}
                      >
                        {/* Comment Card */}
                        <div style={{
                          flex: 1,
                          background: 'var(--card)',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          border: '1px solid var(--border)'
                        }}>
                          {/* Header with username and menu */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <span style={{
                              fontWeight: 600,
                              fontSize: '14px',
                              color: 'var(--foreground)'
                            }}>
                              super admin
                            </span>
                            <button style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0',
                              fontSize: '18px',
                              color: 'var(--muted-foreground)',
                              lineHeight: '1'
                            }}>
                              ⋯
                            </button>
                          </div>
                          
                          {/* Comment Text */}
                          <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '13px',
                            color: 'var(--foreground)',
                            wordBreak: 'break-word',
                            lineHeight: '1.5'
                          }}>
                            {comment.comment}
                          </p>
                          
                          {/* Timestamp */}
                          <div style={{
                            fontSize: '11px',
                            color: 'var(--muted-foreground)'
                          }}>
                            {comment.created_at ? new Date(comment.created_at).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            }) : ''}
                          </div>
                        </div>
                        
                        {/* User Avatar - Outside the card */}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'var(--color-avatar-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: 'var(--muted-foreground)',
                    fontSize: '13px'
                  }}>
                    No comments yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comment Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#90caf9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Write comment here...."
              value={sidebarComment}
              onChange={(e) => setSidebarComment(e.target.value)}
              onFocus={() => setShowComments(true)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitSidebarComment();
                }
              }}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                padding: '8px 0',
                color: 'var(--foreground)'
              }}
            />
            <button
              onClick={handleSubmitSidebarComment}
              disabled={!selectedApplication || !sidebarComment?.trim()}
              style={{
                background: 'var(--destructive)',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: sidebarComment?.trim() ? 'pointer' : 'not-allowed',
                opacity: sidebarComment?.trim() ? 1 : 0.5,
                color: '#fff',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" style={{ transform: 'rotate(-45deg)' }}>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const dataToRender = previewData ?? applicationData;

  return (
    <div className="application-board">
      {skelitonLoading && <Loader />}
      {sidebarVisible && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSidebarVisible(false)}
            className="backdrop"
          />
          {/* Sidebar */}
          <ApplicationDetailsSidebar />
        </>
      )}
      <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '16px' }}>
          {Object.keys(dataToRender).map((dept) => (
            <Droppable key={dept} droppableId={dept}>
              {(provided: any) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="col-3"
                  style={{ minWidth: "300px", flex: "1 1 300px" }}
                >
                  <div
                    className="column-header"
                    style={{
                      background: getHeaderColor(dept),
                      padding: "16px",
                      borderRadius: "10px 10px 0 0"
                    }}
                  >
                    <h5 style={{ margin: 0, fontWeight: 600 }}>{dept}</h5>
                  </div>
                  <div className="column-content" style={{ padding: '16px', background: 'transparent', borderRadius: "0 0 10px 10px" }}>
                    {dataToRender[dept].length > 0 ? (
                      dataToRender[dept].map((app: LoanApplication, index: number) => (
                        <Draggable key={app.id} draggableId={app.id} index={index}>
                          {(provided: any) => (
                            <ApplicationCard
                              ref={provided.innerRef}
                              {...app}
                              id={app.id}
                              draggableProps={provided.draggableProps}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <div style={{ textAlign: "center", color: "var(--muted-foreground)" }}>No applications</div>
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      <Modal
        title="Confirm Move"
        open={showModal}
        onCancel={cancelMove}
        footer={null}
        centered
      >
        <Form layout="vertical" className='mt-4'>
          <Form.Item label="Department">
            <Select
              value={selectedDepartment}
              onChange={(value) => setSelectedDepartment(value)}
              style={{ width: '100%' }}
            >
              {dept?.map((department: any) => (
                <Select.Option key={department.id} value={String(department.id)}>
                  {department.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Write comment here...">
            <TextArea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Add any comments here"
            />
          </Form.Item>
        </Form>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className='theme-btn-back me-2 px-2 py-1' onClick={cancelMove}>Cancel</button>
          <button className='theme-btn-next px-2 py-1' onClick={confirmMove}>Save</button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={showSuccessModal}
        footer={null}
        closable={false}
        centered
        width={600}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '20px 0',
          textAlign: 'center'
        }}>
          {/* Green Checkmark Circle */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '6px solid var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <svg 
              width="60" 
              height="60" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="var(--color-success)" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Verified Text */}
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--foreground)',
            marginBottom: '10px'
          }}>
            Verified!
          </h2>

          {/* Success Message */}
          <p style={{
            fontSize: '18px',
            color: 'var(--muted-foreground)',
            marginBottom: '30px'
          }}>
            Assigned successfully.
          </p>

          {/* OK Button */}
          <button
            onClick={() => setShowSuccessModal(false)}
            style={{
              background: 'var(--destructive)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 40px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              minWidth: '120px'
            }}
          >
            OK
          </button>
        </div>
      </Modal>
    </div>

  );
};

export default ApplicationBoard;
