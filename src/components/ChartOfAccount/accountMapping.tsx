import React, { useState, useEffect } from "react";
import { Input, Select } from "antd";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import {
  getChartOfAccounts,
  getLedgerAccount,
  MapLedgerAccount,
  getProducts,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";

const AccountMapping = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<any>({});
  const [changedFields, setChangedFields] = useState<any>({});
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [initialRendor, setInitialRendor] = useState(false);
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<any>({
    productID: "",
    productName: "",
  });
  const [prodId, setProdId] = useState<any>();
  
  const getProductId = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      if (res) {
        const data = res.data.data;
        setProdId(data);
        if (data && data.length > 0) {
          const initialProduct = {
            productID: data[0]?.id,
            productName: data[0]?.name,
          };
          setFormValues(initialProduct);
          // Call getChartOfAccountsData with the initial product ID
          getChartOfAccountsData(data[0]?.id);
        }
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const getChartOfAccountsData = async (productId: number | string) => {
    if (!productId) return;
    try {
      setLoading(true);
      const response = await getLedgerAccount(1, 1000, "");
      if (response) {
        const valueMain = response?.data?.data || [];
        const res = await getChartOfAccounts(productId);
        if (res) {
          const value = res?.data.data || [];
          setAccounts(value);
          const initialSelections: any = {};
          value.forEach((account: any) => {
            const match = valueMain?.find(
              (customer: any) => customer.id === account.ledgerAccountId
            );
            if (match) {
              initialSelections[account.accountType] = match.id;
            }
          });
          setSelectedAccounts(initialSelections);
        }
        setCustomerData(valueMain);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  const accountsDetailsForList = async () => {
    try {
      // setLoading(true);
      const response = await getLedgerAccount(1, 1000, searchValue);
      if (response) {
        const valueMain = response?.data?.data || [];

        setCustomerData(valueMain);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  const getBussinessTypeById = (id: any) => {
    const cleanedId = String(id).replace(/,+$/, "");
    const entry: any = customerData?.find(
      (entry: any) => entry.id === cleanedId
    );

    return entry ? entry.accountName : "select option";
  };

  const mapAccounts = async () => {
    // Check if there are any non-wallet fields that require a product
    const nonWalletFields = Object.keys(changedFields).filter(
      (accountType) => !["24", "25", "32"].includes(accountType)
    );
    
    if (nonWalletFields.length > 0 && !formValues.productID) {
      toast.error("Please select a product");
      return;
    }
    
    try {
      // Build array of payloads
      const payloads = Object.entries(changedFields).map(([accountType, accountId]) => {
        // Wallet fields (24, 25, 32) should have productId as null
        const isWalletField = ["24", "25", "32"].includes(accountType);
        return {
          productId: isWalletField ? null : formValues.productID,
          accountTypes: parseInt(accountType),
          chartOfAccountId: accountId,
        };
      });
      
      // Call API once with all payloads
      const res = await MapLedgerAccount(payloads);
      if (res) {
        toast.success(res?.data?.notificationMessage);
      }
      
      setChangedFields({});
      // Refresh the data after mapping
      if (formValues.productID) {
        getChartOfAccountsData(formValues.productID);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const handleSelectChange = (name: string, value: any) => {
    setSelectedAccounts((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
    setChangedFields((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    getProductId();
    setInitialRendor(true);
  }, []);
  useEffect(() => {
    if (initialRendor) {
      const timeoutId = setTimeout(() => {
        accountsDetailsForList();
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchValue]);

  const businessInformationFields = [
    // {
    //   label: "Disbursement Account",
    //   type: "select",
    //   name: "0",
    //   options: customerData,
    //   Placeholder: "Disbursement Account",
    //   value: selectedAccounts[0]
    //     ? selectedAccounts[0]
    //     : null,
    //   onChange: (value: string) => handleSelectChange("0", value),
    // },
    {
      label: "Collection Account",
      type: "select",
      name: "1",
      options: customerData,
      Placeholder: "Collection Account",
      value: selectedAccounts[1]
        ? selectedAccounts[1]
        : null,
      onChange: (value: string) => handleSelectChange("1", value),
    },
    {
      label: "Purchase Account",
      type: "select",
      name: "2",
      options: customerData,
      Placeholder: "Purchase Account",
      value: selectedAccounts[2]
        ? selectedAccounts[2]
        : null,
      onChange: (value: string) => handleSelectChange("2", value),
    },
    {
      label: "Supplier Account",
      type: "select",
      name: "3",
      options: customerData,
      Placeholder: "Supplier Account",
      value: selectedAccounts[3]
        ? selectedAccounts[3]
        : null,
      onChange: (value: string) => handleSelectChange("3", value),
    },
    {
      label: "Expense Account",
      type: "select",
      name: "4",
      options: customerData,
      Placeholder: "Expense Account",
      value: selectedAccounts[4]
        ? selectedAccounts[4]
        : null,
      onChange: (value: string) => handleSelectChange("4", value),
    },
    {
      label: "Fee Account",
      type: "select",
      name: "5",
      options: customerData,
      Placeholder: "Fee Account",
      value: selectedAccounts[5]
        ? selectedAccounts[5]
        : getBussinessTypeById(
            accounts
              .map((account) =>
                account.accountType === "FeeAccount" ? account.accountId : null
              )
              .filter((accountId) => accountId !== null)
          ),
      onChange: (value: string) => handleSelectChange("5", value),
    },
    {
      label: "VAT Account",
      type: "select",
      name: "6",
      options: customerData,
      Placeholder: "VAT Account",
      value: selectedAccounts[6]
        ? selectedAccounts[6]
        : getBussinessTypeById(
            accounts
              .map((account) =>
                account.accountType === "VatAccount" ? account.accountId : null
              )
              .filter((accountId) => accountId !== null)
          ),
      onChange: (value: string) => handleSelectChange("6", value),
    },
    {
      label: "Accured Account",
      type: "select",
      name: "7",
      options: customerData,
      Placeholder: "Accured Account",
      value: selectedAccounts[7]
        ? selectedAccounts[7]
        : null,
      onChange: (value: string) => handleSelectChange("7", value),
    },
    {
      label: "Output Vat Account",
      type: "select",
      name: "8",
      options: customerData,
      Placeholder: "Output Vat Account",
      value: selectedAccounts[8]
        ? selectedAccounts[8]
        : null,
      onChange: (value: string) => handleSelectChange("8", value),
    },
    {
      label: "Output Interest Revenue Account",
      type: "select",
      name: "9",
      options: customerData,
      Placeholder: "Output Interest Revenue Account",
      value: selectedAccounts[9]
        ? selectedAccounts[9]
        : null,
      onChange: (value: string) => handleSelectChange("9", value),
    },
    {
      label: "Receivable Account",
      type: "select",
      name: "10",
      options: customerData,
      Placeholder: "Receivable Account",
      value: selectedAccounts[10]
        ? selectedAccounts[10]
        : null,
      onChange: (value: string) => handleSelectChange("10", value),
    },
    {
      label: "Other Taxes Account",
      type: "select",
      name: "11",
      options: customerData,
      Placeholder: "Other Taxes Account",
      value: selectedAccounts[11]
        ? selectedAccounts[11]
        : null,
      onChange: (value: string) => handleSelectChange("11", value),
    },
    {
      label: "Processing Fee Account",
      type: "select",
      name: "12",
      options: customerData,
      Placeholder: "Processing Fee Account ",
      value: selectedAccounts[12]
        ? selectedAccounts[12]
        : null,
      onChange: (value: string) => handleSelectChange("12", value),
    },
    {
      label: "Admin Fee Account",
      type: "select",
      name: "13",
      options: customerData,
      Placeholder: "Admin Fee Account",
      value: selectedAccounts[13]
        ? selectedAccounts[13]
        : null,
      onChange: (value: string) => handleSelectChange("13", value),
    },
    {
      label: "Balloon Payment Account",
      type: "select",
      name: "14",
      options: customerData,
      Placeholder: "Balloon Payment Account",
      value: selectedAccounts[14]
        ? selectedAccounts[14]
        : null,
      onChange: (value: string) => handleSelectChange("14", value),
    },
    {
      label: "Advance Payment Account",
      type: "select",
      name: "15",
      options: customerData,
      Placeholder: " Advance Payment Account",
      value: selectedAccounts[15]
        ? selectedAccounts[15]
        : null,
      onChange: (value: string) => handleSelectChange("15", value),
    },
    {
      label: "Early Settlement Principle",
      type: "select",
      name: "16",
      options: customerData,
      Placeholder: "Early Settlement Principle",
      value: selectedAccounts[16]
        ? selectedAccounts[16]
        : null,
      onChange: (value: string) => handleSelectChange("16", value),
    },
    {
      label: "Early Settlement Profit",
      type: "select",
      name: "17",
      options: customerData,
      Placeholder: "Early Settlement Profit",
      value: selectedAccounts[17]
        ? selectedAccounts[17]
        : null,
      onChange: (value: string) => handleSelectChange("17", value),
    },
    {
      label: "Due Principle",
      type: "select",
      name: "18",
      options: customerData,
      Placeholder: "Due Principle",
      value: selectedAccounts[18]
        ? selectedAccounts[18]
        : null,
      onChange: (value: string) => handleSelectChange("18", value),
    },
    {
      label: "Due Profit",
      type: "select",
      name: "19",
      options: customerData,
      Placeholder: "Due Profit",
      value: selectedAccounts[19]
        ? selectedAccounts[19]
        : null,
      onChange: (value: string) => handleSelectChange("19", value),
    },
    {
      label: "Late Payment Principle",
      type: "select",
      name: "20",
      options: customerData,
      Placeholder: "Late Payment Principle",
      value: selectedAccounts[20]
        ? selectedAccounts[20]
        : null,
      onChange: (value: string) => handleSelectChange("20", value),
    },
    {
      label: "Late Payment Profit",
      type: "select",
      name: "21",
      options: customerData,
      Placeholder: "Late Payment Profit",
      value: selectedAccounts[21]
        ? selectedAccounts[21]
        : null,
      onChange: (value: string) => handleSelectChange("21", value),
    },
    {
      label: "Cash In",
      type: "select",
      name: "22",
      options: customerData,
      Placeholder: "Cash In",
      value: selectedAccounts[22]
        ? selectedAccounts[22]
        : null,
      onChange: (value: string) => handleSelectChange("22", value),
    },
    {
      label: "Cash Out",
      type: "select",
      name: "23",
      options: customerData,
      Placeholder: "Cash Out",
      value: selectedAccounts[23]
        ? selectedAccounts[23]
        : null,
      onChange: (value: string) => handleSelectChange("23", value),
    },
    {
      label: "Wallet",
      type: "select",
      name: "24",
      options: customerData,
      Placeholder: "Wallet",
      value: selectedAccounts[24]
        ? selectedAccounts[24]
        : null,
      onChange: (value: string) => handleSelectChange("24", value),
    },
    {
      label: "Investment Wallet",
      type: "select",
      name: "25",
      options: customerData,
      Placeholder: "Wallet",
      value: selectedAccounts[25]
        ? selectedAccounts[25]
        : null,
      onChange: (value: string) => handleSelectChange("25", value),
    },
    {
      label: "Investment Capital",
      type: "select",
      name: "26",
      options: customerData,
      Placeholder: "Capital",
      value: selectedAccounts[26]
        ? selectedAccounts[26]
        : null,
      onChange: (value: string) => handleSelectChange("26", value),
    },
    {
      label: "Return Payable",
      type: "select",
      name: "27",
      options: customerData,
      Placeholder: "ReturnPayable",
      value: selectedAccounts[27]
        ? selectedAccounts[27]
        : null,
      onChange: (value: string) => handleSelectChange("27", value),
    },
    {
      label: "Commodity Inventory Account",
      type: "select",
      name: "28",
      options: customerData,
      Placeholder: "Commodity Inventory Account",
      value: selectedAccounts[28]
        ? selectedAccounts[28]
        : null,
      onChange: (value: string) => handleSelectChange("28", value),
    }, {
      label: "Return Expense",
      type: "select",
      name: "29",
      options: customerData,
      Placeholder: "ReturnExpense",
      value: selectedAccounts[29]
        ? selectedAccounts[29]
        : null,
      onChange: (value: string) => handleSelectChange("29", value),
    }, 
    {
      label: "Investment Processing Fee",
      type: "select",
      name: "30",
      options: customerData,
      Placeholder: "InvestmentProcessingFee",
      value: selectedAccounts[30]
        ? selectedAccounts[30]
        : null,
      onChange: (value: string) => handleSelectChange("30", value),
    }, 
    {
      label: "Investment Vat",
      type: "select",
      name: "29",
      options: customerData,
      Placeholder: "InvestmentVat",
      value: selectedAccounts[31]
        ? selectedAccounts[31]
        : null,
      onChange: (value: string) => handleSelectChange("31", value),
    }, 
    {
      label: "Investor Wallet",
      type: "select",
      name: "32",
      options: customerData,
      Placeholder: "Investor Wallet",
      value: selectedAccounts[32]
        ? selectedAccounts[32]
        : null,
      onChange: (value: string) => handleSelectChange("32", value),
    }, 
    {
      label: "Payable Account",
      type: "select",
      name: "33",
      options: customerData,
      Placeholder: "Payable Account",
      value: selectedAccounts[33]
        ? selectedAccounts[33]
        : null,
      onChange: (value: string) => handleSelectChange("33", value),
    }, 
    {
      label: "Factoring Valley Receivable Account",
      type: "select",
      name: "34",
      options: customerData,
      Placeholder: "Factoring Valley Receivable Account",
      value: selectedAccounts[34]
        ? selectedAccounts[34]
        : null,
      onChange: (value: string) => handleSelectChange("34", value),
    }, 
    {
      label: "Cash Account",
      type: "select",
      name: "35",
      options: customerData,
      Placeholder: "Cash Account",
      value: selectedAccounts[35]
        ? selectedAccounts[35]
        : null,
      onChange: (value: string) => handleSelectChange("35", value),
    }, 
    {
      label: "Supplier Commission",
      type: "select",
      name: "36",
      options: customerData,
      Placeholder: "Supplier Commission",
      value: selectedAccounts[36]
        ? selectedAccounts[36]
        : null,
      onChange: (value: string) => handleSelectChange("36", value),
    }, 
  ];

  return (
    <div>
      {loading ? (
        <>
          <Row className="mb-3">
            {Array.from({ length: 10 }).map((_, index) => (
              <Col md={4} key={index} className="pt-3">
                <Skeleton height={40} />
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <>
          <Row>
          <Col md={4} className="mb-3 pt-2">
            <Form.Group>
              <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                Select Product
              </Form.Label>
              <Select
                showSearch
                value={formValues.productID}
                onChange={(value) => {
                  const selectedProduct = prodId?.find((p: any) => p.id === value);
                  setFormValues((prevValues: any) => ({
                    ...prevValues,
                    productID: value,
                    productName: selectedProduct?.name || "",
                  }));
                  getChartOfAccountsData(value);
                }}
                defaultValue={formValues?.productID}
                style={{ width: "100%" }}
                placeholder="Select Product"
                filterOption={(input, option: any) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {prodId?.map((option: any) => (
                  <Select.Option key={option.id} value={option.id}>
                    {option?.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Group>
          </Col>
        </Row>
        <div className="py-2">
          <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
            Chart of Account Mapping
          </h4>
            <div className="d-flex justify-content-end mt-2">
              {/* <TableHeaderFilter
          searchInput={customSearchInput}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        /> */}
              {/* <span className="pe-2">
                <Input
                  placeholder="Search By Account Code/Name"
                  value={searchValue}
                  prefix={<SearchOutlined />}
                  onChange={(e: any) => {
                    setSearchValue(e.target.value);
                  }}
                />
              </span> */}
            </div>
            <Row className="mb-3">
              {customerData &&
                customerData.length > 0 &&
                businessInformationFields.map((field: any, index) => (
                  <Col md={4} key={index} className="pt-3">
                    <Form.Group>
                      <Form.Label
                        className="mt-2"
                        style={{ fontSize: "12px", fontWeight: "700" }}
                      >
                        {field.label}
                      </Form.Label>
                      <Select
                        showSearch
                        value={field.value}
                        onChange={field.onChange}
                        style={{ width: "100%", height: "40px" }}
                        placeholder={field.Placeholder}
                        filterOption={(input, option: any) =>
                          option?.children?.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {(field.options || []).length > 0 ? (
                          (field.options || []).map((option: any) => (
                            <Select.Option key={option.id} value={option.id}>
                              {option.accountName}
                            </Select.Option>
                          ))
                        ) : (
                          <Select.Option>No Options Available</Select.Option>
                        )}
                      </Select>
                    </Form.Group>
                  </Col>
                ))}
            </Row>
            <hr className="my-4" />
            <div className="d-flex justify-content-end">
              <Button
                className="application-btn"
                style={{
                  backgroundColor: "#EB0D0D",
                  color: "#FCFCFC",
                  border: "none",
                }}
                onClick={mapAccounts}
              >
                Save
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountMapping;
