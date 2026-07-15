import { SetStateAction, useEffect, useState } from "react";

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

import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  getProductsListing,
  getTypeReasons,
  deleteTypeReasons,
  updateTypeReasons,
  createTypeReasons,
  updateReasonTypeStatus,
} from "../../redux/apis/apisCrud";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { useTranslation } from "react-i18next";
const ReasonsTypes = () => {
  const { t } = useTranslation("lov");
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
  const [formData, setFormData] = useState({ type_id: "", reason: "", status: 0 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleMenuClick = (key: string, row: any) => {
    if (key === "edit") {
      setSelectedItem("edit");
      setCurrentSourceId(row.id);
      setFormData({ 
        type_id: row.title,
        reason: row.product_id,
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
      name: t("reasonsTypes.col.reason"),
      selector: (row: { reason: any }) => row.reason,
      // sortable: true,
      // width: "75%",
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
                ? "var(--color-success)"
                : row.status === 0
                ? "var(--color-error)"
                : "var(--color-orange-alt)",
            color: "var(--primary-foreground)",
            cursor: row.status === 1 ? "pointer" : "default",
          }}
        >
          {row.status == 1 ? t("common:active") : t("common:inactive")}
        </div>
      ),
    },
    {
      name: t("shared.changeStatus"),
      cell: (row: any) => (
        <Switch
          className="red-switch"
          checked={row.status}
          onChange={async (checked) => {
            const newStatus = checked;
            const body = {
              status: newStatus,
            };

            try {
              const res = await updateReasonTypeStatus(row.id, body);
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
      name: t("common:actions"),
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
      await toast.promise(deleteTypeReasons(deleteTargetId), {
        loading: t("reasonsTypes.toast.deleting"),
        success: (response) => {
          getList();
          setShowConfirmModal(false);
          return t("reasonsTypes.toast.deleted");
        },
        error: (err) => err?.message || t("reasonsTypes.toast.deleteFailed"),
      });
    } catch (error) {
      console.error("Delete error:", error);
      setShowConfirmModal(false);
    }
  }; 

   const handleSave = async () => {
    const body: any = {
      type_id: formData.type_id,
      reason: formData.reason,
      status: formData.status
    };
    try {
      if (selectedItem == "edit" && currentSourceId !== null) {
        await toast.promise(updateTypeReasons(currentSourceId, body), {
          loading: t("reasonsTypes.toast.updating"),
          success: (response: any) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
              type_id: "",
              reason: "",
              status: 0 
             });
            getList();
            return t("reasonsTypes.toast.updated");
          },
          error: (err) => err?.message || t("reasonsTypes.toast.updateFailed"),
        });
      } else if (selectedItem == "add") {
        await toast.promise(createTypeReasons(body), {
          loading: t("reasonsTypes.toast.adding"),
          success: (response) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
                type_id: "",
                reason: "",
                status: 0 
              });
            getList();
            return t("reasonsTypes.toast.added");
          },
          error: (err) => err?.message || t("reasonsTypes.toast.addFailed"),
        });
      }
    } catch (error) {
      console.error("Failed to save source:", error);
      setShowConfirmModal(false);
    }
  }; 

  const getList= async () => {
     setSkelitonLoading(true);
     try {
       const res = await getTypeReasons();
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

  const getProducts = async () => {
    try {
      const response = await getProductsListing();
      if (response) {
        const data = response?.data?.data?.data;
        setProdData(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  useEffect(() => {
     getList();
     getProducts();
  }, [page, pageSize]);
  
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item?.id,
        Sr: index + 1,
        type: item?.type_id,
        reason: item?.reason,
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
                placeholder={t("shared.searchPlaceholder")}
              />
            </div>

            <button
              className="theme-btn-next"
              onClick={() => {
                setShowModal(true);
                setSelectedItem("add");
                setFormData({ 
                  type_id: "",
                  reason: "",
                  status: 0 
                });
              }}
            >
              {t("shared.addNewRecord")}
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

        <Modal
          className="custom-mod"
          style={{ maxWidth: "640px" }}
          title={
            selectedItem === "edit" ? t("reasonsTypes.modal.editTitle") : t("shared.addNewRecord")
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
                <Col className="px-2" md={12}>
                <label className="fw-400">{t("reasonsTypes.label.reason")}</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder={t("reasonsTypes.ph.reason")}
                  value={formData.reason}
                  onChange={(e: any) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                />
                </Col>
                <Col className = "px-2" md={12}>
                <label className="fw-400">{t("common:type")}</label>
                <Select
                  className="fs-6"
                  placeholder={t("reasonsTypes.ph.type")}
                  value={formData.type_id}
                  onChange={(e: any) =>
                    setFormData({ ...formData, type_id: e})
                  }
                >
                  {prodData.map((prod: any) => (
                      <Select.Option key={prod.id} value={prod.id}>
                        {prod.name_en}
                      </Select.Option>
                  ))}          
                </Select>
                </Col>
              </Row>
            </Form>
          </div>
        </Modal>
        <Modal
          visible={showConfirmModal}
          onCancel={() => setShowConfirmModal(false)}
          className="custom-mod"
          style={{ maxWidth: "632px" }}
          title={
            selectedItem === "edit"
              ? t("reasonsTypes.modal.editTitle")
              : selectedItem === "edit"
              ? t("shared.addNewRecord")
              : t("reasonsTypes.modal.deleteTitle")
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
                ? t("reasonsTypes.confirmUpdateBody")
                : selectedItem == "add"
                ? t("reasonsTypes.confirmAddBody")
                : t("reasonsTypes.confirmDeleteBody")
            }`}
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default ReasonsTypes;
