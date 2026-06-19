import TableView from "../../components/TableView/TableView";
import { DatePicker, Select } from "antd";
import DynamicHeaderStructure from "../../components/DynamicHeaderStructure";
import TableHeaderFilter from "../TableHeaderFilter";
import TextArea from "antd/es/input/TextArea";
import Loader from "../Loader/Loader";
import {
  getAllReference,
  AddRefrence,
  getAllCountries,
  allState,
  getAllRealations,
  updateRefrence,
  getCities,
  getReferenceById,
  delReference,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Button, Dropdown, Input, Menu } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Field, ErrorMessage, Form } from "formik";
import { Col, Modal, ModalBody, ModalHeader, Row } from "react-bootstrap";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
const References = () => {
  const [relation, setRelation] = useState<any>("");
  const [country, setCountry] = useState<any>("");
  const [city, setCity] = useState<any>("");
  const states = useSelector((state: RootState) => state.block.states);
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState<any>();
  const [updateData, setUpdateData] = useState<any>();
  const id = useParams();
  const params = useParams();
  const [editMode, setEditMode] = useState(false);
  const [show, setShow] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const handleClose = () => setShow(false);

  const statusOptions = [
    { value: 1, label: "Initiated" },
    { value: 2, label: "Pending" },
    { value: 3, label: "InProgress" },
    { value: 4, label: "Completed" },
    { value: 5, label: "Verified" },
    { value: 6, label: "Failed" },
    { value: 7, label: "Cancelled" },
    { value: 8, label: "OnHold" },
    { value: 9, label: "Reassigned" },
    { value: 10, label: "Escalated" },
    { value: 11, label: "AwaitingCustomerResponse" },
    { value: 12, label: "Review" },
    { value: 13, label: "Closed" },
    { value: 14, label: "DiscrepancyFound" },
    { value: 15, label: "NotApplicable" },
  ];

  const handleSubmit = async (fieldValue: any) => {
    try {
      let body: any = {
        relationshipId: fieldValue?.relationshipId,
        name: fieldValue?.name,
        status: Number(fieldValue?.status),
        countryId: fieldValue?.countryId,
        addess: fieldValue?.address,
        zip: fieldValue?.zip,
        zipExtention: fieldValue?.zipExtension,
        city: fieldValue?.cityId,
        stateId: fieldValue?.stateId,
        years: fieldValue?.years,
        month: fieldValue?.months,
        phone: fieldValue?.phone,
        perissionToCall: fieldValue?.permissionToCall ? true : false,
        permissionToText: fieldValue?.permissionToText ? true : false,
        extention: fieldValue?.extension,
        secondary_Phone: fieldValue?.secondaryPhone,
        comment: fieldValue?.comment,
      };
      if (editMode) {
        body = {
          ...body,
          id: updateData.id,
        };
      }
      let res: any;
      if (editMode) {
        res = await updateRefrence(body);
        getReference();
        setEditMode(false);
        fetchRelation();
      } else res = await AddRefrence(body);
      if (res) {
        toast.success(res?.data?.notificationMessage);
        // resetForm();
        getReference();
        // getAllReference(page, pageSize);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  useEffect(() => {
    fetchCountry();
    fetchRelation();
    //fetchState();
    fetchCity();
    getReference();
    return () => { };
  }, [page, pageSize]);

  const fetchCountry = async () => {
    try {
      const res = await getAllCountries();
      if (res) {
        const data = res.data.data;

        setCountry(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const fetchCity = async () => {
    try {
      const res = await getCities();
      if (res) {
        const data = res.data.data;
        setCity(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  /* const fetchState = async () => {
    try {
      const res = await allState();
      if (res) {
        const data = res.data.data;
        setState(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }; */

  const fetchRelation = async () => {
    try {
      const res = await getAllRealations(page, pageSize);
      if (res) {
        const data = res.data.data;
        setRelation(data || []);
        setTotalRows(data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const handleChange = async (key: string, row: any) => {
    if (key === "edit") {
      setLoading(true);
      await fetchReferenceById(row.id);
      setShow(true);
      setEditMode(true);
      setLoading(false);
    } else if (key === "delete") {
      handleDelete(row.id);
    }
  };

  const menu = (row: any) => (
    <>
      <Menu
        onClick={({ key }: any) => {
          handleChange(key, row);
        }}
      >
        <Menu.Item key="edit" icon={<EditOutlined />}>
          Edit
        </Menu.Item>
        <Menu.Item key="delete" icon={<DeleteOutlined />}>
          Delete
        </Menu.Item>
      </Menu>
    </>
  );

  const getReference = async () => {
    try {
      const res = await getAllReference(page, pageSize);
      if (res) {
        const data = res.data.data;
        setReference(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const fetchReferenceById = async (Id: any) => {
    try {
      const res = await getReferenceById(Id);
      if (res) {
        const data = res.data.data;
        setUpdateData(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const handleDelete = async (id: any) => {
    try {
      const res = await delReference(id);
      if (res) {
        toast.success(res.data.notificationMessage);
        getReference();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCountry = (id: any) => {
    let entry: any = country && country?.find((entry: any) => entry.id == id);
    return entry?.name;
  };
  const handleStatus = (value: any) => {
    let entry: any = statusOptions?.find((entry: any) => entry.value == value);
    return entry ? entry.label : "";
  };

  const getCityById = (id: any) => {
    let entry: any = city && city.find((entry: any) => entry.id == id);
    return entry?.name;
  };

  const mappedData =
    reference &&
    reference.map((item: any) => {
      return {
        Name: item.name,
        Country: handleCountry(item.countryId),
        City: getCityById(item.city),
        Status: handleStatus(item.status),
        id: item.id,
      };
    });
  /* const getStatus = (value: any) => {
    if (!statusOptions || statusOptions.length === 0) return "";
    const action = statusOptions.find((g: any) => g.value === value);
    setStatus(action);
    return action?.label || "";
  }; */

  const button = [
    {
      title: "Add",
      onClick: () => {
        setShow(true);
      },
    },
  ];

  //const navigate = useNavigate();

  const handleModal = () => {
    setEditMode(false);
    handleClose();
  };

  const Reference_Header = [
    {
      name: "Name",
      selector: (row: { Name: any }) => row.Name,
    },
    {
      name: "Country",
      selector: (row: { Country: any }) => row.Country,
    },
    {
      name: "City",
      selector: (row: { City: any }) => row.City,
    },
    {
      name: "Status",
      selector: (row: { Status: any }) => row.Status,
    },

    {
      name: "Action",
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


  return (
    <>
      <div className="cs-table p-2">
        <DynamicHeaderStructure title={"References"} button={button} />
        <TableHeaderFilter />
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Reference_Header}
          data={mappedData}
        />{" "}
      </div>
      <div className="col-12 p-4" />
      <Modal
        centered
        show={show}
        onHide={handleModal}
        size="lg"
        dialogClassName="custom-modal"
      >
        <ModalHeader style={{ fontWeight: 620, fontSize: 20 }} closeButton>
          Reference
        </ModalHeader>

        {loading ? (
          <Loader />
        ) : (
          <Formik
            initialValues={{
              relationshipId: editMode ? updateData?.relationshipId : "",
              zipExtension: editMode ? updateData?.zipExtention : "",
              name: editMode ? updateData?.name : "",
              cityId: editMode ? updateData?.city : "",
              phone: editMode ? updateData?.phone : "",
              status: editMode ? updateData?.status : "",
              stateId: editMode ? updateData?.stateId : "",
              extension: editMode ? updateData?.extention : "",
              countryId: editMode ? updateData?.countryId : "",
              years: editMode ? updateData?.years : "",
              months: editMode ? updateData?.month : "",
              zip: editMode ? updateData?.zip : "",
              secondaryPhone: editMode ? updateData?.secondary_Phone : "",
              address: editMode ? updateData?.addess : "",
              comment: editMode ? updateData?.comment : "",
              permissionToCall: editMode ? updateData?.perissionToCall : "",
              permissionToText: editMode ? updateData?.permissionToText : "",
            }}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue }) => (
              <Form className="col-12 p-3 pt-3">
                <div className="col-md-12 d-flex w-100">
                  <div className="col-md-6 px-2">
                    <div className="simple-text" style={{ fontWeight: 500 }}>
                      Relationship
                    </div>
                    <div className="pt-1">
                      <Field
                        as={Select}
                        name="relationshipId"
                        onChange={(value) =>
                          setFieldValue("relationshipId", value)
                        }
                      >
                        <option label="Select Relation"></option>
                        {relation?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Field>
                    </div>
                  </div>
                  <div className="col-md-6 px-2">
                    <div className="simple-text" style={{ fontWeight: 500 }}>
                      Zip Extension
                    </div>
                    <div className="pt-1">
                      <Field as={Input} name="zipExtension" id="zipExtension" />
                    </div>
                  </div>
                </div>

                <div className="col-md-12 d-flex pt-3">
                  <div className="col-md-6 px-2">
                    <div className="simple-text" style={{ fontWeight: 500 }}>
                      Name
                    </div>
                    <div className="pt-1">
                      <Field as={Input} name="name" />
                    </div>
                  </div>
                  <div className="col-md-6 px-2">
                    <div className="simple-text" style={{ fontWeight: 500 }}>
                      Phone
                    </div>
                    <div className="pt-1">
                      <Field as={Input} name="phone" />
                    </div>
                  </div>
                </div>

                <div className="col-md-12 d-flex pt-3">
                  <div className="col-md-6 px-2">
                    <div className="simple-text" style={{ fontWeight: 500 }}>
                      Status
                    </div>
                    <div className="pt-1">
                      <Field
                        as={Select}
                        name="status"
                        onChange={(value) => setFieldValue("status", value)}
                      >
                        <option value="" label="Select Status" />
                        {statusOptions?.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Field>
                    </div>
                  </div>
                  <div className="col-md-6 px-2">
                    <div className="simple-text" style={{ fontWeight: 500 }}>
                      Extension
                    </div>
                    <div className="pt-1">
                      <Field as={Input} name="extension" />
                    </div>
                  </div>
                </div>

                <div className="col-md-12 d-flex pt-3">
                  <div className="col-md-6 px-2">
                    <div className="simple-text" style={{ fontWeight: 500 }}>
                      Months
                    </div>
                    <div className="pt-1">
                      <Field as={Input} name="months" />
                    </div>
                  </div>
                  <div className="col-md-6 px-2">
                    <div className="simple-text" style={{ fontWeight: 500 }}>
                      Years
                    </div>
                    <div className="pt-1">
                      <Field as={Input} name="years" />
                    </div>
                  </div>
                </div>
                <div className="col-md-12 d-flex pt-3">
                  <div className="col-md-6 px-2">
                    <div className="simple-text" style={{ fontWeight: 500 }}>
                      Secondary Phone
                    </div>
                    <div className="pt-1">
                      <Field as={Input} name="secondaryPhone" />
                    </div>
                  </div>
                  <div className="col-md-6 px-2">
                    <div className="simple-text" style={{ fontWeight: 500 }}>
                      Zip Code
                    </div>
                    <div className="pt-1">
                      <Field as={Input} name="zip" />
                    </div>
                  </div>
                </div>
                <div className="col-md-12 d-flex pt-3 align-items-center">
                  <div className="col-md-6 px-2">
                    <div className="simple-text" style={{ fontWeight: 500 }}>
                      Comments
                    </div>
                    <div className="pt-1">
                      <Field as={Input} name="comment" />
                    </div>
                  </div>
                  <div className="col-md-6 d-flex align-items-center">
                    <div className="d-flex align-items-center p-2">
                      <Field type="checkbox" name="permissionToCall" />
                      <div
                        className="ps-2 simple-text"
                        style={{ fontWeight: 500 }}
                      >
                        Permission to Call
                      </div>
                    </div>
                    <div className="d-flex align-items-center ml-3 p-2">
                      <Field type="checkbox" name="permissionToText" />
                      <div
                        className="ps-2 simple-text"
                        style={{ fontWeight: 500 }}
                      >
                        Permission to Text
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-12">
                  <h5 className="pt-4 pb-3 px-2">Address</h5>
                  <div className="d-flex">
                    <div className="col-md-6 px-2">
                      <div className="simple-text" style={{ fontWeight: 500 }}>
                        Country
                      </div>
                      <div className="pt-1">
                        <Field
                          as={Select}
                          name="countryId"
                          onChange={(value) =>
                            setFieldValue("countryId", value)
                          }
                        >
                          <option label="Select Country"></option>
                          {country?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name || "Unknown Country"}
                            </option>
                          ))}
                        </Field>
                      </div>
                    </div>
                    <div className="col-md-6 px-2">
                      <div className="simple-text" style={{ fontWeight: 500 }}>
                        State
                      </div>
                      <div className="pt-1">
                        <Field
                          as={Select}
                          name="stateId"
                          onChange={(value) => setFieldValue("stateId", value)}
                        >
                          <option label="Select State"></option>
                          {states?.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {item.name || "Unknown State"}
                            </option>
                          ))}
                        </Field>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex pt-3">
                    <div className="col-md-6 px-2">
                      <div className="simple-text" style={{ fontWeight: 500 }}>
                        City
                      </div>
                      <div className="pt-1">
                        <Field
                          as={Select}
                          name="cityId"
                          onChange={(value) => setFieldValue("cityId", value)}
                        >
                          <option value="" label="Select City" />
                          {city?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name || "Unknown City"}
                            </option>
                          ))}
                        </Field>
                      </div>
                    </div>
                    <div className="col-md-6 px-2">
                      <div className="simple-text" style={{ fontWeight: 500 }}>
                        Address
                      </div>
                      <div className="pt-1">
                        <Field as={Input} name="address" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-12 d-flex justify-content-end pt-3 pb-2 px-2">
                  <button
                    type="submit"
                    className="btn theme-btn-next"
                    onClick={handleClose}
                  >
                    Save
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </Modal>
    </>
  );
};

export default References;
