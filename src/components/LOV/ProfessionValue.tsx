import { SetStateAction, useEffect, useState, useRef, useCallback } from "react";

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
  getProfessions,
  updateProfession,
  createProfession,
  deleteProfession,
  importProfessions,
} from "../../redux/apis/apisCrud";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { useTranslation } from "react-i18next";

const ProfessionValue = () => {
  const { t } = useTranslation("lov");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
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
    code: "", 
    descriptionEn: "", 
    descriptionAr: "", 
    factorWeight: "", 
    risk: "", 
    isPep: false, 
    status: false 
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleMenuClick = (key: string, row: any) => {
    if (key === "edit") {
      // Find the original item from data array to get the correct structure
      const originalItem = data.find((item: any) => item.id === row.id);
      setSelectedItem("edit");
      setCurrentSourceId(row.id);
      setFormData({ 
        code: originalItem?.code || "",
        descriptionEn: originalItem?.description?.en || "",
        descriptionAr: originalItem?.description?.ar || "",
        factorWeight: originalItem?.factor_weight || originalItem?.factor_id || "",
        risk: originalItem?.risk || "",
        isPep: originalItem?.is_pep || false,
        status: originalItem?.status || false
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
      name: t("professionValue.col.code"),
      selector: (row: { code: any }) => row.code,
      width: "100px",
      // sortable: true,
    },
     {
      name: t("professionValue.col.descriptionEn"),
      selector: (row: { descriptionEn: any }) => row.descriptionEn,
      width: "200px",
      // sortable: true,
    },
     {
      name: t("professionValue.col.descriptionAr"),
      selector: (row: { descriptionAr: any }) => row.descriptionAr,
      // sortable: true,
      width: "300px",
    },
     {
      name: t("professionValue.col.risk"),
      cell: (row: any) => {
        const risk = row.risk || "";
        const getRiskColor = (risk: string) => {
          const riskLower = risk?.toLowerCase() || "";
          if (riskLower === "high") return "var(--color-error)";
          if (riskLower === "medium") return "var(--color-orange-alt)";
          if (riskLower === "low") return "var(--color-success)";
          return "var(--color-orange-alt)";
        };
        return (
          <div
            style={{
              padding: "8px 10px",
              fontSize: "12px",
              borderRadius: "32px",
              backgroundColor: getRiskColor(risk),
              color: "var(--primary-foreground)",
            }}
          >
            {risk || "-"}
          </div>
        );
      },
    },
     {
      name: t("professionValue.col.factorId"),
      selector: (row: { factorId: any }) => row.factorId,
      // sortable: true,
    },
    {
      name: t("professionValue.col.factorWeight"),
      selector: (row: { factorWeight: any }) => row.factorWeight,
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
      width: "100px",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button className="gradient-btn" type="primary">{t("common:select")} <img src={arrowDown} alt="" /></Button>
        </Dropdown>
      ),
    },
  ];

   const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      await toast.promise(deleteProfession(deleteTargetId), {
        loading: t("professionValue.toast.deleting"),
        success: (response) => {
          getList();
          setShowConfirmModal(false);
          return t("professionValue.toast.deleted");
        },
        error: (err) => err?.message || t("professionValue.toast.deleteFailed"),
      });
    } catch (error) {
      console.error("Delete error:", error);
      setShowConfirmModal(false);
    }
  }; 

   const handleSave = async () => {
    // Validate required fields
    if (!formData.descriptionEn || formData.descriptionEn.trim() === "") {
      toast.error(t("professionValue.validation.descriptionEn"));
      setShowConfirmModal(false);
      setShowModal(true);
      return;
    }
    if (!formData.descriptionAr || formData.descriptionAr.trim() === "") {
      toast.error(t("professionValue.validation.descriptionAr"));
      setShowConfirmModal(false);
      setShowModal(true);
      return;
    }

    try {
      if (selectedItem == "edit" && currentSourceId !== null) {
        // Update API body: only description, risk, and factor_weight
        const updateBody: any = {
          description: {
            en: formData.descriptionEn,
            ar: formData.descriptionAr
          },
          risk: formData.risk,
          factor_weight: formData.factorWeight ? Number(formData.factorWeight) : 0
        };
        await toast.promise(updateProfession(currentSourceId, updateBody), {
          loading: t("professionValue.toast.updating"),
          success: (response: any) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
              code: "", 
              descriptionEn: "", 
              descriptionAr: "", 
              factorWeight: "", 
              risk: "", 
              isPep: false, 
              status: false 
             });
            getList();
            return t("professionValue.toast.updated");
          },
          error: (err) => err?.message || t("professionValue.toast.updateFailed"),
        });
      } else if (selectedItem == "add") {
        // Create API body: code, description, risk, factor_weight, is_pep, and status
        const createBody: any = {
          code: formData.code,
          description: {
            en: formData.descriptionEn,
            ar: formData.descriptionAr
          },
          risk: formData.risk,
          factor_weight: formData.factorWeight ? Number(formData.factorWeight) : 0,
          is_pep: formData.isPep,
          status: formData.status
        };
        await toast.promise(createProfession(createBody), {
          loading: t("professionValue.toast.adding"),
          success: (response) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
              code: "", 
              descriptionEn: "", 
              descriptionAr: "", 
              factorWeight: "", 
              risk: "", 
              isPep: false, 
              status: false 
              });
            getList();
            return t("professionValue.toast.added");
          },
          error: (err) => err?.message || t("professionValue.toast.addFailed"),
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
       const res = await getProfessions(page, pageSize, searchQuery || searchTerm);
       if (res) {
         const responseData = res?.data?.data;
         const data = responseData?.data || [];
         setData(data);
         setSkelitonLoading(false);
         setTotalRows(responseData?.total || 0);
         setFrom(responseData?.from || 0);
         setTo(responseData?.to || 0);
         setTotalPage(responseData?.last_page || 0);
       }
     } catch (error: any) {
       console.error("Error fetching Professions:", error);
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
  
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item?.id,
        Sr: index + 1,
        code: item?.code || "-",
        descriptionEn: item?.description?.en || "-",
        descriptionAr: item?.description?.ar || "-",
        risk: item?.risk || "-",
        factorId: item?.factor_id || "-",
        isPep: item?.is_pep ? "True" : "False",
        status: item?.status,
        factorWeight: item?.factor?.factor_weight || "-",
      };
    });

  const options = [{ label: t("common:name"), value: "name" }];
  const handleChange = (value: SetStateAction<undefined>[]) => {
    setSelectedFilters(value[0]);
    // You can trigger filtering logic here
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);

      await toast.promise(importProfessions(formDataToSend), {
        loading: t("professionValue.toast.importing"),
        success: (response: any) => {
          getList();
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return response?.data?.message || t("professionValue.toast.imported");
        },
        error: (err) => err?.response?.data?.message || t("professionValue.toast.importFailed"),
      });
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
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
              onClick={handleImportClick}
              disabled={isImporting}
            >
              {isImporting ? t("professionValue.importing") : t("common:import")}
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept=".xlsx,.xls,.csv"
            />

            <button
              className="theme-btn-next"
              onClick={() => {
                setShowModal(true);
                setSelectedItem("add");
                setFormData({ 
                  code: "", 
                  descriptionEn: "", 
                  descriptionAr: "", 
                  factorWeight: "", 
                  risk: "", 
                  isPep: false, 
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
            selectedItem === "edit" ? t("professionValue.modal.editTitle") : t("professionValue.modal.addTitle")
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
                // Validate required fields before showing confirmation modal
                if (!formData.descriptionEn || formData.descriptionEn.trim() === "") {
                  toast.error(t("professionValue.validation.descriptionEn"));
                  return;
                }
                if (!formData.descriptionAr || formData.descriptionAr.trim() === "") {
                  toast.error(t("professionValue.validation.descriptionAr"));
                  return;
                }
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
                    <label className="fw-400">{t("professionValue.label.code")}</label>
                    <Input
                      type="text"
                      className="fs-6"
                      placeholder={t("professionValue.ph.code")}
                      value={formData.code}
                      onChange={(e: any) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                    />
                  </Col>

                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">{t("professionValue.label.descriptionEn")} <span style={{ color: "red" }}>*</span></label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder={t("professionValue.ph.descriptionEn")}
                  value={formData.descriptionEn}
                  onChange={(e: any) =>
                    setFormData({ ...formData, descriptionEn: e.target.value })
                  }
                  required
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">{t("professionValue.label.descriptionAr")} <span style={{ color: "red" }}>*</span></label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder={t("professionValue.ph.descriptionAr")}
                  value={formData.descriptionAr}
                  onChange={(e: any) =>
                    setFormData({ ...formData, descriptionAr: e.target.value })
                  }
                  required
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">{t("professionValue.label.risk")}</label>
                <Select
                  className="fs-6"
                  placeholder={t("professionValue.ph.selectRisk")}
                  value={formData.risk}
                  onChange={(e: any) =>
                    setFormData({ ...formData, risk: e})
                  }
                >
                  <option value="Low">{t("professionValue.risk.low")}</option>
                  <option value="Medium">{t("professionValue.risk.medium")}</option>
                  <option value="High">{t("professionValue.risk.high")}</option>
                </Select>
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">{t("professionValue.label.factorWeight")}</label>
                <Input
                  type="number"
                  className="fs-6"
                  placeholder={t("professionValue.ph.factorWeight")}
                  value={formData.factorWeight}
                  onChange={(e: any) =>
                    setFormData({ ...formData, factorWeight: e.target.value })
                  }
                />
                </Col>

                  <Col className = "px-2 py-2" md={12}>
                    <label className="fw-400">{t("professionValue.label.pep")}</label>
                    <Select
                      className="fs-6"
                      placeholder={t("professionValue.ph.selectType")}
                      value={formData.isPep ? "true" : "false"}
                      onChange={(e: any) =>
                        setFormData({ ...formData, isPep: e === "true"})
                      }
                    >
                      <option value="true">{t("professionValue.opt.true")}</option>
                      <option value="false">{t("professionValue.opt.false")}</option>
                    </Select>
                  </Col>


                  <Col md={12} className="px-2 py-4" style={{ marginTop: "20px" }} >
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
              ? t("professionValue.modal.editRecordTitle")
              : selectedItem === "add"
              ? t("shared.addNewRecord")
              : t("professionValue.modal.deleteRecordTitle")
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
                ? t("professionValue.confirmUpdate")
                : selectedItem == "add"
                ? t("professionValue.confirmAdd")
                : t("professionValue.confirmDelete")
            }`}
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default ProfessionValue;
