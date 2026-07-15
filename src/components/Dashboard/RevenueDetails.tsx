import { Form, Input } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

function RevenueDetails({ setSelectedTab }: any) {
  const { t } = useTranslation("dashboard");
  return (
    <div>
      <h5 className="mt-3 mb-3">{t("revenue.title")}</h5>
      <Form className="mt-2">
        <div
          className="col-12 d-flex justify-content-between gap-5 mb-2"
          style={{ width: "96%" }}
        >
          <div className="col-6">
            <div>{t("revenue.month")}</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder={t("revenue.enterMonth")}
              className="shadow-none form-control modal-input"
            />
          </div>
          <div className="col-6">
            <div>{t("common:amount")}</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder={t("revenue.enterAmount")}
              className="shadow-none form-control modal-input"
            />
          </div>
        </div>
        <div
          className="col-12 d-flex justify-content-between gap-5 mb-2"
          style={{ width: "96%" }}
        >
          <div className="col-6">
            <div>{t("revenue.month")}</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder={t("revenue.enterMonth")}
              className="shadow-none form-control modal-input"
            />
          </div>
          <div className="col-6">
            <div>{t("common:amount")}</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder={t("revenue.enterAmount")}
              className="shadow-none form-control modal-input"
            />
          </div>
        </div>
        <div
          className="col-12 d-flex justify-content-between gap-5 mb-2"
          style={{ width: "96%" }}
        >
          <div className="col-6">
            <div>{t("revenue.month")}</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder={t("revenue.enterMonth")}
              className="shadow-none form-control modal-input"
            />
          </div>
          <div className="col-6">
            <div>{t("common:amount")}</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder={t("revenue.enterAmount")}
              className="shadow-none form-control modal-input"
            />
          </div>
        </div>
        <div
          className="col-12 d-flex justify-content-between gap-5 mb-2"
          style={{ width: "96%" }}
        >
          <div className="col-6">
            <div>{t("revenue.month")}</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder={t("revenue.enterMonth")}
              className="shadow-none form-control modal-input"
            />
          </div>
          <div className="col-6">
            <div>{t("common:amount")}</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder={t("revenue.enterAmount")}
              className="shadow-none form-control modal-input"
            />
          </div>
        </div>
        <div
          className="col-12 d-flex justify-content-between gap-5 mb-2"
          style={{ width: "96%" }}
        >
          <div className="col-6">
            <div>{t("revenue.month")}</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder={t("revenue.enterMonth")}
              className="shadow-none form-control modal-input"
            />
          </div>
          <div className="col-6">
            <div>{t("common:amount")}</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder={t("revenue.enterAmount")}
              className="shadow-none form-control modal-input"
            />
          </div>
        </div>
        <div className="col-12 mb-2">
          <div>{t("revenue.month")}</div>
          <Input
            type="text"
            style={{ height: "44px", border: "transparent" }}
            placeholder="Enter your Month"
            className="shadow-none form-control modal-input"
          />
        </div>
        <div className="col-12 d-flex justify-content-end gap-2 mt-3">
          <button className="theme-btn">{t("common:cancel")}</button>

          <button className="theme-btn">{t("common:approve")}</button>
        </div>
      </Form>
    </div>
  );
}

export default RevenueDetails;
