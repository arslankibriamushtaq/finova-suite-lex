import React, { useRef, useState } from "react";
import { Images } from "../Config/Images";
import { DatePicker, Input, Menu, Radio } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Dropdown,
  DropdownButton,
  Modal,
  Offcanvas,
} from "react-bootstrap";
import { FaArrowDown, FaCog, FaDropbox, FaSignOutAlt } from "react-icons/fa";
import {
  RiArrowDownLine,
  RiArrowDropDownFill,
  RiArrowDropDownLine,
  RiArrowRightDownLine,
} from "react-icons/ri";

const DashboardHeader = () => {
  const location = useLocation();
  const [selectTab, setSelectedTab] = useState("Dashboard");
  let tokenValue = localStorage.getItem("accessToken");
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

  const items = [
    {
      key: "Dashboard",
      label: (
        <Link
          style={{ textDecoration: "none", color: "inherit" }}
          to="/superadmin"
        >
          Dashboard
        </Link>
      ),

      icon: (
        <img
          src={Images.userSettingIcon}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
    },

    {
      label: "Tenants",
      key: "Tenants",
      children: [
        {
          key: "Leads",
          label: <Link to="/superadmin/tenants/leads">Leads</Link>,
        },
        {
          key: "Oppurtunities",
          label: (
            <Link to="/superadmin/tenants/oppurtunities">Oppurtunities</Link>
          ),
        },
        {
          key: "tenants",
          label: <Link to="/superadmin/tenants/tenants">Tenants</Link>,
        },
      ],
      icon: (
        <img
          src={Images.userSettingIcon}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
    },
    {
      key: "productmanagement",
      label: <Link to="/superadmin/productmanagement">Product Management</Link>,
      icon: (
        <img
          src={Images.productManagementIcon}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
    },
    {
      key: "loancalculator",
      label: <Link to="/view/loancalculator">Loan calculator</Link>,
      icon: (
        <img
          src={Images.productManagementIcon}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
    },
    {
      label: "LOV's",
      key: "lov",
      icon: (
        <img
          src={Images.userSettingIcon}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
      children: [
        {
          label: "Individuals",
          key: "individuals",
          children: [
            {
              key: "Individual",
              label: <Link to="/superadmin/lov/relation">Individual</Link>,
            },
            {
              key: "occupation",
              label: <Link to="/superadmin/lov/occupation">Occupation</Link>,
            },
          ],
        },
        {
          label: "Business",
          key: "business",
          children: [
            {
              key: "businessType",
              label: (
                <Link to="/superadmin/lov/business/type">Business Type</Link>
              ),
            },
            {
              key: "businessCategory",
              label: (
                <Link to="/superadmin/lov/business/category">
                  Business Category
                </Link>
              ),
            },
            {
              key: "totalEPF",
              label: (
                <Link to="/superadmin/lov/business/totalEPF">Total EPF</Link>
              ),
            },
          ],
        },
        {
          label: "Customer Services",
          key: "customerservices",
          children: [
            {
              key: "VerificationAgency",
              label: (
                <Link to="/superadmin/lov/business/verificationAgency">
                  VerificationAgency
                </Link>
              ),
            },
            {
              key: "actions",
              label: <Link to="/superadmin/lov/business/actions">Actions</Link>,
            },
            {
              key: "Results",
              label: <Link to="/superadmin/lov/business/result">Results</Link>,
            },
            {
              key: "Reasons",
              label: <Link to="/superadmin/lov/business/reason">Reasons</Link>,
            },
          ],
        },
      ],
    },
    {
      label: "ACM",
      key: "acm",
      icon: (
        <img
          src={Images.userSettingIcon}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
      children: [
        {
          type: "group",
          label: "Item 1",
          children: [
            { label: "Option 1", key: "setting:1" },
            { label: "Option 2", key: "setting:2" },
          ],
        },
      ],
    },
    {
      label: "Reports",
      key: "Reports",
      icon: (
        <img
          src={Images.userSettingIcon}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
      children: [
        {
          type: "group",
          label: "Item 1",
          children: [
            { label: "Option 1", key: "setting:1" },
            { label: "Option 2", key: "setting:2" },
          ],
        },
      ],
    },
    {
      label: "Settings",
      key: "settings",
      icon: (
        <img
          src={Images.userSettingIcon}
          alt="User Setting Icon"
          style={{ width: "20px", height: "20px" }}
        />
      ),
      children: [
        {
          type: "group",
          label: "Item 1",
          children: [
            { label: "Option 1", key: "setting:1" },
            { label: "Option 2", key: "setting:2" },
          ],
        },
      ],
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
          <div className="col-3 col-md-3 d-flex gap-3  align-items-center">
            <Input
              type="search"
              className="header-select"
              placeholder="Search"
            />
            <div style={{ fontWeight: 700, fontSize: "20px" }}>Dashboard</div>
          </div>
          <div
            onClick={() => {
              navigate("/lms/dashboard");
            }}
            className="col-3"
          >
            <img src={Images.AwnLogo} alt="logo" height={80}/>
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
                  Super Admin <RiArrowDropDownFill />
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
                <h4 className="profile-name">Super Admin</h4>

                {/* Profile Actions */}
                <div className="profile-actions">
                  <button
                    className="profile-btn left"
                    onClick={() => navigate("/superadmin/settings")}
                  >
                    <FaCog className="icon" /> Settings
                  </button>
                  <div className="divider"></div>
                  <button className="profile-btn right">
                    <FaSignOutAlt className="icon" /> Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-12 " style={{ background: "#373435" }}>
        <div className="d-flex  justify-content-center align-items-center">
          <Menu
            style={{ background: "#373435", color: "white" }}
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
              <Radio value="today">Today</Radio>
              <Radio value="last-week">Last Week</Radio>
              <Radio value="last-month">Last Month</Radio>
            </Radio.Group>
            <div className="d-flex gap-2">
              <DatePicker
                style={{
                  background: "transparent",
                  border: "1px solid #D1D1D1",
                  borderRadius: "32px",
                }}
                placeholder="From"
              />
              <DatePicker
                style={{
                  background: "transparent",
                  border: "1px solid #D1D1D1",
                  borderRadius: "32px",
                }}
                placeholder="To"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHeader;
