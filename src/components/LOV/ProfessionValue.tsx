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

const ProfessionValue = () => {
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

  const Activity_Loans_Header = [
    // {
    //   name: "Sr:",
    //   selector: (row: { Sr: any }) => row.Sr,
    //   sortable: true,
    //   // width: "15%",
    // },
    {
      name: "Code",
      selector: (row: { code: any }) => row.code,
      width: "100px",
      // sortable: true,
    },
     {
      name: "Description (English)",
      selector: (row: { descriptionEn: any }) => row.descriptionEn,
      width: "200px",
      // sortable: true,
    },
     {
      name: "Description (Arabic)",
      selector: (row: { descriptionAr: any }) => row.descriptionAr,
      // sortable: true,
      width: "300px",
    },
     {
      name: "Risk",
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
      name: "Factor Id",
      selector: (row: { factorId: any }) => row.factorId,
      // sortable: true,
    },
    {
      name: "Factor Weight",
      selector: (row: { factorWeight: any }) => row.factorWeight,
      // sortable: true,
    },
    {
      name: "Status",
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
          {row.status == 1 || row.status === true ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      name: "Actions",
      width: "100px",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button className="gradient-btn" type="primary">Select <img src={arrowDown} alt="" /></Button>
        </Dropdown>
      ),
    },
  ];

   const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      await toast.promise(deleteProfession(deleteTargetId), {
        loading: "Deleting...",
        success: (response) => {
          getList();
          setShowConfirmModal(false);
          return "Deleted successfully";
        },
        error: (err) => err?.message || "Failed to delete source",
      });
    } catch (error) {
      console.error("Delete error:", error);
      setShowConfirmModal(false);
    }
  }; 

   const handleSave = async () => {
    // Validate required fields
    if (!formData.descriptionEn || formData.descriptionEn.trim() === "") {
      toast.error("Description (English) is required");
      setShowConfirmModal(false);
      setShowModal(true);
      return;
    }
    if (!formData.descriptionAr || formData.descriptionAr.trim() === "") {
      toast.error("Description (Arabic) is required");
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
          loading: "Updating...",
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
            return "Updated successfully";
          },
          error: (err) => err?.message || "Failed to update",
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
          loading: "Adding new profession...",
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
            return "Financing Purpose added successfully";
          },
          error: (err) => err?.message || "Failed to add new source",
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

  const options = [{ label: "Name", value: "name" }];
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
        loading: "Importing professions...",
        success: (response: any) => {
          getList();
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return response?.data?.message || "Professions imported successfully";
        },
        error: (err) => err?.response?.data?.message || "Failed to import professions",
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
        style={{ background: "white", padding: "1rem", borderRadius: "6px" }}
      >
        <div className="d-flex mb-3 col-12 filter-select">
          <Select
            mode="tags"
            style={{ width: "15%", borderTopRightRadius: "0px" }}
            onChange={handleChange}
            placeholder="Filter"
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
                placeholder="Search..."
              />
            </div>

            <button
              className="theme-btn-next"
              onClick={handleImportClick}
              disabled={isImporting}
            >
              {isImporting ? "Importing..." : "Import"}
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
              Add New Record
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
            selectedItem === "edit" ? "Edit Profession Value" : "Add Profession Value"
          }
          visible={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowModal(false)}>
              Cancel
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={() => {
                // Validate required fields before showing confirmation modal
                if (!formData.descriptionEn || formData.descriptionEn.trim() === "") {
                  toast.error("Description (English) is required");
                  return;
                }
                if (!formData.descriptionAr || formData.descriptionAr.trim() === "") {
                  toast.error("Description (Arabic) is required");
                  return;
                }
                setShowConfirmModal(true);
                setShowModal(false);
              }}
            >
              {selectedItem === "edit" ? "Save" : "Submit"}
            </Button>,
          ]}
        >
          <div className={"Ente-details"}>
            <Form>
              <Row className="">
                
                  <Col className="px-2 py-2" md={12}>
                    <label className="fw-400">Code</label>
                    <Input
                      type="text"
                      className="fs-6"
                      placeholder="Enter Code"
                      value={formData.code}
                      onChange={(e: any) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                    />
                  </Col>
                
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">Description (English) <span style={{ color: "red" }}>*</span></label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder="Enter Description (English)"
                  value={formData.descriptionEn}
                  onChange={(e: any) =>
                    setFormData({ ...formData, descriptionEn: e.target.value })
                  }
                  required
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">Description (Arabic) <span style={{ color: "red" }}>*</span></label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder="Enter Description (Arabic)"
                  value={formData.descriptionAr}
                  onChange={(e: any) =>
                    setFormData({ ...formData, descriptionAr: e.target.value })
                  }
                  required
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">Risk</label>
                <Select
                  className="fs-6"
                  placeholder="Select Risk"
                  value={formData.risk}
                  onChange={(e: any) =>
                    setFormData({ ...formData, risk: e})
                  }
                >
                  <option value="Low">Low</option> 
                  <option value="Medium">Medium</option>      
                  <option value="High">High</option>      
                </Select>
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">Factor Weight</label>
                <Input
                  type="number"
                  className="fs-6"
                  placeholder="Enter Factor Weight"
                  value={formData.factorWeight}
                  onChange={(e: any) =>
                    setFormData({ ...formData, factorWeight: e.target.value })
                  }
                />
                </Col>
                
                  <Col className = "px-2 py-2" md={12}>
                    <label className="fw-400">Pep</label>
                    <Select
                      className="fs-6"
                      placeholder="Select type"
                      value={formData.isPep ? "true" : "false"}
                      onChange={(e: any) =>
                        setFormData({ ...formData, isPep: e === "true"})
                      }
                    >
                      <option value="true">True</option> 
                      <option value="false">False</option>      
                    </Select>
                  </Col>
                
                
                  <Col md={12} className="px-2 py-4" style={{ marginTop: "20px" }} >            
                    <Checkbox 
                      checked={formData.status}
                      onChange={(e: any) =>
                        setFormData({ ...formData, status: e.target.checked })
                      }
                    >
                      Status
                    </Checkbox>
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
              ? "Edit Record"
              : selectedItem === "add"
              ? "Add New Record"
              : "Delete Record"
          }
          footer={[
            <Button key="no" onClick={() => setShowConfirmModal(false)}>
              No
            </Button>,
            <Button
              key="yes"
              type="primary"
              onClick={
                selectedItem == "delete" ? handleDeleteConfirmed : handleSave
              }
            >
              Yes
            </Button>,
          ]}
        >
          <Form>
            {`${
              selectedItem == "edit"
                ? "Are you sure you want to update this record?"
                : selectedItem == "add"
                ? "Are you sure you want to add new record?"
                : "Are you sure you want to delete this record?"
            }`}
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default ProfessionValue;
