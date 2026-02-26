import { ErrorMessage, Field, Form, Formik } from "formik";
import { Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authSlice } from "../redux/apis/apisSlice";
import { useDispatch } from "react-redux";
import { Images } from "./Config/Images";

const data = [
  {
    Customer: "jhdbfs",
    ProductName: "kajbdsf",
    ApplicationNo: "2235",
    CrNumber: "1234",
    Email: "11@gmail.com",
    Phone: "123456",
    Date: "12.34.2044",
    ParentStatus: "---",
    Status: "active",
    Action: "--",
  },
];
const Call_Activity_Header = [
  {
    name: "Action",
    selector: (row: { ApplicationNo: any }) => row.ApplicationNo,
  },

  {
    name: "Contact",
    selector: (row: { CrNumber: any }) => row.CrNumber,
  },
  {
    name: "Reason",
    selector: (row: { Email: any }) => row.Email,
  },
  {
    name: "Promise Date",
    selector: (row: { Phone: any }) => row.Phone,
  },
  {
    name: "Promise Amt",
    selector: (row: { Date: any }) => row.Date,
  },
  {
    name: "Current Amount Due",
    selector: (row: { ParentStatus: any }) => row.ParentStatus,
  },
  {
    name: "Condition",
    selector: (row: { Status: any }) => row.Status,
  },
  {
    name: "Appointment",
    selector: (row: { Action: any }) => row.Action,
  },
];
const PaymentDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <>
      <div className="p-2 col-11">
        <Formik initialValues={{}} onSubmit={(values) => { }}>
          {(formik) => (
            <Form>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "rgba(0, 0, 0, 1)",
                }}
                className="pb-3"
              >
                Payment Detail
              </div>
              <Row className="pt-2">
                <Col md={6}>
                  <div className="form-group form-label-group">
                    <Field
                      placeHolder="John Doe"
                      id="userid"
                      type="text"
                      name="reason"
                      className="shadow-none form-control modal-input br-10"
                    />
                    <label htmlFor="userid">CardHolder Name</label>
                    <ErrorMessage
                      name="userid"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                </Col>

                <Col md={6}>
                  <div className="form-group form-label-group">
                    <Field
                      placeHolder="4141 4141 4141 4444"
                      id="arabicReason"
                      type="text"
                      name="arabicReason" // Corrected field name
                      className="shadow-none form-control modal-input br-10"
                    />
                    <label htmlFor="arabicReason">Card Email</label>
                    <ErrorMessage
                      name="arabicReason"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                </Col>
              </Row>

              <Row className="pt-3">
                <Col md={6}>
                  <div className="form-group form-label-group">
                    <Field
                      placeHolder="12/25"
                      id="userid"
                      type="text"
                      name="reason"
                      className="shadow-none form-control modal-input br-10"
                    />
                    <label htmlFor="userid">Card Expiry</label>
                    <ErrorMessage
                      name="userid"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                </Col>

                <Col md={6}>
                  <div className="form-group form-label-group">
                    <Field
                      placeHolder="123"
                      id="arabicReason"
                      type="text"
                      name="arabicReason" // Corrected field name
                      className="shadow-none form-control modal-input br-10"
                    />
                    <label htmlFor="arabicReason">CVV</label>
                    <ErrorMessage
                      name="arabicReason"
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div>
                </Col>
              </Row>

              <div className="col-md-12 d-flex" style={{ marginTop: "20rem" }}>
                <div className="col-md-4"></div>
                <div className="col-md-4"></div>
                <div className="col-md-4 d-flex justify-content-end">
                  <div
                    className="theme-btn-prev mt-1 button-margin  d-flex justify-content-center"
                    onClick={() => {
                      dispatch(
                        authSlice.actions.setBusiness({
                          business: false,
                        })
                      );
                      navigate("/teanenetflow/info");
                    }}
                  >
                    <div className="ps-1 d-flex align-items-center">
                      {" "}
                      Previous
                    </div>
                  </div>
                  <div
                    className="theme-btn-next mt-1 button-margin  d-flex justify-content-center cursor-pointer"
                    onClick={() => {
                      dispatch(
                        authSlice.actions.setPayment({
                          payment: true,
                        })
                      );
                      navigate("/teanenetflow/setpassword");
                    }}
                  >
                    <div className="ps-1 d-flex align-items-center cursor-pointer">
                      {" "}
                      Next{" "}
                      <div className="ps-2">
                        <img src={Images.next} alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};
export default PaymentDetail;
