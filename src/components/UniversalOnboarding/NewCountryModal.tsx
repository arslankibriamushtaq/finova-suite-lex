import React, { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { registerCountry } from '../../redux/apis/apisUniversalOnboarding';
import toast from 'react-hot-toast';

interface NewCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewCountryModal: React.FC<NewCountryModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ workflowName: '', countryCode: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.workflowName || !formData.countryCode) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setLoading(true);
      // Payload matches backend: { countryCode, workflowName, isActive }
      await registerCountry({
        countryCode: formData.countryCode.toUpperCase(),
        workflowName: formData.workflowName,
        isActive: true,
      });
      toast.success('Country workflow registered successfully');
      setFormData({ workflowName: '', countryCode: '' });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to register country');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal backdrop="static" keyboard={false} show={isOpen} onHide={onClose} centered className="new-country-modal">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-3">
          <span className="ncm-title-icon">
            <GlobalOutlined style={{ fontSize: 18 }} />
          </span>
          <div>
            <div className="ncm-title-text">Register New Country Workflow</div>
            <div className="ncm-title-sub">Create an onboarding flow scoped to a country</div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="ncm-body">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="ncm-label">Workflow Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. UAE Digital Onboarding"
              value={formData.workflowName}
              onChange={(e) => setFormData({ ...formData, workflowName: e.target.value })}
              className="ncm-input"
            />
            <Form.Text className="ncm-help">
              A descriptive name for this country's onboarding flow.
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label className="ncm-label">Country Code (ISO 3166)</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. UAE, PK, SA"
              value={formData.countryCode}
              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
              maxLength={4}
              className="ncm-input ncm-input-mono"
            />
            <Form.Text className="ncm-help">
              ISO country code (2–3 letters). This will be auto-uppercased.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="ncm-footer">
        <Button onClick={onClose} className="ncm-btn-cancel" disabled={loading}>
          Cancel
        </Button>
        <Button
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          className="ncm-btn-submit"
        >
          Register Country
        </Button>
      </Modal.Footer>

      <style>{`
        .new-country-modal .modal-content {
          border: 1px solid var(--border);
          border-radius: 14px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }
        .new-country-modal .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          background: #fff;
        }
        .new-country-modal .modal-title {
          font-size: 16px;
        }
        .new-country-modal .ncm-title-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background-color: var(--muted);
          color: var(--foreground);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .new-country-modal .ncm-title-text {
          font-weight: 700;
          font-size: 17px;
          line-height: 1.2;
          color: var(--foreground);
        }
        .new-country-modal .ncm-title-sub {
          font-size: 12px;
          color: var(--muted-foreground);
          font-weight: 400;
          margin-top: 2px;
        }
        .new-country-modal .ncm-body {
          padding: 22px 24px 8px;
        }
        .new-country-modal .ncm-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: 6px;
        }
        .new-country-modal .ncm-input {
          height: 42px !important;
          border-radius: 8px !important;
          border: 1px solid var(--border) !important;
          font-size: 14px;
          padding: 8px 12px;
          background: #fff;
        }
        .new-country-modal .ncm-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06) !important;
          outline: none;
        }
        .new-country-modal .ncm-input-mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          letter-spacing: 1px;
        }
        .new-country-modal .ncm-help {
          font-size: 12px;
          color: var(--muted-foreground);
          margin-top: 6px;
          display: block;
        }
        .new-country-modal .ncm-footer {
          padding: 16px 24px 20px;
          border-top: 1px solid var(--border);
          gap: 10px;
        }
        .new-country-modal .ncm-btn-cancel {
          height: 40px !important;
          padding: 0 18px !important;
          border-radius: 8px !important;
          border: 1px solid var(--border) !important;
          background-color: #fff !important;
          color: var(--foreground) !important;
          font-weight: 500;
        }
        .new-country-modal .ncm-btn-cancel:hover:not(:disabled) {
          background-color: var(--muted) !important;
        }
        .new-country-modal .ncm-btn-submit,
        .new-country-modal .ncm-btn-submit.ant-btn-primary {
          height: 40px !important;
          padding: 0 22px !important;
          border-radius: 8px !important;
          background-color: #000000 !important;
          border-color: #000000 !important;
          color: #ffffff !important;
          font-weight: 600;
          white-space: nowrap;
          min-width: 160px;
        }
        .new-country-modal .ncm-btn-submit:hover:not(:disabled),
        .new-country-modal .ncm-btn-submit.ant-btn-primary:hover:not(:disabled) {
          background-color: #1a1a1a !important;
          border-color: #1a1a1a !important;
          color: #ffffff !important;
        }
        .new-country-modal .ncm-btn-submit .ant-btn-loading-icon svg {
          color: #ffffff;
        }
      `}</style>
    </Modal>
  );
};

export default NewCountryModal;
