import { Images } from "./Config/Images";
import { useNavigate } from "react-router-dom";
import { authSlice } from "../redux/apis/apisSlice";
import { useDispatch } from "react-redux";

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
const SetPassword = () => {
  const userEmail = localStorage.getItem("userEmail");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <>
      <div className="p-2">
        <div
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "rgba(0, 0, 0, 1)",
          }}
          className="pb-3"
        >
          Set Password
        </div>
        <div className="d-flex justify-content-center mt-5">
          <div
            className="col-9"
            style={{
              border: "1px solid rgba(211, 211, 211, 1)",
              borderRadius: "6px",
            }}
          >
            <div className="p-4 mt-4">
              <div className="d-flex justify-content-center pt-4 pb-4">
                <img
                  src={Images.passwordGroup}
                  alt=""
                  width={120}
                  height={120}
                />
              </div>
              <div
                className="text-center p-3 mb-3"
                style={{
                  fontSize: "18px",
                  lineHeight: "25.2px",
                  fontWeight: "400",
                }}
              >
                To complete the sign-up process, please check your email (
                <span className="bg-red">
                  {userEmail ? userEmail : "john.doe@abc.com"}
                </span>
                ) for a link to create a secure password. Follow the
                instructions in the email to secure your account and get
                started.
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-12 d-flex pe-5" style={{ marginTop: "8rem" }}>
          <div className="col-md-4"></div>
          <div className="col-md-4"></div>
          <div className="col-md-4 d-flex justify-content-center">
            <div
              className="theme-btn-prev mt-1 button-margin  d-flex justify-content-center"
              onClick={() => {
                dispatch(
                  authSlice.actions.setPayment({
                    payment: false,
                  })
                );
                navigate("/teanenetflow/payment");
              }}
            >
              <div className="ps-1 d-flex align-items-center cursor-pointer">
                {" "}
                Previous
              </div>
            </div>
            <div
              className="theme-btn-next mt-1 button-margin d-flex justify-content-center"
              onClick={() => {
                dispatch(
                  authSlice.actions.setPassword({
                    password: true,
                  })
                );
                navigate("/teanenetflow/finish");
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
      </div>
    </>
  );
};
export default SetPassword;
