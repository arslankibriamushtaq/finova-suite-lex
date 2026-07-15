import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tab, Tabs } from "react-bootstrap";
import { Reference } from "yup";
import CallActivity from "../CustomerManagemnt/CallActivity";
import EarlySettlement from "../Deliquency/EarlySettlement";
import Due from "../Deliquency/Due";
import LatePayment from "../Deliquency/LatePayment";
import NonPerforming from "../Deliquency/NonPerforming";
import { Input } from "antd";
import axios from "../../utils/axios";
import Loader from "../Loader/Loader";
import "./style.css";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import DeliquencyManagement from "./Deliquency/DeliquencyManagement";
import EditDeliquencyManagement from "./Deliquency/EditDeliquencyManagement";

const EditProduct = () => {
  const { t } = useTranslation("productManagement2");
  const [selectTab, setSelectedTab] = useState("productName");
  const [productId, setProductId] = useState("");

  const tapOptions = [
    {
      title: t("productForm.tabProductName"),
      key: "productName",
      folder: (
        <ProductNameTab tabs={setSelectedTab} setProductId={setProductId} />
      ),
    },
    {
      title: t("productForm.tabSettings"),
      key: "settings",
      folder: (
        <ProductSettingsTab tabs={setSelectedTab} productId={productId} />
      ),
    },
    {
      title: t("productForm.tabDelinquency"),
      key: "deliquency",
      folder: (
        <EditDeliquencyManagement tabs={setSelectedTab} productId={productId} />
      ),
    },
  ];
  return (
    <>
      <div className="">
        <h2 className="col-md-12 pt-2 pb-2 d-flex align-items-center fs-6 fw-bold">
          {t("productForm.addNewProduct")}
        </h2>
        <Tabs
          id="controlled-tab-example"
          className="mt-30 position-relative tabs-overflow"
          activeKey={selectTab}
          onSelect={(tab: any) => {
            setSelectedTab(tab);
          }}
        >
          {tapOptions.map((item: any, index: any) => (
            <Tab eventKey={item.key} title={item.title}>
              {selectTab === item.key && item.folder}
            </Tab>
          ))}
        </Tabs>
      </div>
    </>
  );
};
export default EditProduct;

