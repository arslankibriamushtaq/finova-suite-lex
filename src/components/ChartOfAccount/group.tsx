import React, { useState, useCallback, useEffect } from "react";
import { Input, Menu, Checkbox, Select } from "antd";
import { FaSearch } from "react-icons/fa";
import TableView from "../TableView/TableView";
import BuisnessModal from "../Customers/Modals/BuisnessModal";
import { useNavigate } from "react-router-dom";
import TableHeaderFilter from "../TableHeaderFilter";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import CallActivity from "../CustomerManagemnt/CallActivity";
import toast from "react-hot-toast";
import { getGroupLedger, addGroupLedger } from "../../redux/apis/apisCrud";
import { Modal } from "react-bootstrap";
import { Images } from "../Config/Images";
import Loader from "../Loader/Loader";
const Group = () => {
  const [searchValue, setSearchValue] = useState("");

  const [addGroupMod, setAddGroupMod] = useState(false);
  const [editRowId, setEditRowId] = useState(null);

  const [editFormData, setEditFormData] = useState<any>({});
  const [groupLedgerData, setGroupLedgerData] = useState<any>();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const customSearchInput = (
    <Input
      placeholder="Search"
      value={searchValue}
      prefix={<FaSearch />}
      onChange={(e) => setSearchValue(e.target.value)}
    />
  );

  const Account_Documents_List_Header = [
    {
      name: "Group Name",
      selector: (row: { accountGroupName: any }) => row.accountGroupName,
    },
    {
      name: "Group Type",
      selector: (row: { groupType: any }) => row.groupType,
    },
    {
      name: "Parent Group",
      selector: (row: { parentGroup: any }) => row.parentGroup || "N/A",
    },
  ];

  useEffect(() => {
    ledgerAcoount();
  }, [page, pageSize]);

  const [loading, setLoading] = useState(false);

  const ledgerAcoount = async () => {
    try {
      setLoading(true);
      const response = await getGroupLedger(page, pageSize);
      if (response) {
        const data = response.data.data;
        setGroupLedgerData(data || []);
        setTotalRows(response?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const mappedData =
    groupLedgerData &&
    groupLedgerData.map((item: any) => {
      return {
        accountGroupName: item.accountGroupName,
        groupType: item.groupType,
        parentGroup: item.parentGroup,
      };
    });

  const button = [{ title: "view" }];

  return (
    <div>
      {loading && <Loader />}
      <div className="flex justify-content-between align-items-center col-15">
        <TableHeaderFilter
          searchInput={customSearchInput}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />

        <button className="theme-btn-next" onClick={() => setAddGroupMod(true)}>
          + Add Group
        </button>
      </div>

      <div className="cs-table p-2 mt-3">
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Account_Documents_List_Header}
          data={mappedData}
        />
      </div>

      <AddGroupModal
        modal={addGroupMod}
        setModal={setAddGroupMod}
        mappedData={mappedData}
      />
    </div>
  );
};

export default Group;

function AddGroupModal({ modal, setModal, mappedData }) {
  const [errors, setErrors] = useState([]);

  const [accountGroupName, setaccountGroupName] = useState(null);
  const [narration, setnarration] = useState(null);
  const [isDefault, setisDefault] = useState(false);
  const [nature, setnature] = useState(null);
  const [affectGrossProfit, setaffectGrossProfit] = useState(null);
  const [modifyBy, setmodifyBy] = useState(null);
  const [groupType, setgroupType] = useState(null);
  const [parentGroup, setparentGroup] = useState(null);
  const [parentGroupId, setparentGroupId] = useState(null);

  const addGroup = async (e: any) => {
    e.preventDefault();

    // Prepare the request body
    let body: any = {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      accountGroupName,
      narration,
      isDefault,
      nature,
      affectGrossProfit,
      modifyBy,
      groupType,
    };

    if (parentGroup) body.parentGroup = parentGroup;
    if (parentGroupId) body.parentGroupId = parentGroupId;

    // Use toast.promise to manage different states
    await toast.promise(
      addGroupLedger(body), // The API call
      {
        loading: "Adding group...", // Loading message
        success: (response) => {
          if (response?.data?.data) {
            return "Group added successfully!";
          } else {
            throw new Error("Failed to add group.");
          }
        },
        error: (err) => err?.message || "Something went wrong!",
      }
    );
  };


  return (
    <Modal show={modal} centered size="lg">
      <Modal.Header>
        <Modal.Title className="modal-title">Add Group</Modal.Title>
        <div className="cursor-pointer" onClick={() => setModal(false)}>
          <img src={Images.closeBtn} alt="" />
        </div>
      </Modal.Header>
      <Modal.Body className="">
        <form className="container" onSubmit={(e) => addGroup(e)}>
          <div className="row py-2">
            <div className="col">
              <div className="py-2">Account Group Name</div>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={accountGroupName}
                onChange={(e) => setaccountGroupName(e.target.value)}
              />
              {errors.includes("accountGroupName") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div>

            <div className="col">
              <div className="py-2">Narration</div>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={narration}
                onChange={(e) => setnarration(e.target.value)}
              />
              {errors.includes("narration") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div>
          </div>

          <div className="row py-2">
            <div className="col">
              <div className="py-2">Set as Default?</div>
              <Checkbox
                className="w-fit p-2"
                value={isDefault}
                onChange={(e) => setisDefault(e.target.value)}
              />
              {errors.includes("isDefault") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div>

            <div className="col">
              <div className="py-2">Nature</div>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={nature}
                onChange={(e) => setnature(e.target.value)}
              />
              {errors.includes("nature") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div>
          </div>

          <div className="row py-2">
            <div className="col">
              <div className="py-2">Affect Gross Profit</div>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={affectGrossProfit}
                onChange={(e) => setaffectGrossProfit(e.target.value)}
              />
              {errors.includes("affectGrossProfit") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div>

            <div className="col">
              <div className="py-2">Modified By</div>
              <Input
                type="text"
                className="w-3/4 border p-2"
                value={modifyBy}
                onChange={(e) => setmodifyBy(e.target.value)}
              />
              {errors.includes("modifyBy") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div>
          </div>

          <div className="row py-2">
            <div className="col">
              <div className="py-2">Group Type</div>
              <Select value={groupType} onChange={setgroupType}>
                <Select.Option value="0">Liabilities</Select.Option>
                <Select.Option value="1">Assets</Select.Option>
                <Select.Option value="2">Income</Select.Option>
                <Select.Option value="3">Expenses</Select.Option>
              </Select>
              {errors.includes("") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div>

            <div className="col">
              <div className="py-2">Parent Group</div>
              <Select value={parentGroup} onChange={setparentGroup}>
                {mappedData?.length ? (
                  mappedData?.map((group: any, index: any) => (
                    <Select.Option key={index} value="0">
                      {group?.accountGroupName || "Name"}
                    </Select.Option>
                  ))
                ) : (
                  <Select.Option value="" className="text-center p-3" disabled>
                    No Groups found!
                  </Select.Option>
                )}
              </Select>
              {errors.includes("") ? (
                <div className="pt-1 text-danger fs-12"></div>
              ) : (
                <div className="pt-1 group-fs">No Error</div>
              )}
            </div>
          </div>

          <button
            style={{ float: "right" }}
            className="theme-btn-next"
            onClick={() => setModal(false)}
          >
            Add Group
          </button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
