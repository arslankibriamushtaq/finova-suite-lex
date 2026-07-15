import { Row, Col } from "react-bootstrap";
import { Select } from "antd";
import { useTranslation } from "react-i18next";

const CreditInfo = () => {
  const { t } = useTranslation("allApplication");
  const fields = [
    { label: t("creditInfo.customerType"), value: "Individual (weight: 2)" },
    { label: t("creditInfo.employmentTenure"), value: "<= 5 Years (weight: 5)" },
    { label: t("creditInfo.currentEmploymentTenure"), value: "<= 5 Years (weight: 7)" },
    { label: t("creditInfo.ageOfCustomer"), value: "<= 40 Years (weight: 19)" },
    { label: t("creditInfo.region"), value: "Riyadh (weight: 10)" },
    { label: t("creditInfo.simahCreditScore"), value: "Very Low Risk (weight: 50)" },
    { label: t("creditInfo.activeCreditProducts"), value: "> 4 Other Lenders (weight: 5)" },
    { label: t("creditInfo.creditConsumption"), value: "DSCR <= 1 (weight: 27)" },
    { label: t("creditInfo.averageMonthlyBalance"), value: "> 5000 (weight: 10)" },
    { label: t("creditInfo.salary"), value: "John Doe" },
  ];

  return (
    <div className="mt-2">
      <Row className="g-3">
        {fields.map((field, index) => (
          <Col md={6} key={index}>
            <div className="fs-12 mb-1 fw-500">{field.label}</div>
            <Select className="w-100 fs-14 rounded-2" value={field.value} disabled />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CreditInfo;
