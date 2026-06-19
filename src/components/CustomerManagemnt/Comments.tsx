import TableView from "../../components/TableView/TableView";
import { Button, Checkbox, DatePicker, Dropdown, Menu } from "antd";
import {
  DeleteFilled,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import DynamicHeaderStructure from "../../components/DynamicHeaderStructure";
import TableHeaderFilter from "../TableHeaderFilter";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
// import { Formik, Field, ErrorMessage } from "formik";
// import { Col, Modal, ModalHeader, Row } from "react-bootstrap";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Col, Modal, ModalHeader, Row } from "react-bootstrap";
import * as Yup from "yup";
import {
  getAllComments,
  getCommentById,
  addComment as addCommentAPI,
  updateComment as updateCommentAPI,
  deleteComment as deleteCommentAPI,
  deleteComment,
} from "../../redux/apis/apisCrud";
import { themeStyle } from "../Config/Theme";
import { Images } from "../Config/Images";

const Comments = () => {
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [AllComments, setAllComments] = useState<any>([]);
  const [modal, setModal] = useState(false);
  const [formModal, setFormModal] = useState<any>(false);
  const [type, setType] = useState<any>(["Regular", "Special", "Custom"]);
  const [subType, setSubType] = useState<any>([
    "Systemm Generated",
    "User Generated",
  ]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [editForm, setEditForm] = useState<any>([]);
  const handleSubmit = async () => {
    try {
      const res = await getAllComments(page, pageSize);
      if (res) {
        const data = res.data.data;
        setAllComments(data || "");
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const mappedData =
    AllComments &&
    AllComments.map((item: any) => {
      return {
        id: item?.id || "",
        isAlert: item?.isAlert || "",
        type: item?.type || "",
        subType: item?.subType || "",
        comments: item?.comments || "",
        commentedBy: item?.commentedBy || "",
        timestamp: formatDate(item?.timestamp) || "",
        action: item?.id || "",
      };
    });

  useEffect(() => {
    handleSubmit();
  }, [page, pageSize]);

  const handleClick = () => {
    setFormModal(true);
  };

  const button = [{ title: "add", onClick: handleClick }];

  const handleEditClick = (id: any) => {
    setEditForm({});
    setEditRowId(id);
    setModal(true);
    commentId(id);
  };

  const handleDelete = async (row: any) => {
    try {
      const res = await deleteComment(row.id);
      if (res) {
        toast.success(res?.data?.notificationMessage);
        handleSubmit();
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const commentId = async (id: any) => {
    try {
      const res = await getCommentById(id.id);
      if (res) {
        const value = res.data.data;
        setEditForm(value);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleChange = (key: string, row: any) => {
    if (key === "edit") {
      handleEditClick(row);
    } else if (key === "view") {
      handleDelete(row);
    }
  };

  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="view" icon={<DeleteOutlined />}>
        Delete
      </Menu.Item>
    </Menu>
  );
  const formatDatePayload = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  };

  const addComment = async (formFields: any) => {
    try {
      const body = {
        accountId: formFields?.accountId,
        comments: formFields?.comments,
        timeStamp: formatDatePayload(formFields?.timeStamp),
        commentedBy: formFields?.commentedBy,
        isAlert: formFields?.isAlert,
        type: formFields?.type,
        subType: formFields?.subType,
      };
      const response: any = await addCommentAPI(body);
      if (response) {
        toast.success(response?.data?.notificationMessage);
        setFormModal(false);
        handleSubmit();
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const updateAccountDetail = async (formFields: any) => {
    try {
      const body = {
        id: editRowId.id,
        accountId: formFields?.accountId,
        comments: formFields?.comments,
        timeStamp: formFields?.timeStamp,
        commentedBy: formFields?.commentedBy,
        isAlert: formFields?.isAlert,
        type: formFields?.type,
        subType: formFields?.subType,
      };
      const response = await updateCommentAPI(editRowId, body);
      if (response) {
        toast.success(response?.data?.notificationMessage);
        setModal(false);
        handleSubmit(); // Refresh the data
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const Get_All_Comments_Header = [
    // {
    //   name: "",
    //   cell: (row: any) =>
    //     editRowId === row.id ? (
    //       <div
    //         style={{ color: "#A0A0A0", height: "100%" }}
    //         className="cursor-pointer"
    //       >
    //         ..
    //       </div>
    //     ) : (
    //       <div
    //         style={{ color: "#A0A0A0", height: "100%" }}
    //         className="cursor-pointer"
    //         onClick={() => handleEditClick(row)}
    //       >
    //         .
    //       </div>
    //     ),
    //   ignoreRowClick: true,
    //   allowOverflow: true,
    //   button: true,
    // },
    {
      name: "Alert",
      // selector: (row: { isAlert: any }) => row.isAlert,
      cell: (row: any) => (
        <>
          <Checkbox checked={row?.isAlert} disabled />
        </>
      ),
    },
    {
      name: "Type",
      selector: (row: { type: any }) => row?.type,
    },
    {
      name: "Sub-Type",
      selector: (row: { subType: any }) => row?.subType,
    },
    {
      name: "Comments",
      selector: (row: { comments: any }) => row?.comments,
    },
    {
      name: "Comment By",
      selector: (row: { commentedBy: any }) => row?.commentedBy,
    },
    {
      name: "Comment Date",
      selector: (row: { timestamp: any }) => row?.timestamp,
    },
    {
      name: "Actions",

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            type="primary"
            style={{
              background: "linear-gradient(100deg, #DEF5FF, #90CAFF)",
              color: "var(--foreground)",
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const validationSchema = Yup.object().shape({
    comments: Yup.string()
      .required("Comment is required")
      .max(255, "Comment must be at most 255 characters long"),
    timeStamp: Yup.date().required("Comment Date is required").nullable(),
    type: Yup.string().required("Type is required"),
    subType: Yup.string().required("Sub-Type is required"),
    commentedBy: Yup.string().required("Commented By is required"),
  });
  return (
    <>
      <Modal
        size="lg"
        show={modal}
        onHide={() => {
          setModal(false);
        }}
      >
        <ModalHeader closeButton>
          <h3>Update Comment</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            accountId: editForm?.accountId,
            comments: editForm?.comments,
            timeStamp: formatDate(editForm?.timestamp),
            commentedBy: editForm?.commentedBy,
            isAlert: editForm?.isAlert,
            type: editForm?.type,
            subType: editForm?.subType,
          }}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={updateAccountDetail}
        >
          {({ handleChange }) => {
            return (
              <Form className="p-4">
                <Modal.Body>
                  <Row className="pt-2">
                    <Col md={6} className="mb-4">
                      <label htmlFor="comments" className="mb-1 fs-14">
                        Enter Comment
                      </label>
                      <Field
                        placeholder="Commennt"
                        type="text"
                        id="comments"
                        name="comments"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="comments"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label
                        htmlFor="timeStamp"
                        className="mb-1"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        Comment Date
                      </label>
                      <Field
                        placeholder="Comment Date"
                        id="timeStamp"
                        type="date"
                        name="timeStamp"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="timeStamp"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="pt-2">
                    <Col md={6} className="mb-4">
                      <label htmlFor="type" className="mb-1 fs-14">
                        Type
                      </label>
                      <Field
                        as="select"
                        placeholder="Select Type"
                        id="type"
                        name="type"
                        className="form-control"
                      >
                        <option value="" label="Select type" />
                        {type &&
                          type.map((item: any, id: any) => (
                            <option key={id} value={id}>
                              {item}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage
                        name="type"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6} className="mb-4">
                      <label htmlFor="subType" className="mb-1 fs-14">
                        Sub-Type
                      </label>
                      <Field
                        as="select"
                        placeholder="Select Sub-Type"
                        id="subType"
                        name="subType"
                        className="form-control"
                      >
                        <option value="" label="Select type" />
                        {subType &&
                          subType.map((item: any, id: any) => (
                            <option key={id} value={id}>
                              {item}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage
                        name="subType"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="pt-2">
                    <Col md={6}>
                      <label
                        htmlFor="commentedBy"
                        className="mb-1"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        Commented By
                      </label>
                      <Field
                        placeholder="Commentor Name"
                        id="commentedBy"
                        type="text"
                        name="commentedBy"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="commentedBy"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label
                        htmlFor="isAlert"
                        className="py-3 d-flex w-full"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        <Checkbox
                          id="isAlert"
                          type="checkbox"
                          name="isAlert"
                          className="me-2"
                        />
                        <span className="py-1">Is Alert</span>
                      </label>
                      <ErrorMessage
                        name="isAlert"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <div className="d-flex mt-4 justify-content-end ">
                    <button className="theme-btn-next" type="submit">
                      Update Comment
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>

      <Modal
        size="lg"
        show={formModal}
        onHide={() => {
          setFormModal(false);
        }}
      >
        <ModalHeader closeButton>
          <h3>Add Comment</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            accountId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            comments: "",
            timeStamp: "",
            commentedBy: "",
            isAlert: true,
            type: "",
            subType: "",
          }}
          validationSchema={validationSchema}
          // @ts-ignore
          onSubmit={addComment}
        >
          {({ handleChange }) => {
            return (
              <Form className="">
                <Modal.Body>
                  <Row className="">
                    <Col md={6} className="">
                      <label htmlFor="comments" className="mb-1 fs-14">
                        Enter Comment
                      </label>
                      <Field
                        placeholder="Commennt"
                        type="text"
                        id="comments"
                        name="comments"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="comments"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label htmlFor="timeStamp" className="mb-1 fs-14">
                        Comment Date
                      </label>
                      <Field
                        placeholder="Comment Date"
                        id="timeStamp"
                        type="date"
                        name="timeStamp"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="timeStamp"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="pt-2">
                    <Col md={6} className="">
                      <label htmlFor="type" className="mb-1 fs-14">
                        Type
                      </label>
                      <Field
                        as="select"
                        placeholder="Select Type"
                        id="type"
                        name="type"
                        className="form-control"
                      >
                        <option value="" label="Select type" />
                        {type &&
                          type.map((item: any, id: any) => (
                            <option key={id} value={id}>
                              {item}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage
                        name="type"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6} className="">
                      <label htmlFor="subType" className="mb-1 fs-14">
                        Sub-Type
                      </label>
                      <Field
                        as="select"
                        placeholder="Select Sub-Type"
                        id="subType"
                        name="subType"
                        className="form-control"
                      >
                        <option value="" label="Select type" />
                        {subType &&
                          subType.map((item: any, id: any) => (
                            <option key={id} value={id}>
                              {item}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage
                        name="subType"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="pt-2">
                    <Col md={6}>
                      <label htmlFor="commentedBy" className="mb-1 fs-14">
                        Commented By
                      </label>
                      <Field
                        placeholder="Commentor Name"
                        id="commentedBy"
                        type="text"
                        name="commentedBy"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="commentedBy"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="isAlert"
                        className="py-3 d-flex w-full fs-14"
                      >
                        <Checkbox
                          id="isAlert"
                          type="checkbox"
                          name="isAlert"
                          className="me-2"
                        />
                        <span className="py-1">Is Alert</span>
                      </label>
                      <ErrorMessage
                        name="isAlert"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <div className="d-flex mt-4 justify-content-end ">
                    <button className="theme-btn-next" type="submit">
                      Add Comments
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>
      <div className="cs-table p-2">
        <div className="d-flex justify-content-end">
          <div
            className="gradient-button mt-1 mb-2 button-margin  d-flex justify-content-center"
            style={{
              backgroundColor: themeStyle?.table?.backgroundColor,
            }}
            onClick={() => {
              setFormModal(true);
            }}
          >
            <div className="">
              <img
                src={Images.customerManagement}
                alt=""
                width={16}
                height={16}
              />
            </div>
            <div className="ps-1 d-flex align-items-center cursor-pointer">
              Add
            </div>
          </div>
        </div>
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Get_All_Comments_Header}
          data={mappedData}
        />
      </div>
    </>
  );
};
export default Comments;
