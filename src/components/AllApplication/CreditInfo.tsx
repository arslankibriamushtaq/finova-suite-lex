import { Row, Col } from "react-bootstrap";
import { Select } from "antd";

const CreditInfo = () => {
  const fields = [
    { label: "Customer type", value: "Individual (weight: 2)" },
    { label: "Employment tenure", value: "<= 5 Years (weight: 5)" },
    { label: "Current employment tenure", value: "<= 5 Years (weight: 7)" },
    { label: "Age of customer", value: "<= 40 Years (weight: 19)" },
    { label: "Region", value: "Riyadh (weight: 10)" },
    { label: "Simah credit score", value: "Very Low Risk (weight: 50)" },
    { label: "Number of active credit products", value: "> 4 Other Lenders (weight: 5)" },
    { label: "Credit consumption", value: "DSCR <= 1 (weight: 27)" },
    { label: "Average monthly balance", value: "> 5000 (weight: 10)" },
    { label: "Salary", value: "John Doe" },
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
