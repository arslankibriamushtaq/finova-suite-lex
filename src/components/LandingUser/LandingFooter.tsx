import React from "react";
import { Container } from "react-bootstrap";
import { PhoneOutlined } from "@ant-design/icons";
import { Images } from "../Config/Images";

const LandingFooter: React.FC = () => {
  return (
    <footer className="border-top py-3 bg-light">
      <Container className="d-flex justify-content-between align-items-center">
        <img src={Images.FactoringLogo} alt="Finova Logo" width="140" />
        <a className="text-danger fs-4" href="tel:8014106510">
          <PhoneOutlined /> 8014106510
        </a>
      </Container>
    </footer>
  );
};

export default LandingFooter;
