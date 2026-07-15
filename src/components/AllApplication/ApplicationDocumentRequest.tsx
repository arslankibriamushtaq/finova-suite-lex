import React from "react";
import { useTranslation } from "react-i18next";

const ApplicationDocumentRequest = () => {
  const { t } = useTranslation("allApplication");
  return (
    <>
      <div className="card">
        <div className="card-body">
          <div className="col-xl-12 col-12 d-flex align-items-center pb-3">
            <h2 className="col-xl-6 col-12 fs-6 fw-bold">
              {t("docRequest.selectPrompt")}
            </h2>
            <div className="col-xl-6 col-12 d-flex justify-content-end align-items-center">
              <div className="theme-btn mt-1">{t("docRequest.viewAllDocuments")}</div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <div className="d-flex pb-2">
                <input className="col-2" type="checkbox" />
                <div className="col-10">{t("docRequest.commodityContract")}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex pb-2">
                <input className="col-2" type="checkbox" />
                <div className="col-10">{t("docRequest.usPassport")}</div>
              </div>
            </div>
          </div>
          <div className=" d-flex justify-content-end align-items-center">
            <div className="theme-btn mt-4">{t("docRequest.requestNow")}</div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ApplicationDocumentRequest;
