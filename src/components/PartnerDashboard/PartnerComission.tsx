import { useEffect, useState } from "react";
import { Input, Select } from "antd";

import TableView from "../TableView/TableView";
import { getPartnerDashboardComission } from "../../redux/apis/apisCrud";
import { useTranslation } from "react-i18next";
import Loader from "../Loader/Loader";

const PartnerComission = () => {
  const { t } = useTranslation("partner");
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [partnerData, setPartnerData] = useState<any>([]);
  const [totalFinancingAmount, setTotalFinancingAmount] = useState<any>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>("");
  useEffect(() => {
    const fetchAllApis = async () => {
      try {
        setLoading(true);
        const response = await getPartnerDashboardComission();
        if(response?.data?.success){
          setPartnerData(response?.data?.data?.partner_products || []);
          setTotalFinancingAmount(response?.data?.data?.commission_application || {});
          setData(response?.data?.data?.loan_applications || []);
        }
      } catch (error) {
        console.error("Error fetching all APIs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllApis();
  }, []);
  const mappedData =
  data &&
  data?.map((item: any) => {
    return {
      id: item?.id,
      name: item?.name || "-",
      base_url: item?.base_url || "-",
      path: item?.path || "-",
      method: item?.method || "-",
    };
  });
  const cardsData = [
    {
      title: t("dashComm.totalFinancingAmount"),
      value: `${totalFinancingAmount?.total_financing_amount || "-"}`,
    },
    {
      title: t("dashComm.totalComissionAmount"),
      value: `${totalFinancingAmount?.total_commission_amount || "-"}`,
    },
  ];

  const Activity_Loans_Header = [
    {
      name: t("col.applicationNo"),
      selector: (row: any) => row.applicationNumber,
    },

    {
      name: t("col.customerName"),
      selector: (row: any) => row.customerName,
    },
    {
      name: t("col.product"),
      selector: (row: any) => row.duration,
    },

    {
      name: t("common:amount"),
      selector: (row: any) => row.amount,
    },
    {
      name: t("col.comission"),
      selector: (row: any) => row.comission,
    },
    {
      name: t("common:date"),
      selector: (row: any) => row.date,
    },
  ];

  // const mappedData =
  //   data &&
  //   data.map((item: any, index: number) => ({
  //     Sr: index + from, // dynamic serial number
  //     applicationNumber: item.applicationNumber,
  //     product: item.product,
  //     customerName: item.customerName,
  //     duration: item.duration,
  //     type: item.type,
  //     applicationDate: item.applicationDate,
  //     amount: item.amount,
  //     parentStatus: item.parentStatus,
  //     status: item.status,
  //   }));


  return (
    
    <>
      {loading ? <Loader /> : (
      <div className="container-fluid px-4 p-2 mt-2">
        <div className="row">
          <div className="col-12">
            <div className="row mt-3 ">
              {cardsData.map((card, index) => (
                <div className="col-4 p-2 mb-5" key={index}>
                  <div
                    className={`card-product p-4 ${
                      index === 0 ? "highlight-card" : "highlight-card-2"
                    }`}
                  >
                    <div className="mt-4">{card.title}</div>
                    <div className="mt-2 mb-2 fw-4">{card.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row mt-4">
              <div className="col-12 mb-2 d-flex justify-content-between">
                <div className="col-5">
                  <h3>{t("dashComm.allApplications")}</h3>
                </div>
                <div className="col-3">
                  <Select
                    placeholder={t("filter.allProducts")}
                    className="form w-50"
                    value={selectedProduct || undefined}
                    onChange={(value) => setSelectedProduct(value)}
                    options={[
                      { value: "", label: t("filter.allProducts") },
                      ...partnerData.map((product: any) => ({
                        value: product.id,
                        label: product.name_en
                      }))
                    ]}
                  />
                </div>
                <div className="col-3 d-flex justify-content-end">
                  <Input
                    placeholder={t("filter.searchByIdName")}
                    className="form-input w-50"
                  />
                </div>
              </div>
              <div className="col-12 custom-table-wrapper">
                <TableView paginationShow={false} header={Activity_Loans_Header} data={mappedData} />
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default PartnerComission;
