import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Dropdown,
  Input,
  Menu,
  Select,
} from "antd";
import { FaDumpster, FaPencilAlt, FaSearch } from "react-icons/fa";
import TableView from "../TableView/TableView";
import TableHeaderFilter from "../TableHeaderFilter";
import { Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  addAccountLedger,
  deleteChartOfAccount,
  getLedgerAccount,
  updateAccountLedger,
} from "../../redux/apis/apisCrudLms";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Images } from "../Config/Images";

const Account = ({ loader, setAddGroupMod, addGroupMod, setcsvData }: any) => {
  const [accountCode, setaccountCode] = useState<any>(null);
  const [searchValue, setSearchValue] = useState("");
  const [initialRendor, setInitialRendor] = useState(false);
  const [editRowId, setEditRowId] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [accountTitle, setaccountTitle] = useState<any>(null);
  const [accountBalance, setAccountBalance] = useState<any>(null);
  const [bankAccountNumber, setBankAccountNumber] = useState<any>(null);
  const [bic, setBic] = useState<any>(null);
  const [updateModel, setUpdateModel] = useState(false);
  const [ledgerData, setLedgerData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [accountType, setAccountType] = useState<any>(null);
  const { Option } = Select;
  // useEffect(() => {
  //   // if (fromDate && toDate) {
  //     ledgerAccount();
  //   // }
  // }, [fromDate, toDate]);
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };
  const updateAccount = async () => {
    let body: any = {
      accountId: editRowId.id,
      accountName: accountTitle,
      accountBalance: accountBalance,
      // accountType: accountType,
      accountCode: accountCode,
      accountType:
        typeof accountType === "string"
          ? accountType === "Debit"
            ? 0
            : 1
          : accountType,
      bankAccountNumber,
      bic,
    };
    toast.promise(updateAccountLedger(body), {
      loading: "Updating account...",
      success: (response) => {
        if (response?.data?.notificationMessage === "Operation successful.") {
          setUpdateModel(false);
          ledgerAccount();
          return response.data.notificationMessage;
        } else {
          throw new Error(response?.data?.notificationMessage);
        }
      },
      error: (error) => error?.message || error?.data?.notificationMessage,
    });
  };

  const customSearchInput = (
    <Input
      placeholder="Search"
      value={searchValue}
      prefix={<FaSearch />}
      onChange={(e) => setSearchValue(e.target.value)}
    />
  );

  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => console.log(key, row)}>
      <Menu.Item
        onClick={() => {
          setUpdateModel(true);
          setEditRowId(row);
          setaccountTitle(row.accountTitle);
          setAccountBalance(row.accountBalance);
          setAccountType(row.accountType);
          setBankAccountNumber(row.bankAccountNumber);
          setBic(row.bic);
          setaccountCode(row?.accountCode);
        }}
        key="edit"
        icon={<FaPencilAlt />}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          setShowPopup(true);
          setEditRowId(row);
        }}
        key="view"
        icon={<RiDeleteBin6Line />}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const Account_Documents_List_Header = [
    {
      name: "Account Code",
      selector: (row: { accountCode: any }) => row.accountCode,
    },
    {
      name: "Account Title",
      cell: (row: { accountTitle: any }) => (
        <span style={{ whiteSpace: "break-spaces" }}>{row.accountTitle}</span>
      ),
    },
    {
      name: "Account Type",
      selector: (row: { accountType: any }) => row.accountType,
    },
    // {
    //   name: "Account Parent",
    //   selector: (row: { accountGroup: any }) => row.accountGroup,
    // },
    {
      name: "Account Balance",
      selector: (row: { accountBalance: any }) => row.accountBalance,
    },
    {
      name: "IBAN",
      selector: (row: { bankAccountNumber: any }) =>
        row.bankAccountNumber || "-",
    },
    {
      name: "BIC",
      selector: (row: { bic: any }) => row.bic || "-",
    },

    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            type="primary"
            className="gradient-btn"
            style={{
              borderColor: "white",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const deleteAccount = async (row: any) => {
    toast.promise(deleteChartOfAccount(row?.id), {
      loading: "Deleting account...",
      success: (response) => {
        if (response?.data?.notificationMessage === "Operation successful.") {
          ledgerAccount();
          setShowPopup(false);
          setEditRowId("");
          return response.data.notificationMessage;
        } else {
          throw new Error(
            response?.data?.notificationMessage || "Deletion failed!"
          );
        }
      },
      error: (error) => error?.message || error?.data?.notificationMessage,
    });
  };

  const ledgerAccount = async () => {
    const dates = {
      from: fromDate?.toISOString(),
      to: toDate?.toISOString() ?? fromDate?.toISOString(),
    };
    try {
      setLoading(true);
      const response = await getLedgerAccount(
        page,
        pageSize,
        searchValue,
        dates
      );
      if (response) {
        const data = response.data.data;
        setLedgerData(data || []);
        setcsvData(data || []);
        
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
  useMemo(() => {
    // ledgerAcoount();
    setInitialRendor(true);
  }, [page, pageSize, loader, fromDate, toDate]);
  const mappedData =
    ledgerData &&
    ledgerData.map((item: any) => {
      return {
        accountTitle: item.accountName,
        accountCode: item.accountCode,
        accountGroup: item.parentAccountName || "-",
        accountType: item.accountType === 0 ? "Debit" : "Credit",
        id: item.id,
        accountBalance: item.accountBalance || 0,
        bankAccountNumber: item?.bankAccountNumber || "",
        bic: item?.bic || "",
      };
    });
  useEffect(() => {
    if (initialRendor) {
      const timeoutId = setTimeout(() => {
        ledgerAccount();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [page, pageSize, searchValue, loader, fromDate, toDate]);
  return (
    <div>
      {/* {loading && <Loader />} */}
      <div className="d-flex justify-content-end mt-2">
        {/* <TableHeaderFilter
          searchInput={customSearchInput}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        /> */}
        <span className="pe-2">
          <Input
            placeholder="Search"
            value={searchValue}
            // className="col-3"
            prefix={<SearchOutlined />}
            onChange={(e: any) => {
              setSearchValue(e.target.value);
            }}
          />
        </span>
        <div className="d-flex gap-2">
          <DatePicker
            style={{
              background: "transparent",
              border: "1px solid #D1D1D1",
              borderRadius: "32px",
            }}
            placeholder="Filter by date"
            onChange={(date) => setFromDate(date)}
          />
          {/* <DatePicker
            style={{
              background: "transparent",
              border: "1px solid #D1D1D1",
              borderRadius: "32px",
            }}
            placeholder="To"
            onChange={(date) => setToDate(date)}
          /> */}
        </div>
      </div>

      <div className="cs-table mt-2">
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          from={from}
          to={to}
          header={Account_Documents_List_Header}
          data={mappedData}
          style={{ borderRadius: "7px" }}
          isLoading={loading}
        />
      </div>

      <Modal
        show={showPopup}
        onHide={() => {
          setShowPopup(false);
        }}
      >
        <Modal.Header closeButton>
          {/* <Modal.Title>Are you sure?</Modal.Title> */}
        </Modal.Header>
        <Modal.Body>
          {/* Additional content goes here */}
          {showPopup && (
            <div>
              <div
                className="d-flex justify-content-center"
                style={{ fontSize: "20px", fontWeight: "600" }}
              >
                Are you Sure?
              </div>
              <p className="text-center pt-3">
                This action cannot be undone. All values associated with this
                record will be lost.
              </p>
              {/* Add more details as needed */}
            </div>
          )}
          <div className="col-12 gap-2 d-flex justify-content-center">
            <Button
              className="col-4 d-flex cursor-pointer application-btn justify-content-center"
              onClick={() => {
                deleteAccount(editRowId);
              }}
            >
              Yes
            </Button>

            <Button
              className="cursor-pointer invoice-btn col-4 d-flex justify-content-center"
              onClick={() => {
                setShowPopup(false);
              }}
            >
              No
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={updateModel} centered size="lg">
        <Modal.Header>
          <Modal.Title className="modal-title">Update Account</Modal.Title>
          <div className="cursor-pointer" onClick={() => setUpdateModel(false)}>
            <img /* src={Images.closeBtn} */ alt="" />
          </div>
        </Modal.Header>
        <Modal.Body className="">
          <div className="row py-2">
            <div className="col-6">
              <h6 className="">Account Name</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={accountTitle}
                onChange={(e) => setaccountTitle(e.target.value)}
              />
            </div>
            <div className="col-6">
              <h6 className="">Account Balance</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
              />
            </div>
          </div>
          <div className="row py-2">
            <div className="col-6">
              <h6 className="">Account Type</h6>
              <Select
                className="w-3/4"
                value={accountType}
                onChange={(value) => setAccountType(value)}
                placeholder="Select Account Type"
              >
                <Option value={0}>Debit</Option>
                <Option value={1}>Credit</Option>
              </Select>
            </div>
            <div className="col">
              <h6 className="">IBAN</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="row py-2">
            <div className="col-6">
              <h6 className="">BIC</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={bic}
                onChange={(e) => setBic(e.target.value)}
              />
            </div>
            <div className="col">
              <h6 className="">Account Code</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={accountCode}
                onChange={(e) => setaccountCode(e.target.value)}
              />
            </div>
          </div>

          <button
            style={{ float: "right" }}
            className="theme-btn-next"
            onClick={() => updateAccount()}
          >
            Update Account
          </button>
        </Modal.Body>
      </Modal>
      <AddGroupModal
        modal={addGroupMod}
        setModal={setAddGroupMod}
        mappedData={mappedData}
        setAddGroupMod={setAddGroupMod}
      />
    </div>
  );
};

export default Account;
function AddGroupModal({ modal, setModal, mappedData, setAddGroupMod }: any) {
  const [errors, setErrors] = useState<any>([]);

  const [accountCode, setaccountCode] = useState<any>(null);
  const [accountTitle, setaccountTitle] = useState<any>(null);
  const [accountBalance, setAccountBalance] = useState<any>(null);
  const [bankAccountNumber, setBankAccountNumber] = useState<any>(null);
  const [bic, setBic] = useState<any>(null);
  const [parentGroupId, setparentGroupId] = useState<any>(null);
  const [ledgerData, setLedgerData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const ledgerAccount = async () => {
    try {
      setLoading(true);
      const response = await getLedgerAccount(page, pageSize, "");
      if (response) {
        const data = response.data.data;
        setLedgerData(data || []);

        setTotalRows(response?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  };
  const addAccount = async (e: any) => {
    e.preventDefault();

    let body: any = {
      accountCode: Number(accountCode),
      accountName: accountTitle,
      parentAccount: parentGroupId != null ? String(parentGroupId) : null,
      accountBalance: accountBalance,
      accountDescription: "string",
      bankAccountNumber,
      bic,
    };

    toast.promise(addAccountLedger(body), {
      loading: "Processing...",
      success: (response) => {
        if (response?.data?.notificationMessage === "Operation successful.") {
          setAddGroupMod(false);
          return response.data.notificationMessage;
        } else {
          throw new Error(response?.data?.notificationMessage);
        }
      },
      error: (error) => error?.message || error?.data?.notificationMessage,
    });
  };
  // useEffect(() => {
  //   ledgerAccount();
  // }, []);
  return (
    <Modal show={modal} centered size="lg">
      <Modal.Header>
        <Modal.Title className="modal-title">Add Account</Modal.Title>
        <div className="cursor-pointer" onClick={() => setModal(false)}>
          <img /* src={Images.closeBtn} */ alt="" />
        </div>
      </Modal.Header>
      <Modal.Body className="">
        <form className="container" onSubmit={(e) => addAccount(e)}>
          <div className="row py-2">
            <div className="col">
              <h6 className="">Account Code</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={accountCode}
                onChange={(e) => setaccountCode(e.target.value)}
              />
              {errors.includes("accountCode") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div>
            <div className="col">
              <h6 className="">Account Name</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={accountTitle}
                onChange={(e) => setaccountTitle(e.target.value)}
              />
              {errors.includes("accountTitle") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div>
          </div>

          <div className="row py-2">
            {/* <div className="col">
              <h6 className="">Account Parent</h6>
              <Select value={parentGroupId} onChange={setparentGroupId}>
                {ledgerData &&
                  ledgerData?.map((option) => (
                    <option key={option.accountCode} value={option.accountCode}>
                      {option.accountName}
                    </option>
                  ))}
              </Select>
              {errors.includes("") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div> */}
            <div className="col">
              <h6 className="">IBAN</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
              />
              {errors.includes("accountCode") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div>
            <div className="col">
              <h6 className="">Account Balance</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
              />
              {errors.includes("accountBalance") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div>
          </div>
          <div className="row py-2">
            <div className="col-6">
              <h6 className="">BIC</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={bic}
                onChange={(e) => setBic(e.target.value)}
              />
              {errors.includes("accountBalance") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div>
          </div>

          <button
            type="submit"
            style={{ float: "right" }}
            className="theme-btn-next"
            // onClick={() => setModal(false)}
          >
            Add Account
          </button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
