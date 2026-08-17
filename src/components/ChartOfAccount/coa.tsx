import React, { useState, useCallback } from "react";
import { Button, DatePicker, Input, Upload, UploadFile, UploadProps } from "antd";
import { BarChart3 } from "lucide-react";
import { SearchOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import { useLocation, useNavigate } from "react-router-dom";
import Account from "./account";
import toast from "react-hot-toast";
import { ImageElementContainer } from "html2canvas/dist/types/dom/replaced-elements/image-element-container";
import { FaDownload, FaPencilAlt, FaUpload } from "react-icons/fa";
import { getLedgerAccount, uploadAccounts } from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";

// import { useDropzone } from "react-dropzone";

const validAccountTypes = ["assets", "liability", "equity", "revenue", "expense", "-"];

const requiredHeaders = ["account id", "account code", "account name", "account parent"];
const accountCodePattern = /^[A-Za-z0-9-]+$/; // Alphanumeric with optional dashes

// interface CoaProps {
//   onSuccess: () => void; // Callback function to close modal on success
// }
const Coa = () => {
  const { t } = useTranslation("accountingLoans");
  const navigate = useNavigate();
  const location = useLocation(); // Get current route
  const isChartOfAccountPage = location.pathname === "/Lms/ChartOfAccount/ChartOfAccount";
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [jsonData, setJsonData] = useState<any>(null);
  const [loader, setLoader] = useState(false);
  const [errorsData, setErrorsData] = useState<any>([]);
  const [errorCheck, setErrorCheck] = useState(false);
  const [addGroupMod, setAddGroupMod] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [ledgerData, setLedgerData] = useState<any>();
  const [csvData, setcsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  // Lifted up from <Account /> so the search + date filter can sit on the
  // same responsive row as the action buttons.
  const [searchValue, setSearchValue] = useState("");
  const [fromDate, setFromDate] = useState<any>(null);

  const addAccounts = async (data: any) => {
    setLoader(true);

    // Use toast.promise to handle different states
    await toast.promise(
      uploadAccounts(data), // The promise to track
      {
        loading: t("coa.toast.uploading"), // Loading state message

        success: (res) => {
          if (res?.data?.notificationMessage === "Operation successful.") {
            // onSuccess();
            // toast.success(res?.data?.notificationMessage);
            navigate("/lms/ChartOfAccount/CoaConfiguration");

            return res?.data?.notificationMessage;
          } else if (res?.data?.errors) {
            throw new Error(res.data.errors[0]); // Force error handling
          }
        },
        error: (err) => {
          console.error("Error occurred:", err);
          return err?.message || t("coa.toast.genericError");
        },
      }
    );

    setLoader(false);
  };

  const validateHeaders = (headers: any) => {
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header.toLowerCase())
    );
    return missingHeaders.length === 0
      ? null
      : t("coa.val.missingHeaders", { headers: missingHeaders.join(", ") });
  };

  // const validateAccountNames = (data, headers) => {
  //   const errors = [];
  //   const colIndex = headers
  //     .map((h) => h.toLowerCase())
  //     .indexOf("account parent");
  //   if (colIndex !== -1) {
  //     data.forEach((row, rowIndex) => {
  //       const accountName = row["account parent"]
  //         ?.toString()
  //         .trim()
  //         .toLowerCase();
  //       if (!validAccountTypes.includes(accountName)) {
  //         errors.push(
  //           `Invalid "account parent" in row ${
  //             rowIndex + 2
  //           }: "${accountName}". Allowed values are: ${validAccountTypes.join(
  //             ", "
  //           )}.`
  //         );
  //       }
  //     });
  //   }
  //   return errors;
  // };
  // const validateTopLevelAccountForParent = (data, headers) => {
  //   const errors = [];
  //   const colIndex = headers
  //     .map((h) => h.toLowerCase())
  //     .indexOf("account parent");
  //   if (colIndex !== -1) {
  //     const foundAccountTypes = new Set();
  //     data.forEach((row, rowIndex) => {
  //       const accountName = row["account parent"]
  //         ?.toString()
  //         .trim()
  //         .toLowerCase();

  //       // Track valid account types found in the column
  //       if (validAccountTypes.includes(accountName)) {
  //         foundAccountTypes.add(accountName);
  //       }
  //     });

  //     // Check if all valid account types are present
  //     const missingTypes = validAccountTypes.filter(
  //       (type) => !foundAccountTypes.has(type)
  //     );

  //     if (missingTypes.length > 0) {
  //       errors.push(
  //         `The "account parent" column is missing required values: ${missingTypes.join(
  //           ", "
  //         )}. Ensure all these values are included in the column.`
  //       );
  //     }
  //   } else {
  //     errors.push(`"Account parent" column not found.`);
  //   }

  //   return errors;
  // };

  const validateAccountNamesAndParentAccountNotSame = (data: any, headers: any) => {
    const errors: any[] = [];
    const headerIndexMap = headers.reduce((map: any, header: any, index: any) => {
      map[header.toLowerCase()] = index;
      return map;
    }, {});

    const accountNameIndex = headerIndexMap["account name"];
    const parentAccountIndex = headerIndexMap["account parent"];

    if (accountNameIndex !== undefined && parentAccountIndex !== undefined) {
      data.forEach((row: any, rowIndex: any) => {
        const accountName = row[headers[accountNameIndex]]?.toString().trim().toLowerCase();
        const parentAccount = row[headers[parentAccountIndex]]?.toString().trim().toLowerCase();

        // Check if parent account is invalid
        if (!validAccountTypes.includes(parentAccount)) {
          errors.push(
            t("coa.val.invalidParent", {
              row: rowIndex + 2,
              value: parentAccount,
              allowed: validAccountTypes.join(", "),
            })
          );
        }

        // Check if account name and parent account are the same
        if (accountName === parentAccount) {
          errors.push(
            t("coa.val.sameNameParent", {
              row: rowIndex + 2,
              value: accountName,
            })
          );
        }
      });
    }
    return errors;
  };

  const validateUniqueAccountCodes = (data: any) => {
    const errors: any[] = [];
    const accountCodeSet = new Set();

    data.forEach((row: any, rowIndex: any) => {
      const accountCode = row["account code"]?.toString().trim();

      if (accountCode) {
        if (accountCodeSet.has(accountCode)) {
          errors.push(t("coa.val.duplicateCode", { row: rowIndex + 2, value: accountCode }));
        } else {
          accountCodeSet.add(accountCode);
        }
      } else {
        errors.push(t("coa.val.missingCode", { row: rowIndex + 2 }));
      }
    });

    return errors;
  };
  const validateUniqueAccountName = (data: any) => {
    const errors: any[] = [];
    const accountCodeSet = new Set();

    data.forEach((row: any, rowIndex: any) => {
      const accountCode = row["account name"]?.toString().trim();

      if (accountCode) {
        if (accountCodeSet.has(accountCode)) {
          errors.push(t("coa.val.duplicateName", { row: rowIndex + 2, value: accountCode }));
        } else {
          accountCodeSet.add(accountCode);
        }
      } else {
        errors.push(t("coa.val.missingName", { row: rowIndex + 2 }));
      }
    });

    return errors;
  };
  const validateMandatoryFields = (data: any[], headers: string[]) => {
    const errors: string[] = [];

    const headerMap = Object.fromEntries(
      headers.map((header, index) => [header.trim().toLowerCase(), index])
    );

    data.forEach((row, rowIndex) => {
      requiredHeaders.forEach((requiredHeader) => {
        const colIndex = headerMap[requiredHeader.toLowerCase()];

        if (requiredHeader.toLowerCase() === "account parent") {
          // Allow "account parent" to be empty only when "account name" is in validAccountTypes
          const accountNameIndex = headerMap["account name"];
          const accountName = row[headers[accountNameIndex]]?.toString().trim().toLowerCase();

          if (
            !validAccountTypes.includes(accountName) &&
            (!colIndex || !row[headers[colIndex]]?.toString().trim())
          ) {
            errors.push(
              t("coa.val.missingMandatoryParent", {
                row: rowIndex + 2,
                column: requiredHeader,
                allowed: validAccountTypes.join(", "),
              })
            );
          }
        } else if (colIndex !== undefined) {
          const value = row[headers[colIndex]]?.toString().trim();
          if (!value || value === "") {
            errors.push(
              t("coa.val.missingMandatory", {
                row: rowIndex + 2,
                column: requiredHeader,
              })
            );
          }
        }
      });
    });

    return errors;
  };

  const validateAccountCodes = (data: any[], headers: string[]) => {
    const errors: string[] = [];

    const colIndex = headers.findIndex((header) => header.trim().toLowerCase() === "account code");

    if (colIndex !== -1) {
      data.forEach((row, rowIndex) => {
        const accountCode = row[headers[colIndex]]?.toString().trim();
        if (!accountCode || !accountCodePattern.test(accountCode)) {
          errors.push(
            t("coa.val.invalidAccountCode", {
              row: rowIndex + 2,
              col: colIndex + 1,
            })
          );
        }
      });
    }

    return errors;
  };

  const assignParentCodes = (data: any) => {
    const accountMap: any = {}; // Map of accountName -> accountCode
    const errors: any = [];

    // Step 1: Build a map of account names to their respective codes
    data.forEach((row: any) => {
      const { accountCode, accountName } = row;
      if (accountCode && accountName) {
        accountMap[accountName.toLowerCase().trim()] = accountCode.toString();
      }
    });

    // Step 2: Assign the correct parent code from the existing map
    const processedData = data.map((row: any, rowIndex: any) => {
      let { parentAccount, accountName } = row;

      if (parentAccount) {
        // If parentAccount is a valid accountCode, keep it
        if (accountMap[parentAccount]) {
          row.parentAccount = parentAccount; // Already a valid code
        }
        // If parentAccount is an accountName, replace it with the correct accountCode
        else if (accountMap[parentAccount.toLowerCase()]) {
          row.parentAccount = accountMap[parentAccount.toLowerCase()]; // Map name -> code
        }
        // If the parent account is missing or incorrect, log an error
        else {
          errors.push(
            t("coa.val.invalidParentRef", {
              row: rowIndex + 2,
              value: parentAccount,
            })
          );
        }
      }

      return row;
    });

    return { processedData, errors };
  };

  const handleCSVParse = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const headers = result.meta.fields?.map((h) => h.toLowerCase()) || [];
          const data = result.data;

          // Validate headers
          const headerError = validateHeaders(headers);
          if (headerError) {
            toast.error(headerError);
            return;
          }

          // Validate account names
          // const accountNameErrors = validateAccountNames(data, headers);
          const mandatoryFieldErrors = validateMandatoryFields(data, headers);
          const accountCodeErrors = validateAccountCodes(data, headers);
          const uniqueAccountCodeErrors = validateUniqueAccountCodes(data);
          const uniqueAccountName = validateUniqueAccountName(data);
          const sameNameCheck = validateAccountNamesAndParentAccountNotSame(data, headers);
          // const checkTopLevelAccount = validateTopLevelAccountForParent(
          //   data,
          //   headers
          // );
          const { processedData, errors } = assignParentCodes(data);

          const allErrors = [
            ...mandatoryFieldErrors,
            ...accountCodeErrors,
            ...uniqueAccountCodeErrors,
            // ...accountNameErrors,
            ...uniqueAccountName,
            // ...sameNameCheck,
            // ...checkTopLevelAccount,
          ];

          if (errors.length > 0) {
            setErrorsData(errors);
          } else if (allErrors.length > 0) {
            setErrorsData(allErrors);
            // allErrors.forEach((error) => toast.error(error));
          } else {
            toast.success(t("coa.toast.csvValidated"));
            setErrorCheck(true);
          }
          // if (accountNameErrors.length > 0) {
          //   accountNameErrors.forEach((error) => toast.error(error));
          // } else {
          //   toast.success("CSV file validated successfully!");
          // }
        },
        error: (err: any) => {
          console.error("Error parsing CSV:", err);
          toast.error(t("coa.toast.parseFailedContent"));
        },
      });
    };
    reader.readAsText(file);
  };
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/COA Template.csv"; // Path to the CSV file in the public directory
    link.download = "COA Template.csv"; // The file name for the downloaded file
    link.click();
  };
  const ledgerAccount = async () => {
    try {
      setLoading(true);
      const response = await getLedgerAccount(page, pageSize, "");
      if (response) {
        const data = response.data.data;
        setLedgerData(data || []);

        // Extract pagination data from API response
        const pageInfo = response?.data?.pageInfo;
        const totalItems = pageInfo?.totalItems || 0;
        setTotalRows(totalItems);

        // Calculate from and to based on pagination
        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      }
    } catch (error: any) {
      toast.error(error?.message);
      // Reset pagination values on error
      setTotalRows(0);
      setFrom(0);
      setTo(0);
    } finally {
      setLoading(false);
    }
  };
  const button = [{ title: "view" }];
  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      setErrorsData([]);
      const newFileList = [...fileList, file];
      setFileList(newFileList);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Parse CSV data into JSON
        Papa.parse(content, {
          header: true, // Treat the first row as header
          skipEmptyLines: false, // Skip empty rows
          complete: (result) => {
            // Transform parsed data
            const accountMap: any = {}; // Stores "account name" → "account code"

            result.data.forEach((item: any) => {
              const accountName = item["account name"]?.trim()?.toLowerCase();
              const accountCode = String(item["account code"])?.trim();

              if (accountName && accountCode) {
                accountMap[accountName] = accountCode; // Store mapping
              }
            });

            // Step 2: Transform parsed data with correct parent code assignments
            const transformedData = result.data.map((item: any, index) => {
              const accountCode = String(item["account code"]).trim();
              const accountName = item["account name"]?.trim()?.toLowerCase();
              const parentAccountName = item["account parent"]?.trim()?.toLowerCase();

              return {
                accountCode: Number(accountCode) || 0,
                accountName: item["account name"] || "string",
                parentAccount: parentAccountName ? accountMap[parentAccountName] || "" : "",
                accountDescription: "string",
              };
            });

            setJsonData(transformedData);
            const localErrorsData = errorsData;

            // result.data.forEach((row) => {
            //   if (
            //     !row["account code"] ||
            //     !row["account name"] ||
            //     !row["account parent"]
            //   ) {
            //     localErrorsData.push("Missing required fields in CSV row.");
            //   }
            // });

            if (localErrorsData.length === 0) {
              addAccounts(transformedData); // Proceed if no errors
            } else {
              console.error("detected", localErrorsData);
              toast.error(t("coa.toast.csvHasErrors"));
            }
            setErrorsData(localErrorsData);
            setJsonData(transformedData);
          },
          error: (err: any) => {
            console.error("Error parsing CSV:", err);
            toast.error(t("coa.toast.parseFailedFile"));
          },
        });
      };
      // Check file type (allow CSV, XLS, and XLSX files)
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
        "text/csv", // .csv
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(t("coa.toast.invalidFileType"));
        return Upload.LIST_IGNORE; // Prevent file from being added to the upload list
      }

      // Check file size (must be less than 5 MB)
      const isLessThan5MB = file.size / 1024 / 1024 < 5;
      if (!isLessThan5MB) {
        toast.error(t("coa.toast.fileTooLarge"));
        return Upload.LIST_IGNORE; // Prevent file from being added to the upload list
      }
      // Proceed with parsing if valid
      reader.readAsText(file);
      handleCSVParse(file);
      return false; // Prevent actual upload
    },
    fileList,
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
      setJsonData([]); // Clear JSON data when a file is removed
    },
  };
  const exportToCSV = (data: any[], fileName: string) => {
    const csvRows = [];
    const headers = Object.keys(data[0]); // Assuming all objects have the same keys
    csvRows.push(headers.join(",")); // Join header row with commas

    // Loop through the data and generate CSV rows
    data.forEach((row) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    });

    // Create CSV string
    const csvString = csvRows.join("\n");

    // Create a Blob from the CSV string and trigger a download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };
  return (
    <div className="service coa-page py-2">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <BarChart3 className="h-4 w-4" />
          </span>
          {t("coa.title")}
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder={t("common:search")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchValue}
            onChange={(e: any) => setSearchValue(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <DatePicker
            placeholder={t("coa.filterByDate")}
            value={fromDate}
            onChange={(date: any) => setFromDate(date)}
            format="YYYY-MM-DD"
            allowClear
            style={{
              flex: "1 1 180px",
              minWidth: 160,
              height: 40,
              borderRadius: 2,
              background: "#fff",
            }}
          />
          <button
            type="button"
            className="theme-btn-next"
            onClick={() => exportToCSV(csvData, "Account")}
            disabled={!csvData?.length}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t("coa.exportCsv")}
          </button>
          <Button
            className="theme-btn-next"
            onClick={handleDownload}
            icon={<FaDownload />}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t("coa.templateCsv")}
          </Button>
          <Upload {...uploadProps}>
            <Button
              className="theme-btn-next"
              type="primary"
              icon={<FaUpload />}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {t("coa.upload")}
            </Button>
          </Upload>
          {isChartOfAccountPage && (
            <Button
              className="theme-btn-next"
              type="primary"
              onClick={() => setAddGroupMod(true)}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {t("coa.addAccount")}
            </Button>
          )}
        </div>
      </div>

      {errorsData?.length > 0 && (
        <div
          className="mb-3"
          style={{
            padding: "8px",
            borderRadius: "2px",
            border: "1px solid red",
            maxHeight: "224px",
            overflowY: "auto",
          }}
        >
          <div className="label">{t("coa.errors")}</div>
          {errorsData.map((item: any, index: any) => (
            <div key={index} className="pt-3">{`${index + 1}-${item}`}</div>
          ))}
        </div>
      )}
      {/* The accounts table used to sit behind a <Tabs> with a single "Account"
          tab — the second tab ("Group") was commented out, leaving a tab bar
          that could not switch to anything. Rendered directly instead. */}
      {isChartOfAccountPage && (
        <div className="pro-card">
          <Account
            loader={loader}
            setAddGroupMod={setAddGroupMod}
            addGroupMod={addGroupMod}
            setcsvData={setcsvData}
            searchValue={searchValue}
            fromDate={fromDate}
          />
        </div>
      )}
    </div>
  );
};

export default Coa;
