import React, { useState } from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
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
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <GlobalOutlined className="text-blue-600" />
          Register New Country Workflow
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Workflow Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. UAE Digital Onboarding"
              value={formData.workflowName}
              onChange={(e) => setFormData({ ...formData, workflowName: e.target.value })}
              className="h-11 rounded-lg"
            />
            <Form.Text className="text-muted">A descriptive name for this country's onboarding flow.</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Country Code (ISO 3166)</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. UAE, PK, SA"
              value={formData.countryCode}
              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
              maxLength={4}
              className="h-11 rounded-lg font-mono"
            />
            <Form.Text className="text-muted">ISO country code (2-3 letters). This will be auto-uppercased.</Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="primary"
          className="gradient-btn h-10 px-6 rounded-lg"
          loading={loading}
          onClick={handleSubmit}
        >
          Register Country
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewCountryModal;
