import React from "react";
import { Form, Select, Button, Row, Col, Card } from "antd";

const { Option } = Select;

const formFields = [
  "Customer Type",
  "Years in Business",
  "Relevant Experience",
  "Age of Owner",
  "Region",
  "Key Person Risk",
  "Supply Risk",
  "Obsolescence Risk",
  "Diversity of Clientele Base",
  "Number of Employees",
  "Saudization Ratio",
  "Zakat Certificate Flag",
  "Existing Client Flag",
  "Length of Relationship",
  "Credit Score of Owner",
  "Returned Checks",
  "Negative Indicators",
  "Number of Lenders with Active Limits",
  "Source of Financial Information",
  "Auditor Category",
  "Sales",
  "Sales Growth (Last Two Years) %",
  "Net Profit Margin %",
  "Operating Cash Cycle Days",
  "Leverage",
  "Debt Service Coverage",
  "% Sales through Banking Channels",
  "Industry Overall Assessment",
];

const CreditCheck: React.FC = () => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
  };

  return (
    <Card
      bordered={false}
      style={{
        margin: "0 auto",
        background: "var(--background)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        borderRadius: 6,
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ width: "100%" }}
      >
        <Row gutter={[16, 16]}>
          {formFields.map((label) => (
            <Col xs={24} sm={12} md={8} key={label}>
              <Form.Item
                label={label}
                name={label.replace(/\s+/g, "_").toLowerCase()}
                style={{ marginBottom: 8 }}
              >
                <Select placeholder="Placeholder" allowClear>
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                </Select>
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Row justify="end" style={{ marginTop: 24 }}>
          <Col>
            <Button type="primary" htmlType="submit" size="large">
              Save
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default CreditCheck;
