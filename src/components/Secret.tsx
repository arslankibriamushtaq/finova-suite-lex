import React, { useState } from "react";
import { Form, Container, Row, Col, Alert, Modal } from "react-bootstrap";
import TableView from "./TableView/TableView";
import { Button, Dropdown, Menu } from "antd";
import { EditOutlined, DownOutlined, CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import Loader from "./Loader/Loader";

const Secret = () => {
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState<{ id: number, url: string, secret: string } | null>(null);

  const handleSave = async () => {
    setSuccess(null);
    setError(null);

    if (!url || !secret) {
      setError("Both fields are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/save-secret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, secret }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Secret saved successfully.");
      } else {
        throw new Error(data.message || "Failed to save secret.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const dummyData = [
    { id: 1, url: "https://example.com/api1", secret: "abc123" },
    { id: 2, url: "https://example.com/api2", secret: "def456" },
  ];

  const handleEditClick = (row: any) => {
    setEditData(row);
    setEditModalVisible(true);
  };

  const handleMenuClick = (key: string, row: any) => {
    switch (key) {
      case "edit":
        handleEditClick(row);
        break;
      case "enable":
        break;
      case "disable":
        break;
    }
  };

  const menu = (row: any) => (
    <Menu onClick={({ key }) => handleMenuClick(key, row)}>
      <Menu.Item key="edit" icon={<EditOutlined />}>Edit</Menu.Item>
      <Menu.Item key="enable" icon={<CheckCircleOutlined />}>Enable</Menu.Item>
      <Menu.Item key="disable" icon={<StopOutlined />}>Disable</Menu.Item>
    </Menu>
  );

  const mappedData = dummyData.map((item) => ({
    id: item.id,
    type: item.url,
    subType: item.secret,
  }));

  const Get_All_Header = [
    {
      name: "URL",
      selector: (row: { type: string }) => row.type,
      width: "40%",
    },
    {
      name: "Secret key",
      selector: (row: { subType: string }) => row.subType,
       width: "40%",
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            style={{
              background: "linear-gradient(100deg, #DEF5FF, #90CAFF)",
              color: "#000000",
              borderColor: "white",
              borderRadius: "6px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center mb-4">
        <Col md={12}>
          <h4 className="mb-4">Save Secret</h4>
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form>
            <Form.Group className="mb-3" controlId="formUrl">
              <Form.Label>URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter API URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formSecret">
              <Form.Label>Secret</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter secret key"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </Form.Group>

            <button className="theme-btn-next" onClick={handleSave} disabled={loading}>
              {loading ? (
                <div style={{ display: "inline-block", transform: "scale(0.3)", transformOrigin: "center" }}>
                  <Loader />
                </div>
              ) : "Save"}
            </button>
          </Form>
        </Col>
      </Row>

      <TableView
        setPage={setPage}
        setPageSize={setPageSize}
        totalRows={totalRows}
        header={Get_All_Header}
        data={mappedData}
      />

      <Modal
        show={editModalVisible}
        onHide={() => setEditModalVisible(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Secret</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>URL</Form.Label>
              <Form.Control
                type="text"
                value={editData?.url || ""}
                onChange={(e) =>
                  setEditData((prev: any) => ({ ...prev, url: e.target.value }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Secret</Form.Label>
              <Form.Control
                type="text"
                value={editData?.secret || ""}
                onChange={(e) =>
                  setEditData((prev: any) => ({ ...prev, secret: e.target.value }))
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Secret;
