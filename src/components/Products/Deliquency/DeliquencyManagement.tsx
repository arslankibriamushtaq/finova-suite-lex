import { useEffect, useState } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
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
      title: "Early Settlement",
      key: "EarlySettlement",
      folder: (
        <EarlySettlement
          productId={formValues?.productID}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: "Due Loan",
      key: "DueLoan",
      folder: (
        <Due
          productId={formValues?.productID}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: "Late Payment",
      key: "LatePayment",
      folder: (
        <LatePayment
          productId={formValues?.productID}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: "Write-offs",
      key: "Write-offs",
      folder: (
        <WriteOff
          productId={formValues?.productID}
          setSelectedTab={setSelectedTab}
        />
      ),
    },
    {
      title: "Non-Performing Loan",
      key: "Non-PerformingLoan",
      folder: (
        <NonPerforming
          productId={formValues?.productID}
          setSelectedTab={setSelectedTab}
        />
      ),
    },

    {
      title: "Broken Promises",
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
    <>
      <div className="">
        <h2 className="col-md-12 pt-2 pb-2 d-flex align-items-center fs-6 fw-bold">
          {"Delinquency Management"}
        </h2>
        <Row>
          <Col md={4} className="mb-3">
            <Form.Group>
              <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                Select Product
              </Form.Label>
              <Select
                value={formValues.productID}
                onChange={(value:any) => {
                  const selectedProduct = prodId?.find((p: any) => p.id === value);
                  setFormValues((prevValues: any) => ({
                    ...prevValues,
                    productID: value,
                    productName: selectedProduct?.nameEn || "",
                  }));
                  getDeliquencyData(value);
                }}
                defaultValue={formValues?.productID}
                style={{ width: "100%" }}
                placeholder="Select Product"
              >
                {prodId?.map((option: any) => (
                  <Select.Option key={option.id} value={option.id}>
                    {option?.nameEn}
                  </Select.Option>
                ))}
              </Select>
            </Form.Group>
          </Col>
        </Row>
        <Tabs
          id="controlled-tab-example"
          className="mt-30 position-relative tabs-overflow"
          activeKey={selectTab}
          onSelect={(tab: any) => {
            setSelectedTab(tab);
          }}
        >
          {tapOptions.map((item: any) => (
            <Tab eventKey={item.key} title={item.title}>
              {selectTab === item.key && item.folder}
            </Tab>
          ))}
        </Tabs>

        <div></div>
      </div>
    </>
  );
};
export default DeliquencyManagement;
