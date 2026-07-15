import React from "react";
import { Row, Col, Descriptions } from "antd";
import { useTranslation } from "react-i18next";

const FinancingInfoTab: React.FC = () => {
  const { t } = useTranslation("customerManagement");
  return (
    <div>
      <Row gutter={24}>
        <Col span={12}>
          <Descriptions
            bordered
            column={1}
            size="small"
            title={t("financingInfo.title")}
            style={{ background: "var(--color-surface-ice)", borderRadius: 2 }}
          >
            <Descriptions.Item label={t("financingInfo.loanAmount")}>PKR 2,000,000</Descriptions.Item>
            <Descriptions.Item label={t("financingInfo.tenure")}>24 Months</Descriptions.Item>
            <Descriptions.Item label={t("common:status")}>{t("financingInfo.pendingApproval")}</Descriptions.Item>
          </Descriptions>
        </Col>

        <Col span={12}>
          <Descriptions
            bordered
            column={1}
            size="small"
            title="معلومات التمويل"
            style={{ background: "var(--color-surface-ice)", borderRadius: 2 }}
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
