import React from "react";
import { Form, Select, Button, Row, Col, Card } from "antd";
import { useTranslation } from "react-i18next";

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

const fieldKeys: { [key: string]: string } = {
  "Customer Type": "credit.field.customerType",
  "Years in Business": "credit.field.yearsInBusiness",
  "Relevant Experience": "credit.field.relevantExperience",
  "Age of Owner": "credit.field.ageOfOwner",
  "Region": "credit.field.region",
  "Key Person Risk": "credit.field.keyPersonRisk",
  "Supply Risk": "credit.field.supplyRisk",
  "Obsolescence Risk": "credit.field.obsolescenceRisk",
  "Diversity of Clientele Base": "credit.field.diversityOfClienteleBase",
  "Number of Employees": "credit.field.numberOfEmployees",
  "Saudization Ratio": "credit.field.saudizationRatio",
  "Zakat Certificate Flag": "credit.field.zakatCertificateFlag",
  "Existing Client Flag": "credit.field.existingClientFlag",
  "Length of Relationship": "credit.field.lengthOfRelationship",
  "Credit Score of Owner": "credit.field.creditScoreOfOwner",
  "Returned Checks": "credit.field.returnedChecks",
  "Negative Indicators": "credit.field.negativeIndicators",
  "Number of Lenders with Active Limits": "credit.field.numberOfLendersWithActiveLimits",
  "Source of Financial Information": "credit.field.sourceOfFinancialInformation",
  "Auditor Category": "credit.field.auditorCategory",
  "Sales": "credit.field.sales",
  "Sales Growth (Last Two Years) %": "credit.field.salesGrowthLastTwoYears",
  "Net Profit Margin %": "credit.field.netProfitMargin",
  "Operating Cash Cycle Days": "credit.field.operatingCashCycleDays",
  "Leverage": "credit.field.leverage",
  "Debt Service Coverage": "credit.field.debtServiceCoverage",
  "% Sales through Banking Channels": "credit.field.salesThroughBankingChannels",
  "Industry Overall Assessment": "credit.field.industryOverallAssessment",
};

const CreditCheck: React.FC = () => {
  const { t } = useTranslation("customerManagement");
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
        borderRadius: 2,
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
                label={t(fieldKeys[label])}
                name={label.replace(/\s+/g, "_").toLowerCase()}
                style={{ marginBottom: 8 }}
              >
                <Select placeholder={t("credit.placeholder")} allowClear>
                  <Option value="low">{t("credit.low")}</Option>
                  <Option value="medium">{t("credit.medium")}</Option>
                  <Option value="high">{t("credit.high")}</Option>
                </Select>
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Row justify="end" style={{ marginTop: 24 }}>
          <Col>
            <Button type="primary" htmlType="submit" size="large">
              {t("common:save")}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default CreditCheck;
