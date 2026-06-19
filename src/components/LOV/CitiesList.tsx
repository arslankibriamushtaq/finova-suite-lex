import { SetStateAction, useEffect, useRef, useState } from "react";

import {
  Select,
} from "antd";

import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {

  getCities,
} from "../../redux/apis/apisCrud";


const CitiesList = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState();

  const Activity_Loans_Header = [
    {
      name: "City ID",
      selector: (row: { cityId: any }) => row.cityId,
      width: "100px",
    },
    {
      name: "Region ID",
      selector: (row: { regionId: any }) => row.regionId,
      width: "100px",
    },
    {
      name: "City Name (English)",
      selector: (row: { cityNameEn: any }) => row.cityNameEn,
      width: "200px",
    },
    {
      name: "City Name (Arabic)",
      selector: (row: { cityNameAr: any }) => row.cityNameAr,
      width: "200px",
    },
    {
      name: "Risk Score",
      cell: (row: any) => {
        const riskScore = row.riskScore || "";
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
              backgroundColor: getRiskColor(riskScore),
              color: "var(--primary-foreground)",
            }}
          >
            {riskScore || "-"}
          </div>
        );
      },
    },
    {
      name: "Country Name",
      selector: (row: { countryName: any }) => row.countryName,
      width: "200px",
    },
    {
      name: "Factor",
      selector: (row: { factorName: any }) => row.factorName,
      width: "150px",
    },
    {
      name: "Factor Weight",
      selector: (row: { factorWeight: any }) => row.factorWeight,
      width: "120px",
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
    /* {
      name: "Actions",
      width: "100px",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button className="gradient-btn" type="primary">Select <img src={arrowDown} alt="" /></Button>
        </Dropdown>
      ),
    }, */
  ];

 /*   const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      await toast.promise(deleteCommodityType(deleteTargetId), {
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
    const body: any = {
      name: formData.name,
      status: formData.status,
      parent_id: 1
    };
    try {
      if (selectedItem == "edit" && currentSourceId !== null) {
        await toast.promise(updateCommodityType(currentSourceId, body), {
          loading: "Updating...",
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
            return "Updated successfully";
          },
          error: (err) => err?.message || "Failed to update",
        });
      } else if (selectedItem == "add") {
        await toast.promise(createCommodityType(body), {
          loading: "Adding finance purpose...",
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
            return "Financing Purpose added successfully";
          },
          error: (err) => err?.message || "Failed to add new source",
        });
      }
    } catch (error) {
      console.error("Failed to save source:", error);
      setShowConfirmModal(false);
    }
  };  */

  const getList = async (searchQuery?: string) => {
     setSkelitonLoading(true);
     try {
       const res = await getCities(page, pageSize, searchQuery || searchTerm);
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
       console.error("Error fetching Cities:", error);
       setSkelitonLoading(false);
     }
  };
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
    return () => {
      if (debouncedSearch.current) {
        clearTimeout(debouncedSearch.current);
      }
    };
  }, []);
  useEffect(() => {
     getList();
  }, [page, pageSize]);
  
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      const nameValue = typeof item?.name === 'object' && item?.name !== null
        ? item.name.en || item.name.ar || "-"
        : item?.name || "-";
      return {
        id: item?.id,
        Sr: index + 1,
        cityId: item?.city_id || "-",
        regionId: item?.region_id || "-",
        name: nameValue,
        slug: item?.slug || "-",
        unit_of_measure: item?.unit_of_measure || "-",
        parent_id: item?.parent_id || "-",
        cityNameEn: item?.name?.en || "-",
        cityNameAr: item?.name?.ar || "-",
        status: item?.status,
        riskScore: item?.risk_score || "-",
        countryName: item?.country?.country_name || "-",
        factorName: item?.factor?.factors || "-",
        factorWeight: item?.factor?.factor_weight || "-",
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

            {/* <button
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
              Add New Record
            </button> */}
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

        {/* <Modal
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
                <label className="fw-400">City ID</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">Regin ID</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                </Col>
                 {selectedItem != "edit" && (
                  <Col className = "px-2 py-2" md={24}>
                    <label className="fw-400">Country</label>
                    <Select
                      className="fs-6"
                      placeholder="Select type"
                      value={formData.status}
                      onChange={(e: any) =>
                        setFormData({ ...formData, status: e})
                      }
                    >
                      <option value = {1}>True</option> 
                      <option value = {0}>False</option>      
                    </Select>
                  </Col>
                )}
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">City (English)</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">City (Arabic)</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">Factor Weight</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                </Col>
                 <Col className="px-2 py-2" md={12}>
                <label className="fw-400"> Weight</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                </Col>
                {selectedItem != "edit" && (
                  <Col className = "px-2 py-2" md={24}>
                    <label className="fw-400">Risk Score</label>
                    <Select
                      className="fs-6"
                      placeholder="Select type"
                      value={formData.status}
                      onChange={(e: any) =>
                        setFormData({ ...formData, status: e})
                      }
                    >
                      <option value = {1}>True</option> 
                      <option value = {0}>False</option>      
                    </Select>
                  </Col>
                )}
                
                <Col md={12} >            
                <Checkbox>Status</Checkbox>
                </Col>
              </Row>
            </Form>
          </div>
        </Modal> */}
        {/* <Modal
          visible={showConfirmModal}
          onCancel={() => setShowConfirmModal(false)}
          className="custom-mod"
          style={{ maxWidth: "632px" }}
          title={
            selectedItem === "edit"
              ? "Edit Record"
              : selectedItem === "edit"
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
        </Modal> */}
      </div>
    </>
  );
};

export default CitiesList;
