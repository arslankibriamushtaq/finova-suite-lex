import { useState } from "react";

import Loader from "../../../components/Loader/Loader";
import { useNavigate } from "react-router-dom";
const Bureau = () => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <div>
      {loader && <Loader />}

      <div className="mt-2">
        <div className="col-12 mt-2">
          <div
            className="d-flex align-items-center justify-content-between mt-1 mb-3"
            style={{ fontSize: "15px", fontWeight: "Bold" }}
          >
            Credit Bureau Consent
          </div>
        </div>

        <div className="p-4 d-flex align-items-center">
          <input
            type="checkbox"
            className="custom-checkbox"
            checked={checked}
            onChange={() => setChecked(!checked)}
          />
          <span className="ps-2">
            {" "}
            I Acknowledge and authorize{" "}
            <span
              style={{ color: "#000000", fontSize: "14px", fontWeight: "800" }}
            >
              Credira
            </span>{" "}
            to collect my data from credit bureau.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Bureau;
