import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";

import TableView from "../../components/TableView/TableView";
import { Types_Reasons_Header } from "../../components/Config/TableHeaders";
import { Input, Select, Switch } from "antd";
import { Dropdown, Modal, ModalBody } from "react-bootstrap";
import { Images } from "../../components/Config/Images";
import { useEffect, useMemo, useState } from "react";
import {
  createEmployeeRole,
  editEmployeeRole,
  getAllEmployeeRole,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const data = [
  {
    DepartmentName: "kajbdsf",
    email: "ufgh@gmail.com",
    status: "Active",
    department: "11@gmail.com",
    role: "--",
  },
  {
    DepartmentName: "kajbdsf",
    email: "ufgh@gmail.com",
    status: "InActive",
    department: "11@gmail.com",
    role: "--",
  },
];
const ManageRoles = () => {
  const checkReduxState = useSelector((state: RootState) => state.block.check);
  const [addDialog, setAddDialog] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [allEmployeeRole, setAllEmployeeRole] = useState<any>("");
  const [addRoleName, setAddRoleName] = useState<any>();
  const [addRoleStatus, setAddRoleStatus] = useState<any>(false);
  const [addRoleId, setAddRoleId] = useState<any>("");
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const fetchPoolCards = async () => {
    try {
      const response: any = await getAllEmployeeRole();
      if (response?.data?.notificationMessage) {
        setAllEmployeeRole(response?.data?.data);
      } else if (response?.data?.data?.errorMessage) {
        toast.error(response?.data[0]?.errorMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const mappedData =
    allEmployeeRole &&
    allEmployeeRole?.map((item: any) => {
      return {
        name: item?.name ? item?.name : "-",

        status: item?.status,

        id: item?.id,
      };
    });
  const statusChange = async (row: any) => {
    try {
      const newStatus = row.status ? false : true;
      const id = row.id;
      const body = {
        id: id,
        status: newStatus,
        name: row.name,
      };

      let res = await editEmployeeRole(body);
      if (res?.data?.notificationMessage) {
        toast.success(res?.data?.notificationMessage);
        fetchPoolCards();
      } else if (res?.data[0]?.errorMessage) {
        toast.error(res?.data[0]?.errorMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const handleChnage = (item: any, row: any) => {
    if (item.label == "Edit") {
      navigate(`/lms/editRole/${row.id}`);

      setAddRoleName(row.name);
      setAddRoleStatus(row.status);
      setAddRoleId(row.id);
      // setUpdateDialog(true);
    } else if (item.label == "Delete") {
      setDeleteDialog(true);
    }
  };
  const createEmployee = async () => {
    try {
      const body = {
        status: addRoleStatus,
        name: addRoleName ? addRoleName : "",
      };
      let res = await createEmployeeRole(body);
      if (res?.data?.notificationMessage) {
        toast.success(res?.data?.notificationMessage);
        setAddDialog(false);
        fetchPoolCards();
      } else if (res?.data[0]?.errorMessage) {
        toast.error(res?.data[0]?.errorMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const actionSelect = [{ label: "Edit", img: Images.edit }];
  const Departments_Header = [
    {
      name: "User Name",
      selector: (row: { name: any }) => row.name,
    },

    {
      name: "Status",
      selector: (row: { status: any }) => row.status,
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "6px",
            backgroundColor: row.status
              ? "rgba(146, 188, 131, 1)"
              : "rgba(55, 52, 53, 1)",

            color: "rgba(255, 255, 255, 1)",
            cursor: row.status === "Active" ? "pointer" : "default",
          }}
        >
          {row.status ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      name: "Change Status",
      selector: (row: { Status: any }) => row.Status,
      cell: (row: any, index: any) => (
        <div>
          <Switch
            checked={row.status}
            onChange={() => {
              statusChange(row);
            }}
          />
        </div>
      ),
    },
    {
      name: "Action",
      selector: (row: { Action: any }) => row.Action,
      cell: (row: any) => (
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Select
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {actionSelect.map((item, index) => (
              <Dropdown.Item>
                <>
                  <div
                    className="d-flex"
                    onClick={() => {
                      handleChnage(item, row);
                    }}
                  >
                    <div className="col-2">
                      <img src={item.img} alt="" />
                    </div>

                    {item.label}
                  </div>
                </>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      ),
    },
  ];
  const onSearchHandle = (e: any) => {
    setSearchValue(e.target.value);
    setAllEmployeeRole(filteredClients);
    // setClientList(filteredClients)
  };
  const filteredClients = useMemo(() => {
    return (
      allEmployeeRole &&
      allEmployeeRole.filter(
        (client: any) =>
          client.name &&
          client.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  }, [allEmployeeRole, searchValue]);
  useEffect(() => {
    {
      searchValue == "" && fetchPoolCards();
    }
  }, [searchValue]);
  return (
    <>
      <div className="cs-table">
        <div className="col-lg-12 col-12 d-flex align-items-center pb-3">
          <h2 className="col-lg-4 col-12 fs-6 fw-bold  d-flex justify-content-start ">
            Manage Role
          </h2>
          <div className="col-lg-8 col-12 d-flex justify-content-end align-items-center">
            {/* <Select
              style={{ width: "250px", height: "38px" }}
              placeholder="Type here"
              className="search-bar"
            /> */}

            <div className="d-flex">
              <input
                type="text"
                placeholder="Type here"
                className="search-icon form-control search-bar"
                value={searchValue}
                onChange={onSearchHandle}
              />
            </div>
            <div
              onClick={() => {
                setAddDialog(true);
              }}
              className="theme-btn-next"
            >
              Add New Role
            </div>
          </div>
        </div>
        <TableView header={Departments_Header} data={mappedData} />
      </div>
      <Modal show={addDialog} size="lg">
        <Modal.Header closeButton onClick={() => setAddDialog(!addDialog)}>
          <Modal.Title>Add New Role</Modal.Title>
        </Modal.Header>
        <ModalBody>
          <div className="d-flex gap-5">
            <div className="form-group form-label-groups col-md-6 d-grid">
              User Name
              <Input
                placeholder="Department Name"
                className="p-2 mt-2"
                onChange={(e: any) => {
                  setAddRoleName(e?.target?.value);
                }}
              />
            </div>
            <div className="form-group form-label-groups col-md-6 d-flex align-items-center mt-3">
              <Switch
                checked={addRoleStatus}
                onChange={(checked) => {
                  setAddRoleStatus(checked);
                }}
              />
              <label
                className="ps-3"
                htmlFor="receiver"
                style={{ fontSize: "14px", fontWeight: "500" }}
              >
                Active/InActive
              </label>
            </div>
          </div>

          <div className="col-12 d-flex justify-content-end border-top">
            <button
              className="theme-btn-next mt-3"
              onClick={() => {
                createEmployee();
              }}
            >
              Add Role
            </button>
          </div>
        </ModalBody>
      </Modal>
      {/* <Modal show={updateDialog} size="lg">
        <Modal.Header
          closeButton
          onClick={() => setUpdateDialog(!updateDialog)}
        >
          <Modal.Title>Edit Role Detials</Modal.Title>
        </Modal.Header>
        <ModalBody>
          <div className="d-flex gap-5">
            <div className="form-group form-label-groups col-md-6 d-grid">
              User Name
              <Input
                placeholder="Enter Name"
                className="p-2 mt-2"
                onChange={(e: any) => {
                  setAddRoleName(e?.target?.value);
                }}
                value={addRoleName}
              />
            </div>
            <div className="form-group form-label-groups col-md-6 d-flex align-items-center mt-3">
              <Switch
                checked={addRoleStatus}
                onChange={(checked) => {
                  setAddRoleStatus(checked);
                }}
              />
              <label
                className="ps-3"
                htmlFor="receiver"
                style={{ fontSize: "14px", fontWeight: "500" }}
              >
                Status
              </label>
            </div>
          </div>

          <div className="col-12 d-flex justify-content-end border-top">
            <button
              className="theme-btn mt-3"
              onClick={() => {
                updateEmployee();
              }}
            >
              Save Changes
            </button>
          </div>
        </ModalBody>
      </Modal> */}
    </>
  );
};
export default ManageRoles;