function ProductNameTab({ tabs, setProductId }) {
  const { t } = useTranslation("productManagement2");
  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [load, setLoad] = useState(false);
  const [errors, setErrors] = useState([]);
  const id = useParams();
  async function getInfo() {
    setLoad(true);
    try {
      let payload = {
        name,
        arabicName,
      };
      await axios
        .get(`/api/Product/GetProductDetailsById?Id=${id?.id}`)
        .then((res) => {
          if (res.status == 200) {
            if (res.data.notificationMessage == "Operation successful.") {
              setName(res?.data?.data?.product?.name);
              setArabicName(res?.data?.data?.product?.arabicName);
              setLoad(false);
            } else {
              toast.error(res.data.errors[0]);
              setLoad(false);
            }
          }
        });
    } catch (e) {
      console.error(e);
    } finally {
      setLoad(false);
    }
  }
  useEffect(() => {
    getInfo();
  }, []);
  async function saveName() {
    setLoad(true);
    try {
      let payload = {
        id: id?.id,
        name,
        arabicName,
      };

      const errorCheck = checkForEmptyPayload(payload);
      if (errorCheck) {
        setErrors(errorCheck);
        setLoad(false);
        return;
      }
      await axios.post("/api/Product/UpdateProduct", payload).then((res) => {
        if (res.status == 200) {
          setProductId(res?.data?.data?.id);
          if (res.data.notificationMessage == "Operation successful.") {
            toast.success(res.data.notificationMessage);

            tabs("settings");
            setLoad(false);
          } else {
            toast.error(res.data.errors[0]);
            setLoad(false);
          }
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoad(false);
    }
  }

  return (
    <>
      {load && <Loader />}
      <div className="container py-4 my-4 border rounded">
        <h5>{t("productForm.productName")}</h5>
        <div className="row py-2">
          <div className="col">
            <div className="py-2">{t("productForm.productName")}</div>
            <Input
              type="text"
              placeholder={t("productForm.namePlaceholder")}
              className="w-3/4 border p-2"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            {errors.includes("name") ? (
              <div style={{ fontSize: "12px" }} className="text-danger pt-1">
                {t("productForm.errName")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>

          <div className="col">
            <div className="py-2">{t("productForm.nameArLabel")}</div>
            <Input
              type="text"
              placeholder={t("productForm.nameArPlaceholder")}
              className="w-3/4 border p-2"
              value={arabicName}
              onChange={(e) => {
                setArabicName(e.target.value);
              }}
            />
            {errors.includes("arabicName") ? (
              <div style={{ fontSize: "12px" }} className="text-danger pt-1">
                {t("productForm.errArabicName")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-end align-items-center px-4">
        {/* {index > 0 && (
          <button className="theme-btn-next me-3" onClick={()=>setSelectedTab(tapOptions[index-1].key)}>Back</button>
        )}
        {index+1 == tapOptions.length ? (
          <button className="theme-btn-next me-3" onClick={()=>alert("Done")}>Done</button>
        ) : ( */}
        <button
          disabled={load}
          className={"theme-btn-next me-3 " + (load && " opacity-50")}
          onClick={() => saveName()}
        >
          {t("productForm.saveNext")}
        </button>
        {/* )} */}
      </div>
    </>
  );
}

function ProductSettingsTab({ tabs, productId }) {
  const { t } = useTranslation("productManagement2");
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);

  const [minFinancingAmount, setminFinancingAmount] = useState<number | any>(
    null
  );
  const [maxFinancingAmount, setmaxFinancingAmount] = useState<number | any>(
    null
  );
  const [ballonAmount, setballonAmount] = useState<number | any>(null);
  const [advanceAmount, setadvanceAmount] = useState<number | any>(null);
  const [suggestedAmount, setsuggestedAmount] = useState<number | any>(null);
  const [costOfFinancingAmount, setcostOfFinancingAmount] = useState<
    number | any
  >(null);
  const [costOfTermAmount, setcostOfTermAmount] = useState<number | any>(null);
  const [earlySettlement, setearlySettlement] = useState<number | any>(null);
  const [administrativeFeeAmount, setadministrativeFeeAmount] = useState<
    number | any
  >(null);
  const [vat, setVat] = useState<number | any>(null);
  const [otherTaxes, setotherTaxes] = useState<number | any>(null);
  const [minTenure, setminTenure] = useState<number | any>(null);
  const [maxTenure, setmaxTenure] = useState<number | any>(null);
  const [gdbrPercentage, setgdbrPercentage] = useState<number | any>(null);
  const [creditLinePercentage, setcreditLinePercentage] = useState<
    number | any
  >(null);
  const [bankAccountMonthManualApproval, setbankAccountMonthManualApproval] =
    useState<number | any>(null);
  const [bankAccountMonthAutoApproval, setbankAccountMonthAutoApproval] =
    useState<number | any>(null);
  const [minAge, setminAge] = useState<number | any>(null);
  const [maxAge, setmaxAge] = useState<number | any>(null);
  const [income, setincome] = useState<number | any>(null);

  const [errors, setErrors] = useState([]);
  const id = useParams();
  async function getInfo() {
    setLoad(true);
    try {
      await axios
        .get(`/api/Product/GetProductDetailsById?Id=${id?.id}`)
        .then((res) => {
          if (res.status == 200) {
            if (res.data.notificationMessage == "Operation successful.") {
              setminFinancingAmount(
                res?.data?.data?.financeSetting?.minFinancingAmount
              );
              setmaxFinancingAmount(
                res?.data?.data?.financeSetting?.maxFinancingAmount
              );
              setsuggestedAmount(
                res?.data?.data?.financeSetting?.suggestedAmount
              );
              setcostOfFinancingAmount(
                res?.data?.data?.financeSetting?.costOfFinancingAmount
              );
              setcostOfTermAmount(
                res?.data?.data?.financeSetting?.costOfTermAmount
              );
              setearlySettlement(
                res?.data?.data?.financeSetting?.earlySettlement
              );
              setadministrativeFeeAmount(
                res?.data?.data?.financeSetting?.administrativeFeeAmount
              );
              setminTenure(res?.data?.data?.financeSetting?.minTenure);
              setmaxTenure(res?.data?.data?.financeSetting?.maxTenure);
              setgdbrPercentage(
                res?.data?.data?.financeSetting?.gdbrPercentage
              );
              setcreditLinePercentage(
                res?.data?.data?.financeSetting?.creditLinePercentage
              );
              setbankAccountMonthManualApproval(
                res?.data?.data?.financeSetting?.bankAccountMonthManualApproval
              );
              setbankAccountMonthAutoApproval(
                res?.data?.data?.financeSetting?.bankAccountMonthAutoApproval
              );
              setmaxAge(res?.data?.data?.financeSetting?.maxAge);
              setminAge(res?.data?.data?.financeSetting?.minAge);
              setincome(res?.data?.data?.financeSetting?.income);
              setLoad(false);
            } else {
              toast.error(res.data.errors[0]);
              setLoad(false);
            }
          }
        });
    } catch (e) {
      console.error(e);
    } finally {
      setLoad(false);
    }
  }
  useEffect(() => {
    getInfo();
  }, []);
  async function saveSettings() {
    setLoad(true);
    setErrors([]);
    try {
      let payload = {
        productId: id.id || "000",
        minFinancingAmount: parseFloat(minFinancingAmount),
        maxFinancingAmount: parseFloat(maxFinancingAmount),
        suggestedAmount: parseFloat(suggestedAmount),
        costOfFinancingAmount: parseFloat(costOfFinancingAmount),
        costOfTermAmount: parseFloat(costOfTermAmount),
        earlySettlement: parseFloat(earlySettlement),
        administrativeFeeAmount: parseFloat(administrativeFeeAmount),
        minTenure: parseFloat(minTenure),
        maxTenure: parseFloat(maxTenure),
        gdbrPercentage: parseFloat(gdbrPercentage),
        creditLinePercentage: parseFloat(creditLinePercentage),
        bankAccountMonthManualApproval: parseFloat(
          bankAccountMonthManualApproval
        ),
        bankAccountMonthAutoApproval: parseFloat(bankAccountMonthAutoApproval),
        minAge: parseFloat(minAge),
        maxAge: parseFloat(maxAge),
        income: parseFloat(income),
      };

      const errorCheck = checkForEmptyPayload(payload);
      if (errorCheck) {
        setErrors(errorCheck);
        setLoad(false);
        return;
      }

      const res = await axios.post(
        "/api/Product/UpdateProductFinance",
        payload
      );
      if (res.data.notificationMessage == "Operation successful.") {
        toast.success(res.data.notificationMessage);
        localStorage.setItem("tabs", "DueLoan");
        tabs("deliquency");
        setLoad(false);
      } else {
        toast.error(res.data.errors[0]);
        setLoad(false);
      }
      // if (res.status == 200) {
      //   toast.success(res?.data?.notificationMessage)
      //   navigate("/lms/ProductManagement");
      // }
    } catch (e) {
      console.error(e);
    } finally {
      setLoad(false);
    }
  }

  return (
    <>
      {load && <Loader />}
      <div className="container py-4 my-4 border rounded">
        <h5>{t("productForm.financingAmount")}</h5>
        <div className="row py-2">
          <div className="col">
            <div className="py-2">{t("productForm.minFinancingAmount")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2"
              value={minFinancingAmount}
              onChange={(e) => {
                setminFinancingAmount(e.target.value);
              }}
            />
            {errors.includes("minFinancingAmount") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errMinFinancing")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>

          <div className="col">
            <div className="py-2">{t("productForm.maxFinancingAmount")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={maxFinancingAmount}
              onChange={(e) => {
                setmaxFinancingAmount(e.target.value);
              }}
            />
            {errors.includes("maxFinancingAmount") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errMaxFinancing")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>
        </div>

        <div className="row py-2">
          <div className="col">
            <div className="py-2">{t("productForm.balloonAmount")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={ballonAmount}
              onChange={(e) => {
                setballonAmount(e.target.value);
              }}
            />
            {errors.includes("ballonAmount") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errBalloon")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>

          <div className="col">
            <div className="py-2">{t("productForm.advanceAmount")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={advanceAmount}
              onChange={(e) => {
                setadvanceAmount(e.target.value);
              }}
            />
            {errors.includes("advanceAmount") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errAdvance")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>
        </div>

        <div className="row py-2">
          <div className="col">
            <div className="py-2">{t("productForm.suggestAmount")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={suggestedAmount}
              onChange={(e) => {
                setsuggestedAmount(e.target.value);
              }}
            />
            {errors.includes("suggestedAmount") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errSuggested")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>

          <div className="col"></div>
        </div>

        <hr className="my-4" />

        <h5>{t("productForm.financingFee")}</h5>
        <div className="row py-2">
          <div className="col">
            <div className="py-2">{t("productForm.costOfFinancing")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={costOfFinancingAmount}
              onChange={(e) => {
                setcostOfFinancingAmount(e.target.value);
              }}
            />
            {errors.includes("costOfFinancingAmount") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errCostFinancing")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>

          <div className="col">
            <div className="py-2">{t("productForm.costOfTerm")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={costOfTermAmount}
              onChange={(e) => {
                setcostOfTermAmount(e.target.value);
              }}
            />
            {errors.includes("costOfTermAmount") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errCostTerm")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>
        </div>

        <div className="row py-2">
          <div className="col">
            <div className="py-2">{t("productForm.earlySettlement")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={earlySettlement}
              onChange={(e) => {
                setearlySettlement(e.target.value);
              }}
            />
            {errors.includes("earlySettlement") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errEarlySettlement")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>

          <div className="col">
            <div className="py-2">{t("productForm.administrativeFee")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={administrativeFeeAmount}
              onChange={(e) => {
                setadministrativeFeeAmount(e.target.value);
              }}
            />
            {errors.includes("administrativeFeeAmount") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errAdminFee")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>
        </div>

        <div className="row py-2">
          <div className="col">
            <div className="py-2">{t("productForm.vat")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={vat}
              onChange={(e) => {
                setVat(e.target.value);
              }}
            />
            {errors.includes("vat") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errVat")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>

          <div className="col">
            <div className="py-2">{t("productForm.otherTaxes")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={otherTaxes}
              onChange={(e) => {
                setotherTaxes(e.target.value);
              }}
            />
            {errors.includes("otherTaxes") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errOtherTaxes")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>
        </div>

        <hr className="my-4" />

        <div>
          <h5 style={{ display: "inline" }}>{t("productForm.loanTenure")}</h5>
          <span style={{ color: "red", fontSize: "0.9em", marginLeft: "8px" }}>
            {t("productForm.inMonths")}
          </span>
        </div>
        <div className="row py-2">
          <div className="col">
            <div className="py-2">{t("productForm.minTenure")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={minTenure}
              onChange={(e) => {
                setminTenure(e.target.value);
              }}
            />
            {errors.includes("minTenure") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errMinTenure")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>

          <div className="col">
            <div className="py-2">{t("productForm.maxTenure")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={maxTenure}
              onChange={(e) => {
                setmaxTenure(e.target.value);
              }}
            />
            {errors.includes("maxTenure") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errMaxTenure")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>
        </div>

        <hr className="my-4" />

        <h5>{t("productForm.configurationsFee")}</h5>
        <div className="row py-2">
          <div className="col">
            <div className="py-2">{t("productForm.gdbrPercentage")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={gdbrPercentage}
              onChange={(e) => {
                setgdbrPercentage(e.target.value);
              }}
            />
            {errors.includes("gdbrPercentage") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errGdbr")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>

          <div className="col">
            <div className="py-2">{t("productForm.creditLinePercentage")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={creditLinePercentage}
              onChange={(e) => {
                setcreditLinePercentage(e.target.value);
              }}
            />
            {errors.includes("creditLinePercentage") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errCreditLine")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>
        </div>

        <div className="row py-2">
          <div className="col">
            <div className="py-2">{t("productForm.bankAccountManual")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={bankAccountMonthManualApproval}
              onChange={(e) => {
                setbankAccountMonthManualApproval(e.target.value);
              }}
            />
            {errors.includes("bankAccountMonthManualApproval") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errBankManual")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>

          <div className="col">
            <div className="py-2">{t("productForm.bankAccountAuto")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={bankAccountMonthAutoApproval}
              onChange={(e) => {
                setbankAccountMonthAutoApproval(e.target.value);
              }}
            />
            {errors.includes("bankAccountMonthAutoApproval") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errBankAuto")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>
        </div>

        <div className="row py-2">
          <div className="col">
            <div className="py-2">{t("productForm.minAge")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={minAge}
              onChange={(e) => {
                setminAge(e.target.value);
              }}
            />
            {errors.includes("minAge") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errMinAge")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>

          <div className="col">
            <div className="py-2">{t("productForm.maxAge")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={maxAge}
              onChange={(e) => {
                setmaxAge(e.target.value);
              }}
            />
            {errors.includes("maxAge") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errMaxAge")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>
        </div>

        <div className="row py-2">
          <div className="col">
            <div className="py-2">{t("productForm.income")}</div>
            <Input
              type="number"
              className="w-3/4 border p-2 input"
              value={income}
              onChange={(e) => {
                setincome(e.target.value);
              }}
            />
            {errors.includes("income") ? (
              <div style={{ fontSize: "12px" }} className="pt-1 text-danger">
                {t("productForm.errIncome")}
              </div>
            ) : (
              <div
                style={{ fontSize: "12px", color: "transparent" }}
                className="pt-1"
              >
                No Error
              </div>
            )}
          </div>

          <div className="col"></div>
        </div>
      </div>

      <div className="d-flex justify-content-end align-items-center px-4">
        <button className="revert-btn me-3" onClick={() => tabs("productName")}>
          {t("common:back")}
        </button>
        {/* {index > 0 && (
        )}
        {index+1 == tapOptions.length ? (
          <button className="theme-btn-next me-3" onClick={()=>alert("Done")}>Done</button>
        ) : ( */}
        <button
          disabled={load}
          className={"theme-btn-next me-3 " + (load && " opacity-50")}
          onClick={() => saveSettings()}
        >
          {t("productForm.saveNext")}
        </button>
        {/* )} */}
      </div>
    </>
  );
}

export function checkForEmptyPayload(object: any) {
  let empty = false;
  let keys = [];

  Object.keys(object).map((key) => {
    if (
      object[key] === "" ||
      object[key] < 0 ||
      Number.isNaN(object[key]) ||
      object[key] === null ||
      object[key] === "undefined"
    ) {
      empty = true;
      keys.push(key);
    }
  });

  if (empty) {
    return keys;
  } else {
    return false;
  }
}
