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

const CompanyManagerList = () => {
  const { t } = useTranslation("customerManagement");
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
      name: "#",
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
    {
      name: t("common:name"),
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
     {
      name: t("companyManager.col.nid"),
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
     {
      name: t("companyManager.col.relation"),
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
    {
      name: t("companyManager.col.dob"),
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
    {
      name: t("companyManager.col.nationality"),
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
   
  ];

   const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      await toast.promise(deleteCommodityType(deleteTargetId), {
        loading: t("companyManager.toast.deleting"),
        success: (response) => {
          getList();
          setShowConfirmModal(false);
          return t("common:deletedSuccessfully");
        },
        error: (err) => err?.message || t("companyManager.toast.deleteFailed"),
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
          loading: t("companyManager.toast.updating"),
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
            return t("common:updatedSuccessfully");
          },
          error: (err) => err?.message || t("companyManager.toast.updateFailed"),
        });
      } else if (selectedItem == "add") {
        await toast.promise(createCommodityType(body), {
          loading: t("companyManager.toast.adding"),
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
            return t("companyManager.toast.addSuccess");
          },
          error: (err) => err?.message || t("companyManager.toast.addFailed"),
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

  const options = [{ label: t("common:name"), value: "name" }];
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
          <Select
            mode="tags"
            style={{ width: "15%", borderTopRightRadius: "0px" }}
            onChange={handleChange}
            placeholder={t("common:filter")}
            tokenSeparators={[","]}
            suffixIcon={<FaFilter />}
            options={options}
          />

          <div className="d-flex gap-2 w-100">
            <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
              <img src={Images.searchIconGray} alt="" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                }}
                className="p-2"
                placeholder={t("common:search")}
              />
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
              {t("companyManager.addNew")}
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
            selectedItem === "edit" ? t("companyManager.modal.editTitle") : t("companyManager.modal.addTitle")
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
                <Col className="px-2" md={24}>
                <label className="fw-400">{t("companyManager.form.minimumAmount")}</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder={t("companyManager.form.enterName")}
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                </Col>
                {selectedItem != "edit" && (
                  <Col className = "px-2" md={24}>
                    <label className="fw-400">{t("companyManager.form.range")}</label>
                    <Select
                      className="fs-6"
                      placeholder={t("companyManager.form.selectType")}
                      value={formData.status}
                      onChange={(e: any) =>
                        setFormData({ ...formData, status: e})
                      }
                    >
                      <option value = {1}>{t("companyManager.form.true")}</option>
                      <option value = {0}>{t("companyManager.form.false")}</option>
                    </Select>
                  </Col>
                )}
                <Col className="px-2" md={24}>
                <label className="fw-400">{t("companyManager.form.maximumAmount")}</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder={t("companyManager.form.enterName")}
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
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
              ? t("companyManager.modal.editTitle")
              : selectedItem === "edit"
              ? t("companyManager.modal.addTitle")
              : t("companyManager.modal.deleteTitle")
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
                ? t("companyManager.confirm.update")
                : selectedItem == "add"
                ? t("companyManager.confirm.add")
                : t("companyManager.confirm.delete")
            }`}
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default CompanyManagerList;
