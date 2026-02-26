import React, { useEffect, useState } from "react";
import { Form as BootstrapForm, Form } from "react-bootstrap";
import TableView from "../TableView/TableView";
import { Menu, Dropdown, Button, Switch, Select } from "antd";
import { DownOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { Col, Modal, ModalHeader } from "react-bootstrap";
import { ErrorMessage, Field, Formik } from "formik";
import { AddProductRequiredDocuments } from "../../redux/apis/apisTenantCrud";
import { useNavigate } from "react-router-dom";
const { Option } = Select;
function ProductRequiredDocs({
  productId,
  onSuccess,
  productData,
  isEditable,
}) {
  const [pageSize, setPageSize] = useState(10);
  const [modal, setModal] = useState(false);
  const [editRowId, setEditRowId] = useState(false);
  const [isView, setisView] = useState(false);
  const [updateData, setUpdateData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [allReason, setAllReason] = useState<any>([]);
  const navigation = useNavigate();
  const handleChange = (key: string, row: any) => {
    if (key === "view") {
      setModal(true);
      setisView(true);
      setEditRowId(false);
      setUpdateData({
        documentName: row.documentName,
        documentType: row.documentType,
        status: row.status,
        id: row.id,
      });
    } else if (key === "edit") {
      setModal(true);
      setEditRowId(true);
      setUpdateData({
        documentName: row.documentName,
        documentType: getDoctypeValue(row.documentType),
        status: row.status,
        id: row.id,
      });
    }
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        View
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
    </Menu>
  );
  const Access_History_Header = [
    {
      name: "Name",
      selector: (row: { documentName: string }) => row.documentName,
    },

    {
      name: "Type",
      selector: (row: { documentType: string }) => row.documentType,
    },
    {
      name: "Created Date",
      selector: (row: { createdAt: string }) => row.createdAt,
    },
    // {
    //   name: "Creation Date",
    //   selector: (row: { category: string }) => "23-02-2025",
    // },

    {
      name: "Status",
      cell: (row: { status: boolean }) => (
        <Switch
          checked={row.status}
          style={{ backgroundColor: row.status ? "red" : "" }}
        />
      ),
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button>
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
  const doctypes = [
    { label: "PDF", value: 0 },
    { label: "IMAGE", value: 1 },
    { label: "DOC", value: 2 },
  ];
  const getDoctypeValue = (value: any) => {
    const category = doctypes.find((g) => g.label === value);
    return category ? category.value : "";
  };
  const getDocTypeName = (value: any) => {
    const category = doctypes.find((g) => g.value === value);
    return category ? category.label : "";
  };
  const mappedData =
    allReason &&
    allReason.map((item: any, index: any) => {
      return {
        id: item.id || index + 1, // Ensure ID exists
        index: index + 1,
        documentName: item.documentName,
        documentType: getDocTypeName(item.documentType),
        createdAt: formatDate(item.createdAt),
        status: item.status,
      };
    });

  useEffect(() => {
    setAllReason(productData?.productDocuments);
    setTotalRows(productData?.productDocuments?.length);
  }, [productData]);
  const addNewDocument = () => {
    setModal(true);
    setUpdateData("");
    setEditRowId(false);
  };
  function formatDate(dateString: any) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JS
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  const handleNextPage = () => {
    navigation("/superadmin/productmanagement");
  };
  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      let body: any = {
        documentName: values.documentName,
        documentType: values.documentType,
        status: values.status,
        productId,
      };
      if (editRowId) {
        body = {
          documentName: values.documentName,
          documentType: values.documentType,
          status: values.status,
          productId,
          id: values.id,
        };
      }
      await toast.promise(
        AddProductRequiredDocuments(body), // Pass the body with ID included
        {
          loading: "adding document...",
          success: (response) => {
            if (
              response?.data?.notificationMessage === "Operation successful."
            ) {
              setModal(false);
              onSuccess(productId);
              return response?.data?.notificationMessage;
            } else {
              throw new Error(
                response?.data?.errors?.[0] ||
                response?.data?.notificationMessage ||
                "Failed to add document"
              );
            }
          },
          error: (err) => err?.message || "Something went wrong.",
        }
      );
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      <div className="tab-form-content">
        <div className="cs-table ">
          <div className="col-12">
            <div className="d-flex justify-content-between">
              <h5 className="col-6 mb-3">Required Documents</h5>
              <div className="col-6 d-flex justify-content-end align-items-end">
                {isEditable && (
                  <button
                    onClick={addNewDocument}
                    className="theme-btn-next mb-2"
                    type="submit"
                  >
                    Add New Document
                  </button>
                )}
              </div>
            </div>
          </div>
          <Modal
            size="lg"
            show={modal}
            onHide={() => {
              setModal(false);
              setisView(false);
            }}
          >
            <ModalHeader closeButton>
              <h3>Add Document</h3>
            </ModalHeader>

            <Formik
              initialValues={{
                documentName: updateData?.documentName || "",
                documentType: updateData?.documentType || 0,
                status: updateData?.status || false,
                id: updateData?.id || "",
              }}
              enableReinitialize={true}
              onSubmit={(values, formikBag) => {
                handleSubmit(values, formikBag);
              }}
            >
              {({ handleChange, values, setFieldValue, handleSubmit }) => {
                return (
                  <Form onSubmit={handleSubmit} className="p-2">
                    <Modal.Body>
                      <Col className="mb-3">
                        <label
                          htmlFor="documentName"
                          className="mb-1"
                          style={{ fontSize: "14px", fontWeight: 600 }}
                        >
                          Document Name <span className="text-danger">*</span>
                        </label>
                        <Field
                          type="text"
                          placeholder="Document Name"
                          id="documentName"
                          name="documentName"
                          className="form-control"
                          disabled={isView}
                        />
                        <ErrorMessage
                          name="documentName"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>

                      <Col className="mb-3">
                        <label
                          htmlFor="documentType"
                          className="mb-1"
                          style={{ fontSize: "14px", fontWeight: 600 }}
                        >
                          Document Type
                        </label>

                        <div>
                          <Select
                            id="documentType"
                            style={{ width: "100%" }}
                            value={values.documentType}
                            onChange={(value) => {
                              setFieldValue("documentType", Number(value));
                            }}
                            disabled={isView}
                          >
                            {doctypes.map((item) => (
                              <Option key={item.value} value={item.value}>
                                {item.label}
                              </Option>
                            ))}
                          </Select>
                        </div>
                        <ErrorMessage
                          name="documentType"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>

                      <Col className="mb-3 d-flex align-items-center">
                        <div className="form-check form-switch ps-0">
                          <BootstrapForm.Check
                            className="theme-toggle-btn"
                            type="switch"
                            label="Document Status"
                            checked={values.status}
                            disabled={isView}
                            onChange={() =>
                              setFieldValue("status", !values.status)
                            }
                            id="status"
                          />
                        </div>
                      </Col>
                      {!isView && (
                        <div className="d-flex mt-4 justify-content-end">
                          <button
                            className="theme-btn-next"
                            type="button" // Change to type="button" instead of "submit"
                            onClick={() => {
                              handleSubmit();
                            }}
                          >
                            {editRowId ? "Update Document" : "Add Document"}
                          </button>
                        </div>
                      )}
                    </Modal.Body>
                  </Form>
                );
              }}
            </Formik>
          </Modal>
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            totalRows={totalRows}
            header={Access_History_Header}
            data={mappedData}
          />
        </div>
      </div>
      {isEditable && (
        <div className="d-flex  justify-content-end pt-4">
          <Button onClick={handleNextPage} className="theme-btn-next">
            Next
          </Button>
        </div>
      )}
    </>
  );
}

export default ProductRequiredDocs;
