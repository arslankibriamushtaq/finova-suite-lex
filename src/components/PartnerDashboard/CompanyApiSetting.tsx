import { Button, Input } from "antd";
import React from "react";

function CompanyApiSetting({ apisData,partnerData }: any) {
  return (
    <>
      <div className="p-3 my-box">
        <div className="row mt-3">
          <div className="col-6">
            <div className="mb-2">Get Revenue Secret Key</div>
            <Input className="form-control" value={partnerData?.get_revenue_secret_key||"-"} />
          </div>

          <div className="col-6">
            <div className="mb-2 fw-700">Get Revenue URL</div>
            <Input className="form-control" value={partnerData?.get_revenue_url||"-"} />
          </div>
          <div className="justify-content-end d-flex">
            <Button className="theme-btn-next mt-4">Save</Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompanyApiSetting;
