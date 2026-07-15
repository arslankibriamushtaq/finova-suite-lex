import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("adminMisc");

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
      name: t("ui.sr"),
      selector: (row: { user_id: any }) => row.user_id,
      sortable: true,
      width : "100px"
    },
    {
      name: t("faq.col.questions"),
      selector: (row: {  answer: any }) => row.answer,
      sortable: true,
    },
    {
      name: t("faq.col.answers"),
      selector: (row: { question: any }) => row.question,
      sortable: true,
    },
    {
        name: t("common:type"),
        cell: (row: any) => (
            <div
             
              style={{
                padding: "0.22rem 1rem",
                borderRadius: "2px",
                cursor: row.type === "spin" ? "spin" : "reward",
              }}
            >
              {row.type=="spin"?t("faq.type.spin"):t("faq.type.reward")}
            </div>
          ),

      },
      {
        name: t("common:status"),
        cell: (row: any) => (
            <div
             
              style={{
                padding: "0.22rem 1rem",
                borderRadius: "2px",
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
              {row.status=="active"?t("common:active"):t("common:inactive")}
            </div>
          ),
      },
    {
        name: t("common:actions"),
  
        cell: (row: any) => (
          <Dropdown overlay={menu(row)} trigger={["click"]}>
            <Button
              className="gradient-btn"
              type="primary"
              style={{
                backgroundColor: "#0B8085 !important",
                color: "#000000",
                borderColor: "white",
                borderRadius: "2px",
                padding: "10px 20px",
              }}
            >
              {t("common:select")} <img src={arrowDown} alt="" />
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
            {t("common:edit")}
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleMenuClick("delete", row)}
      >
        {t("common:delete")}
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

          return t("faq.toast.updateSuccess");
        } else {
          throw new Error(response?.data?.errors || t("faq.toast.updateFailed"));
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

          return t("faq.toast.addSuccess");
        } else {
          throw new Error(response?.data?.errors || t("faq.toast.addFailed"));
        }
      }
    };

    toast.promise(
      savePromise(),
      {
        loading: isEditing ? t("faq.toast.updating") : t("faq.toast.adding"),
        success: (msg) => msg,
        error: (err) => err.message || t("faq.toast.somethingWentWrong"),
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
                return t("faq.toast.deleteSuccess");
              } else {
                throw new Error(response?.data?.errors || t("faq.toast.deleteFailed"));
              }
          };

          toast.promise(
            savePromise(),
            {
              loading:  t("faq.toast.deleting"),
              success: (msg) => msg,
              error: (err) => err.message || t("faq.toast.somethingWentWrong"),
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
              placeholder={t("ui.searchPlaceholder")}
            />
          </div>

          <button className="invoice-btn">{t("ui.excel")}</button>
          <button className="invoice-btn">{t("ui.pdf")}</button>
          <button className="invoice-btn">{t("common:print")}</button>
          <button
            className="theme-btn"
            onClick={() => setShowModal(true)}>
            {t("faq.addBtn")}
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
                <Modal.Title>{editRowId?t("faq.modal.editTitle"):t("faq.modal.addTitle")}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-2 custom-input-box">
                        <Form.Label className="px-2 mt-2">{t("faq.form.question")}</Form.Label>
                        <Form.Control
                          type="text"
                          className="custom-input"
                          placeholder={t("faq.form.placeholder")}
                          name="answer"
                          value={formData.answer}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-2 custom-input-box">
                        <Form.Label className="px-2 mt-2">{t("faq.form.answer")}</Form.Label>
                        <Form.Control
                          type="text"
                          className="custom-input"
                          placeholder={t("faq.form.placeholder")}
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
                        <Form.Label className="px-2 mt-2">{t("common:type")}</Form.Label>
                        <div className="custom-input-cont">
                            <Form.Select
                            value={formData.type}
                            name="type"
                            onChange={handleInputChange}  // Now properly typed
                            style={{ width: "100%", marginTop: "0" }}
                            >
                            <option value="spin">{t("faq.type.spin")}</option>
                            <option value="reward">{t("faq.type.reward")}</option>
                            </Form.Select>
                        </div>
                      </Form.Group>
      
                      </Col>
                      <Col md={6}>
                      <Form.Group className="mb-2 custom-input-box">
                        <Form.Label className="px-2 mt-2">{t("common:status")}</Form.Label>

                        <Form.Group className="w-100">
                        <div className="custom-input-cont">
                            <Form.Select
                            value={formData.status}
                            name="status"
                            onChange={handleInputChange}  // Now properly typed
                            style={{ width: "100%", marginTop: "0" }}
                            >
                            <option value="active">{t("common:active")}</option>
                            <option value="inactive">{t("common:inactive")}</option>
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
                  {t("common:close")}
                </Button>
                <Button className="theme-btn" onClick={handleSave}>
                {editRowId?t("faq.modal.editTitle"):t("faq.modal.addTitle")}
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
            {t("faq.confirm.delete")}
          </p>
        </div>
              </Modal.Body>
              <Modal.Footer className="mod-footer">
                <Button
                key="no"
                onClick={() => setIsDeleteModalVisible(false)}
                className="invoice-btn"
                >
                {t("common:no")}
                </Button>
                <Button
                key="yes"
                onClick={()=>{handleDelete(editRowId)}}
                disabled={loading}
                className="theme-btn"
                >
                {t("common:yes")}
                </Button>
              </Modal.Footer>
            </Modal>
   
     
    </div>
  );
};

export default Faq;