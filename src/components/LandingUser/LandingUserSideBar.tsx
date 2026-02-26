import { useEffect, useState } from "react";
import { Images } from "../Config/Images";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { authSlice } from "../../redux/apis/apisSlice";
import Loader from "../Loader/Loader";

const LandingUserSideBar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const loading = false;
  const STEPS = [
  "partner",
  "Terms",
  "businessdetails",
  "otpVerification",
  "orbitSms",
  "factoringInfo",
  "ComplianceInfo",
  "bankingInfo",
  "finish",
] as const;


  const updateView = () => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/");
    return parts[2];
  };

  const [view, setView] = useState(updateView);
  useEffect(() => {
    const newStep = updateView();
    setView(newStep);
    if (view == "finish") {
      dispatch(
        authSlice.actions.setPassword({
          password: false,
        })
      );
    }
    
  }, [location.pathname]);

  const currIndex = Math.max(0, STEPS.indexOf(view as (typeof STEPS)[number]));

  const badgeStyle = (step: string) => {
    const idx = STEPS.indexOf(step as any);
    if (idx === currIndex) return { background: "#1963b9" };     // current -> blue
    if (idx > -1 && idx < currIndex) return { background: "#1963b9" }; // before -> blue (changed from green)
    return { background: "#B8B8B8" };                            // after -> grey
  };

  const steps = [
    { key: "partner", label: "Verification", icon: Images.productLogo },
    { key: "Terms", label: "Terms & Condition", icon: Images.businessLogo },
    { key: "businessdetails", label: "Business Info", icon: Images.paymentLogo },
    { key: "otpVerification", label: "Email Verification", icon: Images.paymentLogo },
    { key: "orbitSms", label: "Orbit SMS", icon: Images.paymentLogo },
    { key: "ComplianceInfo", label: "Compliance Info", icon: Images.finishLogo },
    { key: "factoringInfo", label: "Factoring Info", icon: Images.paymentLogo },
    { key: "bankingInfo", label: "Docs & Bank Verification", icon: Images.paymentLogo },
    { key: "finish", label: "Finish", icon: Images.paymentLogo },
  ];

  return (
    <>
      {loading && <Loader />}
      
      <div style={{ 
        // background: '#fff',
        padding: '20px 0',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #E0E0E0'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative'
        }}>
          {/* Progress Bar Background */}
          <div style={{
            position: 'absolute',
            top: '28px',
            left: '60px',
            right: '60px',
            height: '4px',
            background: '#E0E0E0',
            zIndex: 0
          }}>
            {/* Progress Bar Fill */}
            <div style={{
              height: '100%',
              background: '#1963b9',
              width: `${(currIndex / (steps.length - 1)) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Steps */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'relative',
            zIndex: 1
          }}>
            {steps.map((step, index) => {
              const stepStyle = badgeStyle(step.key);
              const isActive = currIndex === index;
              const isCompleted = index < currIndex;
              
              return (
                <div 
                  key={step.key}
                  style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: '0 0 auto',
                    minWidth: '80px',
                    maxWidth: '120px'
                  }}
                >
                  {/* Icon Circle */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: stepStyle.background,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    boxShadow: isActive ? '0 4px 12px rgba(66,82,159,0.3)' : 'none',
                    transition: 'all 0.3s ease',
                    border: isActive ? '3px solid #1963b9' : 'none'
                  }}>
                    <img 
                      src={step.icon} 
                      alt={step.label}
                      width={24}
                      height={24}
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                  </div>
                  
                  {/* Label */}
                  <span style={{
                    color: isActive || isCompleted ? '#292929' : '#838383',
                    fontSize: '12px',
                    fontWeight: isActive ? '600' : '400',
                    textAlign: 'center',
                    lineHeight: '1.3',
                    transition: 'all 0.3s ease'
                  }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingUserSideBar;
