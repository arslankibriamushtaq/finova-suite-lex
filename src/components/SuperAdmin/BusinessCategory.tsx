import TableView from "../../components/TableView/TableView";
import { Col, Modal, ModalHeader } from "react-bootstrap";
import { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  GetAllBusinessCategory,
  createBusinessCategory,
  deleteBusinessCategory,
  getAllBusinessById,
  updateAllBusiness,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import DynamicBreadcrumb from "./SuperAdminBreadCrumb";
const BusinessCategory = () => {
  const [editRowId, setEditRowId] = useState(null);
  const [modal, setModal] = useState(false);
  const [allReason, setAllReason] = useState<any>();
  const [updateData, setUpdateData] = useState<any>();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const handleEditClick = (row: any) => {
    BusinessId(row.id);
    setEditRowId(row.id);
    setModal(true);
  };

  const handleChange = (key: string, row: any) => {
    if (key === "edit") {
      handleEditClick(row);
    } else if (key === "delete") {
      handleDelete(row);
    }
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />}>
        Delete
      </Menu.Item>
    </Menu>
  );
  const Access_History_Header = [
    {
      name: "SR no.",
      selector: (row: { index: any }) => row.index,
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: "Value",
      selector: (row: { name: any }) => row.name,
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: "Actions",

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button>
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const getAllBusiness = async () => {
    try {
      const res = await GetAllBusinessCategory(page, pageSize);
      if (res) {
        const data = res.data.data;
        setAllReason(data || []);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  useEffect(() => {
    // getAllBusiness();
  }, []);
  const BusinessId = async (id: any) => {
    try {
      const res = await getAllBusinessById(id);
      if (res) {
        const value = res.data.data;
        setUpdateData(value);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (formField: any) => {
    try {
      const body: any = {
        name: formField.name,
      };
      let res;
      if (modal && editRowId) {
        // body["id"] = editRowData;
        body.id = editRowId;
        res = await updateAllBusiness(body);
      } else {
        res = await createBusinessCategory(body);
      }

      if (res) {
        toast.success(res.data.notificationMessage);
        setModal(false);
        getAllBusiness();
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const handleDelete = async (row: any) => {
    try {
      const res = await deleteBusinessCategory(row.id);
      if (res) {
        toast.success(res.data.notificationMessage);
        getAllBusiness();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const mappedData =
    allReason &&
    allReason.map((item: any, index: any) => {
      return {
        id: item.id,
        index: index + 1,
        name: item.name,
      };
    });

  return (
    <>
      <div className="cs-table p-4">
        <div className="col-12">
          <div className="d-flex justify-content-between">
            <DynamicBreadcrumb className="col-6"/>
            <div className="col-6 d-flex justify-content-end">
              <button
                onClick={() => {
                  setModal(true);
                  setUpdateData("");
                  setEditRowId(null);
                }}
                className="theme-btn-next mb-2"
                type="submit"
              >
                Add New
              </button>
            </div>
          </div>
        </div>
        <Modal
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
        </Modal>
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
};
export default BusinessCategory;
