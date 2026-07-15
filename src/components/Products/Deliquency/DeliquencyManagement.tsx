import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Tab, Tabs } from "react-bootstrap";
import EarlySettlement from "./EarlySettlement";
import Due from "./Due";
import LatePayment from "./LatePayment";
import NonPerforming from "./NonPerforming";
import WriteOff from "./WriteOff";
import BrokenPromisses from "./BrokenPromisses";  
import { Select } from "antd";
import { getDeliquencybyID, getProducts } from "../../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import Default from "./Default";
import { getAllProducts } from "../../../redux/apis/apisCrudProductManagement";

const DeliquencyManagement = () => {
  const { t } = useTranslation("productManagement2");
  localStorage.setItem("tabs", "EarlySettlement");
  const getTabs = localStorage.getItem("tabs");
  const [selectTab, setSelectedTab] = useState<any>(getTabs);
  const [prodId, setProdId] = useState<any>();
  const [deliquencyData, setDeliquencyData] = useState<any>();
  const [formValues, setFormValues] = useState<any>({
    productID: "",
    productName: "",
  });
  const getProductId = async () => {
    try {
      const res = await getAllProducts();
      if (res) {
        const data = res.data.data;
        setProdId(data);
        if (data && data.length > 0) {
          const initialProduct = {
            productID: data[0]?.id,
            productName: data[0]?.name,
          };
          setFormValues(initialProduct);
          // Call getDeliquencyData with the initial product ID
          getDeliquencyData(data[0]?.id);
        }
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
    useEffect(() => {
    getProductId();
  }, []);

  const getDeliquencyData = async (productId: number | string) => {
    // if (!productId) return;
    // try {
    //   const res = await getDeliquencybyID(productId);
    //   if (res) {
    //     const data = res.data.data;
    //     setDeliquencyData(data);
    //   }
    // } catch (error: any) {
    //   toast.error(error?.message);
    // }
  };

  // useEffect(() => {
  //   if (formValues.productID) {
  //     getDeliquencyData(formValues.productID);
  //   }
  // }, [formValues.productID]);
  const tapOptions = [
    {
      title: t("delinquency.tab.earlySettlement"),
      key: "EarlySettlement",
      folder: (
        <EarlySettlement
          productId={formValues?.productID}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: t("delinquency.tab.dueLoan"),
      key: "DueLoan",
      folder: (
        <Due
          productId={formValues?.productID}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: t("delinquency.tab.latePayment"),
      key: "LatePayment",
      folder: (
        <LatePayment
          productId={formValues?.productID}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: t("delinquency.tab.writeOffs"),
      key: "Write-offs",
      folder: (
        <WriteOff
          productId={formValues?.productID}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: t("delinquency.tab.nonPerforming"),
      key: "Non-PerformingLoan",
      folder: (
        <NonPerforming
          productId={formValues?.productID}
          setSelectedTab={setSelectedTab}
        />
      ),
    },

    {
      title: t("delinquency.tab.brokenPromises"),
      key: "BrokenPromises",
      folder: (
        <BrokenPromisses
          productId={formValues?.productID}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    // {
    //   title: "Default",
    //   key: "Default",
    //   folder: (
    //     <Default
    //       productId={formValues?.productID}
    //       setSelectedTab={setSelectedTab}
    //     />
    //   ),
    // },
  ];
  return (
    <div className="service delinquency-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <AlertTriangle className="h-4 w-4" />
          </span>
          {t("delinquency.title")}
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <div style={{ flex: "1 1 280px", minWidth: 240 }}>
            <label
              className="d-block mb-1"
              style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-foreground)" }}
            >
              {t("delinquency.selectProduct")}
            </label>
            <Select
              value={formValues.productID}
              onChange={(value: any) => {
                const selectedProduct = prodId?.find((p: any) => p.id === value);
                setFormValues((prevValues: any) => ({
                  ...prevValues,
                  productID: value,
                  productName: selectedProduct?.nameEn || "",
                }));
                getDeliquencyData(value);
              }}
              defaultValue={formValues?.productID}
              style={{ width: "100%", height: 40 }}
              placeholder={t("delinquency.selectProduct")}
            >
              {prodId?.map((option: any) => (
                <Select.Option key={option.id} value={option.id}>
                  {option?.nameEn}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs + content card */}
      <div className="pro-card">
        <Tabs
          id="controlled-tab-example"
          className="px-3 pt-3"
          activeKey={selectTab}
          onSelect={(tab: any) => {
            setSelectedTab(tab);
          }}
        >
          {tapOptions.map((item: any) => (
            <Tab eventKey={item.key} title={item.title}>
              <div className="p-3">{selectTab === item.key && item.folder}</div>
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
export default DeliquencyManagement;
