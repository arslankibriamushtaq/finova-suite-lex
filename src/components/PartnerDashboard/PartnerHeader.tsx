import React, { useRef, useState } from "react";
import { Images } from "../Config/Images";
import { DatePicker, Menu, Radio } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import { RiArrowDropDownFill } from "react-icons/ri";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { logOutApi } from "../../redux/apis/apisCrud";
import { clearAdminSession } from "../../utils/adminSession";

const PartnerHeader = () => {
  const { t } = useTranslation("partner");
  const location = useLocation();
  const [selectTab, setSelectedTab] = useState("Dashboard");

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Toggle Profile Menu
  const toggleMenu = () => {
    setOpen(!open);
  };

  // Logout function
  const logOut = async () => {
    try {
      await toast.promise(
        logOutApi(),
        {
          loading: t("toast.loggingOut"),
          success: (res) => {
            // Clearing only `token` left `refreshToken`, permissions and
            // applicant PII in the store and in the persisted session.
            void clearAdminSession();
            navigate("/login");
            return res?.data?.message || t("toast.loggedOut");
          },
          error: (err) => {
            return err?.response?.data?.message || err?.message || t("toast.logoutFailed");
          },
        }
      );
    } catch (error: any) {
      console.error("Error during log out", error);
    }
  };

  // Close when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = [
    {
      key: "Dashboard",
      label: (
        <Link style={{ textDecoration: "none", color: "white" }} to="/partner">
          {t("header.dashboard")}
        </Link>
      ),

      icon: (
        <img
          className="my-icon"
          src={Images.dashboardIcon}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
    },

    {
      label: t("header.applications"),
      key: "AllApplications",
      children: [
        {
          key: "AllApplications",
          label: <Link to="/partner/AllApplications">{t("header.allApplications")}</Link>,
        },
        {
          key: "IncompletePartner",
          label: (
            <Link to="/partner/IncompletePartner">{t("header.incompleteApplications")}</Link>
          ),
        },
        {
          key: "PendingApplications",
          label: (
            <Link to="/partner/PendingApplications">{t("header.pendingApplications")}</Link>
          ),
        },
        {
          key: "InProgressApplications",
          label: (
            <Link to="/partner/InProgressApplications">
              {t("header.inProgressApplications")}
            </Link>
          ),
        },
        {
          key: "RejectedApplications",
          label: (
            <Link to="/partner/RejectedApplications">
              {t("header.rejectedApplications")}
            </Link>
          ),
        },
        {
          key: "ApprovedApplications",
          label: (
            <Link to="/partner/ApprovedApplications">
              {t("header.approvedApplications")}
            </Link>
          ),
        },
      ],
      icon: (
        <img
          src={Images.reportsIcon}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
    },
    {
      key: "ApiManagement",
      label: (
        <Link
          style={{ textDecoration: "none", color: "white" }}
          to="/partner/apimanagement"
        >
          {t("header.apiManagement")}
        </Link>
      ),
      icon: (
        <img
          className="my-icon"
          src={Images.shieldCheck}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
    },
    {
      key: "Landingpagemanagement",
      label: (
        <Link style={{ textDecoration: "none", color: "white" }} to="/partner/landingpage">
          {t("header.landingPageManagement")}
        </Link>
      ),
      icon: (
        <img
          src={Images.landingIcon}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
    },
    {
      key: "Comission",
      label: (
        <Link
          style={{ textDecoration: "none", color: "white" }}
          to="/partner/comission"
        >
          {t("header.comissions")}
        </Link>
      ),
      icon: (
        <img
          src={Images.comission}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
    },
    {
      key: "PartnerOnboarding",
      label: (
        <Link
          style={{ textDecoration: "none", color: "white" }}
          to="/partner/onboarding"
        >
          {t("header.onboardCustomers")}
        </Link>
      ),
      icon: (
        <img
          src={Images.comission}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
    },
  ];
  const onClick = (e: any) => {
    setSelectedTab(e.key);
    if (e.key === "settings") {
      navigate("/superadmin/settings");
    }
  };

  return (
    <>
      <div className="container-fluid px-4 bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <div
            onClick={() => {
              navigate("/lms/dashboard");
            }}
            className="col-3"
          >
            <img src={Images.FactoringLogo} alt="logo" />
          </div>

          <div className="profile-container">
            <div className="d-flex align-items-center" onClick={toggleMenu}>
              <a
                style={{ justifySelf: "left", marginRight: "4px" }}
                href={`/flow/dashboard`}
              >
                <img src={Images.notification} alt="Notifications" />
              </a>
              <div className="user-profile-trigger d-flex align-items-center">
                <img
                  src={Images.userIcon}
                  alt="User Icon"
                  className="user-avatar"
                />
                <span className="user-name">
                 Default Super Admin <RiArrowDropDownFill />
                </span>
              </div>
            </div>

            {/* Floating Profile Menu */}
            {open && (
              <div ref={menuRef} className="profile-dropdown">
                {/* Close Button */}
                <Button
                  variant="light"
                  className="close-btn"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </Button>

                {/* Profile Picture */}
                <div className="profile-picture">
                  <img src={Images.userIcon} alt="Super Admin" />
                  <span className="edit-icon">✎</span>
                </div>

                {/* User Name */}
                <h4 className="profile-name">Default Super Admin</h4>

                {/* Profile Actions */}
                <div className="profile-actions">
                  <button
                    className="profile-btn left"
                    onClick={() => navigate("/superadmin/settings")}
                  >
                    <FaCog className="icon" /> {t("header.settings")}
                  </button>
                  <div className="divider"></div>
                  <button className="profile-btn right" onClick={logOut}>
                    <FaSignOutAlt className="icon" /> {t("header.logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-12 " style={{ background: "#606366" }}>
        <div className="d-flex  justify-content-center align-items-center">
          <Menu
            style={{ background: "#606366", color: "white" }}
            onClick={onClick}
            selectedKeys={[selectTab]}
            mode="horizontal"
            items={items}
            className="d-flex gap-3"
          />
        </div>
      </div>

      {location.pathname === "/superadmin" && (
        <div className="p-2" style={{ backgroundColor: "#F0F0F0" }}>
          <div className="d-flex px-4 align-items-center justify-content-end">
            <Radio.Group
              defaultValue="today"
              buttonStyle="solid"
              style={{ marginRight: "16px" }}
            >
              <Radio value="today">{t("header.today")}</Radio>
              <Radio value="last-week">{t("header.lastWeek")}</Radio>
              <Radio value="last-month">{t("header.lastMonth")}</Radio>
            </Radio.Group>
            <div className="d-flex gap-2">
              <DatePicker
                style={{
                  background: "transparent",
                  border: "1px solid #D1D1D1",
                  borderRadius: "32px",
                }}
                placeholder={t("header.from")}
              />
              <DatePicker
                style={{
                  background: "transparent",
                  border: "1px solid #D1D1D1",
                  borderRadius: "32px",
                }}
                placeholder={t("header.to")}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PartnerHeader;
