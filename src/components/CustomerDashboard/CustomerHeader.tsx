import React, { useRef, useState } from "react";
import { Images } from "../Config/Images";
import { DatePicker, Input, Menu, Radio } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import { RiArrowDropDownFill } from "react-icons/ri";
import { logOutApi } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setToken } from "../../redux/apis/apisSlice";
import { useTranslation } from "react-i18next";

const CustomerHeader = () => {
  const { t } = useTranslation("customersB");
  const location = useLocation();
  const [selectTab, setSelectedTab] = useState("Dashboard");
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Toggle Profile Menu
  const toggleMenu = () => {
    setOpen(!open);
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
  React.useEffect(() => {
    if(location.pathname === "/customer/Applications" || location.pathname === "/customer/InvoiceByApplicationID") {
      setSelectedTab("Applications");
    } else {
      setSelectedTab("Dashboard");
    } 
  }, [location.pathname]);

  const items = [
    {
      key: "Dashboard",
      label: (
        <Link
          style={{ textDecoration: "none", color: "white" }}
          to="/customer"
        >
          {t("customersB:header.dashboard")}
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
      key: "Applications",
      label: (
        <Link
          style={{ textDecoration: "none", color: "white" }}
          to="/customer/Applications"
        >
          {t("customersB:header.applications")}
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
      key: "Invoices",
      label: (
        <Link
          style={{ textDecoration: "none", color: "white" }}
          to="/superadmin"
        >
          {t("customersB:header.invoices")}
        </Link>
      ),

      icon: (
          <img
            src={Images.reportsIcon}
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
  const logOut = async () => {
    try {
      await toast.promise(
        logOutApi(),
        {
          loading: t("customersB:header.loggingOut"),
          success: (res) => {
            dispatch(setToken({ token: "" }));
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
            localStorage.removeItem("permissions");
            navigate("/login");
            return res?.data?.message || t("customersB:header.logoutSuccess");
          },
          error: (err) => {
            return err?.response?.data?.message || err?.message || t("customersB:header.logoutFail");
          },
        }
      );
    } catch (error: any) {
      console.error("Error during log out", error);
    }
  };
  return (
    <>
      <div className="container-fluid px-4 bg-light">
        <div className="d-flex justify-content-between align-items-center">
          {/* <div className="col-3 col-md-3 d-flex gap-3  align-items-center">
            <Input
              type="search"
              className="header-select"
              placeholder="Search"
            />
            <div style={{ fontWeight: 700, fontSize: "20px" }}>Dashboard</div>
          </div> */}
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
                  {t("customersB:header.superAdmin")} <RiArrowDropDownFill />
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
                <h4 className="profile-name">{t("customersB:header.superAdmin")}</h4>

                {/* Profile Actions */}
                <div className="profile-actions">
                  <button
                    className="profile-btn left"
                    onClick={() => navigate("/superadmin/settings")}
                  >
                    <FaCog className="icon" /> {t("customersB:header.settings")}
                  </button>
                  <div className="divider"></div>
                  <button className="profile-btn right" onClick={()=>{logOut()}}>
                    <FaSignOutAlt className="icon" /> {t("customersB:header.logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-12 " style={{ background: "#606366" }}>
        <div className="d-flex justify-content-center align-items-center">
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
        <div className="p-2" style={{ backgroundColor: "var(--color-surface-muted)" }}>
          <div className="d-flex px-4 align-items-center justify-content-end">
            <Radio.Group
              defaultValue="today"
              buttonStyle="solid"
              style={{ marginRight: "16px" }}
            >
              <Radio value="today">{t("customersB:header.today")}</Radio>
              <Radio value="last-week">{t("customersB:header.lastWeek")}</Radio>
              <Radio value="last-month">{t("customersB:header.lastMonth")}</Radio>
            </Radio.Group>
            <div className="d-flex gap-2">
              <DatePicker
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-border-light)",
                  borderRadius: "32px",
                }}
                placeholder={t("common:from")}
              />
              <DatePicker
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-border-light)",
                  borderRadius: "32px",
                }}
                placeholder={t("common:to")}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerHeader;
