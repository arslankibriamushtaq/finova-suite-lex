import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import calandrImg from "../../assets/images/calandar-img.png";
import { Form,Modal, Row, Col, FormLabel } from "react-bootstrap";

import { Button, Dropdown, Menu, Select, Tabs,  Input,  } from "antd";
import { FaFilter, FaSearch } from "react-icons/fa";
import { Images } from "../Config/Images";
import TableView from "../TableView/TableView";
import { Activity_Loans_Header } from "../Config/TableHeaders";
import { deleteFaq, getAllFaq, getAllFaqCreate, updateFaqList } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { DeleteOutlined, DownOutlined, EditOutlined } from "@ant-design/icons";
import arrowDown from "../../assets/images/arrow-down.png";

import SkeletonLabel from "../SkeletonLabel";

const Faq = () => {

  const [dashboardData, setDashboardData] = useState<any>();
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [editRowId, setEditRowId] = useState(null);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    answer: '',
    question: '',
    type: 'spin',
    status : 'active'   
  });



  const Activity_Loans_Header = [
    {
      name: "Sr:",
      selector: (row: { user_id: any }) => row.user_id,
      sortable: true,
      width : "100px"
    },
    {
      name: "Questions",
      selector: (row: {  answer: any }) => row.answer,
      sortable: true,
    },
    {
      name: "Answers",
      selector: (row: { question: any }) => row.question,
      sortable: true,
    },
    {
        name: "Type",
        cell: (row: any) => (
            <div
             
              style={{
                padding: "0.22rem 1rem",
                borderRadius: "12px",
                cursor: row.type === "spin" ? "spin" : "reward",
              }}
            >
              {row.type=="spin"?"spin":"reward"}
            </div>
          ),
        
      },
      {
        name: "Status",
        cell: (row: any) => (
            <div
             
              style={{
                padding: "0.22rem 1rem",
                borderRadius: "12px",
                width:"90px",
                textAlign:"center",
                backgroundColor:
                  row.status === "active"
                    ? "rgba(63, 195, 128, 0.9)"
                    : row.accountStatus === "inactive"
                    ? "#F84D4D"
                    : " #f84d4d ",
                color: "white",
                cursor: row.status === "active" ? "pointer" : "default",
              }}
            >
              {row.status=="active"?"Active":"Inactive"}
            </div>
          ),
      },
    {
        name: "Actions",
  
        cell: (row: any) => (
          <Dropdown overlay={menu(row)} trigger={["click"]}>
            <Button
              className="gradient-btn"
              type="primary"
              style={{
                backgroundColor: "#0B8085 !important",
                color: "#000000",
                borderColor: "white",
                borderRadius: "8px",
                padding: "10px 20px",
              }}
            >
              Select <img src={arrowDown} alt="" />
            </Button>
          </Dropdown>
        ),
    },
   

  ];


  const handleMenuClick = (key: string, data: any) => {
    setIsDeleteModalVisible(true);
    setEditRowId(data?.id)
  };
  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => {setEditRowId(row?.id);
            setShowModal(true);  
          setFormData({
            answer: row?.answer,
            question: row?.question,
            type: row?.type,
            status : row?.status  
      });
      setSelectedItem("edit")
    }}
        
      >
            Edit
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleMenuClick("delete", row)}
      >
        Delete
      </Menu.Item>
    </Menu>
  );
