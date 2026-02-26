import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import calandrImg from "../../assets/images/calandar-img.png";
import { Modal, Form, Row, Col, FormLabel } from "react-bootstrap";

import { Button, Dropdown, Menu, Select, Tabs,  Input,  } from "antd";
import { FaFilter, FaSearch } from "react-icons/fa";
import { Images } from "../Config/Images";
import TableView from "../TableView/TableView";
import { Activity_Loans_Header } from "../Config/TableHeaders";
import { getAllReferral } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";

import SkeletonLabel from "../SkeletonLabel";

const Referral = () => {
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [legends, setLegends] = useState<any>();
  const [dashboardData, setDashboardData] = useState<any>();
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const Activity_Loans_Header = [
    {
      name: "Sr:",
      selector: (row: { user_id: any }) => row.user_id,
      sortable: true,
      width: "100px"
    },
    {
      name: "Referrer Phone",
      selector: (row: {  referrer_phone: any }) => row.referrer_phone,
      sortable: true,
      width: "150px"
    },
    {
      name: "Referred Phone",
      selector: (row: { referred_phone: any }) => row.referred_phone,
      sortable: true,
      width: "220px"
    },
    {
      name: "Tier ID",
      selector: (row: { tier_id: any }) => row.tier_id,
      sortable: true,
      width: "180px"
    },
    {
      name: "Referrer Reward Value",
      selector: (row: { referrer_reward_value: any }) => row.referrer_reward_value,
      sortable: true,
      width: "150px"
    },
    {
      name: "Referred Reward Value",
      selector: (row: { referred_reward_value: any }) => row.referred_reward_value,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: { status: any }) => row.status,
      sortable: true,
    },

  ];
  const initialFormValues = {
    name: '',
    resetTime: 'daily',
    minSegment: 0,
    maxSegment: 0,
    limit: 0,
    accountLimit: 0,
    accountHead: '',
    type: 'fixed'
  };
const getList = async () => {
  try {
    setLoading(true);
    const response = await getAllReferral();
    if (response) {
      const data = response?.data?.data?.data;
      setDashboardData(data);
      setLoading(false);
      setTotalRows(response?.data?.data?.total || 0);
      setFrom(response?.data?.data?.from || 0);
      setTo(response?.data?.data?.to || 0);
      setPage(response?.data?.data?.current_page);
      setTotalPage(response?.data?.data?.last_page);

    }
  } catch (error: any) {
    toast.error(error?.message);
    setLoading(false);
  } finally {
    setLoading(false);
  }

};

useEffect(() => {
  getList();
}, []); // Empty dependency array means this runs once on mount

const mappedData =
dashboardData &&
dashboardData?.map((item: any) => {
      return {
        id: item?.id,
        user_id: item?.id || "-",
        referrer_phone: item?.phone || "-",
        referred_phone: item?.referrer?.phone || "-",
        tier_id: item?.tier_id || "-",
        referrer_reward_value: item?.referrer_reward_value || "-",
        referred_reward_value: item?.referred_reward_value || "-",
        status: item?.status || "-",
      };
    });
  const [formData, setFormData] = useState({
    user_id: '',
    referrer_phone: '',
    referred_phone: '',
    tier_id:  '',
    referrer_reward_value: '',
    referred_reward_value: '',
    status: '',
  });
  const handleSave = async () => {
    const body: any = {
        user_id: formData.id,
        referrer_phone: formData.referrer_phone,
        referred_phone: formData.referred_phone,
        tier_id: formData.tier_id,
        referrer_reward_value: formData.referrer_reward_value,
        referred_reward_value: formData.referred_reward_value,
        status: formData.status,
    };
  
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {

    // Handle form submission (e.g., API call)
    setIsModalOpen(false);
  };
  return (
    <div className="dashboard">
 
      <div className="service">
        <div className="d-flex justify-content-end  col-12">
        <Select
          mode="tags"
          style={{ width: "15%", borderTopRightRadius: "0px" }}
          // onChange={handleChange}
          placeholder="Filter"
          tokenSeparators={[","]}
          suffixIcon={<FaFilter />}

          // options={options}
        />

        <div className="d-flex gap-2 w-100">
          <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
            <img src={Images.searchIconGray} alt="" />
            <input
              type="text"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
              }}
              className="p-2"
              placeholder="Search..."
            />
          </div>

          <button className="invoice-btn">Excel</button>
          <button className="invoice-btn">PDF</button>
          <button className="invoice-btn">Print</button>
          
        </div>
      </div>
        </div>
      <TableView 
            header={Activity_Loans_Header} 
            data={mappedData}
            isLoading={loading}
            page={page}
            totalRows={totalRows}
            totalPage={totalPage}
            setPage={setPage}
            from={from}
            to={to}
            pageSize={pageSize}
            setPageSize={setPageSize}
        />
   
    </div>
  );
};

export default Referral;