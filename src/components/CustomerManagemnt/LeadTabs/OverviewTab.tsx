import React from "react";
import { Row, Col, Descriptions } from "antd";

const OverviewTab: React.FC = () => {
  return (
    <div>
      <Row gutter={24}>
        <Col span={12}>
          <Descriptions
            bordered
            column={1}
            size="small"
            title="English"
            style={{ background: "var(--color-surface-ice)", borderRadius: 8 }}
          >
            <Descriptions.Item label="Lead ID">LD-2025001</Descriptions.Item>
            <Descriptions.Item label="Status">Active</Descriptions.Item>
            <Descriptions.Item label="Creation Date">
              21 Oct 2025
            </Descriptions.Item>
          </Descriptions>
        </Col>

        <Col span={12}>
          <Descriptions
            bordered
            column={1}
            size="small"
            title="Arabic"
            style={{ background: "var(--color-surface-ice)", borderRadius: 8 }}
          >
            <Descriptions.Item label="معرف العميل">LD-2025001</Descriptions.Item>
            <Descriptions.Item label="الحالة">نشط</Descriptions.Item>
            <Descriptions.Item label="تاريخ الإنشاء">
              21 أكتوبر 2025
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </div>
  );
};

export default OverviewTab;
