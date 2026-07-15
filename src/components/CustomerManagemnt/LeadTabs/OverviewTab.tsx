import React from "react";
import { Row, Col, Descriptions } from "antd";
import { useTranslation } from "react-i18next";

const OverviewTab: React.FC = () => {
  const { t } = useTranslation("customerManagement");
  return (
    <div>
      <Row gutter={24}>
        <Col span={12}>
          <Descriptions
            bordered
            column={1}
            size="small"
            title={t("leadTabs.overview.english")}
            style={{ background: "var(--color-surface-ice)", borderRadius: 2 }}
          >
            <Descriptions.Item label={t("leadTabs.overview.leadId")}>LD-2025001</Descriptions.Item>
            <Descriptions.Item label={t("common:status")}>{t("common:active")}</Descriptions.Item>
            <Descriptions.Item label={t("leadTabs.overview.creationDate")}>
              21 Oct 2025
            </Descriptions.Item>
          </Descriptions>
        </Col>

        <Col span={12}>
          <Descriptions
            bordered
            column={1}
            size="small"
            title={t("leadTabs.overview.arabic")}
            style={{ background: "var(--color-surface-ice)", borderRadius: 2 }}
          >
            <Descriptions.Item label={t("leadTabs.overview.leadId")}>LD-2025001</Descriptions.Item>
            <Descriptions.Item label={t("common:status")}>{t("common:active")}</Descriptions.Item>
            <Descriptions.Item label={t("leadTabs.overview.creationDate")}>
              21 أكتوبر 2025
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </div>
  );
};

export default OverviewTab;
