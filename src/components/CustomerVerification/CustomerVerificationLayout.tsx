import { Outlet } from "react-router-dom";
import NafathVerification from "./NafathVerification";

const CustomerVerificationLayout = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('https://devlos.factoringvalley.com.sa/storage/setting/1/image/4PmQ7ZtfXC-1762436319.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      {/* Blur overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
      />
      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Outlet />
        <NafathVerification />
      </div>
    </div>
  );
};

export default CustomerVerificationLayout;

