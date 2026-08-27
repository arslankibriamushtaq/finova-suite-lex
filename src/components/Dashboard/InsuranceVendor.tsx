import { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Select,
  Switch,
} from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  addVendor,
  deleteVendorInsurance,
  editVendorInsurance,
  insuranceVendor,
  ViewVendor,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { DeleteFilled, EditFilled, EyeOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { authSlice } from "../../redux/apis/apisSlice";
import { formatDate } from "../../App";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import axios from "axios";
import { store } from "../../redux/store";
import { usePermissions, VENDOR_PERMISSIONS } from "../../hooks/useProductPermissions";
import { useTranslation } from "react-i18next";
const InsuranceVendor = () => {
  const { t } = useTranslation("financing");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedValue, setSelectedValue] = useState("today");
  const [showModal, setShowModal] = useState(false);
  const [updateId, setUpdateId] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  
  // Permissions
  const { hasPermission } = usePermissions();
  const canCreateVendor = hasPermission(VENDOR_PERMISSIONS.CREATE);
  const canEditVendor = hasPermission(VENDOR_PERMISSIONS.EDIT);
  const canDeleteVendor = hasPermission(VENDOR_PERMISSIONS.DELETE);
  const canShowVendor = hasPermission(VENDOR_PERMISSIONS.SHOW);

  const [formData, setFormData] = useState<any>({
    name_en: "",
    name_ar: "",
    email: "",
    phone: "",
    status: false,
    logo: null as File | null,
  });
  const token = (store.getState() as any).block.token;
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (logoPreview) URL.revokeObjectURL(logoPreview);

    setFormData((prev: any) => ({ ...prev, logo: file }));
    setLogoPreview(URL.createObjectURL(file));
  };

  const Activity_Loans_Header = [
    {
      name: t("iv.nameEn"),
      selector: (row: { name_en: any }) => row.name_en,
      sortable: true,
    },
    {
      name: t("iv.nameAr"),
      selector: (row: { name_ar: any }) => row.name_ar,
      sortable: true,
    },
    {
      name: t("common:email"),
      selector: (row: { email: any }) => row.email,
      sortable: true,
      width: "300px",
    },
    {
      name: t("iv.logo"),
      key: "logo",
      selector: (row: { logo: string }) => (
        <img
          src={row?.logo}
          alt="Logo"
          style={{ width: "50px", height: "50px", objectFit: "contain" }}
        />
      ),
    },

    {
      name: t("common:status"),
      cell: (row: { status: any }) => (
        <div
          style={{
            padding: "8px 10px",
            borderRadius: "32px",
            fontSize: "12px",
            backgroundColor:
              row.status === "Active"
                ? "rgba(63, 195, 128, 0.9)"
                : row.status === "inactive"
                ? "#F84D4D"
                : "transparent",
            color: "white",
            cursor: row.status === "active" ? "pointer" : "default",
          }}
        >
          {row.status == "Active" ? t("common:active") : t("common:inactive")}
        </div>
      ),
      sortable: true,
    },
    {
      name: t("common:actions"),

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "#c00000 !important",
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
  const menu = (row: any) => (
    <Menu>
      {canShowVendor && (
        <Menu.Item
          key="view"
          icon={<EyeOutlined />}
          onClick={() => handleMenuClick("view", row)}
        >
          {t("common:viewDetails")}
        </Menu.Item>
      )}
      {canEditVendor && (
        <Menu.Item
          key="edit"
          icon={<EditFilled />}
          onClick={() => handleMenuClick("edit", row)}
        >
          {t("common:edit")}
        </Menu.Item>
      )}
      {canDeleteVendor && (
        <Menu.Item
          key="delete"
          icon={<DeleteFilled />}
          onClick={() => handleMenuClick("delete", row)}
        >
          {t("common:delete")}
        </Menu.Item>
      )}
    </Menu>
  );
  const getInfo = async (id: any) => {
    try {
      const response = await ViewVendor(id);
      if (response) {
        const data = response?.data?.data;
        setFormData({
          // id: data?.id
          name_en: data?.name_en,
          name_ar: data?.name_ar,
          email: data?.email,
          phone: data?.phone,
          status: data?.status,
          logo: data?.logo,
        });
        if (typeof data?.logo === "string") setLogoPreview(data.logo);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const editInfo = async (id: any) => {
    try {
      const body = {
        name_en: formData?.name_en,
        name_ar: formData?.name_ar,
        email: formData?.email,
        phone: formData?.phone,
        status: formData?.status,
        logo: formData?.logo,
      };

      await toast.promise(
        axios.post(
          `${
            import.meta.env.VITE_REACT_APP_API_BASE_URL
          }/insurance-vendors/update/${id}`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        ),
        {
          loading: t("iv.updatingVendor"),
          success: (res) => {
            if (res?.data?.success) {
              setShowModal(false);
              setUpdateId("");
              getInsuranceVendor();
              return res?.data?.message;
            } else if (res?.data?.errors) {
              Object.values(res.data.errors).forEach((msgs: any) =>
                msgs.forEach((msg: string) => toast.error(msg))
              );
              throw new Error("Validation failed");
            } else {
              throw new Error(res?.data?.message || "Unknown error");
            }
          },
          error: (err) => err?.message || t("iv.somethingWentWrong"),
        }
      );
    } catch (error: any) {
      toast.error(error?.message || t("iv.updateVendorFailed"));
    }
  };

  const deleteInfo = async (id: any) => {
    try {
      const res = await deleteVendorInsurance(id);

      if (res?.data?.message) {
        getInsuranceVendor();

        toast.success(res?.data?.message);
      }
    } catch (errors: any) {
      toast.error(errors?.message);
    }
  };
  const handleMenuClick = (key: string, row: any) => {
    setSelectedItem(key);

    switch (key) {
      case "view":
        setShowModal(true);
        setIsViewOnly(true);
        getInfo(row?.id);
        break;

      case "edit":
        setShowModal(true);
        setIsViewOnly(false);
        getInfo(row?.id);
        setUpdateId(row?.id);
        break;

      case "delete":
        deleteInfo(row?.id);
        break;

      default:
        break;
    }
  };

  const getInsuranceVendor = async () => {
    try {
      setSkelitonLoading(true);

      const response = await insuranceVendor();
      if (response) {
        const data = response?.data?.data?.data || [];

        setData(data || []);
        setSkelitonLoading(false);
        setTotalRows(response?.data?.data?.total || 0);
        setFrom(response?.data?.data?.from || 0);
        setTo(response?.data?.data?.to || 0);
        setPage(response?.data?.data?.current_page);
        setTotalPage(response?.data?.data?.last_page);
      }
    } catch (error: any) {
      // toast.error(response?.data?.error);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getInsuranceVendor();
  }, []);
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item.id,
        Sr: index + from,
        phone: item?.phone,
        name_en: item?.name_en,
        name_ar: item?.name_ar,
        email: item?.email,
        status: item?.status,

        logo: item?.logo,
      };
    });

  const addInsuranceVendor = async () => {
    setShowModal(true);

    try {
      const body: any = new FormData();
      body.append("name_en", formData.name_en || "");
      body.append("name_ar", formData.name_ar || "");
      body.append("email", formData.email || "");
      body.append("phone", formData.phone || "");
      body.append("status", formData.status);
      if (formData.logo instanceof File) {
        body.append("logo", formData.logo);
      } else {
        console.warn("Logo is not a valid file:", formData.logo);
      }
      await toast.promise(
        axios.post(
          `${
            import.meta.env.VITE_REACT_APP_API_BASE_URL
          }/insurance-vendors/store`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        ),
        {
          loading: t("iv.addingVendor"),
          success: (res) => {
            if (res?.data?.data?.message) {
              toast.success(res?.data?.data?.message);
              setShowModal(false);
              getInsuranceVendor();
              return res?.data?.message;
            } else if (res?.data?.errors[0]) {
              toast.error(res?.data?.errors[0]);
            }
          },
          error: (err) => {
            console.error("Error occurred:", err);
            return err?.message || t("iv.somethingWentWrong");
          },
        }
      );
    } catch (error: any) {
      // console.error("Error during login:", error);
    }
  };

  return (
    <div className="service">
      <div className="d-flex justify-content-end col-12 filter-select">
        <Select
          mode="tags"
          style={{ width: "15%", borderTopRightRadius: "0px" }}
          // onChange={handleChange}
          placeholder={t("common:filter")}
          tokenSeparators={[","]}
          suffixIcon={<FaFilter />}

          // options={options}
        />

        <div className="d-flex gap-2 w-100" style={{ height: 40 }}>
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
              placeholder={t("filter.searchPlaceholder")}
            />
          </div>
          <div className="d-flex align-items-center">
            <div
              className="d-flex gap-1 p-2"
              style={{ paddingLeft: "0px !important" }}
            >
              <DatePicker
                className="date-picker"
                placeholder={t("common:from")}
                value={fromDate}
                onChange={(date) => {
                  setFromDate(date);
                  dispatch(
                    authSlice.actions.setFromFilter({
                      fromFilter: formatDate(date ? date : null),
                    })
                  );
                }}
                allowClear
              />
              <DatePicker
                className="date-picker"
                placeholder={t("common:to")}
                value={toDate}
                onChange={(date) => {
                  setToDate(date);
                  dispatch(
                    authSlice.actions.setToFilter({
                      toFilter: formatDate(date),
                    })
                  );
                  setSelectedValue(!toDate ? "" : "today");
                  dispatch(authSlice.actions.setTheme({ theme: "" }));
                }}
                allowClear
              />
            </div>
          </div>
          {canCreateVendor && (
            <button
              className="theme-btn-next"
              onClick={() => {
                setShowModal(true);
                setFormData({});
              }}
            >
              {t("iv.addVendor")}
            </button>
          )}
          {/* <button
            className="invoice-btn"
            onClick={() => {
              exportToPDF();
            }}
          >
            PDF
          </button>
          <button className="invoice-btn">Print</button> */}
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
        style={{ maxWidth: "732px" }}
        title={selectedItem === "edit" ? t("iv.editVendor") : t("iv.addVendor")}
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowModal(false)}>
            {t("common:cancel")}
          </Button>,
          !isViewOnly && (
            <Button
              key="save"
              type="primary"
              onClick={() => {
                if (selectedItem === "edit") {
                  editInfo(updateId);
                } else {
                  addInsuranceVendor();
                }
              }}
            >
              {selectedItem === "edit" ? t("common:save") : t("common:submit")}
            </Button>
          ),
        ]}
      >
        <div className={"Ente-details"}>
          <Form>
            <div className="d-flex col-12 gap-2 mb-2">
              <div className="col-6">
                <label className="fw-400">{t("iv.nameEn")}</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder={t("iv.enterEnglishName")}
                  value={formData.name_en}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name_en: e.target.value })
                  }
                  disabled={isViewOnly}
                />
              </div>
              <div className="col-6">
                <label className="fw-400">{t("iv.nameAr")}</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder={t("iv.enterArabicName")}
                  value={formData.name_ar}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name_ar: e.target.value })
                  }
                  disabled={isViewOnly}
                />
              </div>
            </div>

            <div className="d-flex col-12 gap-2 mb-2">
              <div className="col-6">
                <label className="fw-400">{t("iv.vendorEmail")}</label>
                <Input
                  type="email"
                  className="fs-6"
                  placeholder={t("iv.enterEmail")}
                  value={formData.email}
                  onChange={(e: any) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isViewOnly}
                />
              </div>
              <div className="col-6">
                <label className="fw-400">{t("iv.phoneNumber")}</label>
                <PhoneInput
                  country={"pk"}
                  value={formData.phone}
                  onChange={(phone) => setFormData({ ...formData, phone })}
                  inputClass="w-100"
                  inputStyle={{ height: "38px", fontSize: "14px" }}
                  disabled={isViewOnly}
                />
              </div>
            </div>

            <div className="d-flex col-12 gap-2">
              <div className="col-6">
                <label className="fw-400">{t("iv.uploadLogo")}</label>
                <Input
                  type="file"
                  className="fs-6"
                  accept=".png,.jpg,.jpeg,.gif,.svg"
                  onChange={handleLogoUpload}
                  disabled={isViewOnly}
                />

                {logoPreview ? (
                  <img
                    src={logoPreview}
                    width={50}
                    height={50}
                    style={{ objectFit: "contain", marginTop: 8 }}
                    alt={t("iv.logoPreview")}
                  />
                ) : null}
              </div>
              <div className="col-6 d-flex mt-4 align-items-center">
                <Switch
                  className="red-switch"
                  checked={formData.status === 1}
                  onChange={(checked) =>
                    setFormData({ ...formData, status: checked ? 1 : 0 })
                  }
                  disabled={isViewOnly}
                />

                <label className="fw-400 ms-3">{t("iv.statusChange")}</label>
              </div>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default InsuranceVendor;
