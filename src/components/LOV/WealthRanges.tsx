import { SetStateAction, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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
  Checkbox,
} from "antd";

import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  getWealthRanges,
  updateWealthRange,
  createWealthRange,
  deleteWealthRange,
  getWealthRangesTypes,
} from "../../redux/apis/apisCrud";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";

const WealthRanges = () => {
  const { t } = useTranslation("lov");
  const navigate = useNavigate();
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
  const [formData, setFormData] = useState({ 
    type: "", 
    factors: "", 
    range: "", 
    minimum_amount: "", 
    maximum_amount: "", 
    factor_weight: "", 
    status: false 
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [wealthRangesTypes, setWealthRangesTypes] = useState<any[]>([]);

  const handleMenuClick = (key: string, row: any) => {
    if (key === "view") {
      navigate(`/Los/LOV/WealthRanges/${row.id}`);
    } else if (key === "edit") {
      setSelectedItem("edit");
      setCurrentSourceId(row.id);
      setFormData({ 
        type: row.type || "",
        factors: row.factors || "",
        range: row.range || "",
        minimum_amount: row.minimum_amount || "",
        maximum_amount: row.maximum_amount || "",
        factor_weight: row.factor_weight || "",
        status: row.status || false
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
        key="view"
        icon={<EyeOutlined />}
        onClick={() => handleMenuClick("view", row)}
      >
        {t("common:view")}
      </Menu.Item>
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
      name: t("wealthRanges.col.minimumAmount"),
      selector: (row: { minimum_amount: any }) => row.minimum_amount,
      // sortable: true,
    },
     {
      name: t("wealthRanges.col.maximumAmount"),
      selector: (row: { maximum_amount: any }) => row.maximum_amount,
      // sortable: true,
    },
     {
      name: t("common:type"),
      selector: (row: { type: any }) => row.type,
      // sortable: true,
    },
     {
      name: t("wealthRanges.col.range"),
      selector: (row: { range: any }) => row.range,
      // sortable: true,
    },
     {
      name: t("wealthRanges.col.factors"),
      selector: (row: { factors: any }) => row.factors,
      // sortable: true,
    },
    {
      name: t("wealthRanges.col.factorWeight"),
      selector: (row: { factor_weight: any }) => row.factor_weight,
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
                row.status === 1 || row.status === true
                  ? "var(--color-success)"
                  : row.status === 0 || row.status === false
                  ? "var(--color-error)"
                  : "var(--color-orange-alt)",
              color: "var(--primary-foreground)",
              cursor: row.status === 1 ? "pointer" : "default",
            }}
          >
            {row.status == 1 || row.status === true ? t("common:active") : t("common:inactive")}
          </div>
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
      await toast.promise(deleteWealthRange(deleteTargetId), {
        loading: t("wealthRanges.toast.deleting"),
        success: (response) => {
          getList();
          setShowConfirmModal(false);
          setDeleteTargetId(null);
          return t("wealthRanges.toast.deleted");
        },
        error: (err) => err?.message || t("wealthRanges.toast.deleteFailed"),
      });
    } catch (error) {
      console.error("Delete error:", error);
      setShowConfirmModal(false);
    }
  }; 

   const handleSave = async () => {
    const body: any = {
      type: formData.type,
      factors: formData.factors,
      range: formData.range,
      minimum_amount: formData.minimum_amount ? Number(formData.minimum_amount) : 0,
      maximum_amount: formData.maximum_amount ? Number(formData.maximum_amount) : 0,
      factor_weight: formData.factor_weight ? Number(formData.factor_weight) : 0,
      status: formData.status
    };
    try {
      if (selectedItem == "edit" && currentSourceId !== null) {
        await toast.promise(updateWealthRange(currentSourceId, body), {
          loading: t("wealthRanges.toast.updating"),
          success: (response: any) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
              type: "", 
              factors: "", 
              range: "", 
              minimum_amount: "", 
              maximum_amount: "", 
              factor_weight: "", 
              status: false 
             });
            getList();
            return t("wealthRanges.toast.updated");
          },
          error: (err) => err?.message || t("wealthRanges.toast.updateFailed"),
        });
      } else if (selectedItem == "add") {
        await toast.promise(createWealthRange(body), {
          loading: t("wealthRanges.toast.adding"),
          success: (response) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
              type: "", 
              factors: "", 
              range: "", 
              minimum_amount: "", 
              maximum_amount: "", 
              factor_weight: "", 
              status: false 
              });
            getList();
            return t("wealthRanges.toast.added");
          },
          error: (err) => err?.message || t("wealthRanges.toast.addFailed"),
        });
      }
    } catch (error) {
      console.error("Failed to save source:", error);
      setShowConfirmModal(false);
    }
  }; 

  const getList = async (searchQuery?: string) => {
     setSkelitonLoading(true);
     try {
       const res = await getWealthRanges(page, pageSize, searchQuery || searchTerm);
       if (res) {
         const responseData = res?.data?.data;
         const data = responseData?.data || [];
         setData(data || []);
         setSkelitonLoading(false);
         setTotalRows(responseData?.total || 0);
         setFrom(responseData?.from || 0);
         setTo(responseData?.to || 0);
         setTotalPage(responseData?.last_page || 0);
       }
     } catch (error: any) {
       console.error("Error fetching Financing purpose:", error);
       setSkelitonLoading(false);
     }
  };

  // Debounce search function
  const debouncedSearch = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Clear previous timeout
    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }
    
    // Set new timeout for debounced search
    debouncedSearch.current = setTimeout(() => {
      // Reset to page 1 when searching
      setPage(1);
      getList(value);
    }, 500); // 500ms debounce delay
  };

  useEffect(() => {
     getList();
  }, [page, pageSize]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debouncedSearch.current) {
        clearTimeout(debouncedSearch.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await getWealthRangesTypes();
        if (res?.data?.data) {
          setWealthRangesTypes(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching wealth ranges types:", error);
      }
    };
    fetchTypes();
  }, []);
  
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item?.id,
        Sr: index + 1,
        minimum_amount: item?.minimum_amount || "-",
        maximum_amount: (item?.maximum_amount === 0 || item?.maximum_amount === "0" || Number(item?.maximum_amount) === 0)
          ? t("wealthRanges.anythingAbove")
          : item?.maximum_amount || "-",
        type: item?.type || "-",
        range: item?.range || "-",
        factors: item?.factors || "-",
        factor_weight: item?.factor_weight || "-",
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
                onChange={(e) => handleSearchChange(e.target.value)}
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
                  type: "", 
                  factors: "", 
                  range: "", 
                  minimum_amount: "", 
                  maximum_amount: "", 
                  factor_weight: "", 
                  status: false 
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

        <Modal maskClosable={false} keyboard={false}
          className="custom-mod"
          style={{ maxWidth: "640px" }}
          title={
            selectedItem === "edit" ? t("wealthRanges.modal.editTitle") : t("wealthRanges.modal.addTitle")
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
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">{t("common:type")}</label>
                <Select
                  className="fs-6 w-100"
                  placeholder={t("wealthRanges.ph.selectType")}
                  value={formData.type || undefined}
                  onChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  {wealthRangesTypes.map((type: any) => (
                    <Select.Option key={type.value || type} value={type.value || type}>
                      {type.label || type}
                    </Select.Option>
                  ))}
                </Select>
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">{t("wealthRanges.label.factors")}</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder={t("wealthRanges.ph.factors")}
                  value={formData.factors}
                  onChange={(e: any) =>
                    setFormData({ ...formData, factors: e.target.value })
                  }
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">{t("wealthRanges.label.range")}</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder={t("wealthRanges.ph.range")}
                  value={formData.range}
                  onChange={(e: any) =>
                    setFormData({ ...formData, range: e.target.value })
                  }
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">{t("wealthRanges.label.minimumAmount")}</label>
                <Input
                  type="number"
                  className="fs-6"
                  placeholder={t("wealthRanges.ph.minimumAmount")}
                  value={formData.minimum_amount}
                  onChange={(e: any) =>
                    setFormData({ ...formData, minimum_amount: e.target.value })
                  }
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">{t("wealthRanges.label.maximumAmount")}</label>
                <Input
                  type="number"
                  className="fs-6"
                  placeholder={t("wealthRanges.ph.maximumAmount")}
                  value={formData.maximum_amount}
                  onChange={(e: any) =>
                    setFormData({ ...formData, maximum_amount: e.target.value })
                  }
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">{t("wealthRanges.label.factorWeight")}</label>
                <Input
                  type="number"
                  className="fs-6"
                  placeholder={t("wealthRanges.ph.factorWeight")}
                  value={formData.factor_weight}
                  onChange={(e: any) =>
                    setFormData({ ...formData, factor_weight: e.target.value })
                  }
                />
                </Col>
                <Col md={12} >
                <Checkbox
                  checked={formData.status}
                  onChange={(e: any) =>
                    setFormData({ ...formData, status: e.target.checked })
                  }
                >
                  {t("common:status")}
                </Checkbox>
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
              ? t("wealthRanges.modal.editRecordTitle")
              : selectedItem === "add"
              ? t("shared.addNewRecord")
              : t("wealthRanges.modal.deleteRecordTitle")
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
                ? t("wealthRanges.confirmUpdateBody")
                : selectedItem == "add"
                ? t("wealthRanges.confirmAddBody")
                : t("wealthRanges.confirmDeleteBody")
            }`}
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default WealthRanges;
