import React, { useEffect, useState } from "react";
import { Input, Select, Switch } from "antd";
import {
  assignPermissionToRole,
  editEmployeeRole,
  getAllEmployeeRole,
  getAllModules,
  getAllPermission,
  getPermissionsForRole,
  getPermissionsRoleId,
  updatePermissionToRole,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const EditManageRole: React.FC = () => {
  const [createAssignPermission, setCreateAssignPermission] = useState(false);
  const [selectedSubOptions, setSelectedSubOptions] = useState<any>({});
  const [roleId, setRoleId] = useState<any>("");
  const [categoryData, setCategoryData] = useState<any>("");
  const [moduleData, setModuleData] = useState<any>("");
  const [permissionData, setPermissionData] = useState<any>("");
  const [addRoleName, setAddRoleName] = useState<any>();
  const [addRoleStatus, setAddRoleStatus] = useState<any>(false);
  const { Option } = Select;
  const id = useParams();
  const fetchPoolCardsRole = async () => {
    try {
      const response: any = await getAllEmployeeRole();
      if (response?.data?.notificationMessage) {
        setCategoryData(response?.data?.data);
      } else if (response?.data?.data[0]?.errorMessage) {
        toast.error(response?.data[0]?.errorMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const fetchModules = async () => {
    try {
      const response: any = await getAllModules(1, 1000);
      if (response?.data?.notificationMessage) {
        setModuleData(response?.data?.data);
      } else if (response?.data?.data[0]?.errorMessage) {
        toast.error(response?.data[0]?.errorMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response: any = await getAllPermission();
      if (response?.data?.notificationMessage) {
        setPermissionData(response?.data?.data);
      } else if (response?.data?.data[0]?.errorMessage) {
        toast.error(response?.data[0]?.errorMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const createPermissions = async () => {
    let data = {
      roleId: roleId,
      assignPermissionsModule: Object.keys(selectedSubOptions).map(
        (moduleId) => ({
          moduleId: moduleId,
          permissionIds: selectedSubOptions[moduleId] || [],
        })
      ),
    };
    try {
      const response: any = await assignPermissionToRole(data);
      if (response?.data?.notificationMessage) {
        setCreateAssignPermission(false);
        toast.success(response?.data?.notificationMessage);
      } else if (response?.data?.data[0]?.errorMessage) {
        toast.error(response?.data[0]?.errorMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const updatePermissions = async () => {
    let data = {
      roleId: id.id,
      assignPermissionsModule: Object.keys(selectedSubOptions).map(
        (moduleId) => ({
          moduleId: moduleId,
          permissionIds: selectedSubOptions[moduleId] || [],
        })
      ),
    };
    try {
      const response: any = await updatePermissionToRole(data);
      if (response?.data?.notificationMessage) {
        toast.success(response?.data?.notificationMessage);
      } else if (response?.data?.data[0]?.errorMessage) {
        toast.error(response?.data[0]?.errorMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  useEffect(() => {
    fetchPoolCardsRole();
    fetchModules();
    fetchPermissions();
    fetchRolePermissions(id.id);
    fetchRoleDetails(id.id);
  }, []);

  const fetchRolePermissions = async (roleId: any) => {
    try {
      const response: any = await getPermissionsForRole(roleId);
      if (response.data.data != null) {
        const rolePermissions = response?.data?.data;
        const selectedSubOptions =
          rolePermissions &&
          rolePermissions?.reduce((acc: any, perm: any) => {
            if (!acc[perm.moduleId]) {
              acc[perm.moduleId] = [];
            }
            acc[perm.moduleId].push(perm.permissionId);
            return acc;
          }, {});

        setSelectedSubOptions(selectedSubOptions);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const handleChangeRole = (event: any) => {
    if (event) {
      const selectedId = event;
      setRoleId(selectedId);
      fetchRolePermissions(selectedId);
    } else {
      console.error("Invalid event structure", event);
    }
  };

  const handleSwitchChange = (moduleId: any, permissionIds: any) => {
    setSelectedSubOptions((prev: any) => {
      if (prev[moduleId]) {
        const { [moduleId]: _, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [moduleId]: permissionIds };
      }
    });
  };

  const handleSubOptionChange = (moduleId: any, permissionId: any) => {
    setSelectedSubOptions((prevSelectedSubOptions: any) => {
      const modulePermissions = prevSelectedSubOptions[moduleId] || [];
      const newModulePermissions = modulePermissions.includes(permissionId)
        ? modulePermissions.filter((item: any) => item !== permissionId)
        : [...modulePermissions, permissionId];

      return {
        ...prevSelectedSubOptions,
        [moduleId]: newModulePermissions,
      };
    });
  };

const handleAssignAllPermissions = (
  moduleId: any,
  permissionIds: any[],
) => {
  setSelectedSubOptions((prevSelectedSubOptions: any) => {
    const existingPermissions = prevSelectedSubOptions[moduleId] || [];

    if (!createAssignPermission) {
      // Merge permissions, avoid duplicates
      const updatedPermissions = Array.from(
        new Set([...existingPermissions, ...permissionIds])
      );

      return {
        ...prevSelectedSubOptions,
        [moduleId]: updatedPermissions,
      };
    } else {
      // Remove only the specified permissionIds, keep others
      const updatedPermissions = existingPermissions.filter(
        (perm: any) => !permissionIds.includes(perm)
      );

      if (updatedPermissions.length === 0) {
        const { [moduleId]: _, ...rest } = prevSelectedSubOptions;
        return rest;
      }

      return {
        ...prevSelectedSubOptions,
        [moduleId]: updatedPermissions,
      };
    }
  });
};


  const mergeModulesWithPermissions = (modules: any, permissions: any) => {
    return (
      modules &&
      modules?.map((module: any) => {
        const matchingPermission =
          permissions &&
          permissions?.find(
            (permission: any) => permission.moduleId === module.id
          );
        if (matchingPermission) {
          return {
            ...module,
            permissionLists: matchingPermission.permissionLists,
          };
        } else {
          return module;
        }
      })
    );
  };

  const mergedResult = mergeModulesWithPermissions(moduleData, permissionData);
  const fetchRoleDetails = async (roleId: any) => {
    try {
      const response: any = await getPermissionsRoleId(roleId);
      if (response && response.data) {
        setAddRoleName(response.data.name);
        setAddRoleStatus(response.data.status);
        // getAllEmployeeRole();
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  return (
    <div className="">
      <div className="col-12 d-flex align-items-center pb-3 pt-3">
        <div
          className=""
          style={{ fontSize: "16px", lineHeight: "16px", fontWeight: "600" }}
        >
          Manage Permissions
        </div>
      </div>
      <div className="border-bottom pt-2"></div>
      <div
        className="mt-4 mb-3 "
        style={{ fontSize: "18px", lineHeight: "12px", fontWeight: "500" }}
      >
        Edit Role
      </div>

      <div className="d-flex gap-5 ">
        <div className="form-group form-label-groups col-md-6 d-grid">
          Change Role Name
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
            Active/InActive
          </label>
        </div>
      </div>
      <div className="col-12  d-flex justify-content-between border-top p-2 ">
        <h6 className="col-9 mt-2">Assign permissions</h6>
        <div
          className="col-3 d-flex justify-content-end"
          style={{ border: "1px solid black", borderRadius: "2px" }}
        >
          <div className="d-flex justify-content-between align-items-center p-1 mb-2">
            <div className="me-5">Assign all permision</div>
            <Switch
              checked={createAssignPermission}
              onChange={() => {
                setCreateAssignPermission(!createAssignPermission);
                // Handle assigning all permissions
                mergedResult.forEach((module: any) => {
                  handleAssignAllPermissions(
                    module.id,
                    module.permissionLists.map(
                      (subitem: any) => subitem.permissionId
                    )
                  );
                });
              }}
            />
          </div>
        </div>
      </div>
      <div className="border-bottom mb-3"></div>

      <div className="row permision-card mt-1 p-2">
        {mergedResult &&
          mergedResult?.map((item: any, index: any) => (
            <div
              className="col-12 pb-3"
              style={{ borderRadius: "2px" }}
              key={index}
            >
              <div
                className="d-flex pb-2 align-items-center mb-3"
                style={{
                  alignItems: "center",
                  paddingTop: "10px",
                  backgroundColor: "white",
                }}
              >
                <div
                  className="col-6"
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    marginLeft: "10px",
                  }}
                >
                  {item.name}
                </div>
                <div
                  className="col-6 d-flex justify-content-end"
                  style={{ paddingRight: "1rem" }}
                >
                  <Switch
                    checked={!!selectedSubOptions[item.id]}
                    onChange={() =>
                      handleSwitchChange(
                        item.id,
                        item.permissionLists.map(
                          (subitem: any) => subitem.permissionId
                        )
                      )
                    }
                  />
                </div>
              </div>

              <div className="row permision-card col-12 p-2">
                {item.permissionLists &&
                  item.permissionLists.map((subitem: any, subIndex: any) => (
                    <div
                      className="col-md-6 p-2 mt-1 mb-1 "
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "2px",
                      }}
                      key={subIndex}
                    >
                      <div
                        className="d-flex pb-2 justify-content-between"
                        style={{ alignItems: "center" }}
                      >
                        <div
                          className="col-9 d-flex "
                          style={{ fontSize: "14px", borderRadius: "2px" }}
                        >
                          {subitem.name}
                        </div>
                        <Switch
                          checked={selectedSubOptions[item.id]?.includes(
                            subitem?.permissionId
                          )}
                          onChange={() =>
                            handleSubOptionChange(item.id, subitem.permissionId)
                          }
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
      <div className="border-bottom col-md-10 pt-3"></div>
      <div className="d-flex col-md-10 justify-content-end mt-4 mb-4">
        <button
          className="theme-btn-next"
          onClick={() => {
            createAssignPermission ? createPermissions() : updatePermissions();
          }}
        >
          {createAssignPermission ? "Save" : "Update"}
        </button>
      </div>
    </div>
  );
};

export default EditManageRole;
