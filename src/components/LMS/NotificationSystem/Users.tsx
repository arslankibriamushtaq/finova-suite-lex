import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation("notifications");
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
            name: t("shared.sr"),
            selector: (row: { user_id: any }) => row.user_id,
            sortable: true,
            width: "100px",
        },
        {
            name: t("users.col.fullName"),
            selector: (row: { fullName: any }) => row.fullName,
            sortable: true,
        },
        {
            name: t("common:email"),
            selector: (row: { email: any }) => row.email,
            sortable: true,
        },
        {
            name: t("common:phone"),
            selector: (row: { phone: any }) => row.phone,
            sortable: true,
        },
        {
            name: t("users.col.city"),
            selector: (row: { city: any }) => row.city,
            sortable: true,
        },
        {
            name: t("users.col.gender"),
            selector: (row: { gender: any }) => row.gender,
            sortable: true,
        },
        {
            name: t("shared.language"),
            selector: (row: { languageId: any }) => getLanguageNameById(row?.languageId),
            sortable: true,
        },
        {
            name: t("users.col.deviceToken"),
            cell: (row: { deviceToken: any }) => (
                <div style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {row.deviceToken}
                </div>
            ),
            sortable: true,
        },
        {
            name: t("common:createdAt"),
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
                {t("common:edit")}
            </Menu.Item>
            <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                onClick={() => handleMenuClick("delete", row)}
            >
                {t("common:delete")}
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
                    return t("users.toast.updated");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedUpdate"));
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
                    return t("users.toast.added");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedAdd"));
                }
            }
        };

        toast.promise(savePromise(), {
            loading: isEditing ? t("users.toast.updating") : t("users.toast.adding"),
            success: (msg) => msg,
            error: (err) => err.message || t("shared.somethingWentWrong"),
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
                    return t("users.toast.deleted");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedDelete"));
                }
            };

            toast.promise(deletePromise(), {
                loading: t("users.toast.deleting"),
                success: (msg) => msg,
                error: (err) => err.message || t("shared.somethingWentWrong"),
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
                        placeholder={t("common:filter")}
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
                                placeholder={t("shared.searchPlaceholder")}
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
                            {t("users.addNew")}
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
            <Modal maskClosable={false} keyboard={false}
                style={{ maxWidth: "900px" }}
                className="custom-mod"
                visible={showModal}
                onCancel={() => setShowModal(false)}
                title={editRowId ? t("users.editTitle") : t("users.addNew")}
                footer={[
                    <Button key="close" onClick={() => setShowModal(false)}>
                        {t("common:close")}
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSave}>
                        {selectedItem === "edit" ? t("common:update") : t("common:submit")}
                    </Button>,
                ]}
            >
                <Form>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">{t("users.col.fullName")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder={t("users.ph.fullName")}
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={(e: any) => setFormData({ ...formData, fullName: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">{t("common:email")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="email"
                                    className="custom-input"
                                    placeholder={t("users.ph.email")}
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
                                <Form.Label className="px-2 mt-2">{t("common:phone")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder={t("users.ph.phone")}
                                    name="phone"
                                    value={formData.phone}
                                    onChange={(e: any) => setFormData({ ...formData, phone: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">{t("users.col.city")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder={t("users.ph.city")}
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
                                <Form.Label className="px-2 mt-2">{t("users.col.deviceToken")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder={t("users.ph.deviceToken")}
                                    name="deviceToken"
                                    value={formData.deviceToken}
                                    onChange={(e: any) => setFormData({ ...formData, deviceToken: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box select-custom">
                                <Form.Label className="px-2 mt-2">{t("shared.language")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Select
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder={t("shared.selectLanguage")}
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
                                <Form.Label className="px-2 mt-2 col-6">{t("users.label.gender")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <div className="d-flex justify-content-end col-6">
                                    <Radio.Group
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        value={formData.gender}
                                    >
                                        <Radio value="Male">{t("users.gender.male")}</Radio>
                                        <Radio value="Female">{t("users.gender.female")}</Radio>
                                        <Radio value="Other">{t("users.gender.other")}</Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal maskClosable={false} keyboard={false}
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                className="custom-mod"
                style={{ maxWidth: "632px" }}
                title={t("users.delete.title")}
                footer={[
                    <Button key="no" onClick={() => setIsDeleteModalVisible(false)}>
                        {t("common:no")}
                    </Button>,
                    <Button
                        key="yes"
                        type="primary"
                        onClick={() => {
                            handleDelete(editRowId);
                        }}
                    >
                        {t("common:yes")}
                    </Button>,
                ]}
            >
                <Form>
                    {t("users.delete.confirm")}
                </Form>
            </Modal>
        </div>
    );
};

export default Users;
