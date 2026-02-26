import React, { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { Menu, Dropdown, Button, Switch } from "antd";
import {
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { Images } from "../Config/Images";
import { useNavigate } from "react-router-dom";
import { FaList } from "react-icons/fa";
function ProductManagement() {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [allReason, setAllReason] = useState<any>([]);
  const [selectedRows, setSelectedRows] = useState<{ [key: number]: boolean }>(
    {}
  );
  const navigate = useNavigate();
  const handleViewClick = (row: any) => {
    navigate(`/view/productmanagement/${row.id}`);
  };
  const handleChange = (key: string, row: any) => {
    /* if (key === "view") {
            handleViewClick(row);
        } else if (key === "edit") {
            //   handleEditClick(row);
        }
        else if (key === "categories") {
            navigate("/productmanagement/productCategories")
        } */
  };
  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const Access_History_Header = [
    {
      name: "Name",
      selector: (row: { productName: string }) => row.productName,
      width: 300,
    },
    {},
    {
      name: "Slug",
      cell: (row: { productName: string }) => row.productName,
      width: 300,
    },
    {},
    {
      name: "Affiliation",
      cell: (row: { id: number }) => (
        <div style={{ paddingLeft: "24px" }}>
          <input
            type="checkbox"
            checked={!!selectedRows[row.id]}
            onChange={() => handleCheckboxChange(row.id)}
          />
        </div>
      ),
    },
  ];

  const mappedData =
    allReason &&
    allReason.map((item: any, index: any) => {
      return {
        id: item.id || index + 1, // Ensure ID exists
        index: index + 1,
        productName: item.productName,
        logo: item.logo,
        email: item.email,
        country: item.country,
        category: item.category,
        productType: item.productType,
        status: item.status,
      };
    });

  useEffect(() => {
    const dummyData = [
      {
        id: 1,
        productName: "Car Ijara",
        logo: Images.productLogoPlaceholder,
        email: "carijara@finova.com",
        country: "Saudi Arabia",
        category: "Ijara",
        productType: "SME",
        status: true,
      },
      {
        id: 2,
        productName: "Tawarruq Retail",
        logo: Images.productLogoPlaceholder,
        email: "tawarruq@retail.com",
        country: "Saudi Arabia",
        category: "Ijara",
        productType: "Individual",
        status: false,
      },
    ];

    setAllReason(dummyData);
    setTotalRows(dummyData.length);
  }, []);

  return (
    <>
      <div className="cs-table p-4">
        <div className="col-12">
          <div className="max-w-7xl mx-auto px-1">
            <div
              className="flex items-center mb-4 ext-gray-900"
              style={{ fontSize: "13px" }}
            >
              <span>Dashboard</span>
              <span> | </span>
              <span>Tenants</span>
              <span> | </span>
              <span>Tenants</span>
            </div>
            <h1
              className="mx-auto py-3"
              style={{ fontWeight: "bold", fontSize: "18px" }}
            >
              Categories
            </h1>
          </div>
        </div>
        {/* <Modal
        size="sm"
        show={modal}
        onHide={() => {
          setModal(false);
        }}
      >
        <ModalHeader closeButton>
          <h3>Add Relation</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            name: updateData?.name || "",
            id: updateData?.id || "",
          }}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ handleChange }) => {
            return (
              <Form className="p-2">
                <Modal.Body>
                  <Col>
                    <label
                      htmlFor="name"
                      className="mb-1"
                      style={{ fontSize: "14px", fontWeight: 600 }}
                    >
                      Business Category
                    </label>
                    <Field
                      type="text"
                      placeholder="Business Category"
                      id="name"
                      name="name"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </Col>

                  <div className="d-flex mt-4 justify-content-center ">
                    <button className="theme-btn-next" type="submit">
                      {editRowId
                        ? "Update Business Category"
                        : "Add Business Category"}
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal> */}
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Access_History_Header}
          data={mappedData}
        />
      </div>
    </>
  );
}

export default ProductManagement;
