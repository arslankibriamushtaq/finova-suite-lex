import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import calandrImg from "../../assets/images/calandar-img.png";
import { Modal, Form, Row, Col, FormLabel } from "react-bootstrap";

import { Button, Dropdown, Menu, Select, Tabs,  Input,  } from "antd";
import { FaFilter, FaSearch } from "react-icons/fa";
import { Images } from "../Config/Images";
import TableView from "../TableView/TableView";
import { Activity_Loans_Header } from "../Config/TableHeaders";
import { getAllRewards } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import SkeletonLabel from "../SkeletonLabel";

const AllRewards = () => {
  const { t } = useTranslation("dashboard");
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
  const [showModal, setShowModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [loading, setLoading] = useState(false);
  const Activity_Loans_Header = [
    {
      name: t("rewards.col.sr"),
      selector: (row: { user_id: any }) => row.user_id,
      sortable: true,
      width: "100px"
    },
    {
      name: t("common:name"),
      selector: (row: {  user_name: any }) => row.user_name,
      sortable: true,
      width: "150px"
    },
    {
      name: t("rewards.col.minSegment"),
      selector: (row: { user_min_segment: any }) => row.user_min_segment,
      sortable: true,
      width: "220px"
    },
    {
      name: t("rewards.col.maxSegment"),
      selector: (row: { user_max_segemnt: any }) => row.user_max_segemnt,
      sortable: true,
      width: "180px"
    },
    {
      name: t("rewards.col.limit"),
      selector: (row: { user_limit: any }) => row.user_limit,
      sortable: true,
      width: "150px"
    },
    {
      name: t("rewards.col.resetTime"),
      selector: (row: { user_reset_time: any }) => row.user_reset_time,
      sortable: true,
    },
    {
      name: t("rewards.col.accountHead"),
      selector: (row: { user_account_head_id: any }) => row.user_account_head_id,
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
    const response = await getAllRewards();
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
}, [page, pageSize]); // Empty dependency array means this runs once on mount

const mappedData =
dashboardData &&
dashboardData?.map((item: any) => {
      return {
        id: item?.spin?.id,
        user_id: item?.spin?.id || "-",
        user_name: item?.spin?.name || "-",
        user_min_segment: item?.spin?.min_segment || "-",
        user_max_segemnt: item?.spin?.max_segment || "-",
        user_limit: item?.spin?.limit || "-",
        user_reset_time: item?.spin?.reset_time || "-",
        user_account_head_id: item?.spin?.account_head_id || "-",
      };
    });
  const barChartOptions = {
    xAxis: {
      type: "category",
      data: ["12", "13", "14", "15", "16", "17", "18"], // Days in Feb 2025
      nameLocation: "middle", // Position the label in the middle
      nameGap: 30, // Increase the gap between the label and the axis
    },
    yAxis: {
      type: "value",
      name: t("appStatusChart.yAxis.avgTime"), // Y-axis label
    },
    series: [
      {
        name: t("appStatusChart.series1"), // Name for the first line
        data: [10, 20, 15, 25, 30, 22, 18], // Data for the first line
        type: "line",
        smooth: true, // Make the line curve smoothly
        itemStyle: {
          color: "#FF9811", // Color for the first line
        },
      },
      {
        name: t("rewards.series2"), // Name for the second line
        data: [5, 15, 10, 20, 25, 18, 12], // Data for the second line
        type: "line",
        smooth: true, // Make the line curve smoothly
        itemStyle: {
          color: "#614FA2", // Color for the second line
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        // Custom tooltip to show both series values
        let tooltip = `${t("appStatusChart.tooltipDay", { day: params[0].axisValue })}<br>`;
        params.forEach((item) => {
          tooltip += `${item.marker} ${item.seriesName}: ${item.data}<br>`;
        });
        return tooltip;
      },
    },
    legend: {
      data: [t("appStatusChart.series1"), t("rewards.series2")], // Legend to differentiate the lines
      left: "left", // Position the legend on the left
      bottom: "bottom", // Position the legend at the bottom
      orient: "horizontal", // Display the legend horizontally
      padding: 30, // Increase the gap between the label and the axis
    },
    grid: {
      containLabel: true, // Ensure labels fit within the chart
      left: "5%", // Add space on the left for the legend
      right: "5%",
      bottom: "15%", // Add space at the bottom for the x-axis label
    },
  };

  const chartRef: any = useRef(null);
  let colors: any = "";

 

  // Define 7 different colors for the donut chart
  const donutColors = [
    "#FF6384", // Red
    "#36A2EB", // Blue
    "#FFCE56", // Yellow
    "#6366f1", // Teal
    "#9966FF", // Purple
    "#FF9F40", // Orange
    "#C9CBCF", // Gray
  ];

  // Define 7 data points for the donut chart
  const donutData = [
    { name: "Category 1", value: 10 },
    { name: "Category 2", value: 20 },
    { name: "Category 3", value: 15 },
    { name: "Category 4", value: 25 },
    { name: "Category 5", value: 30 },
    { name: "Category 6", value: 22 },
    { name: "Category 7", value: 18 },
  ];

  const totalTickets = donutData.reduce((sum, item) => sum + item.value, 0);

  const seriesData = [
    {
      symbolSize: 1,
      data: donutData,
      name: "Donut Chart",
      type: "pie",
      radius: ["40%", "60%"],
      center: isMobile ? ["50%", "50%"] : ["50%", "50%"],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        disabled: true, // Disable hover effects
      },
      labelLine: {
        show: false,
      },
      
    },
    
    
  ];

  const systemPieGraph = {
    color: donutColors, // Use the 7 defined colors
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      data: donutData.map((item) => item.name), // Legend labels from data
      left: "left", // Position the legend on the left
      bottom: "bottom", // Position the legend at the bottom
      orient: "horizontal", // Display the legend horizontally
      padding: 15, // Increase the gap between the label and the axis
    },
    grid: {
        containLabel: true, // Ensure labels fit within the chart
        top:"0%",
        left: "5%", // Add space on the left for the legend
        right: "5%",
        bottom: "15%", // Add space at the bottom for the x-axis label
      },
    graphic: {
      type: "text",
      left: "center",
      top: "center",
      style: {
        text: `${t("rewards.totalTickets")}\n${totalTickets}`, // Display "Total Tickets" and the value
        fontSize: 12, // Font size for the text
        fontWeight: "bold",
        fill: "#333", // Text color
        textAlign: "center", // Center-align the text
        lineHeight: 15,
      },
   
    },
    series: seriesData,
  };
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
    { value: "option4", label: "Option 4" },
    { value: "option5", label: "Option 5" },
  ];

  // State to manage the selected option
  const [selectedOption, setSelectedOption] = useState(null);

  // Handle change when an option is selected
  const handleChange = (selected) => {
    setSelectedOption(selected);
  };
  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: 200, // Adjust the width of the dropdown
      borderRadius: 2, // Rounded corners
      border: "1px solid #ccc", // Border color
      boxShadow: "none", // Remove default box shadow
      "&:hover": {
        borderColor: "#888", // Border color on hover
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#000000" : "white", // Selected option background
      color: state.isSelected ? "white" : "black", // Selected option text color
      "&:hover": {
        backgroundColor: "#f0f0f0", // Hover background
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: 2, // Rounded corners for the dropdown menu
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Add a subtle shadow
    }),
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    user_min_segment: '',
    user_max_segemnt: '',
    user_limit:  '',
    user_reset_time: '',
    user_account_head_id: '',
    type: '',
    account_limit : ''
  });
  const handleSave = async () => {
    const body: any = {
      name: formData.name,
      user_min_segment: formData.user_min_segment,
      user_max_segemnt: formData.user_max_segemnt,
      user_limit: formData.user_limit,
      user_reset_time: formData.user_reset_time,
      user_account_head_id: formData.user_account_head_id,
      type: formData.type,
      account_limit: formData.account_limit,
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

       
      <div
        className="row"
        style={{
          padding: "0px 0px 20px",
          marginTop: "20px",
        }}
      >
        <div className="col-md-8">
          <div
            style={{
              position: "relative",
              backgroundColor: "white",
              zIndex: 1000,
              maxWidth: "100%",
              height: "480px",
              borderRadius: "2px",
            }}
          >
            <div className="reward-amount">
                <div style={{ margin: "20px" }}>
                <label className="label-tag">{t("rewards.rewardAmountPaid")}</label>
                <div>
                <Select
                    options={options}
                    value={selectedOption}
                    onChange={handleChange}
                    styles={customStyles}
                    placeholder={t("rewards.thisYear")}
                    isSearchable // Enable search functionality
                    isClearable // Allow clearing the selected option
                    />
                                    <img src={calandrImg} alt="calendar" />

                </div>
                </div>
                
            </div>
            <ReactECharts
              option={barChartOptions}
              style={{ width: "100%", height: "400px" }}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div
            style={{
              position: "relative",
              backgroundColor: "white",
              zIndex: 1000,
              maxWidth: "100%",
              height: "480px",
              borderRadius: "2px",
            }}
          >
            <div className="reward-amount">
                <div style={{ margin: "20px" }}>
                <label className="label-tag">{t("rewards.reward")}</label>
                <div>
                <Select
                    options={options}
                    value={selectedOption}
                    onChange={handleChange}
                    styles={customStyles}
                    placeholder={t("rewards.thisYear")}
                    isSearchable // Enable search functionality
                    isClearable // Allow clearing the selected option
                    />
                                    <img src={calandrImg} alt="calendar" />

                </div>
                </div>
                
            </div>
            <ReactECharts
              ref={chartRef}
              option={systemPieGraph}
              style={{ height: "400px", width: "100%" }}
            />
          </div>
        </div>
      </div>
      <div className="service">
        <div className="d-flex justify-content-end  col-12">
        <Select
          mode="tags"
          style={{ width: "15%", borderTopRightRadius: "0px" }}
          // onChange={handleChange}
          placeholder={t("common:filter")}
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
              placeholder={t("pipeline.searchPlaceholder")}
            />
          </div>

          <button className="invoice-btn">{t("btn.excel")}</button>
          <button className="invoice-btn">{t("btn.pdf")}</button>
          <button className="invoice-btn">{t("common:print")}</button>
          <button
            className="theme-btn"
            onClick={() => setShowModal(true)}>
            {t("rewards.addNewSpin")}
          </button>
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
      <Modal backdrop="static" keyboard={false} size="lg" show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("rewards.modal.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-2 custom-input-box">
                  <Form.Label className="px-2 mt-2">{t("common:name")}</Form.Label>
                  <Form.Control
                    type="text"
                    className="custom-input"
                    placeholder={t("rewards.placeholder")}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2 custom-input-box">
                  <Form.Label className="px-2 mt-2">{t("rewards.col.resetTime")}</Form.Label>
                  <Form.Control
                    type="text"
                    className="custom-input"
                    placeholder={t("rewards.placeholder")}
                    name="user_reset_time"
                    value={formData.user_reset_time}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
              <Row>
              <Col md={6}>
                <Form.Group className="mb-2 custom-input-box">
                  <Form.Label className="px-2 mt-2">{t("rewards.col.minSegment")}</Form.Label>
                  <Form.Control
                    /* as="textarea"
                    rows={2} */
                    className="custom-input"
                    placeholder={t("rewards.placeholder")}
                    name="user_reset_time"
                    value={formData.user_min_segment}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                </Col>
                <Col md={6}>
                <Form.Group className="mb-2 custom-input-box">
                  <Form.Label className="px-2 mt-2">{t("rewards.col.maxSegment")}</Form.Label>
                  <Form.Control
                    /* as="textarea"
                    rows={2} */
                    className="custom-input"
                    placeholder={t("rewards.placeholder")}
                    name="user_max_segemnt"
                    value={formData.user_max_segemnt}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-2 custom-input-box">
                  <Form.Label className="px-2 mt-2">{t("rewards.col.limit")}</Form.Label>
                  <Form.Control
                    /* as="textarea"
                    rows={2} */
                    className="custom-input"
                    placeholder={t("rewards.placeholder")}
                    name="Limit"
                    value={formData.user_limit}
                    onChange={handleInputChange}
                  />
              </Form.Group>
              </Col>
              <Col md={6}>
                  <Form.Group className="mb-2 custom-input-box">
                      <Form.Label className="px-2 mt-2">{t("rewards.form.accountLimit")}</Form.Label>
                      <Form.Control
                        /* as="textarea"
                        rows={2} */
                        className="custom-input"
                        placeholder={t("rewards.placeholder")}
                        name="account_limit"
                        value={formData.account_limit}
                        onChange={handleInputChange}
                      />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-2 custom-input-box">
                  <Form.Label className="px-2 mt-2">{t("rewards.col.limit")}</Form.Label>
                  <Form.Control
                    /* as="textarea"
                    rows={2} */
                    className="custom-input"
                    placeholder={t("rewards.placeholder")}
                    name="Account Head"
                    value={formData.user_account_head_id}
                    onChange={handleInputChange}
                  />
              </Form.Group>
              </Col>
              <Col md={6}>
                  <Form.Group className="mb-2 custom-input-box">
                      <Form.Label className="px-2 mt-2">{t("common:type")}</Form.Label>
                      <Form.Control
                        /* as="textarea"
                        rows={2} */
                        className="custom-input"
                        placeholder={t("rewards.placeholder")}
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                      />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="theme-btn" onClick={() => {setShowModal(false); 
       
          setFormData({
            name: '',
            user_min_segment: '',
            user_max_segemnt: '',
            user_limit:  '',
            user_reset_time: '',
            user_account_head_id: '',
            type: '',
            account_limit : ''
          });}}>
            {t("common:close")}
          </Button>
          <Button className="theme-btn" onClick={handleSave}>
            {t("rewards.addNewSpin")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AllRewards;