import TableView from "../../components/TableView/TableView";
import { Button, Checkbox, Dropdown, Menu } from "antd";
import DynamicHeaderStructure from "../../components/DynamicHeaderStructure";
import TableHeaderFilter from "../TableHeaderFilter";
import { useState, useEffect } from "react";
import {
  createCustomerBusinessPreferences,
  deletePreference,
  getAllPreferences,
  getPreferencesById,
  updateBusinessPreferneces,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Col, Modal, ModalHeader, Row } from "react-bootstrap";
import { DownOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
const BusinessPreferences = () => {
  const [editRowId, setEditRowId] = useState(null);
  const [modal, setModal] = useState(false);
  const [allPreferences, setAllPreferences] = useState<any>();
  const [updateData, setUpdateData] = useState<any>();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const handleClick = () => {
    setModal(true);
    setEditRowId(null);
    setUpdateData("");
  };
  const handleEditClick = (row: any) => {
    fieldInvestigationId(row.id);
    setEditRowId(row.id);
    setModal(true);
  };

  const button = [{ title: "add", onClick: handleClick }];
  const Get_All_Customer_Header = [
    {
      name: "Relation Type",
      selector: (row: { relationShipType: any }) => row.relationShipType,
    },

    {
      name: "Type",
      selector: (row: { phoneType: any }) => row.phoneType,
    },

    {
      name: "Permission to Call",
      cell: (row: { permissionToCall: boolean }) => row.permissionToCall,
    },
    {
      name: "Time Zone",
      selector: (row: { timeZone: any }) => row.timeZone,
    },
    {
      name: "Best Day To Call",
      selector: (row: { bestDayToCall: any }) => row.bestDayToCall,
    },
    {
      name: "Start Time",
      selector: (row: { startTime: any }) => row.startTime,
    },
    {
      name: "End Time",
      selector: (row: { endTime: any }) => row.endTime,
    },

    {
      name: "Actions",

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            type="primary"
            style={{
              background: "linear-gradient(100deg, #DEF5FF, #90CAFF)",
              color: "var(--foreground)",
              borderColor: "white",
              borderRadius: "6px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
  const handleChange = (key: string, row: any) => {
    if (key === "edit") {
      handleEditClick(row);
    } else if (key === "delete") {
      handleDelete(row);
    }
  };
  const handleDelete = async (row: any) => {
    try {
      const res = await deletePreference(row.id);
      if (res) {
        toast.success(res.data.notificationMessage);
        getPreferneces();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />}>
        Delete
      </Menu.Item>
    </Menu>
  );
  const handleCheckboxChange = (e: any, setFieldValue: any) => {
    const { name, checked } = e.target;
    setFieldValue(name, checked);
  };
  const getPreferneces = async () => {
    try {
      const res = await getAllPreferences(page, pageSize);
      if (res) {
        const data = res.data.data;
        setAllPreferences(data || []);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const fieldInvestigationId = async (id: any) => {
    try {
      const res = await getPreferencesById(id);
      if (res) {
        const value = res.data.data;
        setUpdateData(value);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    getPreferneces();
  }, [page, pageSize]);

  const handleSubmit = async (formField: any) => {
    try {
      const body: any = {
        customerId: formField.customerId,
        phoneType: formField.phoneType,
        permissionToCall: formField.permissionToCall,
        permissionToText: formField.permissionToText,
        timeZone: formField.timeZone,
        startTime: formField.startTime,
        endTime: formField.endTime,
        bestDayToCall: formField.bestDayToCall,
        relationShipType: formField.relationShipType,
        isEnabled: formField.isEnabled,
      };
      let res;
      if (modal && editRowId) {
        // body["id"] = editRowData;
        body.id = editRowId;
        res = await updateBusinessPreferneces(body);
      } else {
        res = await createCustomerBusinessPreferences(body);
      }

      if (res) {
        toast.success(res.data.notificationMessage);
        setModal(false);
        getPreferneces();
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const enums = {
    PhoneType: [
      { value: 0, label: "MobilePhone" },
      { value: 1, label: "HomePhone" },
      { value: 2, label: "WorkPhone" },
      { value: 3, label: "Fax" },
      { value: 4, label: "OtherPhone" },
    ],

    RelationType: [
      { value: 0, label: "PrimaryBorrower" },
      { value: 1, label: "CoBorrower" },
      { value: 2, label: "Guarantor" },
      { value: 3, label: "CoSigner" },
      { value: 4, label: "Payer" },
      { value: 5, label: "Trustee" },
      { value: 6, label: "Owner" },
      { value: 7, label: "Beneficiary" },
      { value: 8, label: "Agent" },
      { value: 9, label: "Custodian" },
      { value: 10, label: "PowerofAttorney" },
      { value: 11, label: "Spouse" },
    ],

    WeekDays: [
      { value: 0, label: "Monday" },
      { value: 1, label: "Tuesday" },
      { value: 2, label: "Wednesday" },
      { value: 3, label: "Thursday" },
      { value: 4, label: "Friday" },
      { value: 5, label: "Saturday" },
      { value: 6, label: "Sunday" },
    ],
    TimeZone: [
      { value: "UTC", label: "UTC" },
      { value: "UTC-12:00", label: "UTC-12:00" },
      { value: "UTC-11:00", label: "UTC-11:00" },
      { value: "UTC-10:00", label: "UTC-10:00" },
      { value: "UTC-09:00", label: "UTC-09:00" },
      { value: "UTC-08:00", label: "UTC-08:00" },
      { value: "UTC-07:00", label: "UTC-07:00" },
      { value: "UTC-06:00", label: "UTC-06:00" },
      { value: "UTC-05:00", label: "UTC-05:00" },
      { value: "UTC-04:00", label: "UTC-04:00" },
      { value: "UTC-03:00", label: "UTC-03:00" },
      { value: "UTC-02:00", label: "UTC-02:00" },
      { value: "UTC-01:00", label: "UTC-01:00" },
      { value: "UTC+00:00", label: "UTC+00:00" },
      { value: "UTC+01:00", label: "UTC+01:00" },
      { value: "UTC+02:00", label: "UTC+02:00" },
      { value: "UTC+03:00", label: "UTC+03:00" },
      { value: "UTC+04:00", label: "UTC+04:00" },
      { value: "UTC+05:00", label: "UTC+05:00" },
      { value: "UTC+06:00", label: "UTC+06:00" },
      { value: "UTC+07:00", label: "UTC+07:00" },
      { value: "UTC+08:00", label: "UTC+08:00" },
      { value: "UTC+09:00", label: "UTC+09:00" },
      { value: "UTC+10:00", label: "UTC+10:00" },
      { value: "UTC+11:00", label: "UTC+11:00" },
      { value: "UTC+12:00", label: "UTC+12:00" },
    ],
  };
  const getWeek = (value: any) => {
    const entry: any = enums.WeekDays.find(
      (entry: any) => entry.value === value
    );
    return entry ? entry.label : "name not found";
  };
  const getRelationType = (value: any) => {
    const entry: any = enums.RelationType.find(
      (entry: any) => entry.value === value
    );
    return entry ? entry.label : "name not found";
  };
  const getPhoneType = (value: any) => {
    const entry: any = enums.PhoneType.find(
      (entry: any) => entry.value === value
    );
    return entry ? entry.label : "name not found";
  };
  const getTimeZone = (value: any) => {
    const entry: any = enums.TimeZone.find(
      (entry: any) => entry.value === value
    );
    return entry ? entry.label : "time not found";
  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const mappedData =
    allPreferences &&
    allPreferences.map((item: any, index: any) => {
      return {
        id: item.id,
        phoneType: getPhoneType(item.phoneType),
        permissionToCall: item.permissionToCall ? "True" : "False",
        timeZone: getTimeZone(item.timeZone),
        startTime: formatDate(item.startTime),
        endTime: formatDate(item.endTime),
        bestDayToCall: getWeek(item.bestDayToCall),
        relationShipType: getRelationType(item.relationShipType),
        isEnabled: item.isEnabled,
      };
    });

  return (
    <>
      <Modal
        size="lg"
        show={modal}
        onHide={() => {
          setModal(false);
        }}
      >
        <ModalHeader closeButton>
          <h3>Add Customer/Business Preferences</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            customerId: "aec41e88-f345-453a-9791-c4d0f98cbb36",
            phoneType: updateData?.phoneType || "",
            permissionToCall: updateData?.permissionToCall || false,
            permissionToText: updateData?.permissionToText || false,
            timeZone: getTimeZone(updateData?.timeZone || ""),
            startTime: formatDate(updateData?.startTime || ""),
            endTime: formatDate(updateData?.endTime || ""),
            bestDayToCall: updateData?.bestDayToCall || "",
            relationShipType: updateData?.relationShipType || "",
            isEnabled: updateData?.isEnabled || false,
          }}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ handleChange, setFieldValue }) => {
            return (
              <Form className="p-2">
                <Modal.Body>
                  <Row className="pt-2">
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="relationId"
                        className="mb-1 customer-fs-fw"
                      >
                        Relation Type
                      </label>
                      <Field
                        as="select"
                        placeholder="Relation"
                        id="relationShipType"
                        name="relationShipType"
                        className="form-control"
                        onChange={(e: any) =>
                          handleChange({
                            target: {
                              name: e.target.name,
                              value: Number(e.target.value),
                            },
                          })
                        }
                      >
                        <option value="" label="Select relation" />
                        {enums.RelationType.map((item: any) => (
                          <option
                            key={item.value}
                            value={item.value}
                            label={item.label}
                          />
                        ))}
                      </Field>
                      <ErrorMessage
                        name="relationShipType"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="relationId"
                        className="mb-1 customer-fs-fw"
                      >
                        Best Day To Call
                      </label>
                      <Field
                        as="select"
                        placeholder="bestDayToCall"
                        id="bestDayToCall"
                        name="bestDayToCall"
                        className="form-control"
                        onChange={(e: any) =>
                          handleChange({
                            target: {
                              name: e.target.name,
                              value: Number(e.target.value),
                            },
                          })
                        }
                      >
                        <option value="" label="Select bestDayToCall" />
                        {enums.WeekDays.map((item: any) => (
                          <option
                            key={item.value}
                            value={item.value}
                            label={item.label}
                          />
                        ))}
                      </Field>
                      <ErrorMessage
                        name="bestDayToCall"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="phone type"
                        className="mb-1 customer-fs-fw"
                      >
                        Phone Type
                      </label>
                      <Field
                        as="select"
                        placeholder="phone type"
                        id="phoneType"
                        name="phoneType"
                        className="form-control"
                        onChange={(e: any) =>
                          handleChange({
                            target: {
                              name: e.target.name,
                              value: Number(e.target.value),
                            },
                          })
                        }
                      >
                        <option value="" label="Select phone type" />
                        {enums.PhoneType.map((item: any) => (
                          <option
                            key={item.value}
                            value={item.value}
                            label={item.label}
                          />
                        ))}
                      </Field>
                      <ErrorMessage
                        name="phoneType"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6} className="mt-2">
                      <label htmlFor="timeZone" className="mb-1 customer-fs-fw">
                        Time Zone
                      </label>
                      <Field
                        placeholder="Time Zone"
                        id="timeZone"
                        as="select"
                        name="timeZone"
                        className="form-control"
                      >
                        <option value="" label="Select Time Zone" />
                        {enums.TimeZone.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="timeZone"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Row>
                      <Col md={3} className="mt-2">
                        <label
                          htmlFor="StartTime"
                          className="mb-1 customer-fs-fw"
                        >
                          Start Time
                        </label>
                        <Field
                          placeholder="Start Time"
                          id="startTime"
                          type="date"
                          name="startTime"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="startTime"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>
                      <Col md={3} className="mt-2">
                        <label
                          htmlFor="endTime"
                          className="mb-1 customer-fs-fw"
                        >
                          End Time
                        </label>
                        <Field
                          placeholder="End Time"
                          id="endTime"
                          className="form-control"
                          type="date"
                          name="endTime"
                        />

                        <ErrorMessage
                          name="endTime"
                          component="div"
                          className="invalid-feedback text-danger"
                        />
                      </Col>

                      <Col md={6} className="mt-1 p-4">
                        <div className="d-flex align-items-center">
                          <Checkbox
                            type="checkbox"
                            name="permissionToCall"
                            id="permissionToCall"
                            onChange={(e) =>
                              handleCheckboxChange(e, setFieldValue)
                            }
                          />
                          <label
                            htmlFor="permissionToCall"
                            className="ms-2 customer-fs-fw"
                          >
                            Permission to Call
                          </label>

                          <Checkbox
                            type="checkbox"
                            id="permissionToText"
                            name="permissionToText"
                            onChange={(e) =>
                              handleCheckboxChange(e, setFieldValue)
                            }
                            className="ms-4"
                          />
                          <label
                            htmlFor="permissionToText"
                            className="ms-2 customer-fs-fw"
                          >
                            Permission to Text
                          </label>
                        </div>
                      </Col>
                    </Row>

                    <Col md={4} className="mt-3">
                      <div className=" d-flex align-items-center">
                        <Checkbox
                          type="checkbox"
                          name="isEnabled"
                          id="isEnabled"
                          onChange={(e) =>
                            handleCheckboxChange(e, setFieldValue)
                          }
                        />
                        <label
                          htmlFor="isEnabled"
                          className="ms-2 customer-fs-fw"
                        >
                          Enabled
                        </label>
                      </div>
                    </Col>
                  </Row>

                  <div className="d-flex mt-4 justify-content-end ">
                    <button className="theme-btn-next" type="submit">
                      {editRowId ? "Update Preferences" : "Add Preferences"}
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>
      <div className="cs-table p-2">
        <DynamicHeaderStructure title={"Comments"} button={button} />
        <TableHeaderFilter />
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Get_All_Customer_Header}
          data={mappedData}
        />
      </div>
    </>
  );
};
export default BusinessPreferences;
