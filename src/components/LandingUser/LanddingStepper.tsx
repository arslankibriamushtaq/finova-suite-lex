import React from "react";
import { Steps } from "antd";
import {
  CheckCircleFilled,
  FileTextOutlined,
  UserOutlined,
  DollarOutlined,
  SafetyOutlined,
  LockOutlined,
  BankOutlined,
  FileProtectOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { Outlet, useLocation } from "react-router-dom";
import { Images } from "../Config/Images";
const steps:any = [
  { title: "Select Partner", icon: Images.ApiManagementIcon },
  { title: "Terms & Conditions", icon: Images.ApiManagementIcon },
  { title: "Business Info", icon: Images.ApiManagementIcon },
  { title: "Financing Info", icon: Images.ApiManagementIcon },
  { title: "Authorized Info", icon: Images.ApiManagementIcon},
  { title: "OTP Verification", icon: Images.ApiManagementIcon },
  { title: "Compliance Info", icon: Images.ApiManagementIcon },
  { title: "Disclaimer", icon: Images.ApiManagementIcon },
  { title: "Bank Details", icon:Images.ApiManagementIcon },
  { title: "Summary", icon: Images.ApiManagementIcon },
  { title: "Nafath Verification", icon: Images.ApiManagementIcon },
  { title: "Finish", icon: Images.ApiManagementIcon},
];

interface LandingStepperProps {
  currentStep: number;
}

const LandingStepper: React.FC<LandingStepperProps> = ({ currentStep }) => {
  return (
    <div className="pt-4" style={{  backgroundColor: "#fff" }}>
      <Steps
        size="small"
        // direction="horizontal"
        current={currentStep}
        items={steps.map((step:any, index:any) => ({
          title:step.title,
          icon: (
            <img
            className="d-flex justify-content-center"
              src={step.icon}
              alt={step.title}
              style={{
                width: 20,   // adjust size here
                height: 20,
                objectFit: "contain"
              }}
            />
          )
        }))}
      />
      <div className="p-4">
      <Outlet />
      </div>
        
    </div>
  );
};

export default LandingStepper;
