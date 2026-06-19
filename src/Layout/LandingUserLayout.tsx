import React from "react";
import { Outlet } from "react-router-dom";
import "../components/LandingUser/Landing.css";
import { Images } from "../components/Config/Images";
import LandingUserSideBar from "../components/LandingUser/LandingUserSideBar";
import LandingUserHeader from "../components/LandingUser/LandingUserHeader";

const LandingUserLayout: React.FC = () => {

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background:"#FFFFFF"}}>
      {/* Header on Top */}
      <LandingUserHeader />
      
     <div className="d-flex align-items-center" style={{margin:"90px 50px" ,minHeight:"calc(100vh - 375px)"}}>
    
      <div className="container" style={{borderTop:"8px solid #1963b9", borderBottom:"8px solid #1963b9",borderLeft:"1px solid #00000020",borderRight:"1px solid #00000020",position:"relative"}}>
         {/* Horizontal Stepper Bar Below Header */}
         <div className="flex justify-between" style={{ padding: "10px",position:"absolute",top:"-66px",right:"-10px"}}>
          <div className="d-flex items-center">
            <div
              className="p-3"
              style={{
                backgroundColor: " #1963b9",
                color: "white",
                borderTopLeftRadius: "6px",
                borderTopRightRadius: "6px",
              }}
            >
              English
            </div>
            <div
              className="p-3"
              style={{
                backgroundColor: "#dfdddd",
                color: "black",
                // borderTopRightRadius: "6px",
                // borderBottomRightRadius: "6px",
              }}
            >
              العربية
            </div>
          </div>
        </div>
       <LandingUserSideBar />
      
      {/* Main Content Area */}
      <div className="p-3" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          <Outlet />
        </div>
      </div>
      </div>
     </div>
      
      {/* Footer */}
      <footer>
        <div className="pt-4 pb-2" style={{backgroundColor:"#f8f9fa"}}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
            <div className="container d-flex justify-content-between align-items-center">
              <img src={Images.FactoringLogo} alt="" style={{
              width: "220px",
              height: "auto",
              maxHeight: "90px"
            }} />
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#1963b9",
                }}
                className="ps-2"
              >
                800 1111 810
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingUserLayout;
