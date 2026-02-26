import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Images } from "../Config/Images";

const LandingHeader: React.FC = () => {
  return (
    <Navbar bg="white" expand="lg" className="border-bottom">
      <Container>
        {/* Logo */}
        <Navbar.Brand href="/">
          <img src={Images.FactoringLogo} alt="Finova Logo" width="140" />
        </Navbar.Brand>

        {/* <Nav className="ms-auto">
          <Nav.Link>English</Nav.Link>
          <Nav.Link>العربية</Nav.Link>
        </Nav> */}
      </Container>
    </Navbar>
  );
};

export default LandingHeader;
