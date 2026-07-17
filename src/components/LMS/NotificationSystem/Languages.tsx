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
import { getLanguages, createLanguages, updateLanguages, deleteLanguages } from "../../../redux/apis/apisNotificationsCrud";
import { Images } from "../../Config/Images";
import TableView from "../../TableView/TableView";

const Languages = () => {
    const { t } = useTranslation("notifications");
    const [dashboardData, setDashboardData] = useState<any>();
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
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
    const [formData, setFormData] = useState({
        name: "",
        shortcode: "",
    });

    const Activity_Loans_Header = [
        {
            name: t("shared.sr"),
            selector: (row: { user_id: any }) => row.user_id,
            sortable: true,
        },
        {
            name: t("common:name"),
            selector: (row: { name: any }) => row.name,
            sortable: true,
        },
        {
            name: t("languages.col.shortcode"),
            selector: (row: { shortcode: any }) => row.shortcode,
            sortable: true,
            width: "160px",
        },
        {
            name: t("common:createdAt"),
            selector: (row: { createdAt: any }) => row.createdAt,
            sortable: true,
            wrap: true,
        },

        {
            name: t("common:actions"),

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
                        {t("common:select")} <img src={arrowDown} alt="" />
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
                        shortcode: row?.shortcode ?? "",
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
            const response = await getLanguages();
            if (response) {
                const data = response?.data?.data;
                const mappedData =
                    data &&
                    data?.map((item: any, index: any) => {
                        return {
                            id: item?.id,
                            user_id: index + 1 || "-",
                            name: item?.name ?? "-",
                            shortcode: item?.shortcode ?? "-",
                            createdAt: item?.createdAt ?? "-",
                        };
                    });
                setDashboardData(mappedData);
                setLoading(false);
                setSkelitonLoading(false);
                setTotalRows(mappedData?.length || 0);
                // setFrom(response?.data?.data?.from || 0);
                // setTo(response?.data?.data?.to || 0);
                // setPage(response?.data?.data?.current_page);
                // setTotalPage(response?.data?.data?.last_page);
            }
        } catch (error: any) {
            toast.error(error?.message);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getList();
    }, [page, pageSize]); // Empty dependency array means this runs once on mount


    const handleSave = async () => {
        const body: any = {
            requestId: `req-${Date.now()}`,
            channelId: "web",
            data: {
                name: formData?.name,
                shortcode: formData?.shortcode,
            },
        };
        const isEditing = selectedItem === "edit" && editRowId;

        const savePromise = async () => {
            if (isEditing) {
                const response = await updateLanguages(editRowId, body);
                if (response.status === 200) {
                    setShowModal(false);
                    setEditRowId(null);
                    setSelectedItem(null);
                    setFormData({
                        name: "",
                        shortcode: "",
                    });
                    await getList();
                    return t("languages.toast.updated");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedUpdate"));
                }
            } else {
                const response = await createLanguages(body);
                if (response.status === 200 || response.status === 201) {
                    setShowModal(false);
                    await getList();
                    setFormData({
                        name: "",
                        shortcode: "",
                    });
                    return t("languages.toast.added");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedAdd"));
                }
            }
        };

        toast.promise(savePromise(), {
            loading: isEditing ? t("languages.toast.updating") : t("languages.toast.adding"),
            success: (msg) => msg,
            error: (err) => err.message || t("shared.somethingWentWrong"),
        });
    };

     const handleDelete = async (id: any) => {
         try {
             const deletePromise = async () => {
                 const response = await deleteLanguages(id);
                 if (response.status === 200 || response.status === 204) {
                     setIsDeleteModalVisible(false);
                     await getList();
                     setEditRowId(null);
                     return t("languages.toast.deleted");
                 } else {
                     throw new Error(response?.data?.errors || t("shared.failedDelete"));
                 }
             };

             toast.promise(deletePromise(), {
                 loading: t("languages.toast.deleting"),
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
                        // onChange={handleChange}
                        placeholder={t("common:filter")}
                        tokenSeparators={[","]}
                        suffixIcon={<FaFilter />}

                    // options={options}
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
                                    name: "",
                                    shortcode: "",
                                });
                                setEditRowId(null);
                                setSelectedItem(null);
                            }}
                        >
                            {t("languages.addNew")}
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
                style={{ maxWidth: "732px" }}
                className="custom-mod"
                visible={showModal}
                onCancel={() => setShowModal(false)}
                title={editRowId ? t("languages.editTitle") : t("languages.addNew")}
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
                                <Form.Label className="px-2 mt-2">{t("common:name")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder={t("languages.ph.name")}
                                    name="name"
                                    value={formData.name}
                                    onChange={(e: any) => {
                                        setFormData({
                                            ...formData,
                                            name: e?.target?.value,
                                        });
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">{t("languages.col.shortcode")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder={t("languages.ph.shortcode")}
                                    name="shortcode"
                                    value={formData.shortcode}
                                    onChange={(e: any) => {
                                        setFormData({
                                            ...formData,
                                            shortcode: e?.target?.value,
                                        });
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    {/* <Row>
                        <Col md={12}>
                            <Form.Group className="mt-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Config Template <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder="Enter Config Template"
                                    name="configTemplate"
                                    value={formData.configTemplate}
                                    onChange={(e: any) => {
                                        setFormData({
                                            ...formData,
                                            configTemplate: e?.target?.value,
                                        });
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    </Row> */}
                </Form>
            </Modal>

             <Modal maskClosable={false} keyboard={false}
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                className="custom-mod"
                style={{ maxWidth: "632px" }}
                 title={t("languages.delete.title")}
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
                    {t("languages.delete.confirm")}
                </Form>
            </Modal>
        </div>
    );
};

export default Languages;
