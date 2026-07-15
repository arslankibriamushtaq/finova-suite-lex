import { Button, Input } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

function CompanyApiSetting({ apisData,partnerData }: any) {
  const { t } = useTranslation("partner");
  return (
    <>
      <div className="p-3 my-box">
        <div className="row mt-3">
          <div className="col-6">
            <div className="mb-2">{t("companyApi.getRevenueSecretKey")}</div>
            <Input className="form-control" value={partnerData?.get_revenue_secret_key||"-"} />
          </div>

          <div className="col-6">
            <div className="mb-2 fw-700">{t("companyApi.getRevenueUrl")}</div>
            <Input className="form-control" value={partnerData?.get_revenue_url||"-"} />
          </div>
          <div className="justify-content-end d-flex">
            <Button className="theme-btn-next mt-4">{t("common:save")}</Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompanyApiSetting;
