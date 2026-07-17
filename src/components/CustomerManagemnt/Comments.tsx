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
import { useTranslation } from "react-i18next";

const Comments = () => {
  const { t } = useTranslation("customerManagement");
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [AllComments, setAllComments] = useState<any>([]);
  const [modal, setModal] = useState(false);
  const [formModal, setFormModal] = useState<any>(false);
  const [type, setType] = useState<any>([
    t("comments.type.regular"),
    t("comments.type.special"),
    t("comments.type.custom"),
  ]);
  const [subType, setSubType] = useState<any>([
    t("comments.subType.systemGenerated"),
    t("comments.subType.userGenerated"),
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
        {t("common:edit")}
      </Menu.Item>
      <Menu.Item key="view" icon={<DeleteOutlined />}>
        {t("common:delete")}
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
      name: t("comments.col.alert"),
      // selector: (row: { isAlert: any }) => row.isAlert,
      cell: (row: any) => (
        <>
          <Checkbox checked={row?.isAlert} disabled />
        </>
      ),
    },
    {
      name: t("common:type"),
      selector: (row: { type: any }) => row?.type,
    },
    {
      name: t("comments.col.subType"),
      selector: (row: { subType: any }) => row?.subType,
    },
    {
      name: t("comments.col.comments"),
      selector: (row: { comments: any }) => row?.comments,
    },
    {
      name: t("comments.col.commentBy"),
      selector: (row: { commentedBy: any }) => row?.commentedBy,
    },
    {
      name: t("comments.col.commentDate"),
      selector: (row: { timestamp: any }) => row?.timestamp,
    },
    {
      name: t("common:actions"),

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
            {t("common:select")} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const validationSchema = Yup.object().shape({
    comments: Yup.string()
      .required(t("comments.validation.commentRequired"))
      .max(255, t("comments.validation.commentMax")),
    timeStamp: Yup.date()
      .required(t("comments.validation.commentDateRequired"))
      .nullable(),
    type: Yup.string().required(t("comments.validation.typeRequired")),
    subType: Yup.string().required(t("comments.validation.subTypeRequired")),
    commentedBy: Yup.string().required(
      t("comments.validation.commentedByRequired")
    ),
  });
  return (
    <>
      <Modal backdrop="static" keyboard={false}
        size="lg"
        show={modal}
        onHide={() => {
          setModal(false);
        }}
      >
        <ModalHeader closeButton>
          <h3>{t("comments.updateComment")}</h3>
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
                        {t("comments.form.enterComment")}
                      </label>
                      <Field
                        placeholder={t("comments.form.enterComment")}
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
                        {t("comments.form.commentDate")}
                      </label>
                      <Field
                        placeholder={t("comments.form.commentDate")}
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
                        {t("common:type")}
                      </label>
                      <Field
                        as="select"
                        placeholder={t("comments.form.selectTypePlaceholder")}
                        id="type"
                        name="type"
                        className="form-control"
                      >
                        <option value="" label={t("comments.form.selectOption")} />
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
                        {t("comments.form.subType")}
                      </label>
                      <Field
                        as="select"
                        placeholder={t("comments.form.selectSubTypePlaceholder")}
                        id="subType"
                        name="subType"
                        className="form-control"
                      >
                        <option value="" label={t("comments.form.selectOption")} />
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
                        {t("comments.form.commentedBy")}
                      </label>
                      <Field
                        placeholder={t("comments.form.commentorName")}
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
                        <span className="py-1">{t("comments.form.isAlert")}</span>
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
                      {t("comments.updateComment")}
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>

      <Modal backdrop="static" keyboard={false}
        size="lg"
        show={formModal}
        onHide={() => {
          setFormModal(false);
        }}
      >
        <ModalHeader closeButton>
          <h3>{t("comments.addComment")}</h3>
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
                        {t("comments.form.enterComment")}
                      </label>
                      <Field
                        placeholder={t("comments.form.enterComment")}
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
                        {t("comments.form.commentDate")}
                      </label>
                      <Field
                        placeholder={t("comments.form.commentDate")}
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
                        {t("common:type")}
                      </label>
                      <Field
                        as="select"
                        placeholder={t("comments.form.selectTypePlaceholder")}
                        id="type"
                        name="type"
                        className="form-control"
                      >
                        <option value="" label={t("comments.form.selectOption")} />
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
                        {t("comments.form.subType")}
                      </label>
                      <Field
                        as="select"
                        placeholder={t("comments.form.selectSubTypePlaceholder")}
                        id="subType"
                        name="subType"
                        className="form-control"
                      >
                        <option value="" label={t("comments.form.selectOption")} />
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
                        {t("comments.form.commentedBy")}
                      </label>
                      <Field
                        placeholder={t("comments.form.commentorName")}
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
                        <span className="py-1">{t("comments.form.isAlert")}</span>
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
                      {t("comments.addCommentsButton")}
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
              {t("common:add")}
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
