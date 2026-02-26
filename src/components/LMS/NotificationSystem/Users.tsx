import { useEffect, useState } from "react";
import { Form, Row, Col } from "react-bootstrap";

import {
    Button,
    Dropdown,
    Modal,
    Menu,
    Select,
    Input,
    Radio,
} from "antd";
import { FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import arrowDown from "../../../assets/images/arrow-down.png";
import { 
    createUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser,
    getLanguages,
    getChannels
} from "../../../redux/apis/apisNotificationsCrud";
import { Images } from "../../Config/Images";
import TableView from "../../TableView/TableView";

const Users = () => {
    const [dashboardData, setDashboardData] = useState<any>();
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [editRowId, setEditRowId] = useState(null);
    const [skelitonLoading, setSkelitonLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [from, setFrom] = useState(0);
    const [to, setTo] = useState(0);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [totalPage, setTotalPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [languages, setLanguages] = useState<any[]>([]);
    const [channels, setChannels] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        deviceToken: "",
        fullName: "",
        city: "",
        gender: "Male",
        languageId: "",
    });

    const getLanguageNameById = (id: any) => {
        return languages.find((l: any) => l?.id === id)?.name;
    }

    const getChannelNameById = (id: any) => {
        return channels.find((c: any) => c?.id === id)?.name;
    }

    const formatDate = (dateString: any) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const Activity_Loans_Header = [
        {
            name: "Sr:",
            selector: (row: { user_id: any }) => row.user_id,
            sortable: true,
            width: "100px",
        },
        {
            name: "Full Name",
            selector: (row: { fullName: any }) => row.fullName,
            sortable: true,
        },
        {
            name: "Email",
            selector: (row: { email: any }) => row.email,
            sortable: true,
        },
        {
            name: "Phone",
            selector: (row: { phone: any }) => row.phone,
            sortable: true,
        },
        {
            name: "City",
            selector: (row: { city: any }) => row.city,
            sortable: true,
        },
        {
            name: "Gender",
            selector: (row: { gender: any }) => row.gender,
            sortable: true,
        },
        {
            name: "Language",
            selector: (row: { languageId: any }) => getLanguageNameById(row?.languageId),
            sortable: true,
        },
        {
            name: "Device Token",
            cell: (row: { deviceToken: any }) => (
                <div style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {row.deviceToken}
                </div>
            ),
            sortable: true,
        },
        {
            name: "Created At",
            selector: (row: { createdAt: any }) => formatDate(row?.createdAt),
            sortable: true,
        },
    ];

    const handleMenuClick = (key: string, data: any) => {
        setIsDeleteModalVisible(true);
        setEditRowId(data?.id);
    };

    const menu = (row: any) => (
        <Menu>
            <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => {
                    setEditRowId(row?.id);
                    setShowModal(true);
                    setFormData({
                        email: row?.email ?? "",
                        phone: row?.phone ?? "",
                        deviceToken: row?.deviceToken ?? "",
                        fullName: row?.fullName ?? "",
                        city: row?.city ?? "",
                        gender: row?.gender ?? "Male",
                        languageId: row?.languageId ?? "",
                    });
                    setSelectedItem("edit");
                }}
            >
                Edit
            </Menu.Item>
            <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                onClick={() => handleMenuClick("delete", row)}
            >
                Delete
            </Menu.Item>
        </Menu>
    );

    const getList = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers();
            if (response) {
                const data = response?.data?.data;
                const mappedData =
                    data &&
                    data?.map((item: any, index: any) => {
                        return {
                            id: item?.id ?? `user-${index}`,
                            user_id: index + 1 || "-",
                            email: item?.email ?? "-",
                            phone: item?.phone ?? "-",
                            deviceToken: item?.deviceToken ?? "-",
                            fullName: item?.fullName ?? "-",
                            city: item?.city ?? "-",
                            gender: item?.gender ?? "-",
                            languageId: item?.languageId ?? "-",
                            createdAt: item?.createdAt ?? "-",
                        };
                    });
                setDashboardData(mappedData);
                setLoading(false);
                setSkelitonLoading(false);
                setTotalRows(mappedData?.length || 0);
            }
        } catch (error: any) {
            toast.error(error?.message);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const getLookups = async () => {
        try {
            const [langsRes, channelsRes] = await Promise.all([getLanguages(), getChannels()]);
            const langs = langsRes?.data?.data || [];
            const channelsData = channelsRes?.data?.data || [];
            setLanguages(langs);
            setChannels(channelsData);
        } catch (e) {
            // ignore silently; dropdowns will be empty
        }
    };

    useEffect(() => {
        getList();
        getLookups();
    }, [page, pageSize]);

    const handleSave = async () => {
        const body: any = {
            requestId: `req-${Date.now()}`,
            channelId: "web",
            data: {
                email: formData?.email,
                phone: formData?.phone,
                deviceToken: formData?.deviceToken,
                fullName: formData?.fullName,
                city: formData?.city,
                gender: formData?.gender,
                languageId: formData?.languageId,
            },
        };
        const isEditing = selectedItem === "edit" && editRowId;

        const savePromise = async () => {
            if (isEditing) {
                const response = await updateUser(editRowId, body);
                if (response.status === 200) {
                    setShowModal(false);
                    setEditRowId(null);
                    setSelectedItem(null);
                    setFormData({
                        email: "",
                        phone: "",
                        deviceToken: "",
                        fullName: "",
                        city: "",
                        gender: "Male",
                        languageId: "",
                    });
                    await getList();
                    return "User updated successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to update");
                }
            } else {
                const response = await createUser(body);
                if (response.status === 200 || response.status === 201) {
                    setShowModal(false);
                    await getList();
                    setFormData({
                        email: "",
                        phone: "",
                        deviceToken: "",
                        fullName: "",
                        city: "",
                        gender: "Male",
                        languageId: "",
                    });
                    return "User added successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to add");
                }
            }
        };

        toast.promise(savePromise(), {
            loading: isEditing ? "Updating User..." : "Adding User...",
            success: (msg) => msg,
            error: (err) => err.message || "Something went wrong",
        });
    };

    const handleDelete = async (id: any) => {
        try {
            const deletePromise = async () => {
                const response = await deleteUser(id);
                if (response.status === 200 || response.status === 204) {
                    setIsDeleteModalVisible(false);
                    await getList();
                    setEditRowId(null);
                    return "User deleted successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to delete");
                }
            };

            toast.promise(deletePromise(), {
                loading: "Deleting User...",
                success: (msg) => msg,
                error: (err) => err.message || "Something went wrong",
            });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (dashboardData?.length > 0) {
            const total = Math.ceil(totalRows / pageSize);
            setTotalPage(total);

            const start = (page - 1) * pageSize + 1;
            const end = Math.min(page * pageSize, totalRows);

            setFrom(start);
            setTo(end);
        } else {
            setFrom(0);
            setTo(0);
            setTotalPage(0);
        }
    }, [dashboardData, page, pageSize, totalRows]);

    const paginatedData = Array.isArray(dashboardData)
        ? dashboardData.slice((page - 1) * pageSize, page * pageSize)
        : [];

    return (
        <div className="dashboard">
            <div className="service">
                <div className="d-flex justify-content-end  col-12">
                    <Select
                        mode="tags"
                        style={{ width: "15%", borderTopRightRadius: "0px" }}
                        placeholder="Filter"
                        tokenSeparators={[","]}
                        suffixIcon={<FaFilter />}
                    />

                    <div className="d-flex gap-2 w-100">
                        <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
                            <img src={Images.searchIconGray} alt="" />
                            <input
                                type="text"
                                style={{
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                }}
                                className="p-2"
                                placeholder="Search..."
                            />
                        </div>

                        <button
                            className="theme-btn"
                            onClick={() => {
                                setShowModal(true);
                                setFormData({
                                    email: "",
                                    phone: "",
                                    deviceToken: "",
                                    fullName: "",
                                    city: "",
                                    gender: "Male",
                                    languageId: "",
                                });
                                setEditRowId(null);
                                setSelectedItem(null);
                            }}
                        >
                            Add New User
                        </button>
                    </div>
                </div>
            </div>
            <TableView
                header={Activity_Loans_Header}
                data={paginatedData}
                isLoading={loading}
                page={page}
                totalRows={totalRows}
                totalPage={totalPage}
                setPage={setPage}
                from={from}
                to={to}
                pageSize={pageSize}
                setPageSize={setPageSize}
            />
            <Modal
                style={{ maxWidth: "900px" }}
                className="custom-mod"
                visible={showModal}
                onCancel={() => setShowModal(false)}
                title={editRowId ? "Edit User" : "Add New User"}
                footer={[
                    <Button key="close" onClick={() => setShowModal(false)}>
                        Close
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSave}>
                        {selectedItem === "edit" ? "Update" : "Submit"}
                    </Button>,
                ]}
            >
                <Form>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Full Name <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder="Enter full name"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={(e: any) => setFormData({ ...formData, fullName: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Email <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="email"
                                    className="custom-input"
                                    placeholder="Enter email"
                                    name="email"
                                    value={formData.email}
                                    onChange={(e: any) => setFormData({ ...formData, email: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Phone <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder="Enter phone number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={(e: any) => setFormData({ ...formData, phone: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">City <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder="Enter city"
                                    name="city"
                                    value={formData.city}
                                    onChange={(e: any) => setFormData({ ...formData, city: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Device Token <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder="Enter device token"
                                    name="deviceToken"
                                    value={formData.deviceToken}
                                    onChange={(e: any) => setFormData({ ...formData, deviceToken: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box select-custom">
                                <Form.Label className="px-2 mt-2">Language <span style={{ color: "red" }}>*</span></Form.Label>
                                <Select
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder="Select language"
                                    value={formData.languageId || undefined}
                                    onChange={(val: string) => setFormData({ ...formData, languageId: val })}
                                >
                                    {languages.map((l: any) => (
                                        <Select.Option key={l?.id} value={l?.id}>
                                            {l?.name} ({l?.shortcode})
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <div className="mt-2 d-flex align-items-center">
                                <Form.Label className="px-2 mt-2 col-6">Gender <span style={{ color: "red" }}>*</span></Form.Label>
                                <div className="d-flex justify-content-end col-6">
                                    <Radio.Group
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        value={formData.gender}
                                    >
                                        <Radio value="Male">Male</Radio>
                                        <Radio value="Female">Female</Radio>
                                        <Radio value="Other">Other</Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                className="custom-mod"
                style={{ maxWidth: "632px" }}
                title={"Delete User"}
                footer={[
                    <Button key="no" onClick={() => setIsDeleteModalVisible(false)}>
                        No
                    </Button>,
                    <Button
                        key="yes"
                        type="primary"
                        onClick={() => {
                            handleDelete(editRowId);
                        }}
                    >
                        Yes
                    </Button>,
                ]}
            >
                <Form>
                    Are you sure you want to delete this User?
                </Form>
            </Modal>
        </div>
    );
};

export default Users;
