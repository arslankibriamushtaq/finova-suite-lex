
import { Images } from "./Config/Images";
import { useNavigate } from "react-router-dom";

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
const Finish = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="p-2">
        <div className="d-flex justify-content-center mt-5">
          <div className="col-6">
            <div className="p-2">
              <div className="d-flex justify-content-center pt-4 pb-4">
                <img
                  src={Images.congratsLogo}
                  alt=""
                  width={120}
                  height={120}
                />
              </div>
              <div
                className="text-center p-3"
                style={{
                  fontSize: "32px",
                  lineHeight: "44px",
                  fontWeight: "600",
                }}
              >
                Thank You!
              </div>
              <div
                className="text-center mb-3"
                style={{
                  fontSize: "16px",
                  lineHeight: "16px",
                  fontWeight: "500",
                }}
              >
                Tenant ID : 1324657891324
              </div>
              <div
                className="text-center mb-3"
                style={{
                  fontSize: "16px",
                  lineHeight: "16px",
                  fontWeight: "500",
                }}
              >
                Date : 25/03/2024
              </div>
              <div className="d-flex justify-content-center">
                <div
                  className="text-center p-2 col-10 text-center  mb-3"
                  style={{
                    fontSize: "16px",
                    lineHeight: "28px",
                    fontWeight: "500",
                  }}
                >
                  Congratulations! Your account has been created successfully.
                </div>
              </div>
              <div className="d-flex justify-content-center">
                <div
                  className="theme-btn-next mt-1 button-margin "
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  <div className="ps-1 d-flex align-items-center cursor-pointer">
                    {" "}
                    Sign In to Continue
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Finish;
