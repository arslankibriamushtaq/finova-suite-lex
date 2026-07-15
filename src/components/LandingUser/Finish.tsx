// OtpVerification.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Images } from "../Config/Images";
import { useTranslation } from "react-i18next";

const Finish = () => {
  const { t } = useTranslation("landingUser");
  const navigate = useNavigate();


  return (
    <>
    <div className="p-2">
        <div className="d-flex justify-content-center mt-5">
          <div className="col-12">
            <div className="p-2">
              <div className="d-flex justify-content-center pt-4 pb-4">
                <img
                  src={Images.congratsLogo}
                  alt=""
                  width={120}
                  height={120}
                />
              </div>
              
              <div className="d-flex justify-content-center">
                <div
                  className="text-center p-2 col-12 text-center mt-4 mb-3"
                  style={{
                    fontSize: "16px",
                    lineHeight: "28px",
                    fontWeight: "500",
                  }}
                >
                  {t("finish.message")}
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
