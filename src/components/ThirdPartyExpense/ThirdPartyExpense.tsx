import { useState } from "react";
import * as Yup from "yup";
import { Modal, ModalBody, ModalHeader, Tab, Tabs } from "react-bootstrap";
import LoanApprovalExpense from "./LoanApprovalExpense";
import OnboardingExpense from "./OnboardingExpense";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { createThirdPartyServicesExpense, updateThirdPartyServicesExpense } from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";

const ExpenseSchema = Yup.object().shape({
  serviceName: Yup.string()
    .required("Service Name is required")
    .max(100, "Name must be less than 100 characters"),
  successServiceFee: Yup.number()
    .required("Amount is required")
    .typeError("Amount must be a number")
    .min(1, "Amount must be greater than 0"),
  failureServiceFee: Yup.number()
    .required("Amount is required")
    .typeError("Amount must be a number")
    .min(1, "Amount must be greater than 0"),
  channel: Yup.string().when("isEdit", {
    is: false,
    then: (schema) => schema.required("Channel is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  expenseCategory: Yup.string()
    .required("Expense Category type is required"),
    // .test("is-not-zero", "Please select a valid type", (value) => value !== 0),
});
const ThirdPartyExpense = () => {

  const [selectTab, setSelectedTab] = useState('Loan_Approval_Expense');
  const [editData, setEditData] = useState(null);
  const [show, setShow] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [formValues, setFormValues] = useState({
    serviceName: "",
    successServiceFee: 0,
    failureServiceFee: 0,
    channel: "",
    expenseCategory: ""
  });

  const handleOpen = (data?: any) => {
    setEditData(data || null);
    setFormValues(
      data || { serviceName: "",successServiceFee: 0, failureServiceFee: 0, channel: "", expenseCategory: "" }
    );
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };
 const handleSubmitForm = async (formFields: any) => {
   
    try {
     
      const res = await createThirdPartyServicesExpense(formFields);
      if (res.data.notificationMessage) {
        toast.success(res.data.notificationMessage);
        setRefreshData((prev)=>!prev)
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
 const handleeditForm = async (formFields: any) => {
   
    try {
     
      const res = await updateThirdPartyServicesExpense(formFields);
      if (res.data.notificationMessage) {
        toast.success(res.data.notificationMessage);
        setRefreshData((prev)=>!prev)
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const handleSubmit = (values: any) => {
    if (editData) {
      handleeditForm(values)
    } else {
      handleSubmitForm(values)
    }
    handleClose();
  };
  const tapOptions = [
    {
      title: "Loan Approval Expense",
      key: "Loan_Approval_Expense",
      folder: (
        <LoanApprovalExpense
        handleOpen={handleOpen}
         refreshData={refreshData}
        />
      ),
    },
    {
      title: "Onboarding Expense",
      key: "Onboarding_Expense",
      folder: (
        <OnboardingExpense
         handleOpen={handleOpen}
         refreshData={refreshData}
        />
      ),
    },
  ];
  return (
    <>
      <div className="">
        <div className="d-flex justify-content-between">
            <h2 className="pt-2 pb-2 d-flex align-items-center fs-6 fw-bold">
          Third Party Expense
        </h2>
        <button className="theme-btn-next mb-3" onClick={() => handleOpen()}>
          + Add Expense
        </button>
        </div>
        <Tabs
          id="controlled-tab-example"
          className="mt-30 position-relative tabs-overflow"
          activeKey={selectTab}
          onSelect={(tab: any) => {
            setSelectedTab(tab);
          }}
        >
          {tapOptions.map((item: any) => (
            <Tab eventKey={item.key} title={item.title}>
              {selectTab === item.key && item.folder}
            </Tab>
          ))}
        </Tabs>
      </div>
     <Modal backdrop="static" keyboard={false} size="lg" show={show} onHide={handleClose}>
        <ModalHeader closeButton>
          <h3>{editData ? "Edit Expense" : "Create Expense"}</h3>
        </ModalHeader>

        <Formik
          initialValues={{ ...formValues, isEdit: !!editData }}
          validationSchema={ExpenseSchema}
          enableReinitialize
          onSubmit={(values) => {
          const { isEdit, ...rest } = values; // Remove helper field before sending
          handleSubmit(rest);
        }}
        >
          {() => (
            <Form className="p-2">
              <ModalBody>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <Field
                    type="text"
                    name="serviceName"
                    placeholder="Enter service name"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="serviceName"
                    component="div"
                    className="invalid-feedback text-danger"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Success Service Fee</label>
                  <Field
                    type="number"
                    name="successServiceFee"
                    placeholder="Enter amount"
                    className="form-control"
                    min="0"
                  />
                  <ErrorMessage
                    name="successServiceFee"
                    component="div"
                    className="invalid-feedback text-danger"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Failure Service Fee</label>
                  <Field
                    type="number"
                    name="failureServiceFee"
                    placeholder="Enter amount"
                    className="form-control"
                    min="0"
                  />
                  <ErrorMessage
                    name="failureServiceFee"
                    component="div"
                    className="invalid-feedback text-danger"
                  />
                </div>
                {
                    !editData &&
                <div className="mb-3">
                  <label className="form-label">Channel</label>
                  <Field
                    type="text"
                    name="channel"
                    placeholder="Enter channel"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="channel"
                    component="div"
                    className="invalid-feedback text-danger"
                  />
                </div>
                }

                <div className="mb-3">
                  <label className="form-label">Expense Type</label>
                  <Field as="select" name="expenseCategory" className="form-control">
                    <option value={""}>Select Type</option>
                    <option value={"LoanApproval"}>Loan Approval Expense</option>
                    <option value={"Onboarding"}>Onboarding Expense</option>
                    <option value={"Both"}>Both</option>
                  </Field>
                  <ErrorMessage
                    name="expenseCategory"
                    component="div"
                    className="invalid-feedback text-danger"
                  />
                </div>

                <div className="d-flex mt-4 justify-content-end">
                  <button className="theme-btn-next" type="submit">
                    {editData ? "Update" : "Create"}
                  </button>
                </div>
              </ModalBody>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};
export default ThirdPartyExpense;
