import { SetStateAction, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Button,
  Input,
  Menu,
  Select,
  Modal,
  Form,
  Switch,
  Dropdown,
  Row,
  Col,
} from "antd";

import TableView from "../../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../../Config/Images";
import {
  getCommodityTypes,
  updateCommodityTypeStatus,
  createProductType,
  updateProductType,
  deleteProductType,
  createCommodityType,
  updateCommodityType,
  deleteCommodityType,
} from "../../../redux/apis/apisCrud";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../../assets/images/arrow-down.png";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const EmailOther = () => {
  const { t } = useTranslation("notifications");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [prodData, setProdData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [currentSourceId, setCurrentSourceId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", status: 0 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleMenuClick = (key: string, row: any) => {
    if (key === "edit") {
      setSelectedItem("edit");
      setCurrentSourceId(row.id);
      setFormData({ 
        name: row.name,
        status: row.status 
      });
      setShowModal(true);
    } else if (key === "delete") {
      setDeleteTargetId(row.id);
      setShowConfirmModal(true);
      setSelectedItem("delete");
    }
  };

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("edit", row)}
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

  const Activity_Loans_Header = [
    // {
    //   name: "Sr:",
    //   selector: (row: { Sr: any }) => row.Sr,
    //   sortable: true,
    //   // width: "15%",
    // },
    {
      name: t("record.col.templateCode"),
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
     {
      name: t("record.col.templateName"),
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <div
          style={{
            padding: "8px 10px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor:
              row.status === 1
                ? "rgba(63, 195, 128, 0.9)"
                : row.status === 0
                ? "#BC3D3F"
                : "#FF9811",
            color: "white",
            cursor: row.status === 1 ? "pointer" : "default",
          }}
        >
          {row.status == 1 ? t("common:active") : t("common:inactive")}
        </div>
      ),
    },
    {
      name: t("record.col.changeStatus"),
      cell: (row: any) => (
        <Switch
          checked={row.status}
          onChange={async (checked) => {
            const newStatus = checked;
            const body = {
              status: newStatus,
            };

            try {
              const res = await updateCommodityTypeStatus(row.id, body);
              if (res) {
                toast.success(res?.data?.message);
                getList();
                // Update UI locally
                setData((prevData: any) =>
                  prevData.map((item: any) =>
                    item.id === row.id ? { ...item, status: body } : item
                  )
                );
              }
            } catch (error) {
              console.error("Status update failed:", error);
            }
          }}
          className="red-switch"
        />
      ),
    },
    {
      name: t("record.col.action"),
      width: "10%",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              fontSize: "12px",
              borderRadius: "2px",
              padding: "8px",
            }}
          >
            {t("common:select")} 
            <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    },
  ];

   const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      await toast.promise(deleteCommodityType(deleteTargetId), {
        loading: t("record.toast.deleting"),
        success: (response) => {
          getList();
          setShowConfirmModal(false);
          return t("record.toast.deleted");
        },
        error: (err) => err?.message || t("record.toast.deleteFailed"),
      });
    } catch (error) {
      console.error("Delete error:", error);
      setShowConfirmModal(false);
    }
  }; 

   const handleSave = async () => {
    const body: any = {
      name: formData.name,
      status: formData.status,
      parent_id: 1
    };
    try {
      if (selectedItem == "edit" && currentSourceId !== null) {
        await toast.promise(updateCommodityType(currentSourceId, body), {
          loading: t("record.toast.updating"),
          success: (response: any) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
              name: "",
              status: 0 
             });
            getList();
            return t("record.toast.updated");
          },
          error: (err) => err?.message || t("record.toast.updateFailed"),
        });
      } else if (selectedItem == "add") {
        await toast.promise(createCommodityType(body), {
          loading: t("record.toast.addingFinance"),
          success: (response) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
                name: "",
                status: 0 
              });
            getList();
            return t("record.toast.financeAdded");
          },
          error: (err) => err?.message || t("record.toast.addFailed"),
        });
      }
    } catch (error) {
      console.error("Failed to save source:", error);
      setShowConfirmModal(false);
    }
  }; 

  const getList = async () => {
     setSkelitonLoading(true);
     try {
       const res = await getCommodityTypes();
       if (res) {
         const data = res?.data?.data?.data;
         setData(data || []);
         setSkelitonLoading(false);
         setTotalRows(data.length || 0);
         setFrom(1);
         setTo(data.length || 0);
         setPage(1);
         setTotalPage(1);
       }
     } catch (error: any) {
       console.error("Error fetching Financing purpose:", error);
       setSkelitonLoading(false);
     }
  };

  useEffect(() => {
     getList();
  }, [page, pageSize]);
  
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item?.id,
        Sr: index + 1,
        name: item?.name || "-",
        slug: item?.slug || "-",
        unit_of_measure: item?.unit_of_measure || "-",
        parent_id: item?.parent_id || "-",
        status: item?.status,
      };
    });

  const options = [{ label: "Name", value: "name" }];
  const handleChange = (value: SetStateAction<undefined>[]) => {
    setSelectedFilters(value[0]);
    // You can trigger filtering logic here
  };
  return (
    <>
      <div
        className="service"
        style={{ background: "white", padding: "1rem", borderRadius: "2px" }}
      >
        <div className="d-flex mb-3 col-12 filter-select">
          

          <div className="d-flex gap-2 w-100">
            <div className="d-flex align-items-center gap-1  px-2 ps-3 search-box" style={{backgroundColor:"transparent"}}>
              
            </div>

            <button
              className="theme-btn-next"
              onClick={() => {
                setShowModal(true);
                setSelectedItem("add");
                setFormData({ 
                  name: "",
                  status: 0 
                });
              }}
            >
                {t("record.addSms")}
            </button>
          </div>
        </div>
        <TableView
          header={Activity_Loans_Header}
          data={mappedData}
          totalRows={totalRows}
          isLoading={skelitonLoading}
          from={from}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={to}
        />

        <Modal maskClosable={false} keyboard={false}
          className="custom-mod"
          style={{ maxWidth: "640px" }}
          title={
            selectedItem === "edit" ? t("record.editTitle") : t("record.addTitle")
          }
          visible={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowModal(false)}>
              {t("common:cancel")}
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={() => {
                setShowConfirmModal(true);
                setShowModal(false);
              }}
            >
              {selectedItem === "edit" ? t("common:save") : t("common:submit")}
            </Button>,
          ]}
        >
          <div className={"Ente-details"}>
            <Form>
              <Row className="">
                 {selectedItem != "edit" && (
                  <Col className = "px-2" md={12}>
                    <label className="fw-400">{t("record.label.templateType")}</label>
                    <Select
                      className="fs-6"
                      placeholder={t("record.ph.selectType")}
                      value={formData.status}
                      onChange={(e: any) =>
                        setFormData({ ...formData, status: e})
                      }
                    >
                      <option value = {1}>{t("record.opt.true")}</option> 
                      <option value = {0}>{t("record.opt.false")}</option>      
                    </Select>
                  </Col>
                )}
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">{t("record.label.templateCode")}</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder={t("record.ph.enterName")}
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">{t("record.label.templateNameEn")}</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder={t("record.ph.enterName")}
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">{t("record.label.templateNameAr")}</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder={t("record.ph.enterName")}
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                </Col>
                 <Col className="px-2 py-2" md={12}>
          <div className="editor-fixed">
            <label className="fw-400">{t("record.label.message")}</label>

            <CKEditor
              // @ts-ignore
              editor={ClassicEditor}
              config={{
                toolbar: [
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "underline",
                  "strikethrough",
                  "link",
                  "bulletedList",
                  "numberedList",
                  "blockQuote",
                  "insertTable",
                  "undo",
                  "redo",
                  "imageUpload",
                  "mediaEmbed",
                  "codeBlock",
                  "highlight",
                  "alignment",
                  "fontColor",
                  "fontBackgroundColor",
                  "fontSize",
                  "fontFamily",
                  "horizontalLine",
                  "specialCharacters",
                ],
              }}
              
            />
          </div>
        </Col>

        <Col className="px-2 py-2" md={12}>
                    <label className="fw-400">{t("record.label.messageAr")}</label>

          <div className="editor-fixed">
            <CKEditor
              // @ts-ignore
              editor={ClassicEditor}
              config={{
                toolbar: [
                  "bold",
                  "italic",
                  "underline",
                  "bulletedList",
                  "numberedList",
                  "undo",
                  "redo",
                  "-",
                ],
              }}
           
            />
          </div>
        </Col>
               
              </Row>
            </Form>
          </div>
        </Modal>
        <Modal maskClosable={false} keyboard={false}
          visible={showConfirmModal}
          onCancel={() => setShowConfirmModal(false)}
          className="custom-mod"
          style={{ maxWidth: "632px" }}
          title={
            selectedItem === "edit"
              ? t("record.editTitle")
              : selectedItem === "edit"
              ? t("record.addTitle")
              : t("record.confirm.deleteTitle")
          }
          footer={[
            <Button key="no" onClick={() => setShowConfirmModal(false)}>
              {t("common:no")}
            </Button>,
            <Button
              key="yes"
              type="primary"
              onClick={
                selectedItem == "delete" ? handleDeleteConfirmed : handleSave
              }
            >
              {t("common:yes")}
            </Button>,
          ]}
        >
          <Form>
            {`${
              selectedItem == "edit"
                ? t("record.confirm.update")
                : selectedItem == "add"
                ? t("record.confirm.add")
                : t("record.confirm.delete")
            }`}
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default EmailOther;
