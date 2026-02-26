import React, { useEffect, useState } from "react";
import { Checkbox, Input } from "antd";
import TableView from "../TableView/TableView";
import { Col, Modal, ModalHeader, Row } from "react-bootstrap";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { addAccount, getAllAccountDetails } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import * as Yup from "yup";
import DynamicHeaderStructure from "../DynamicHeaderStructure";
const AccountDetails = () => {
  const [accountData, setAccountData] = useState<any[]>([]);
  const [formModal, setFormModal] = useState<any>(false);
  const [masterAccount, setMasterAccount] = useState<any>(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const handleClick = () => {
    setFormModal(true);
  };

  const addAccountApi = async (formField: any) => {
    try {
      const body = {
        accountNumber: formField.accountNumber,
        company: formField.company,
        branch: formField.branch,
        subUnit: formField.subUnit,
        masterAccountNumber:
          masterAccount && formField.masterAccountNumber === "" ? 0 : formField.masterAccountNumber,
        masterAccount: masterAccount,
      };

      // Use toast.promise for clean loading, success, and error handling
      await toast.promise(
        addAccount(body), // API call
        {
          loading: "Adding account...", // While request is pending
          success: (response) => {
            if (response?.data?.notificationMessage === "Operation successful.") {
              setFormModal(false);
              getAllAccountDetails();
              return "Account added successfully!";
            } else {
              throw new Error(response?.data?.errors?.[0] || "Failed to add account.");
            }
          },
          error: (err) => err?.message || "Something went wrong while adding the account.",
        }
      );
    } catch (error: any) {
      console.error("Error occurred:", error);
    }
  };

  const accountDetails = async () => {
    try {
      const response = await getAllAccountDetails();
      if (response) {
        if (response) {
          const data = response.data.data;
          setAccountData(data || []);
          setTotalRows(response?.data?.pageInfo?.totalItems || 0);
          const lastIndexData = data[data.length - 1];
          localStorage.setItem(`accountId`, lastIndexData.id);
          // toast.success(response.data.notificationMessage);
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const mappedData =
    accountData?.map((item) => ({
      AccountNo: item.accountNumber,
      company: item.company,
      branch: item.branch,
      subUnit: item.subUnit,
      MasterAccountNo: item.masterAccountNumber,
      MasterAccount: item.masterAccount,
    })) || [];
  const button = [{ title: "add", onClick: handleClick }];
  useEffect(() => {
    accountDetails();
  }, []);
  const Account_ALL_List_Header = [
    {
      name: "AccountNo",
      selector: (row: any) => row.AccountNo,
    },
    {
      name: "Company",
      selector: (row: { company: any }) => row.company,
    },
    {
      name: "Branch",
      selector: (row: { branch: any }) => row.branch,
    },
    {
      name: "Sub Unit",
      selector: (row: { subUnit: any }) => row.subUnit,
    },
    {
      name: "Master Account No",
      selector: (row: any) => row.MasterAccountNo,
    },
    {
      name: "Master Account",
      selector: (row: any) => (
        <div
          onClick={() => {
          }}
        >
          <Input type="checkbox" checked={row.MasterAccount} />
        </div>
      ),
    },
  ];
  const validationSchema = Yup.object().shape({
    accountNumber: Yup.string().required("Account number is required"),
    company: Yup.string().required("Company name is required"),
    branch: Yup.string().required("Branch is required"),
    subUnit: Yup.string().required("Sub Unit is required"),
    masterAccountNumber: Yup.string().required(
      "Master Account Number is required"
    ),
    masterAccount: Yup.boolean(), // No validation needed for boolean fields
  });

  return (
    <>
      <Modal
        size="lg"
        show={formModal}
        onHide={() => {
          setFormModal(false);
        }}
      >
        <ModalHeader closeButton>
          <h3>Add Account Detail</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            accountNumber: "",
            company: "",
            branch: "",
            subUnit: "",
            masterAccountNumber: "",
            masterAccount: "",
          }}
          validationSchema={validationSchema}
          onSubmit={addAccountApi}
        >
          {({ }) => {
            return (
              <Form className="p-2">
                <Modal.Body>
                  <Row>
                    <Col md={6}>
                      <label htmlFor="Accountno" className="mb-1 fs-14">
                        Account no
                      </label>
                      <Field
                        placeholder="Account no"
                        id="accountNumber"
                        name="accountNumber"
                        className=" form-control"
                      />
                      <ErrorMessage
                        name="accountNumber"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6}>
                      <label htmlFor="Company" className="mb-1 fs-14">
                        Company
                      </label>
                      <Field
                        placeholder="Company"
                        id="company"
                        name="company"
                        className=" form-control"
                      />

                      <ErrorMessage
                        name="company"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row className="pt-2">
                    <Col md={6}>
                      <label htmlFor="Branch" className="mb-1 fs-14">
                        Branch
                      </label>
                      <Field
                        placeholder="Branch"
                        id="branch"
                        type="text"
                        name="branch"
                        className=" form-control"
                      />

                      <ErrorMessage
                        name="branch"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6}>
                      <label htmlFor="SubUnit" className="mb-1 fs-14">
                        Sub Unit
                      </label>
                      <Field
                        placeholder="SubUnit"
                        id="subUnit"
                        type="text"
                        name="subUnit"
                        className=" form-control"
                      />

                      <ErrorMessage
                        name="subUnit"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row className="pt-2">
                    <Col md={6}>
                      <label
                        htmlFor="masterAccountNumber"
                        className="mb-1 fs-14"
                      >
                        Master Account No
                      </label>
                      <Field
                        placeholder="masterAccountNumber"
                        id="masterAccountNumber"
                        name="masterAccountNumber"
                        className=" form-control"
                      />

                      <ErrorMessage
                        name="masterAccountNumber"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6}>
                      <Checkbox
                        id="masterAccount"
                        name="masterAccount"
                        className="mt-4"
                        onChange={(e) => {
                          setMasterAccount(e?.target?.checked);
                        }}
                      />
                      <label
                        htmlFor="masterAccount"
                        className="mb-1 ms-3 fs-14"
                      >
                        Master Account
                      </label>
                      <ErrorMessage
                        name="masterAccount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <div className="d-flex mt-4 justify-content-end ">
                    <button className="theme-btn-next" type="submit">
                      Add Account Detail
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>
      <div>
        {/* <div className="col-11 mb-4 ">
          <h3>Account Details</h3>
        </div> */}
        <div className="col-12">
          <DynamicHeaderStructure title={""} button={button} />
          {/* <TableHeaderFilter button={button} /> */}
        </div>
        <div className="cs-table p-2">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            totalRows={totalRows}
            header={Account_ALL_List_Header}
            data={mappedData}
          />
        </div>
      </div>
    </>
  );
};

export default AccountDetails;
