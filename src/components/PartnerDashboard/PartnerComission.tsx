import { useEffect, useState } from "react";
import { Input, Select } from "antd";

import TableView from "../TableView/TableView";
import { getPartnerDashboardComission } from "../../redux/apis/apisCrud";
import Loader from "../Loader/Loader";

const PartnerComission = () => {
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
      title: "Total Financing Amount",
      value: `${totalFinancingAmount?.total_financing_amount || "-"}`,
    },
    {
      title: "Total Comission Amount",
      value: `${totalFinancingAmount?.total_commission_amount || "-"}`,
    },
  ];

  const Activity_Loans_Header = [
    {
      name: "Application No.",
      selector: (row: any) => row.applicationNumber,
    },

    {
      name: "Customer Name",
      selector: (row: any) => row.customerName,
    },
    {
      name: "Product",
      selector: (row: any) => row.duration,
    },

    {
      name: "Amount",
      selector: (row: any) => row.amount,
    },
    {
      name: "Comission",
      selector: (row: any) => row.comission,
    },
    {
      name: "Date",
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
                  <h3>All Applications</h3>
                </div>
                <div className="col-3">
                  <Select 
                    placeholder="All products" 
                    className="form w-50"
                    value={selectedProduct || undefined}
                    onChange={(value) => setSelectedProduct(value)}
                    options={[
                      { value: "", label: "All products" },
                      ...partnerData.map((product: any) => ({
                        value: product.id,
                        label: product.name_en
                      }))
                    ]}
                  />
                </div>
                <div className="col-3 d-flex justify-content-end">
                  <Input
                    placeholder="Search by Id,Name etc"
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
