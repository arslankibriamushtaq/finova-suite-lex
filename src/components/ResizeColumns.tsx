import { useState } from "react";
import { Modal, Button, Select, InputNumber, Row, Col } from "antd";
import { DownOutlined } from "@ant-design/icons";

const { Option } = Select;

const ResizeColumn = () => {
  const [visible, setVisible] = useState(false);
  const [column, setColumn] = useState<any>("Description");
  const [width, setWidth] = useState<any>(100);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <div className="resize-column">
      <Button onClick={showModal}>
        Resize Columns... <DownOutlined />
      </Button>
      <Modal title="Resize Column" visible={visible} >
        <Row gutter={4}>
          <Col span={4}>Column:</Col>
          <Col span={6}>
            <Select
              value={column}
              onChange={setColumn}
              style={{ width: "100%" }}
            >
              <Option value="Description">Description</Option>
              <Option value="Start Date">Start Date</Option>
              <Option value="End Date">End Date</Option>
              <Option value="Direct">Direct</Option>
              <Option value="Enabled">Enabled</Option>
              <Option value="Collateral Type">Collateral Type</Option>
              <Option value="Collateral Sub Ty..">Collateral Sub Ty..</Option>
              <Option value="Collateral Sub Ty..2">Collateral Sub Ty..2</Option>
            </Select>
          </Col>
        </Row>
        <Row gutter={4} style={{ marginTop: "16px" }}>
          <Col span={4}>Width:</Col>
          <Col span={6}>
            <InputNumber
              min={50}
              max={500}
              value={width}
              onChange={setWidth}
              style={{ width: "100%" }}
            />
          </Col>
        </Row>
        <Row gutter={4} style={{ marginTop: "16px" }}>
          <Col span={4}>
            <Button className="invoice-btn" onClick={handleCancel}>Cancel</Button>
          </Col>
          <Col span={4}>
            <Button onClick={handleOk}>OK</Button>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default ResizeColumn;
