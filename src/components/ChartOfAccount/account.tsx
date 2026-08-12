import React, { useState, useEffect, useMemo } from "react";
import { Button, Checkbox, DatePicker, Dropdown, Input, Menu, Select } from "antd";
import { FaDumpster, FaPencilAlt, FaSearch } from "react-icons/fa";
import TableView from "../TableView/TableView";
import TableHeaderFilter from "../TableHeaderFilter";
import { Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  addAccountLedger,
  deleteChartOfAccount,
  activateChartOfAccount,
  getLedgerAccount,
  updateAccountLedger,
} from "../../redux/apis/apisCrudLms";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Images } from "../Config/Images";
import { useTranslation } from "react-i18next";

const Account = ({
  loader,
  setAddGroupMod,
  addGroupMod,
  setcsvData,
  // Filters lifted up to <Coa /> so they share the row with the action buttons.
  searchValue: searchValueProp,
  fromDate: fromDateProp,
}: any) => {
  const { t } = useTranslation("accountingLoans");
  // Use props when provided, fall back to local state for any caller that
  // doesn't pass them in.
  const [localSearchValue] = useState("");
  const [localFromDate] = useState<any>(null);
  const searchValue = searchValueProp !== undefined ? searchValueProp : localSearchValue;
  const fromDate = fromDateProp !== undefined ? fromDateProp : localFromDate;

  const [initialRendor, setInitialRendor] = useState(false);
  const [editRowId, setEditRowId] = useState<any>(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [accountTitle, setaccountTitle] = useState<any>(null);
  const [updateModel, setUpdateModel] = useState(false);
  const [ledgerData, setLedgerData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [toDate, setToDate] = useState<any>(null);
  const [accountType, setAccountType] = useState<any>(null);
  const [accountNameAr, setAccountNameAr] = useState<any>(null);
  // useEffect(() => {
  //   // if (fromDate && toDate) {
  //     ledgerAccount();
  //   // }
  // }, [fromDate, toDate]);
  const updateAccount = async () => {
    let body: any = {
      accountName: accountTitle,
      accountNameAr: accountNameAr,
    };
    toast.promise(updateAccountLedger(editRowId.id, body), {
      loading: t("account.toast.updating"),
      success: (response) => {
        if (response?.data?.message === "success" || response?.status === 200) {
          setUpdateModel(false);
          ledgerAccount();
          return t("account.toast.updateSuccess");
        } else {
          throw new Error(response?.data?.message || t("account.toast.updateFailed"));
        }
      },
      error: (error) => error?.message || t("account.toast.updateFailed"),
    });
  };

  const customSearchInput = (
    <Input
      placeholder="Search"
      value={searchValue}
      prefix={<FaSearch />}
      onChange={(e: any) => setSearchValue(e.target.value)}
    />
  );

  const menu = (row: any) => {
    const isActive = row.status === "ACTIVE" || row.status === "active" || row.status === "Active";
    return (
      <Menu>
        <Menu.Item
          onClick={() => {
            setUpdateModel(true);
            setEditRowId(row);
            setaccountTitle(row.accountTitle);
            setAccountType(row.accountType);
            setAccountNameAr(row.accountNameAr);
          }}
          key="edit"
          icon={<FaPencilAlt />}
        >
          {t("common:edit")}
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            toggleAccountStatus(row);
          }}
          key="toggle"
          icon={<RiDeleteBin6Line />}
          danger={isActive}
        >
          {isActive ? t("common:deactivate") : t("common:activate")}
        </Menu.Item>
      </Menu>
    );
  };

  const Account_Documents_List_Header = [
    {
      name: t("account.col.code"),
      // Indented by depth so a row's place in the chart is visible. Not a
      // collapsible tree: the list is paged server-side, so a row's parent may
      // sit on another page and cannot be linked up from here.
      cell: (row: any) => (
        <span
          className="font-monospace"
          style={{ paddingInlineStart: `${Math.min(row.hierarchyLevel ?? 0, 4) * 12}px` }}
        >
          {row.accountCode}
        </span>
      ),
    },
    {
      name: t("account.col.name"),
      cell: (row: { accountTitle: any }) => (
        <span style={{ whiteSpace: "break-spaces" }}>{row.accountTitle}</span>
      ),
    },
    {
      name: t("account.col.type"),
      cell: (row: any) => (
        <div className="d-flex align-items-center gap-2">
          <span>{row.accountType}</span>
          {row.isHeader && (
            <span
              className="rounded-pill px-2 py-1"
              style={{
                fontSize: "10px",
                fontWeight: 600,
                backgroundColor: "var(--muted)",
                color: "var(--muted-foreground)",
              }}
            >
              {t("account.headerBadge")}
            </span>
          )}
        </div>
      ),
    },
    {
      name: t("common:status"),
      cell: (row: any) => {
        const isActive =
          row.status === "ACTIVE" || row.status === "active" || row.status === "Active";
        return (
          <div
            style={{
              padding: "5px 12px",
              borderRadius: "32px",
              fontSize: "11px",
              fontWeight: "600",
              backgroundColor: isActive ? "var(--color-success)" : "var(--color-error)",
              color: "white",
              textAlign: "center",
              width: "80px",
            }}
          >
            {isActive ? t("common:active") : t("common:inactive")}
          </div>
        );
      },
    },
    {
      name: t("common:actions"),
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            type="primary"
            className="gradient-btn"
            style={{
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("account.select")} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const toggleAccountStatus = async (row: any) => {
    const isActive = row.status === "ACTIVE" || row.status === "active" || row.status === "Active";
    const apiCall = isActive ? deleteChartOfAccount(row?.id) : activateChartOfAccount(row?.id);
    const failedMsg = isActive
      ? t("account.toast.deactivateFailed")
      : t("account.toast.activateFailed");

    toast.promise(apiCall, {
      loading: isActive
        ? t("account.toast.deactivatingAccount")
        : t("account.toast.activatingAccount"),
      success: (response) => {
        if (
          response?.data?.message === "success" ||
          response?.status === 200 ||
          response?.status === 204
        ) {
          ledgerAccount();
          setShowPopup(false);
          setEditRowId("");
          return isActive
            ? t("account.toast.deactivatedSuccess")
            : t("account.toast.activatedSuccess");
        } else {
          throw new Error(response?.data?.message || failedMsg);
        }
      },
      error: (error) => error?.message || failedMsg,
    });
  };

  const ledgerAccount = async () => {
    const dates = {
      from: fromDate?.toISOString(),
      to: toDate?.toISOString() ?? fromDate?.toISOString(),
    };
    try {
      setLoading(true);
      const response = await getLedgerAccount(page, pageSize, searchValue, dates);
      if (response) {
        const data = response.data.data || [];
        setLedgerData(data);
        setcsvData(data);

        // Backend may return either { pagination: { totalElements, totalPages } }
        // (new shape) or { pageInfo: { totalItems } } (legacy). Use whichever
        // is present; otherwise fall back to the page's row count.
        const pagination = response?.data?.pagination;
        const pageInfo = response?.data?.pageInfo;
        let total = 0;
        if (pagination?.totalElements != null) {
          total = pagination.totalElements;
          setTotalPage(pagination.totalPages || Math.max(1, Math.ceil(total / pageSize)));
        } else if (pageInfo?.totalItems != null) {
          total = pageInfo.totalItems;
          setTotalPage(Math.max(1, Math.ceil(total / pageSize)));
        } else {
          total = data.length;
          setTotalPage(Math.max(1, Math.ceil(total / pageSize)));
        }
        setTotalRows(total);
        setFrom(total > 0 ? (page - 1) * pageSize + 1 : 0);
        setTo(Math.min(page * pageSize, total));
      }
    } catch (error: any) {
      toast.error(error?.message);
      // Reset pagination values on error
      setTotalRows(0);
      setTotalPage(1);
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
        accountNameAr: item.accountNameAr || "",
        accountCode: item.accountCode,
        accountType: item.accountType,
        status: item.status,
        // Real values since the COA became a tree: a header is a grouping node
        // that rejects postings, so it can never be a journal line's account.
        isHeader: !!item.isHeader,
        isManualEntriesAllowed: item.isManualEntriesAllowed !== false,
        parentAccountId: item.parentAccountId ?? null,
        hierarchyLevel: item.hierarchyLevel ?? 0,
        id: item.id,
      };
    });
  // Reset to page 1 whenever a filter changes so we always start at the top
  // of the new result set.
  useEffect(() => {
    setPage(1);
  }, [searchValue, fromDate, toDate]);

  useEffect(() => {
    if (initialRendor) {
      const timeoutId = setTimeout(() => {
        ledgerAccount();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, searchValue, loader, fromDate, toDate]);
  return (
    <div>
      {/* {loading && <Loader />} */}

      <div className="cs-table mt-2">
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          totalPage={totalPage}
          from={from}
          to={to}
          header={Account_Documents_List_Header}
          data={mappedData}
          style={{ borderRadius: "2px" }}
          isLoading={loading}
          paginationShow={true}
        />
      </div>

      <Modal
        backdrop="static"
        keyboard={false}
        show={showPopup}
        onHide={() => {
          setShowPopup(false);
        }}
      >
        <Modal.Header closeButton>{/* <Modal.Title>Are you sure?</Modal.Title> */}</Modal.Header>
        <Modal.Body>
          {/* Additional content goes here */}
          {showPopup && (
            <div>
              <div
                className="d-flex justify-content-center"
                style={{ fontSize: "20px", fontWeight: "600" }}
              >
                {t("common:areYouSure")}
              </div>
              <p className="text-center pt-3">{t("account.cannotUndo")}</p>
              {/* Add more details as needed */}
            </div>
          )}
          <div className="col-12 gap-2 d-flex justify-content-center">
            <Button
              className="col-4 d-flex cursor-pointer application-btn justify-content-center"
              onClick={() => {
                toggleAccountStatus(editRowId);
              }}
            >
              {t("common:yes")}
            </Button>

            <Button
              className="cursor-pointer invoice-btn col-4 d-flex justify-content-center"
              onClick={() => {
                setShowPopup(false);
              }}
            >
              {t("common:no")}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        backdrop="static"
        keyboard={false}
        show={updateModel}
        onHide={() => {
          setUpdateModel(false);
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title">{t("account.updateTitle")}</Modal.Title>
          <div className="cursor-pointer" onClick={() => setUpdateModel(false)}>
            <img /* src={Images.closeBtn} */ alt="" />
          </div>
        </Modal.Header>
        <Modal.Body className="">
          <div className="row py-2">
            <div className="col-6">
              <h6 className="">{t("account.name")}</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={accountTitle}
                onChange={(e: any) => setaccountTitle(e.target.value)}
              />
            </div>
            <div className="col-6">
              <h6 className="">{t("account.nameArabic")}</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={accountNameAr}
                onChange={(e: any) => setAccountNameAr(e.target.value)}
              />
            </div>
          </div>

          <button
            style={{ float: "right" }}
            className="theme-btn-next"
            onClick={() => updateAccount()}
          >
            {t("account.updateBtn")}
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
  const { t } = useTranslation("accountingLoans");
  const [accountCode, setaccountCode] = useState<any>(null);
  const [accountTitle, setaccountTitle] = useState<any>(null);
  const [accountNameAr, setAccountNameAr] = useState<any>(null);
  const [accountType, setAccountType] = useState<any>(null);
  const [parentAccountCode, setParentAccountCode] = useState<any>(null);
  const [isHeader, setIsHeader] = useState(false);
  const { Option } = Select;

  const addAccount = async (e: any) => {
    e.preventDefault();

    let body: any = {
      accountCode,
      accountName: accountTitle,
      accountNameAr: accountNameAr || null,
      accountType,
      parentAccountCode: parentAccountCode || null,
      isHeader,
    };

    toast.promise(addAccountLedger(body), {
      loading: t("account.toast.processing"),
      success: (response) => {
        if (
          response?.data?.message === "success" ||
          response?.status === 201 ||
          response?.status === 200
        ) {
          setAddGroupMod(false);
          return t("account.toast.createSuccess");
        } else {
          throw new Error(response?.data?.message || t("account.toast.createFailed"));
        }
      },
      error: (error) => error?.message || t("account.toast.createFailed"),
    });
  };

  return (
    <Modal
      backdrop="static"
      keyboard={false}
      show={modal}
      centered
      onHide={() => {
        setModal(false);
      }}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title className="modal-title">{t("account.addTitle")}</Modal.Title>
        <div className="cursor-pointer" onClick={() => setModal(false)}>
          <img /* src={Images.closeBtn} */ alt="" />
        </div>
      </Modal.Header>
      <Modal.Body className="">
        <form className="container" onSubmit={(e) => addAccount(e)}>
          <div className="row py-2">
            <div className="col">
              <h6 className="">{t("account.code")}</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={accountCode}
                onChange={(e: any) => setaccountCode(e.target.value)}
              />
            </div>
            <div className="col">
              <h6 className="">{t("account.name")}</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={accountTitle}
                onChange={(e: any) => setaccountTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="row py-2">
            <div className="col">
              <h6 className="">{t("account.nameArabic")}</h6>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={accountNameAr}
                onChange={(e: any) => setAccountNameAr(e.target.value)}
              />
            </div>
            <div className="col">
              <h6 className="">{t("account.type")}</h6>
              <Select
                className="w-full"
                value={accountType}
                onChange={(value: any) => setAccountType(value)}
                placeholder={t("account.selectType")}
              >
                <Option value="ASSET">{t("account.typeAsset")}</Option>
                <Option value="LIABILITY">{t("account.typeLiability")}</Option>
                <Option value="INCOME">{t("account.typeIncome")}</Option>
                <Option value="EXPENSE">{t("account.typeExpense")}</Option>
                <Option value="EQUITY">{t("account.typeEquity")}</Option>
              </Select>
            </div>
          </div>
          <div className="row py-2">
            <div className="col">
              <h6 className="">{t("account.parentCode")}</h6>
              <Select
                showSearch
                className="w-full"
                value={parentAccountCode}
                onChange={(value: any) => setParentAccountCode(value)}
                placeholder={t("account.selectParent")}
                allowClear
              >
                {/* Only a header can group other accounts under it. */}
                {mappedData
                  ?.filter((item: any) => item.isHeader)
                  .map((item: any) => (
                    <Option key={item.accountCode} value={item.accountCode}>
                      {item.accountCode} - {item.accountTitle}
                    </Option>
                  ))}
              </Select>
            </div>
            <div className="col d-flex align-items-center gap-2 pt-4">
              <Checkbox checked={isHeader} onChange={(e: any) => setIsHeader(e.target.checked)} />
              <h6 className="mb-0">{t("account.isHeader")}</h6>
            </div>
          </div>

          <button type="submit" style={{ float: "right" }} className="theme-btn-next">
            {t("account.addBtn")}
          </button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
