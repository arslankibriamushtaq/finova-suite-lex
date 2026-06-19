import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import TableView from "../../components/TableView/TableView";
import DynamicHeaderStructure from "../../components/DynamicHeaderStructure";
import { Input, Select, Switch } from "antd";
import { Dropdown, Modal, ModalBody, Row } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import {
  createDepartment,
  editDepartment,
  getDepartments,
} from "../../redux/apis/apisCrud";
import { log } from "console";
import Loader from "../../components/Loader/Loader";
import toast from "react-hot-toast";
import { Images } from "../../components/Config/Images";
import { useNavigate } from "react-router-dom";
type Department = {
  id: string;
  DepartmentName: string;
  ByDefault: string;
  Status: string;
  ChangeStatus: string;
  Action: string;
};

const Departments = () => {
  const [departmentModal, setDepartmentModal] = useState(false);
  const [departmentData, setDepartmentData] = useState<Department[]>([]);
  const [loader, setLoader] = useState(false);
  const [addDepartmentData, setAddDepartmentData] = useState<any>({
    DepartmentName: "",
    bydefault: false,
    status: false,
  });
  const [searchInput, setSearchInput] = useState("");
  const actionSelect = [{ label: "Edit", img: Images.edit }];
  const navigate = useNavigate();
  const Departments_Header = [
    {
      name: "Department Name",
      selector: (row: { DepartmentName: any }) => row.DepartmentName,
    },
    // {
    //   name: "By Default",
    //   selector: (row: { ByDefault: any }) => row.ByDefault,
    //   cell: (row: any) => (
    //     <div
    //       style={{
    //         padding: "0.22rem 1rem",
    //         borderRadius: "6px",
    //         backgroundColor: row.ByDefault ? "#92BC83" : "#373435",
    //         color: "white",
    //       }}
    //     >
    //       {row.ByDefault ? "Active" : "Inactive"}
    //     </div>
    //   ),
    // },
    {
      name: "Status",
      selector: (row: { Status: any }) => row.Status,
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "6px",
            backgroundColor: row.Status ? "var(--color-success)" : "var(--color-error)",
            color: "white",
          }}
        >
          {row.Status ? "Active" : "InActive"}
        </div>
      ),
    },
    {
      name: "Action",
      selector: (row: { ChangeStatus: any }) => row.ChangeStatus,
      cell: (row: any, index: any) => (
        <div>
          <Switch
            checked={row.Status}
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
  const handleChnage = (item: any, row: any) => {
    if (item.label == "Edit") {
      navigate(`/lms/editdepartment/${row.id}`);
    } else {
    }
  };
  const getApiDepartmentData = (data: any) => {
    return (
      data?.data &&
      data?.data.map(
        (item: { name: any; bydefault: any; status: any; id: any }) => ({
          DepartmentName: item.name,
          // ByDefault: item.bydefault,
          Status: item.status,
          ChangeStatus: item.status,
          Action: "--",
          id: item.id,
        })
      )
    );
  };
  const statusChange = async (row: any) => {
    try {
      const newStatus = row.Status ? false : true;
      const id = row.id;
      const body = {
        id: id,
        status: newStatus,
        departmentName: row.DepartmentName,
        ByDefault: row.ByDefault,
      };

      let res = await editDepartment(body);
      if (res?.data?.notificationMessage) {
        getDepartments();
        setDepartmentData((prevDepartments: any) =>
          prevDepartments.map((dept: any) =>
            dept.id === id ? { ...dept, Status: newStatus } : dept
          )
        );
      } else if (res?.data?.errors) {
        toast.error(res?.data?.errors[0]);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const getAllDepartment = async () => {
    try {
      let res = await getDepartments();
      if (res?.data?.notificationMessage) {

        if (res?.data != null) {
          const mappedData = getApiDepartmentData(res?.data);
          setDepartmentData(mappedData);
        }
      } else if (res?.data?.errors) {
        toast.error(res?.data?.errors[0]);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const createDepartmentStatus = async () => {
    try {
      const body = {
        status: addDepartmentData.status,
        departmentName: addDepartmentData.DepartmentName,
        ByDefault: addDepartmentData.bydefault,
      };
      let res = await createDepartment(body);
      if (res?.data?.notificationMessage) {
        getAllDepartment();
        toast.success(res?.data?.notificationMessage);
        setDepartmentModal(false);
      } else if (res?.data?.errors) {
        toast.error(res?.data.errors[0]);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const onSearchInput = (e: any) => {
    setSearchInput(e.target.value);
    setDepartmentData(handleSearchInputChange);
    // setClientList(filteredClients)
  };
  const handleSearchInputChange = useMemo(() => {
    return (
      departmentData &&
      departmentData.filter(
        (client: any) =>
          client.DepartmentName &&
          client.DepartmentName.toLowerCase().includes(
            searchInput.toLowerCase()
          )
      )
    );
  }, [departmentData, searchInput]);

  useEffect(() => {
    {
      searchInput == "" && getAllDepartment();
    }
  }, [searchInput]);
  return (
    <>
      <div className="cs-table">
        {loader && <Loader />}
        <div className="col-12 d-flex justify-content-center mb-3">
          <div className="col-5">
            <h3>Departments</h3>
          </div>
          <div className="col-7 d-flex justify-content-end gap-2">
            <div className="col-4">
              <Input
                placeholder="Type here"
                className="p-2"
                value={searchInput}
                onChange={onSearchInput}
              />
            </div>
            <button
              className="theme-btn-next"
              onClick={() => {
                setDepartmentModal(true);
              }}
            >
              +Add Departments
            </button>
          </div>
        </div>
        <TableView header={Departments_Header} data={departmentData} />
      </div>

      <Modal show={departmentModal} size="lg">
        <Modal.Header
          closeButton
          onClick={() => {
            setDepartmentModal(false);
          }}
        >
          <h3> Add Department</h3>
        </Modal.Header>
        <ModalBody>
          <div className="d-flex gap-5">
            <div className="col-6">
              Department Name{" "}
              <Input
                placeholder="Department Name"
                className="p-2 mt-1"
                onChange={(e: any) => {
                  setAddDepartmentData({
                    ...addDepartmentData,
                    DepartmentName: e.target.value,
                  });
                }}
              />
            </div>
            {/* <div className="col-6 d-flex align-items-center mt-3">
              <Switch
                checked={addDepartmentData.bydefault}
                onChange={(checked) => {
                  setAddDepartmentData({
                    ...addDepartmentData,
                    bydefault: checked,
                  });
                }}
              />
              <div className="ps-2">By Default</div>
            </div> */}
          </div>
          <div className="col-6 d-flex align-items-center mt-3 mb-3">
            <Switch
              checked={addDepartmentData.status}
              onChange={(checked) => {
                setAddDepartmentData({
                  ...addDepartmentData,
                  status: checked,
                });
              }}
            />
            <div className="ps-2">Active/inactive</div>
          </div>
          <div className="col-12 d-flex justify-content-end border-top">
            <button
              className="theme-btn-next mt-3"
              onClick={createDepartmentStatus}
            >
              Add department
            </button>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};
export default Departments;
