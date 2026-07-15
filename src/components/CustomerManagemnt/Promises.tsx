import { Customer_List_Header } from "../../components/Config/TableHeaders";
import TableView from "../../components/TableView/TableView";
import { Button, DatePicker, Dropdown, Menu } from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import DynamicHeaderStructure from "../../components/DynamicHeaderStructure";
import TableHeaderFilter from "../TableHeaderFilter";
import { Get_All_Promises_Header } from "../../components/Config/TableHeaders";
import { useState, useEffect } from "react";
import {
  addPromise,
  getAllPromises,
  getAllReasons,
  getCallActivityById,
  getPromiseById,
  getPromiseDeleteId,
  updatePromise,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Col, Modal, ModalHeader, Row } from "react-bootstrap";
import * as Yup from "yup";
import { themeStyle } from "../Config/Theme";
import { Images } from "../Config/Images";
import { useTranslation } from "react-i18next";
const Promises = () => {
  const { t } = useTranslation("customerManagement");
  const [AllPromises, setAllPromises] = useState<any>([]);
  const [modal, setModal] = useState(false);
  const [allReason, setAllReason] = useState<any>([]);
  const [editForm, setEditForm] = useState<any>([]);
  const [updateCondition, setUpdateCondition] = useState<any>(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const getAllData = async () => {
    try {
      const res = await getAllPromises(page, pageSize);
      const data = res.data.data;
      setAllPromises(data || []);
      setTotalRows(res?.data?.pageInfo?.totalItems || 0);
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const handleAllReason = async () => {
    try {
      const res = await getAllReasons(1, 1000);
      if (res) {
        const data = res.data.data;
        setAllReason(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  useEffect(() => {
    getAllData();
    handleAllReason();
    return () => {};
  }, [page, pageSize]);
  const handleEditClick = (row: any) => {
    // setEditRowId(row.id);
    // navigate(`${row.id}`);
    setModal(true);
    setUpdateCondition(true);
    acitivityCallId(row.promiseId);
  };
  const acitivityCallId = async (promiseId: any) => {
    try {
      const res = await getPromiseById(promiseId);
      if (res) {
        const value = res.data.data;
        setEditForm(value);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    console.warn("edit data", editForm);
  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const handleDelete = async (row: any) => {
    try {
      const res = await getPromiseDeleteId(row.id);
      if (res) {
        toast.success(res.data.notificationMessage);
        getAllData();
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
  const Get_All_Promises_Header = [
    {
      name: t("promises.col.promiseKey"),
      selector: (row: { promiseKey: any }) => row.promiseKey,
    },
    {
      name: t("promises.col.loanKey"),
      selector: (row: { laonKey: any }) => row.laonKey,
    },
    {
      name: t("promises.col.promiseAmount"),
      selector: (row: { promisedAmount: any }) => row.promisedAmount,
    },
    {
      name: t("promises.col.promiseDate"),
      selector: (row: { promisedDate: any }) => row.promisedDate,
    },
    {
      name: t("promises.col.takenBy"),
      selector: (row: { takenBy: any }) => row.takenBy,
    },
    {
      name: t("promises.col.takenDate"),
      selector: (row: { takenDate: any }) => row.takenDate,
    },
    {
      name: t("promises.col.dueOnTakenDate"),
      selector: (row: { dueOnTakenDate: any }) => row.dueOnTakenDate,
    },
    {
      name: t("promises.col.amountCollected"),
      selector: (row: { collectedAmount: any }) => row.collectedAmount,
    },
    {
      name: t("promises.col.brokenInd"),
      selector: (row: { isBrokenPromise: any }) => row.isBrokenPromise,
    },
    {
      name: t("promises.col.cancelled"),
      selector: (row: { isCancelledPromise: any }) => row.isCancelledPromise,
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

  const handleSubmit = async (values: any) => {
    const body = {
      id: acitivityCallId,
      accountId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      laonId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      promisedAmount: Number(values.promisedAmount),
      promisedDate: values.promisedDate,
      takenBy: values.takenBy,
      takenDate: values.takenDate,
      dueOnTakenDate: values.dueOnTakenDate,
      collectedAmount: Number(values.collectedAmount),
      isBrokenPromise:
        values.isBrokenPromise == false ? values.isBrokenPromise : true,
      isCancelledPromise:
        values.isCancelledPromise == false ? values.isCancelledPromise : true,
      contact: values.contact,
      followupDate: values.followupDate,
      comment: values.comment,
      outboundCallReasonId: values.outboundCallReasonId,
    };
    if (updateCondition) {
      body.accountId = editForm.accountId;
      body.id = editForm.id;
      try {
        const res = await updatePromise(body);
        const data = res.data.data;
        if (data) {
          setModal(false);
          toast.success(res.data.notificationMessage);
          getAllData();
        }
      } catch (error: any) {
        toast.error(error?.message);
      }
    } else {
      try {
        const res = await addPromise(body);
        const data = res.data;
        if (data) {
          setModal(false);
          toast.success(data.notificationMessage);
          getAllData();
        }
      } catch (error: any) {
        toast.error(error?.message);
      }
    }
  };
  const handleAddPromise = async () => {
    setModal(true);
    setUpdateCondition(false);
    // try {
    //   const body = {
    //     accountId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //     outboundCallReasonId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //     promisedAmount: 0,
    //     promisedDate: "2024-08-06T10:33:07.552Z",
    //     takenBy: "string",
    //     takenDate: "2024-08-06T10:33:07.552Z",
    //     dueOnTakenDate: "2024-08-06T10:33:07.552Z",
    //     collectedAmount: 0,
    //     isBrokenPromise: true,
    //     isCancelledPromise: true,
    //     contact: "string",
    //     followupDate: "2024-08-06T10:33:07.552Z",
    //     comment: "string",
    //   };
    //   const res = await addPromise(body);
    //   if (res) {
    //   }
    // } catch (error: any) {
    //   toast.error(error?.message);
    // }
  };
  const button = [{ title: "Add", onClick: handleAddPromise }];
  const mappedData =
    AllPromises &&
    AllPromises.map((item: any) => {

      return {
        id: item.promiseId,
        promiseId: item.promiseId,
        laonKey: item?.laonKey || "-",
        promiseKey: item.promiseKey,
        promisedAmount: item.promisedAmount,
        promisedDate: formatDate(item.followupDate),
        takenBy: item.takenBy,
        takenDate: formatDate(item.takenDate),
        dueOnTakenDate: formatDate(item.dueOnTakenDate),
        collectedAmount: item.collectedAmount,
        isBrokenPromise: item.isBrokenPromise ? t("common:yes") : t("common:no"),
        isCancelledPromise: item.isCancelledPromise
          ? t("common:yes")
          : t("common:no"),
      };
    });
  const validationSchema = Yup.object().shape({
    promisedAmount: Yup.number()
      .required(t("promises.validation.promisedAmountRequired"))
      .positive(t("promises.validation.amountPositive"))
      .integer(t("promises.validation.amountInteger")),
    promisedDate: Yup.date()
      .required(t("promises.validation.promisedDateRequired"))
      .nullable(),
    takenBy: Yup.string().required(t("promises.validation.takenByRequired")),
    takenDate: Yup.date()
      .required(t("promises.validation.takenDateRequired"))
      .nullable(),
    dueOnTakenDate: Yup.date()
      .required(t("promises.validation.dueOnTakenDateRequired"))
      .nullable(),
    collectedAmount: Yup.number()
      .required(t("promises.validation.collectedAmountRequired"))
      .positive(t("promises.validation.amountPositive"))
      .integer(t("promises.validation.amountInteger")),
    isBrokenPromise: Yup.boolean().required(
      t("promises.validation.brokenPromiseRequired")
    ),
    isCancelledPromise: Yup.boolean().required(
      t("promises.validation.cancelledPromiseRequired")
    ),
    contact: Yup.string().required(t("promises.validation.contactRequired")),
    followupDate: Yup.date()
      .required(t("promises.validation.followupDateRequired"))
      .nullable(),
    comment: Yup.string().required(t("promises.validation.commentRequired")),
    outboundCallReasonId: Yup.string().required(
      t("promises.validation.reasonRequired")
    ),
  });
  return (
    <>
      <div className="cs-table p-2">
        {/* <DynamicHeaderStructure title={"Promises"} button={button} />
        <TableHeaderFilter /> */}
        <div className="d-flex justify-content-end">
          <div
            className="gradient-button mt-1 mb-2 button-margin  d-flex justify-content-center"
            style={{
              backgroundColor: themeStyle?.table?.backgroundColor,
            }}
            onClick={() => {
              setModal(true);
              setUpdateCondition(false);
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
          header={Get_All_Promises_Header}
          data={mappedData}
        />
      </div>
      <Modal
        size="lg"
        show={modal}
        onHide={() => {
          setModal(false);
        }}
      >
        <ModalHeader closeButton>
          <h3>{updateCondition ? t("promises.updateTitle") : t("promises.addTitle")}</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            promisedAmount: updateCondition ? editForm.promisedAmount : "",
            promisedDate: updateCondition
              ? formatDate(editForm.promisedDate)
              : "",
            laonKey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            takenBy: updateCondition ? editForm.takenBy : "",
            takenDate: updateCondition ? formatDate(editForm.takenDate) : "",
            dueOnTakenDate: updateCondition
              ? formatDate(editForm.dueOnTakenDate)
              : "",
            collectedAmount: updateCondition ? editForm.collectedAmount : "",
            isBrokenPromise: updateCondition ? editForm.isBrokenPromise : "",
            isCancelledPromise: updateCondition
              ? editForm.isCancelledPromise
              : "",
            contact: updateCondition ? editForm.contact : "",
            followupDate: updateCondition
              ? formatDate(editForm.followupDate)
              : "",
            comment: updateCondition ? editForm.comment : "",
            outboundCallReasonId: updateCondition
              ? editForm.outboundCallReasonId
              : "",
          }}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ handleChange, setFieldValue, values }) => {
            return (
              <Form className="">
                <Modal.Body>
                  <Row className="">
                    <Col md={6} className="mb-2">
                      <label htmlFor="promisedAmount" className="mb-1 fs-14">
                        {t("promises.form.promisedAmount")}
                      </label>
                      <Field
                        type="number"
                        placeholder={t("promises.form.promisedAmount")}
                        id="promisedAmount"
                        name="promisedAmount"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="promisedAmount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6} className="mb-2">
                      <label htmlFor="promisedDate" className="mb-1 fs-14">
                        {t("promises.form.promisedDate")}
                      </label>
                      <Field
                        placeholder={t("promises.form.promisedDate")}
                        id="promisedDate"
                        type="date"
                        name="promisedDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="promisedDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="pt-2">
                    <Col md={6} className="mb-2">
                      <label htmlFor="isBrokenPromise" className="mb-1 fs-14">
                        {t("promises.form.brokenPromise")}
                      </label>
                      <Field
                        placeholder={t("promises.form.brokenPromise")}
                        as="select"
                        id="isBrokenPromise"
                        name="isBrokenPromise"
                        className="form-control"
                        onChange={(e: any) =>
                          handleChange({
                            target: {
                              name: e.target.name,
                              value: e.target.value == "true" ? true : false,
                            },
                          })
                        }
                      >
                        <option value={"true"} label={t("common:yes")} />
                        <option value={"false"} label={t("common:no")} />
                      </Field>
                      <ErrorMessage
                        name="isBrokenPromise"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="takenBy" className="mb-1 fs-14">
                        {t("promises.form.takenBy")}
                      </label>
                      <Field
                        placeholder={t("promises.form.takenBy")}
                        id="takenBy"
                        name="takenBy"
                        className="form-control"
                      />

                      <ErrorMessage
                        name="takenBy"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row className="pt-2">
                    <Col md={6} className="mb-2">
                      <label htmlFor="takenDate" className="mb-1 fs-14">
                        {t("promises.form.takenDate")}
                      </label>
                      <Field
                        type="date"
                        placeholder={t("promises.form.takenDate")}
                        id="takenDate"
                        name="takenDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="takenDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label htmlFor="dueOnTakenDate" className="mb-1 fs-14">
                        {t("promises.form.dueOnTakenDate")}
                      </label>
                      <Field
                        type="date"
                        placeholder={t("promises.form.dueOnTakenDate")}
                        id="dueOnTakenDate"
                        name="dueOnTakenDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="dueOnTakenDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <Row className="pt-2">
                    <Col md={6} className="mb-2">
                      <label htmlFor="collectedAmount" className="mb-1 fs-14">
                        {t("promises.form.collectedAmount")}
                      </label>
                      <Field
                        placeholder={t("promises.form.collectedAmount")}
                        id="collectedAmount"
                        type="number"
                        name="collectedAmount"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="collectedAmount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label
                        htmlFor="isCancelledPromise"
                        className="mb-1 fs-14"
                      >
                        {t("promises.form.collectedPromise")}
                      </label>
                      <Field
                        placeholder={t("promises.form.collectedPromise")}
                        id="isCancelledPromise"
                        as="select"
                        name="isCancelledPromise"
                        className="form-control"
                        onChange={(e: any) =>
                          handleChange({
                            target: {
                              name: e.target.name,
                              value: e.target.value == "true" ? true : false,
                            },
                          })
                        }
                      >
                        <option value={"true"} label={t("common:yes")} />
                        <option value={"false"} label={t("common:no")} />
                      </Field>
                      <ErrorMessage
                        name="condition"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row className="pt-2">
                    <Col md={6} className="mb-2">
                      <label htmlFor="contact" className="mb-1 fs-14">
                        {t("promises.form.contact")}
                      </label>
                      <Field
                        placeholder={t("promises.form.contact")}
                        id="contact"
                        type="text"
                        name="contact"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="contact"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-2">
                      <label
                        htmlFor="isCancelledPromise"
                        className="mb-1 fs-14"
                      >
                        {t("promises.form.followupDate")}
                      </label>
                      <Field
                        placeholder={t("promises.form.followupDate")}
                        id="followupDate"
                        type="date"
                        name="followupDate"
                        className="form-control"
                      />

                      <ErrorMessage
                        name="followupDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row className="pt-2">
                    <Col md={6} className="mb-2">
                      <label htmlFor="comment" className="mb-1 fs-14">
                        {t("promises.form.comment")}
                      </label>
                      <Field
                        placeholder={t("promises.form.comment")}
                        id="comment"
                        type="text"
                        name="comment"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="comment"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mb-4">
                      <label
                        htmlFor="outboundCallReasonId"
                        className="mb-1 fs-14"
                      >
                        {t("promises.form.reason")}
                      </label>
                      <Field
                        as="select"
                        placeholder={t("promises.form.reason")}
                        id="outboundCallReasonId"
                        name="outboundCallReasonId"
                        className="form-control"
                      >
                        <option value="" label={t("promises.form.selectType")} />
                        {allReason &&
                          allReason.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {item.description}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage
                        name="outboundCallReasonId"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6} className="mb-2">
                      <label htmlFor="laonKey" className="mb-1 fs-14">
                        {t("promises.form.loanKey")}
                      </label>
                      <Field
                        as="select"
                        placeholder={t("promises.form.selectLoanId")}
                        id="laonKey"
                        name="laonKey"
                        className="form-control"
                        /* value={values.laonKey}
                      onChange={(e: any) => setFieldValue("laonKey", e.target.value)} */
                      >
                        {/* <option label="Select Loan Id" />

                        {AllPromises && AllPromises?.map((item: any) => (

                          <option key={item.laonKey} value={item.laonKey}>
                            {item?.laonKey || "-"}
                          </option>
                        ))} */}
                      </Field>
                      <ErrorMessage
                        name="laonKey"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <div className="d-flex mt-4 justify-content-end ">
                    <button className="theme-btn-next" type="submit">
                      {updateCondition ? t("common:update") : t("common:create")}
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </>
  );
};
export default Promises;
