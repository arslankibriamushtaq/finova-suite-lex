import { useEffect, useState } from "react";
import { Row, Col, Form } from "react-bootstrap";
import TableHeaderFilter from "../TableHeaderFilter";
import { Select } from "antd";
import toast from "react-hot-toast";
import { getContractById, updateContract } from "../../redux/apis/apisCrud";
import { useParams } from "react-router-dom";

const GenerateEdit = () => {
  const { id: loanId } = useParams();
  const [contractData, setContractData] = useState<any>({
    contractInfo: {},
    advanceDetails: {},
    billingDetails: {},
    bankInfoDetails: {},
  });
  const [readOnly, setReadOnly] = useState(true);
  const [enums, setEnums] = useState({
    BaloonMethod: [
      { value: 1, label: "Annual" },
      { value: 2, label: "BiAnnual" },
      { value: 3, label: "Monthly" },
    ],
    IndexType: [
      { value: 1, label: "A" },
      { value: 2, label: "B" },
      { value: 3, label: "C" },
    ],
    BillingMethod: [
      { value: 1, label: "Card" },
      { value: 2, label: "Wallet" },
      { value: 3, label: "Cash" },
    ],

    allowed: [
      { label: "True", value: true },
      { label: "False", value: false },
    ],
  });
  const handleSelectChange = (name: string, value: number) => {
    setContractData((prevData: any) => {
      const keys = name.split(".");
      const updatedData = { ...prevData };
      let currentLevel = updatedData;

      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          currentLevel[key] = value;
        } else {
          if (!currentLevel[key]) currentLevel[key] = {};
          currentLevel = currentLevel[key];
        }
      });

      return updatedData;
    });
  };

  const getContract = async (id: any) => {
    try {
      const res = await getContractById(id);
      if (res) {
        const data = res?.data?.data;
        setContractData(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  useEffect(() => {
    if (loanId) {
      getContract(loanId);
    }
  }, []);
  const handleNumberValue = (value: any) => {
    return value !== undefined && value !== null ? value : "";
  };

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getIndex = (value: any) => {
    const gender = enums.IndexType.find((g) => g.value === value);
    return gender ? gender.label : "";
  };
  const getBilling = (value: any) => {
    const gender = enums.BillingMethod.find((g) => g.value === value);
    return gender ? gender.label : "";
  };
  const getBalloon = (value: any) => {
    const gender = enums.BaloonMethod.find((g) => g.value === value);
    return gender ? gender.label : "";
  };
  const getAllowed = (value: any) => {
    const gender = enums.allowed.find((g) => g.value === value);
    return gender ? gender.label : "";
  };

  const Contract = [
    {
      label: "Loan ID",
      type: "text",
      name: "contractInfo.loanId",
      value: contractData?.contractInfo?.loanId || "",
    },
    {
      label: "Contract Date",
      type: "date",
      name: "contractInfo.contractDate",
      value: formatDate(contractData?.contractInfo?.contractDate) || "",
    },
    {
      label: "Amount Financed",
      type: "number",
      name: "contractInfo.amountFinanced",
      value: handleNumberValue(contractData?.contractInfo?.amountFinanced),
    },
    {
      label: "Terms",
      type: "text",
      name: "contractInfo.terms",
      value: contractData?.contractInfo?.terms || "",
    },
    {
      label: "Rate",
      type: "number",
      name: "contractInfo.rate",
      value: handleNumberValue(contractData?.contractInfo?.rate),
    },
    {
      label: "Maturity Date",
      type: "date",
      name: "contractInfo.maturityDate",
      value: formatDate(contractData?.contractInfo?.maturityDate) || "",
    },
    {
      label: "First Payment Date",
      type: "date",
      name: "contractInfo.firstPaymentDate",
      value: formatDate(contractData?.contractInfo?.firstPaymentDate) || "",
    },
    {
      label: "Balloon Method",
      type: "select",
      name: "contractInfo.baloonMethod",
      options: enums.BaloonMethod,
      value: getBalloon(contractData?.contractInfo?.baloonMethod),
      onChange: handleSelectChange,
    },
    {
      label: "Balloon Amount",
      type: "number",
      name: "contractInfo.baloonAmount",
      value: handleNumberValue(contractData?.contractInfo?.baloonAmount),
    },
    {
      label: "Finance Charge",
      type: "number",
      name: "contractInfo.financeCharge",
      value: handleNumberValue(contractData?.contractInfo?.financeCharge),
    },
    {
      label: "Total of Payments",
      type: "number",
      name: "contractInfo.totalOfPayments",
      value: handleNumberValue(contractData?.contractInfo?.totalOfPayments),
    },
    {
      label: "Down Payment",
      type: "number",
      name: "contractInfo.downPayment",
      value: handleNumberValue(contractData?.contractInfo?.downPayment),
    },
    {
      label: "Total Sale Price",
      type: "number",
      name: "contractInfo.totalSalePrice",
      value: handleNumberValue(contractData?.contractInfo?.totalSalePrice),
    },
    {
      label: "Payment Amount",
      type: "number",
      name: "contractInfo.paymentAmount",
      value: handleNumberValue(contractData?.contractInfo?.paymentAmount),
    },
    {
      label: "Final Payment Amount",
      type: "number",
      name: "contractInfo.finalPaymentAmount",
      value: handleNumberValue(contractData?.contractInfo?.finalPaymentAmount),
    },
    {
      label: "Residual Days",
      type: "number",
      name: "contractInfo.residualDays",
      value: handleNumberValue(contractData?.contractInfo?.residualDays),
    },
    {
      label: "Index Type",
      type: "select",
      name: "contractInfo.indexType",
      options: enums.IndexType,
      value: getIndex(contractData?.contractInfo?.indexType || ""),
      onChange: handleSelectChange,
    },
    {
      label: "Index Rate",
      type: "number",
      name: "contractInfo.indexRate",
      value: handleNumberValue(contractData?.contractInfo?.indexRate),
    },
  ];

  const Advance = [
    {
      label: "Min Initial Advance Amount",
      type: "number",
      name: "advanceDetails.minInitialAdvAmount",
      value: handleNumberValue(
        contractData?.advanceDetails?.minInitialAdvAmount
      ),
    },
    {
      label: "Max Initial Advance Amount",
      type: "number",
      name: "advanceDetails.maxInitialAdvAmount",
      value: handleNumberValue(
        contractData?.advanceDetails?.maxInitialAdvAmount
      ),
    },
    {
      label: "Min Advance Amount",
      type: "number",
      name: "advanceDetails.minAdvanceAmount",
      value: handleNumberValue(contractData?.advanceDetails?.minAdvanceAmount),
    },
    {
      label: "Max Advance Amount",
      type: "number",
      name: "advanceDetails.maxAdvanceAmount",
      value: handleNumberValue(contractData?.advanceDetails?.maxAdvanceAmount),
    },
    {
      label: "Multi Disbursement Allowed",
      type: "select",
      name: "advanceDetails.multiDisbursmentAllowed",
      options: enums.allowed,
      value: getAllowed(
        contractData?.advanceDetails?.multiDisbursmentAllowed || false
      ),
      onChange: handleSelectChange,
    },
    {
      label: "Draw End Date",
      type: "date",
      name: "advanceDetails.drawEndDate",
      value: formatDate(contractData?.advanceDetails?.drawEndDate) || "",
    },
    {
      label: "Draw Term Billing Indicator",
      type: "text",
      name: "advanceDetails.drawTermBillingInd",
      value: contractData?.advanceDetails?.drawTermBillingInd || "",
    },
    {
      label: "Billing Method",
      type: "select",
      options: enums.BillingMethod,
      name: "advanceDetails.billingMethod",
      value: getBilling(contractData?.advanceDetails?.billingMethod || ""),
      onChange: handleSelectChange,
    },
    {
      label: "Draw Period Interest Rate",
      type: "number",
      name: "advanceDetails.drawPeriodInterestRate",
      value: handleNumberValue(
        contractData?.advanceDetails?.drawPeriodInterestRate
      ),
    },
    {
      label: "Late Charge Allowed",
      type: "select",
      name: "advanceDetails.lateChargeAllowed",
      options: enums.allowed,
      value: getAllowed(contractData?.advanceDetails?.lateChargeAllowed),
      onChange: handleSelectChange,
    },
  ];

  const Billing = [
    {
      label: "Billing Cycle",
      type: "text",
      name: "billingDetails.billingCycle",
      value: contractData?.billingDetails?.billingCycle || "",
    },
    {
      label: "Pre Billed Days",
      type: "number",
      name: "billingDetails.preBillingDays",
      value: handleNumberValue(contractData?.billingDetails?.preBillingDays),
    },
    {
      label: "Multiple Billing Asset Rate",
      type: "number",
      name: "billingDetails.multipleBillingAssetRate",
      value: handleNumberValue(
        contractData?.billingDetails?.multipleBillingAssetRate
      ),
    },
  ];

  const BankInformation = [
    {
      label: "IBAN",
      type: "text",
      name: "bankInfoDetails.iban",
      value: contractData?.bankInfoDetails?.iban || "",
    },
    {
      label: "Account Title",
      type: "text",
      name: "bankInfoDetails.accountTitle",
      value: contractData?.bankInfoDetails?.accountTitle || "",
    },
    {
      label: "Bank Name",
      type: "text",
      name: "bankInfoDetails.bankName",
      value: contractData?.bankInfoDetails?.bankName || "",
    },
  ];

  const handleInputChange = (e: any) => {
    const { name, value, type, checked }: any = e.target;
    const inputValue = type === "checkbox" ? checked : value;
    setContractData((prevData) => {
      const keys = name.split(".");
      const updatedData = { ...prevData };
      keys.reduce((acc, key, index) => {
        if (index === keys.length - 1) {
          acc[key] = inputValue;
        } else {
          acc[key] = { ...acc[key] };
        }
        return acc[key];
      }, updatedData);
      return updatedData;
    });
  };

  const handleUpdateLoan = async (id: string) => {
    try {
      const updateData = {
        contractInfo: contractData.contractInfo,
        advanceDetails: contractData.advanceDetails,
        billingDetails: contractData.billingDetails,
        bankInfoDetails: contractData.bankInfoDetails,
      };
      const res = await updateContract(id, updateData);
      if (res) {
        toast.success(res?.data.notificationMessage);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSave = () => {
    if (readOnly) {
      setReadOnly(false);
    } else {
      if (loanId) {
        handleUpdateLoan(contractData);
      }
      setReadOnly(true);
    }
  };

  const button = [
    { title: readOnly ? "Edit" : "Save and Exit", onClick: handleSave },
  ];
  const renderFormField = (field: any, index: number) => {
    if (field.type === "select") {
      return (
        <Select
          value={field.value}
          onChange={(value: any, target: any) =>
            handleInputChange({ target: { name: field.name, value } })
          }
          className="w-100"
          disabled={readOnly}
        >
          {field.options.map((option: any) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      );
    } else {
      return (
        <Form.Control
          type={field.type}
          name={field.name}
          value={field.value}
          onChange={handleInputChange}
          readOnly={readOnly}
        />
      );
    }
  };

  return (
    <>
      <h3>Generate Edit</h3>
      <TableHeaderFilter button={button} />
      <div
        className="p-4"
        style={{ border: "1px solid var(--color-border-light)", borderRadius: "6px" }}
      >
        <h3> Contract</h3>
        <Row className="mb-3">
          {Contract.map((field, index) => (
            <Col md={4} key={index}>
              <Form.Group controlId={`Contract${index}`}>
                <Form.Label className="mt-2">{field.label}</Form.Label>
                {renderFormField(field, index)}
              </Form.Group>
            </Col>
          ))}
        </Row>
      </div>
      <div
        className="p-4 mt-2"
        style={{ border: "1px solid var(--color-border-light)", borderRadius: "6px" }}
      >
        <h3>Advance</h3>
        <Row className="mb-3">
          {Advance.map((field, index) => (
            <Col md={4} key={index}>
              <Form.Group controlId={`Advance${index}`}>
                <Form.Label className="mt-2">{field.label}</Form.Label>
                {renderFormField(field, index)}
              </Form.Group>
            </Col>
          ))}
        </Row>
      </div>
      <div
        className="p-4 mt-2"
        style={{ border: "1px solid var(--color-border-light)", borderRadius: "6px" }}
      >
        <h3>Billing</h3>
        <Row className="mb-3">
          {Billing.map((field, index) => (
            <Col md={4} key={index}>
              <Form.Group controlId={`billing${index}`}>
                <Form.Label className="mt-2">{field.label}</Form.Label>
                {renderFormField(field, index)}
              </Form.Group>
            </Col>
          ))}
        </Row>
        <h3>Bank Information</h3>
        <Row className="mb-3">
          {BankInformation.map((field, index) => (
            <Col md={4} key={index}>
              <Form.Group controlId={`BankInformation${index}`}>
                <Form.Label className="mt-2">{field.label}</Form.Label>
                {renderFormField(field, index)}
              </Form.Group>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
};

export default GenerateEdit;
