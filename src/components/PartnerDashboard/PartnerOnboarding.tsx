import { useEffect, useState } from "react";
import { Input } from "antd";
import { useTranslation } from "react-i18next";
import TableView from "../TableView/TableView";

const PartnerOnboarding = () => {
  const { t } = useTranslation("partner");
  const [data, setData] = useState<any>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const Activity_Loans_Header = [
    {
      name: t("col.customerName"),
      selector: (row: any) => row.customerName,
    },
    {
      name: t("col.productName"),
      selector: (row: any) => row.productName,
    },
    {
      name: t("col.crNumber"),
      selector: (row: any) => row.crNumber,
    },
    {
      name: t("common:email"),
      selector: (row: any) => row.email,
    },
    {
      name: t("common:phone"),
      selector: (row: any) => row.phone,
    },
    {
      name: t("common:date"),
      selector: (row: any) => row.date,
    },
    {
      name: t("col.action"),
      selector: (row: any) => row.action,
    },
  ];

  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item?.id,
        customerName: item?.customer_name || "-",
        productName: item?.product_name || "-",
        crNumber: item?.cr_number || "-",
        email: item?.email || "-",
        phone: item?.phone || "-",
        date: item?.date || "-",
        action: item?.action || "-",
      };
    });

  return (
    <>
      <div className="container-fluid px-4 p-2 mt-2">
        <div className="row">
          <div className="col-12">
            <div className="row mt-3">
              <div className="col-12 mb-3 d-flex justify-content-between align-items-center">
                <div className="col-6">
                  <h3>{t("onboarding.title")}</h3>
                </div>
                <div className="col-6 d-flex justify-content-end align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <label style={{ whiteSpace: "nowrap", marginBottom: 0 }}>
                      {t("common:from")}
                    </label>
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      style={{
                        width: "180px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <label style={{ whiteSpace: "nowrap", marginBottom: 0 }}>
                      {t("common:to")}
                    </label>
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={{
                        width: "180px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-12 custom-table-wrapper">
                <TableView
                  header={Activity_Loans_Header}
                  data={mappedData}
                  paginationShow={false}
                  locale={{ emptyText: t("onboarding.noDataFound") }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerOnboarding;