const getList = async () => {
  try {
    setLoading(true);
    const response = await getAllFaq(page, pageSize);
    if (response) {
      const data = response?.data?.data?.data ;
      setDashboardData(data);
      setLoading(false);
      setSkelitonLoading(false);
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
        id: item?.id,
        user_id: item?.id || "-",
        answer: item?.answer || "-",
        question: item?.question || "-",
        type: item?.type || "-",
        status: item?.status || "-",
      };
    });


 
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSave = async () => {
    const body: any = {
      answer: formData.answer,
      question: formData.question,
      type: formData.type,
      status: formData.status,
    };
  
    const isEditing = selectedItem === "edit" && editRowId;
  
    const savePromise = async () => {
      if (isEditing) {
        const response = await updateFaqList(editRowId, body);
        if (response.status === 200) {
          setShowModal(false);
          setEditRowId(null);
          setSelectedItem(null);
          setFormData({
            answer: "",
            question: "",
            type: "",
            status: "",
          });
          getList();

          return "Faq updated successfully!";
        } else {
          throw new Error(response?.data?.errors || "Failed to update");
        }
      } else {
        const response = await getAllFaqCreate(body);
        if (response.status === 200) {
          setShowModal(false);
          getList();
          setFormData({
            answer: "",
            question: "",
            type: "",
            status: "",
          });
          getList();

          return "Faq added successfully!";
        } else {
          throw new Error(response?.data?.errors || "Failed to add");
        }
      }
    };
  
    toast.promise(
      savePromise(),
      {
        loading: isEditing ? "Updating Faq..." : "Adding Faq...",
        success: (msg) => msg,
        error: (err) => err.message || "Something went wrong",
      }
    );
  };
  
  const handleDelete = async (row: any) => {
    try {
        const savePromise = async () => {
        
              const response = await deleteFaq(row);
              if (response.status === 200) {
                setIsDeleteModalVisible(false);
                getList();
                setEditRowId(null)
                return "Faq delete successfully!";
              } else {
                throw new Error(response?.data?.errors || "Failed to delete");
              }
          };
        
          toast.promise(
            savePromise(),
            {
              loading:  "Deleting Faq...",
              success: (msg) => msg,
              error: (err) => err.message || "Something went wrong",
            }
          );
    } catch (error: any) {
      toast.error(error.message);
    }
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
          <button
            className="theme-btn"
            onClick={() => setShowModal(true)}>
            Add New Faq
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
       <Modal size="lg" show={showModal} onHide={() => setShowModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>{editRowId?"Edit Faq":"Add New Faq"}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-2 custom-input-box">
                        <Form.Label className="px-2 mt-2">Question</Form.Label>
                        <Form.Control
                          type="text"
                          className="custom-input"
                          placeholder="Placeholder"
                          name="answer"
                          value={formData.answer}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-2 custom-input-box">
                        <Form.Label className="px-2 mt-2">Answer</Form.Label>
                        <Form.Control
                          type="text"
                          className="custom-input"
                          placeholder="Placeholder"
                          name="question"
                          value={formData.question}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                    <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2 custom-input-box">
                        <Form.Label className="px-2 mt-2">Type</Form.Label>
                        <div className="custom-input-cont">
                            <Form.Select
                            value={formData.type}
                            name="type"
                            onChange={handleInputChange}  // Now properly typed
                            style={{ width: "100%", marginTop: "0" }}
                            >
                            <option value="spin">spin</option>
                            <option value="reward">reward</option>
                            </Form.Select>
                        </div>
                      </Form.Group>
      
                      </Col>
                      <Col md={6}>
                      <Form.Group className="mb-2 custom-input-box">
                        <Form.Label className="px-2 mt-2">Status</Form.Label>
                        
                        <Form.Group className="w-100">
                        <div className="custom-input-cont">
                            <Form.Select
                            value={formData.status}
                            name="status"
                            onChange={handleInputChange}  // Now properly typed
                            style={{ width: "100%", marginTop: "0" }}
                            >
                            <option value="active">active</option>
                            <option value="inactive">inactive</option>
                            </Form.Select>
                        </div>
                        </Form.Group>
                      </Form.Group>
                      
                      </Col>
                  </Row>
                 
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button className="theme-btn" onClick={() => {setShowModal(false); 
             
                setFormData({
                  answer: '',
                  question: '',
                  type: '',
                  status:  ''
                });}}>
                  Close
                </Button>
                <Button className="theme-btn" onClick={handleSave}>
                {editRowId?"Edit Faq":"Add New Faq"}
                </Button>
              </Modal.Footer>
            </Modal>
            <Modal size="lg" show={isDeleteModalVisible} onHide={() => setIsDeleteModalVisible(false)} centered className="mini-mod" >
            
              <Modal.Body>
              <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "0",
            }}
          >
            Are you sure want to delete this spin?
          </p>
        </div>
              </Modal.Body>
              <Modal.Footer className="mod-footer">
                <Button
                key="no"
                onClick={() => setIsDeleteModalVisible(false)}
                className="invoice-btn"
                >
                No
                </Button>
                <Button
                key="yes"
                onClick={()=>{handleDelete(editRowId)}}
                disabled={loading}
                className="theme-btn"
                >
                Yes
                </Button>
              </Modal.Footer>
            </Modal>
   
     
    </div>
  );
};

export default Faq;