import { useEffect, useState } from "react";
import { Button as AntButton } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Row, Col, Form, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { createLatePayment, getDelinquencyByStatus, updateLatePayment, deleteLatePayment } from "../../../redux/apis/apisCrudLms";
import Loader from "../../Loader/Loader";

const LatePayment = ({ productId, setSelectedTab }: any) => {
  const [loader, setLoader] = useState(true);
  const [errors, setErrors] = useState<any>({}); // Track validation errors
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [sectionIds, setSectionIds] = useState<any[]>([]); // Store IDs from API for update/delete
  const [sections, setSections] = useState([
    {
      penaltyType: "Percentage",
      penalty: "",
      fromDay: "",
      tillDay: "",
      name: "",
      notification: "",
      templateName: "",
      noOfDay: "",
    } as any,
  ]);

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        penaltyType: "Percentage",
        penalty: "",
        fromDay: "",
        tillDay: "",
        name: "",
        notification: "",
        templateName: "",
        noOfDay: "",
      },
    ]);
  };


  const validateFields = () => {
    const newErrors: any = {};
    sections.forEach((section, index) => {
      if (!section.penalty) newErrors[`${index}_penalty`] = "Penalty is required";
      if (!section.fromDay) newErrors[`${index}_fromDay`] = "From Day is required";
      if (!section.tillDay) newErrors[`${index}_tillDay`] = "Till Day is required";
      if (!section.name) newErrors[`${index}_name`] = "Name is required";
      if (!section.notification) newErrors[`${index}_notification`] = "Notification is required";
      if (!section.templateName) newErrors[`${index}_templateName`] = "Template Name is required";
      if (!section.noOfDay) newErrors[`${index}_noOfDay`] = "No. Of Days is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingSection({ ...sections[index] });
    setShowEditModal(true);
  };

  const handleDelete = (index: number) => {
    if (!sectionIds[index]) {
      // If no ID, it's a new section, just remove it
      const updatedSections = sections.filter((_, i) => i !== index);
      const updatedIds = sectionIds.filter((_, i) => i !== index);
      setSections(updatedSections);
      setSectionIds(updatedIds);
      return;
    }
    setDeletingIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletingIndex === null) return;
    
    setLoader(true);
    try {
      const res = await deleteLatePayment(sectionIds[deletingIndex]);
      if (res?.data?.notificationMessage === "Operation successful." || res?.data?.success) {
        toast.success("Section deleted successfully");
        // Remove from local state
        const updatedSections = sections.filter((_, i) => i !== deletingIndex);
        const updatedIds = sectionIds.filter((_, i) => i !== deletingIndex);
        setSections(updatedSections);
        setSectionIds(updatedIds);
        setShowDeleteModal(false);
        setDeletingIndex(null);
      } else {
        toast.error(res?.data?.errors?.[0] || "Failed to delete section");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Failed to delete section");
    } finally {
      setLoader(false);
    }
  };

  const handleUpdateSection = async () => {
    if (!editingSection || editingIndex === null) return;

    // Validate editing section
    if (!editingSection.penalty || !editingSection.fromDay || !editingSection.tillDay || 
        !editingSection.name || !editingSection.notification || !editingSection.templateName || !editingSection.noOfDay) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoader(true);
    try {
      // Update local state first
      const updatedSections = [...sections];
      updatedSections[editingIndex] = editingSection;
      setSections(updatedSections);

      // Build payload with only the edited section in an array
      const isPercentage = editingSection.penaltyType === "Percentage";
      const payload = [{
        id: sectionIds[editingIndex] || undefined, // Include ID if exists
        delinquencyType: 3,
        isPercentage: isPercentage,
        penaltyPercentage: isPercentage ? Number(editingSection.penalty) : 0,
        penaltyAmount: !isPercentage ? Number(editingSection.penalty) : 0,
        fromDay: Number(editingSection.fromDay),
        tillDay: Number(editingSection.tillDay),
        penaltyType: 1,
        productId: productId,
        name: editingSection.name,
        notification: editingSection.notification,
        templateName: editingSection.templateName,
        noOfDay: Number(editingSection.noOfDay),
      }];

      const res = await updateLatePayment(payload);
      if (res?.data?.notificationMessage === "Operation successful." || res?.data?.success) {
        toast.success("Section updated successfully");
        setShowEditModal(false);
        setEditingIndex(null);
        setEditingSection(null);
        // Refresh data to get updated IDs
        await getDeliquencyData();
      } else {
        toast.error(res?.data?.errors?.[0] || "Failed to update section");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Failed to update section");
    } finally {
      setLoader(false);
    }
  };

  const updateSubmitForm = async () => {
    if (!validateFields()) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoader(true);
    try {
      // Build payload array from sections
      const payload = sections.map((section, idx) => {
        const isPercentage = section.penaltyType === "Percentage";
        return {
          id: sectionIds[idx] || undefined, // Include ID if exists for updates
          delinquencyType: 3,
          isPercentage: isPercentage,
          penaltyPercentage: isPercentage ? Number(section.penalty) : 0,
          penaltyAmount: !isPercentage ? Number(section.penalty) : 0,
          fromDay: Number(section.fromDay),
          tillDay: Number(section.tillDay),
          penaltyType: 1,
          productId: productId,
          name: section.name,
          notification: section.notification,
          templateName: section.templateName,
          noOfDay: Number(section.noOfDay),
        };
      });

      const res = await createLatePayment(payload);
      if (res.data.notificationMessage == "Operation successful.") {
        toast.success(res.data.notificationMessage);
        setSelectedTab("Write-offs");
        setLoader(false);
      } else {
        toast.error(res.data.errors?.[0] || "An error occurred");
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      toast.error(error?.response?.data?.message || error.message || "An error occurred");
    }
  };
  const getDeliquencyData = async () => {
    if (!productId) return;
    try {
      setLoader(true);
      const res = await getDelinquencyByStatus(3, productId); // 3 = Late Payment
      if (res?.data?.success || res?.data) {
        const notifications = res?.data?.data || res?.data || [];
        
        if (notifications.length > 0) {
          // Map notifications to sections and store IDs
          const mappedSections = notifications.map((notif: any) => ({
            penaltyType: notif.isPercentage ? "Percentage" : "Fixed",
            penalty: notif.isPercentage ? notif.penaltyPercentage : notif.penaltyAmount,
            fromDay: notif.fromDay || "",
            tillDay: notif.tillDay || "",
            name: notif.name || "",
            notification: notif.notification || "",
            templateName: notif.templateName || "",
            noOfDay: notif.noOfDay || notif.noOfDays || "",
          }));
          const ids = notifications.map((notif: any) => notif.id);
          setSections(mappedSections);
          setSectionIds(ids);
        } else {
          setSections([{
            penaltyType: "Percentage",
            penalty: "",
            fromDay: "",
            tillDay: "",
            name: "",
            notification: "",
            templateName: "",
            noOfDay: "",
          }]);
          setSectionIds([]);
        }
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      toast.error(error.message || "An error occurred");
    }
  };
  useEffect(() => {
    getDeliquencyData();
  }, [productId]);
  return (
    <div>
      {loader && <Loader />}

      <div className="mt-4 mb-3">
        <div
          className="d-flex align-items-center justify-content-between mb-3"
          style={{ fontSize: "15px", fontWeight: "Bold" }}
        >
          <span>Late Payment Settings</span>
          <button
            className="theme-btn-next"
            onClick={handleAddSection}
            style={{ backgroundColor: "var(--foreground)" }}
          >
            Add Section
          </button>
        </div>

        {sections.map((section, index) => (
          <div
            key={index}
            className="mb-3 p-4"
            style={{
              border: "1px solid var(--color-border-light)",
              borderRadius: "8px",
              backgroundColor: "var(--color-surface-ice)",
              position: "relative",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  margin: 0,
                  color: "var(--color-text-dark)",
                }}
              >
                Section {index + 1}
              </h6>
              <div className="d-flex gap-2">
                <AntButton
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(index)}
                  style={{
                    padding: "4px 8px",
                    height: "auto",
                  }}
                >
                  Edit
                </AntButton>
                <AntButton
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(index)}
                  style={{
                    padding: "4px 8px",
                    height: "auto",
                  }}
                >
                  Delete
                </AntButton>
              </div>
            </div>

            <Row>
              {/* Penalty Type */}
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2" style={{ fontSize: "13px", fontWeight: "600" }}>
                    Penalty Type <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <div className="d-flex gap-3 mt-2">
                    <Form.Check
                      className={`d-flex align-items-center gap-1 ${
                        section.penaltyType === "Percentage" ? "accent-red" : ""
                      }`}
                      type="radio"
                      label="Percentage"
                      name={`penaltyType_${index}`}
                      value="Percentage"
                      checked={section.penaltyType === "Percentage"}
                      disabled
                      style={{ fontSize: "14px", fontWeight: "700" }}
                    />
                    <Form.Check
                      className={`d-flex align-items-center gap-1 ${
                        section.penaltyType === "Fixed" ? "accent-red" : ""
                      }`}
                      type="radio"
                      label="Fixed"
                      name={`penaltyType_${index}`}
                      value="Fixed"
                      checked={section.penaltyType === "Fixed"}
                      disabled
                      style={{ fontSize: "14px", fontWeight: "700" }}
                    />
                  </div>
                </Form.Group>
              </Col>

              {/* Penalty Amount */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2" style={{ fontSize: "13px", fontWeight: "600" }}>
                    {section.penaltyType === "Percentage" ? "Penalty Amount in %" : "Penalty Amount"}
                    <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={section.penalty}
                    placeholder="Penalty"
                    readOnly
                  />
                  {errors[`${index}_penalty`] && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      {errors[`${index}_penalty`]}
                    </span>
                  )}
                </Form.Group>
              </Col>

              {/* From Day */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2" style={{ fontSize: "13px", fontWeight: "600" }}>
                    From Day <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={section.fromDay}
                    placeholder="From Day"
                    readOnly
                  />
                  {errors[`${index}_fromDay`] && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      {errors[`${index}_fromDay`]}
                    </span>
                  )}
                </Form.Group>
              </Col>

              {/* Till Day */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2" style={{ fontSize: "13px", fontWeight: "600" }}>
                    Till Day <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={section.tillDay}
                    placeholder="Till Day"
                    readOnly
                  />
                  {errors[`${index}_tillDay`] && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      {errors[`${index}_tillDay`]}
                    </span>
                  )}
                </Form.Group>
              </Col>

              {/* Name */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2 fs-fw">
                    Name <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={section.name}
                    placeholder="Name"
                    readOnly
                  />
                  {errors[`${index}_name`] && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      {errors[`${index}_name`]}
                    </span>
                  )}
                </Form.Group>
              </Col>

              {/* Notification */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2 fs-fw">
                    Notification <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={section.notification}
                    placeholder="Notification"
                    readOnly
                  />
                  {errors[`${index}_notification`] && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      {errors[`${index}_notification`]}
                    </span>
                  )}
                </Form.Group>
              </Col>

              {/* Template Name */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2 fs-fw">
                    Template Name <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={section.templateName}
                    placeholder="Template Name"
                    readOnly
                  />
                  {errors[`${index}_templateName`] && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      {errors[`${index}_templateName`]}
                    </span>
                  )}
                </Form.Group>
              </Col>

              {/* No. Of Days */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2 fs-fw">
                    No. Of Days <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={section.noOfDay}
                    placeholder="Days"
                    readOnly
                  />
                  {errors[`${index}_noOfDay`] && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      {errors[`${index}_noOfDay`]}
                    </span>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </div>
        ))}
      </div>
      <div className="col-12 d-flex justify-content-end mt-4 mb-5 align-items-center">
        <AntButton
          className="revert-btn mb-2 me-2"
          style={{
            border: "none",
            borderRadius: "7px",
            padding: "8px 8px",
          }}
          onClick={() => {
            setSelectedTab("DueLoan");
          }}
        >
          Back
        </AntButton>
        <AntButton
          className="application-btn mb-2"
          /* style={{
            backgroundColor: "#EB0D0D",
            borderRadius: "8px",
            height: "fit-content",
            width: "fit-content",
          }} */
          onClick={updateSubmitForm}
        >
          Save & Next
        </AntButton>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => {
        setShowEditModal(false);
        setEditingIndex(null);
        setEditingSection(null);
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingSection && (
            <Row>
              {/* Penalty Type */}
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2" style={{ fontSize: "13px", fontWeight: "600" }}>
                    Penalty Type <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <div className="d-flex gap-3 mt-2">
                    <Form.Check
                      className={`d-flex align-items-center gap-1 ${
                        editingSection.penaltyType === "Percentage" ? "accent-red" : ""
                      }`}
                      type="radio"
                      label="Percentage"
                      name="edit_penaltyType"
                      value="Percentage"
                      checked={editingSection.penaltyType === "Percentage"}
                      onChange={(e) => setEditingSection({ ...editingSection, penaltyType: e.target.value })}
                      style={{ fontSize: "14px", fontWeight: "700" }}
                    />
                    <Form.Check
                      className={`d-flex align-items-center gap-1 ${
                        editingSection.penaltyType === "Fixed" ? "accent-red" : ""
                      }`}
                      type="radio"
                      label="Fixed"
                      name="edit_penaltyType"
                      value="Fixed"
                      checked={editingSection.penaltyType === "Fixed"}
                      onChange={(e) => setEditingSection({ ...editingSection, penaltyType: e.target.value })}
                      style={{ fontSize: "14px", fontWeight: "700" }}
                    />
                  </div>
                </Form.Group>
              </Col>

              {/* Penalty Amount */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2" style={{ fontSize: "13px", fontWeight: "600" }}>
                    {editingSection.penaltyType === "Percentage" ? "Penalty Amount in %" : "Penalty Amount"}
                    <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={editingSection.penalty}
                    placeholder="Penalty"
                    onChange={(e) => setEditingSection({ ...editingSection, penalty: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {/* From Day */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2" style={{ fontSize: "13px", fontWeight: "600" }}>
                    From Day <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={editingSection.fromDay}
                    placeholder="From Day"
                    onChange={(e) => setEditingSection({ ...editingSection, fromDay: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {/* Till Day */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2" style={{ fontSize: "13px", fontWeight: "600" }}>
                    Till Day <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={editingSection.tillDay}
                    placeholder="Till Day"
                    onChange={(e) => setEditingSection({ ...editingSection, tillDay: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {/* Name */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2 fs-fw">
                    Name <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={editingSection.name}
                    placeholder="Name"
                    onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {/* Notification */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2 fs-fw">
                    Notification <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={editingSection.notification}
                    placeholder="Notification"
                    onChange={(e) => setEditingSection({ ...editingSection, notification: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {/* Template Name */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2 fs-fw">
                    Template Name <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={editingSection.templateName}
                    placeholder="Template Name"
                    onChange={(e) => setEditingSection({ ...editingSection, templateName: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {/* No. Of Days */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label className="mt-2 fs-fw">
                    No. Of Days <span className="required-indicator ps-1">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={editingSection.noOfDay}
                    placeholder="Days"
                    onChange={(e) => setEditingSection({ ...editingSection, noOfDay: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="theme-btn-next"
            style={{ backgroundColor: "var(--color-text-slate)", marginRight: "10px" }}
            onClick={() => {
              setShowEditModal(false);
              setEditingIndex(null);
              setEditingSection(null);
            }}
          >
            Cancel
          </button>
          <button
            className="theme-btn-next"
            onClick={handleUpdateSection}
          >
            Update
          </button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => {
        setShowDeleteModal(false);
        setDeletingIndex(null);
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this section? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="theme-btn-next"
            style={{ backgroundColor: "var(--color-text-slate)", marginRight: "10px" }}
            onClick={() => {
              setShowDeleteModal(false);
              setDeletingIndex(null);
            }}
          >
            Cancel
          </button>
          <button
            className="theme-btn-next"
            style={{ backgroundColor: "var(--theme-secondary)" }}
            onClick={confirmDelete}
          >
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LatePayment;
