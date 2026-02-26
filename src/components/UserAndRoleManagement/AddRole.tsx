import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import icon from "../../assets/images/Vector-11.png";
import circle from "../../assets/images/circle-icon.png";
import time from "../../assets/images/gg_time.png";
import {
  Button,
  Dropdown,
  Menu,
  Select,
  Tabs,
  Modal,
  Input,
  Form,
  Checkbox,
} from "antd";
import csv from "../../assets/images/print-csv.svg";
import blackPrint from "../../assets/images/blac-print.png";
import TableView from "../TableView/TableView";
import { FaFilter, FaSearch } from "react-icons/fa";
import { Images } from "../Config/Images";
import { customersList } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { DeleteOutlined, DownOutlined, EditOutlined } from "@ant-design/icons";
import arrowDown from "../../assets/images/arrow-down.png";
import DashboardProfile from "../DashboardHeader/DashboardProfile";
import { useNavigate } from "react-router-dom";

////

const data1 = [
  {
    Id: "kajbdsf",
    ApplicationNo: "2235",
    Time: "--",
    Date: "--",
    UpdatedBy: "11@gmail.com",
    Event: "--",
    Changes: "11@gmail.com",
  },
  {
    Id: "abc",
    ApplicationNo: "2235",
    Time: "--",
    Date: "--",
    UpdatedBy: "987654@gmail.com",
    Event: "--",
    Changes: "11@gmail.com",
  },
];
const AddRole = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [status, setStatus] = useState("Manager");
  const handleStatusChange = (value: string) => {
    setStatus(value);
  };
  const customerDetails = [
    {
      label: "Manage Customers",
      Menu: [
        {
          label: "view customer",
        },
        {
          label: "view customer detail",
        },
      ],
    },
    {
      label: "Manage Complaints",
      Menu: [
        {
          label: "view complain",
        },
        {
          label: "edit complain",
        },
        {
          label: "show all complain",
        },
        {
          label: "show assigned complain",
        },
        {
          label: "show generated complain",
        },
      ],
    },
    {
      label: "Manage Complaints Types",
      Menu: [
        {
          label: "view complain_type",
        },
        {
          label: "edit complain_type",
        },
        {
          label: "delete complain_type",
        },
        {
          label: "create complain_type",
        },
      ],
    },
    {
      label: "Account Status",
      Menu: [
        {
          label: "view customer",
        },
        {
          label: "view customer detail",
        },
      ],
    },
    {
      label: "Manage Customers",
      Menu: [
        {
          label: "view customer",
        },
        {
          label: "view customer detail",
        },
      ],
    },
    {
      label: "Manage Complaints",
      Menu: [
        {
          label: "view complain",
        },
        {
          label: "edit complain",
        },
        {
          label: "show all complain",
        },
        {
          label: "show assigned complain",
        },
        {
          label: "show generated complain",
        },
      ],
    },
    {
      label: "Manage Customers",
      Menu: [
        {
          label: "view customer",
        },
        {
          label: "view customer detail",
        },
      ],
    },
    {
      label: "Manage Complaints",
      Menu: [
        {
          label: "view complain",
        },
        {
          label: "edit complain",
        },
        {
          label: "show all complain",
        },
        {
          label: "show assigned complain",
        },
        {
          label: "show generated complain",
        },
      ],
    },
    {
      label: "Manage Complaints Types",
      Menu: [
        {
          label: "view complain_type",
        },
        {
          label: "edit complain_type",
        },
        {
          label: "delete complain_type",
        },
        {
          label: "create complain_type",
        },
      ],
    },
    {
      label: "Account Status",
      Menu: [
        {
          label: "view customer",
        },
        {
          label: "view customer detail",
        },
      ],
    },
    {
      label: "Manage Customers",
      Menu: [
        {
          label: "view customer",
        },
        {
          label: "view customer detail",
        },
      ],
    },
    {
      label: "Manage Complaints",
      Menu: [
        {
          label: "view complain",
        },
        {
          label: "edit complain",
        },
        {
          label: "show all complain",
        },
        {
          label: "show assigned complain",
        },
        {
          label: "show generated complain",
        },
      ],
    },
  ];
  return (
    <div className="service ps-3">
      <div className="custom-mod">
        <div className="cust-drop col-4">
          <label>Role Name</label>
          <Select
            defaultValue="Manager"
            style={{ width: "100%", marginTop: "10px" }}
            onChange={handleStatusChange}
          >
            <Option value="Manager">Manager</Option>
            <Option value="Inactive">Inactive</Option>
            <Option value="Pending">Pending</Option>
          </Select>
          <p className="edit-mod">Edit modal content</p>
        </div>
      </div>
      <div className="service">
        <div className="theme-heading">Assign Permission to the Role</div>
        <div className="mt-3">
          <div className="d-flex flex-wrap">
            {customerDetails.map((detail, index) => (
              <div
                key={index}
                className="d-flex justify-content-between align-items-center pe-2 pb-3 col-4"
              >
                <div
                  className="profile-sec w-100"
                  style={{ height: "-webkit-fill-available" }}
                >
                  <p className="role-label">{detail.label}</p>
                  <div>
                    {detail?.Menu?.map((detail, index) => (
                      <div>
                        <Checkbox>{detail?.label}</Checkbox>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end pt-2 pb-4">
        <button className="invoice-btn">Close</button>
        <button className="theme-btn">Create Role</button>
      </div>
    </div>
  );
};

export default AddRole;
