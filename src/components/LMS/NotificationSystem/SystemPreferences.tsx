import { useEffect, useState } from "react";
import { Form, Row, Col } from "react-bootstrap";

import {
    Button,
    Dropdown,
    Modal,
    Menu,
    Select,
    Radio,
} from "antd";
import { FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";
import { DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import arrowDown from "../../../assets/images/arrow-down.png";
import { 
    createSystemNotificationPreference,
    getAllSystemNotificationPreferences,
    getSystemNotificationPreferenceById,
    updateSystemNotificationPreference,
    deleteSystemNotificationPreference,
    getChannels
} from "../../../redux/apis/apisNotificationsCrud";
import { Images } from "../../Config/Images";
import TableView from "../../TableView/TableView";

const SystemPreferences = () => {
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
    const [channels, setChannels] = useState<any[]>([]);
    const [channelsLoading, setChannelsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        channelIds: [],
    });

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
            name: "Name",
            selector: (row: { name: any }) => row.name,
            sortable: true,
        },
        {
            name: "Channels",
            cell: (row: { channelIds: any }) => (
                <div style={{ maxWidth: "300px" }}>
                    {row.channelIds && row.channelIds.map((channelId: any, index: any) => {
                        const channelName = getChannelNameById(channelId);
                        return (
                            <span key={index} style={{ 
                                display: "inline-block",
                                backgroundColor: "var(--color-action)",
                                color: "white",
                                padding: "2px 8px",
                                borderRadius: "2px",
                                fontSize: "12px",
                                margin: "2px"
                            }}>
                                {channelName || channelId}
                            </span>
                        );
                    })}
                </div>
            ),
            sortable: true,
        },
        {
            name: "Created At",
            selector: (row: { createdAt: any }) => formatDate(row?.createdAt),
            sortable: true,
        },
        {
            name: "Actions",
            cell: (row: any) => (
                <Dropdown overlay={menu(row)} trigger={["click"]}>
                    <Button
                        className="gradient-btn"
                        type="primary"
                        style={{
                            backgroundColor: "var(--color-action) !important",
                            color: "var(--foreground)",
                            borderColor: "white",
                            borderRadius: "2px",
                            padding: "10px 20px",
                        }}
                    >
                        Select <img src={arrowDown} alt="" />
                    </Button>
                </Dropdown>
            ),
            width: "150px",
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
                        name: row?.name ?? "",
                        channelIds: row?.channelIds ?? [],
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
            const response = await getAllSystemNotificationPreferences();
            
            if (response?.data?.status) {
                const data = response?.data?.data?.content || [];
                const mappedData = data.map((item: any, index: any) => {
                    return {
                        id: item?.id ?? `pref-${index}`,
                        user_id: index + 1 || "-",
                        name: item?.name ?? "-",
                        channelIds: item?.channelIds ?? [],
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

    // Fetch Channels API
    const getChannelsData = async () => {
        try {
            setChannelsLoading(true);
            const response = await getChannels();
            
            if (response?.data?.status) {
                const channelsData = response.data.data || [];
                setChannels(channelsData);
            } else {
                toast.error((response?.data?.errors || "Unknown error"));
            }
        } catch (error: any) {
            console.error("Error fetching channels:", error);
            toast.error("Failed to load channels: " + error.message);
        } finally {
            setChannelsLoading(false);
        }
    };

    useEffect(() => {
        getList();
        getChannelsData();
    }, [page, pageSize]);

    const handleSave = async () => {
        const body: any = {
            requestId: `req-${Date.now()}`,
            channelId: "web",
            data: {
                name: formData?.name,
                channelIds: formData?.channelIds,
            },
        };
        const isEditing = selectedItem === "edit" && editRowId;

        const savePromise = async () => {
            if (isEditing) {
                const response = await updateSystemNotificationPreference(editRowId, body);
                if (response.status === 200) {
                    setShowModal(false);
                    setEditRowId(null);
                    setSelectedItem(null);
                    setFormData({
                        name: "",
                        channelIds: [],
                    });
                    await getList();
                    return "System preference updated successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to update");
                }
            } else {
                const response = await createSystemNotificationPreference(body);
                if (response.status === 200 || response.status === 201) {
                    setShowModal(false);
                    await getList();
                    setFormData({
                        name: "",
                        channelIds: [],
                    });
                    return "System preference added successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to add");
                }
            }
        };

        toast.promise(savePromise(), {
            loading: isEditing ? "Updating System Preference..." : "Adding System Preference...",
            success: (msg) => msg,
            error: (err) => err.message || "Something went wrong",
        });
    };

    const handleDelete = async (id: any) => {
        try {
            const deletePromise = async () => {
                const response = await deleteSystemNotificationPreference(id);
                if (response.status === 200 || response.status === 204) {
                    setIsDeleteModalVisible(false);
                    await getList();
                    setEditRowId(null);
                    return "System preference deleted successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to delete");
                }
            };

            toast.promise(deletePromise(), {
                loading: "Deleting System Preference...",
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
                                    name: "",
                                    channelIds: [],
                                });
                                setEditRowId(null);
                                setSelectedItem(null);
                            }}
                        >
                            Add New System Preference
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
                title={editRowId ? "Edit System Preference" : "Add New System Preference"}
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
                        <Col md={12}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Name <span style={{ color: "red" }}>*</span></Form.Label>
                                <input
                                    type="text"
                                    className="form-control custom-input"
                                    placeholder="Enter preference name"
                                    name="name"
                                    value={formData.name}
                                    onChange={(e: any) => setFormData({ ...formData, name: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-2 custom-input-box select-custom">
                                <Form.Label className="px-2 mt-2">Channels <span style={{ color: "red" }}>*</span></Form.Label>
                                <Select
                                    mode="multiple"
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder={channelsLoading ? "Loading channels..." : "Select channels"}
                                    loading={channelsLoading}
                                    value={formData.channelIds}
                                    onChange={(val: any) => setFormData({ ...formData, channelIds: val })}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as unknown as string)
                                            ?.toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                >
                                    {channels.length > 0 ? channels.map((c: any) => (
                                        <Select.Option key={c?.id} value={c?.id}>
                                            {c?.name}
                                        </Select.Option>
                                    )) : (
                                        <Select.Option disabled value="no-channels">
                                            {channelsLoading ? "Loading..." : "No channels available"}
                                        </Select.Option>
                                    )}
                                </Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                className="custom-mod"
                style={{ maxWidth: "632px" }}
                title={"Delete System Preference"}
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
                    Are you sure you want to delete this System Preference?
                </Form>
            </Modal>
        </div>
    );
};

export default SystemPreferences;
