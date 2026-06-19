import React, { useEffect, useRef, useState } from "react";
import { Select, Skeleton } from "antd";
import { Row, Col, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import { calculateApi, getAllProducts } from "../redux/apis/apisCrudLms";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { NumberFormatter } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/rootReducer";
import { setProdId } from "../redux/apis/apisSlice";
import { color } from "echarts";

const Calculator = () => {
  // const [prodId, setProdId] = useState<any>();
  const [loading, setLoading] = useState<any>(false);
  const [calculatorData, setCalculatorData] = useState<any>();
  const dispatch = useDispatch();
  const prodId = useSelector((state: RootState) => state.block.prodId);

  const [formValues, setFormValues] = useState<any>({
    loanAmount: "",
    downPayment: "",
    balloonAmount: "",
    tillDay: "",
    tenureType: 2,
    ToInovice: "",
    productId: 0,
    productName: "",
  });
  const chartRef: any = useRef(null);
  const [errors, setErrors] = useState({});
  const PercentageDetail = [
    {
      label: "Loan Amount",
      type: "number",
      name: "loanAmount",
      placeholder: "Amount",
    },
    {
      label: "Down Payment",
      type: "number",
      name: "downPayment",
      placeholder: "Amount",
    },

    {
      label: "Tenure Type",
      type: "select",
      name: "tenureType",
      placeholder: "Months",
    },
    {
      label: "Tenure (n)",
      type: "number",
      name: "Tenure",
      placeholder: "Tenure",
    },
    {
      label: "Balloon Amount",
      type: "number",
      name: "balloonAmount",
      placeholder: "Amount",
    },
    {
      label: "Interest Rate",
      type: "number",
      name: "InteresrRate",
      placeholder: "Amount",
    },
  ];
  const ProductList = [
    {
      label: "Monthly",
      value: 2,
    },
    {
      label: "Yearly",
      value: 1,
    },
  ];
  // const getProductId = async () => {
  //   try {
  //     const res = await getAllProducts(1, 1000);
  //     if (res) {
  //       const data = res.data.data;
  //       dispatch(setProdId({ business: data }));

  //       setFormValues({
  //         ...formValues,
  //         productId: data[0].productId,
  //         productName: data[0].nameInEnglish,
  //       });
  //     }
  //   } catch (error: any) {
  //     toast.error(error?.message);
  //   }
  // };
  useEffect(() => {
    if (prodId) {
      setFormValues({
        ...formValues,
        productId: prodId[0]?.id,
        productName: prodId[0]?.name,
      });
    }
  }, [prodId]);
  const handleInputChange: any = (event: any) => {
    const { name, value, type } = event.target;
    setFormValues((prevValues: any) => ({ ...prevValues, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };
  const handleCalculate: any = async () => {
    // if (!validateFields()) return;
    setLoading(true);
    try {
      const body = {
        productId: formValues?.productId,
        amountFinanced: Number(formValues?.loanAmount),
        downPayment: Number(formValues?.downPayment),
        tenureType: Number(formValues?.tenureType),
        tenure: Number(formValues?.Tenure),
        annualInterestRate: Number(formValues?.InteresrRate),
        balloonPayment: Number(formValues?.balloonAmount),
      };
      const response = await calculateApi(body);
      if (response?.data?.data) {
        setCalculatorData(response?.data?.data);
        setLoading(false);
        setFormValues({
          ...formValues,
          balloonAmount: "",
          downPayment: "",
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("Error saving data", error);
      setErrors({ api: "Failed to save data, please try again later" });
    }
  };

  const seriesData = [
    {
      symbolSize: 0.5,
      data: [
        {
          name: "Principle Amount",
          value:
            calculatorData?.totalPayment - calculatorData?.totalInterest || 0,
        },
        { name: "Total Fees", value: calculatorData?.totalInterest || 0 },
      ],
      name: "Amount",
      type: "pie",
      radius: ["100%"],
      center: ["50%", "50%"],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 18,
          color: "#ffffff",
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: true,
      },
    },
  ];
  const systemPieGraph = {
    color: ["#000000", " #1963b9"],
    tooltip: {
      trigger: "item",
    },

    series: seriesData,
  };

  const getChainData = !loading
    ? [
        {
          name: "Down Payment",
          value: <NumberFormatter value={calculatorData?.downPayment || 0} />,
        },
        {
          name: "Balloon Payment",
          value: (
            <NumberFormatter value={calculatorData?.balloonPayment || 0} />
          ),
        },
        // {
        //   name: "Amount after Down Payment",
        //   value: <NumberFormatter value={0} />,
        // },
        {
          name: " Monthly Payment",
          value: (
            <NumberFormatter value={calculatorData?.monthlyPayment || 0} />
          ),
        },
        {
          name: "Total Interest",
          value: <NumberFormatter value={calculatorData?.totalInterest || 0} />,
        },
        {
          name: "Final Amount",
          value: <NumberFormatter value={calculatorData?.totalPayment || 0} />,
        },
      ]
    : Array.from({ length: 6 }).map((_, index) => ({
        value: (
          <Skeleton.Input
            style={{ width: 80 }}
            active
            size="small"
            key={index}
          />
        ),
      }));
  return (
    <div>
      <h2 className="col-md-12 pt-2 pb-2 d-flex align-items-center fs-6 fw-bold">
        {"Calculator"}
      </h2>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
              Select Product
            </Form.Label>
            <Select
              value={formValues.productName}
              onChange={(value, option) => {
                setFormValues((prevValues) => ({
                  ...prevValues,
                  productId: value,
                }));
              }}
              defaultValue={formValues?.productId}
              style={{ width: "100%" }}
              placeholder="Select Product"
            >
              {prodId?.map((option,index) => (
                <Select.Option key={index} value={option?.id}>
                  <div
                    onClick={() => {
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        productName: option?.name,
                      }));
                    }}
                  >
                    {option?.name}
                  </div>
                </Select.Option>
              ))}
            </Select>
            {/* <Select
              value={formValues.label}
              defaultValue={1}
              onChange={(value, option) => {
                setFormValues((prevValues) => ({
                  ...prevValues,
                  productId: value,
                }));
              }}
              style={{ width: "100%" }}
              placeholder="Select Product Name"
            >
              {ProductList?.map((option) => (
                <Select.Option value={option.value}>
                  <div>{option?.label}</div>
                </Select.Option>
              ))}
            </Select> */}
          </Form.Group>
        </Col>
      </Row>
      <div
        className="d-flex"
        style={{ border: "1px solid #DADADA", borderRadius: "6px" }}
      >
        <div className="col-7 p-3">
          <div
            className="d-flex align-items-center justify-content-between mt-1 mb-3"
            style={{ fontSize: "15px", fontWeight: "Bold" }}
          >
            {formValues?.productName}
          </div>
          {formValues?.productId == 1 ? (
            <div className="d-flex align-items-center invoice-value justify-content-between mt-1 mb-3">
              {formValues?.productName} is the fastest facility, It is a quick
              fix for your business problems. This facility can be availed
              within 24 hours and can be utilised for 3 months. Below are the
              salient features for {formValues?.productName} product
            </div>
          ) : (
            <div className="d-flex align-items-center invoice-value justify-content-between mt-1 mb-3">
              {formValues?.productName} is the fastest facility, It is a quick
              fix for your business problems. This facility can be availed
              within 24 hours and can be utilised for 1 year. Below are the
              salient features for {formValues?.productName} product
            </div>
          )}

          <Row>
            {PercentageDetail.map((field, index) => (
              <React.Fragment key={index}>
                {(formValues.productId === 2 || // Show all fields when productId is 8
                  (formValues.productId !== 2 &&
                    field.label !== "Balloon Amount" &&
                    field.label !== "Down Payment")) && ( // Exclude "Down Payment" and "Balloon Payment" for other productIds
                  <>
                    {field.type == "select" ? (
                      <>
                        <Col md={6} className="mb-3">
                          <Form.Label
                            className="mt-2"
                            style={{ fontSize: "13px", fontWeight: "600" }}
                          >
                            {field.label}
                            <span className="required-indicator ps-1">*</span>
                          </Form.Label>
                          <Select
                            value={formValues.tenureType}
                            onChange={(value, option) => {
                              setFormValues((prevValues) => ({
                                ...prevValues,
                                tenureType: value,
                              }));
                            }}
                            defaultValue={1}
                            style={{ width: "100%" }}
                            placeholder="Select Product"
                          >
                            {ProductList?.map((option,index) => (
                              <Select.Option  key={index} value={option.value}>
                                <div>{option?.label}</div>
                              </Select.Option>
                            ))}
                          </Select>
                        </Col>
                      </>
                    ) : (
                      <>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label
                              className="mt-2"
                              style={{ fontSize: "13px", fontWeight: "600" }}
                            >
                              {field.label}
                              <span className="required-indicator ps-1">*</span>
                            </Form.Label>
                            <Form.Control
                              name={field.name}
                              type={field.type}
                              value={formValues[field.name]}
                              placeholder={field.placeholder}
                              onChange={handleInputChange}
                            />
                            {errors[field.name] && (
                              <span
                                style={{ color: " #1963b9", fontSize: "12px" }}
                              >
                                {errors[field.name]}
                              </span>
                            )}
                          </Form.Group>
                        </Col>
                      </>
                    )}
                  </>
                )}
              </React.Fragment>
            ))}
          </Row>
          <div className="col-12 d-flex justify-content-start mt-4 mb-3 align-items-center">
            <button
              onClick={() => {
                handleCalculate();
              }}
              className="btn btn-danger"
              style={{
                backgroundColor: "#EB0D0D",
                borderRadius: "6px",
                height: "fit-content",
                width: "fit-content",
              }}
            >
              Calculate
            </button>
          </div>
        </div>
        <div className="col-5 calculator-card">
          <div
            className="d-flex align-items-center justify-content-center mt-5"
            style={{ fontSize: "14px", fontWeight: "Bold" }}
          >
            Breakup of Payment
          </div>
          <div
            className="col-12 d-flex"
            style={{ backgroundColor: "transparent" }}
          >
            <div className="col-6 d-flex align-items-center">
              <div className="col-12 ps-5">
                {getChainData &&
                  getChainData?.map((item: any, index: any) => {
                    return (
                      <>
                        {(formValues.productId === 2 || // Show all fields when productId is 8
                          (formValues.productId !== 2 &&
                            item.name !== "Balloon Payment" &&
                            item.name !== "Down Payment")) && (
                          <div
                            className={
                              formValues?.productId == 2
                                ? `p-1 mt-2`
                                : `p-2 mt-4`
                            }
                            style={{ color: "white" }}
                          >
                            <div
                              className="col-12 d-flex align-items-center invoice-value"
                              style={{ fontSize: "12px", color: "#000000" }}
                            >
                              {item?.name}
                            </div>
                            <div
                              className="col-12 d-flex align-items-center mt-2 invoice-label"
                              style={{
                                color:
                                  item.name == "Final Amount"
                                    ? "#EB0D0D"
                                    : "#000000",
                              }}
                            >
                              <span className="pe-1">SAR</span>
                              {item.value}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })}
              </div>
            </div>
            <div className="col-6 pt-2">
              <ReactECharts
                ref={chartRef}
                echarts={echarts}
                option={systemPieGraph}
                style={{ height: "195px", width: "100%", top: "50px" }}
              />
            </div>
          </div>
          <div className="p-1 d-flex ps-5 mt-5 pt-2 mb-3">
            <div className="d-flex col-6">
              <div className="col-2 d-flex align-items-center">
                <div className="principle-amount"></div>
              </div>
              <div className="col-10 d-flex align-items-center invoice-value">
                Principle Amount
              </div>
            </div>
            <div className="d-flex col-6">
              <div className="col-2 d-flex align-items-center">
                <div className="total-amount"></div>
              </div>
              <div className="col-10 d-flex align-items-center invoice-value">
                Total Fees
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
