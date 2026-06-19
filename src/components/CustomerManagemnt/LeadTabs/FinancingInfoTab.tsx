import React from "react";
import { Row, Col, Descriptions } from "antd";

const FinancingInfoTab: React.FC = () => {
  return (
    <div>
      <Row gutter={24}>
        <Col span={12}>
          <Descriptions
            bordered
            column={1}
            size="small"
            title="Financing Info (English)"
            style={{ background: "var(--color-surface-ice)", borderRadius: 6 }}
          >
            <Descriptions.Item label="Loan Amount">PKR 2,000,000</Descriptions.Item>
            <Descriptions.Item label="Tenure">24 Months</Descriptions.Item>
            <Descriptions.Item label="Status">Pending Approval</Descriptions.Item>
          </Descriptions>
        </Col>

        <Col span={12}>
          <Descriptions
            bordered
            column={1}
            size="small"
            title="معلومات التمويل"
            style={{ background: "var(--color-surface-ice)", borderRadius: 6 }}
          >
            <Descriptions.Item label="مبلغ القرض">PKR 2,000,000</Descriptions.Item>
            <Descriptions.Item label="المدة">24 شهرًا</Descriptions.Item>
            <Descriptions.Item label="الحالة">في انتظار الموافقة</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </div>
  );
};

export default FinancingInfoTab;
