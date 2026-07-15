import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getClientAdmins, deleteClientAdmin } from "../../redux/apis/apisThirdParty";

const ClientAdminList = () => {
  const { t } = useTranslation("connector");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const clientId = id ? parseInt(id) : 0;
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const menu = (row: any) => (
    <Menu>
      <Menu.Item key="edit" onClick={() => handleMenuClick("edit", row)}>
        {t("common:edit")}
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => handleMenuClick("delete", row)}>
        {t("common:delete")}
      </Menu.Item>
    </Menu>
  );

  const handleMenuClick = async (action: string, row: any) => {
    if (action === "edit") {
      navigate(`/ThirdPartyManagement/Clients/${clientId}/Admins/Edit/${row.id}`);
    } else if (action === "delete") {
      if (window.confirm(t("clientAdminList.deleteConfirm", { name: row.name }))) {
        try {
          await deleteClientAdmin(row.id);
          toast.success(t("clientAdminList.toast.deleteSuccess"));
          getClientAdminsList();
        } catch (error: any) {
          toast.error(error?.response?.data?.message || error?.message || t("clientAdminList.toast.deleteFailed"));
        }
      }
    }
  };

  const ClientAdmin_Headers = [
    {
      name: t("clientAdminList.col.name"),
      selector: (row: { name: any }) => row.name,
      sortable: true,
    },
    {
      name: t("clientAdminList.col.email"),
      selector: (row: { email: any }) => row.email,
      sortable: true,
      width: "200px",
    },
    {
      name: t("clientAdminList.col.phone"),
      selector: (row: { phone: any }) => row.phone,
      sortable: true,
    },
    {
      name: t("clientAdminList.col.dob"),
      selector: (row: { dob: any }) => row.dob,
      sortable: true,
      width: "150px",
    },
    {
      name: t("clientAdminList.col.address"),
      selector: (row: { address: any }) => row.address || "-",
      sortable: true,
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "2px",
            backgroundColor: row.status === "Active" || row.status === 1 ? "var(--color-success)" : "var(--color-error)",
            color: "white",
            fontSize: "12px",
          }}
        >
          {row.status === "Active" || row.status === 1 ? t("common:active") : t("common:inactive")}
        </span>
      ),
      sortable: true,
    },
    {
      name: t("clientAdminList.col.action"),
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button type="primary" style={{ backgroundColor: "var(--foreground)" }}>
            {t("clientAdminList.select")} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const getClientAdminsList = async () => {
    if (!clientId) return;
    
    try {
      setSkelitonLoading(true);
      const response = await getClientAdmins(clientId, pageSize, page);
      if (response?.data?.success) {
        const adminsData = response.data.data;
        let adminsArray: any[] = [];
        
        if (adminsData?.admins?.data && Array.isArray(adminsData.admins.data)) {
          adminsArray = adminsData.admins.data;
          setTotalRows(adminsData.admins.total || 0);
          setFrom(adminsData.admins.from || 0);
          setTo(adminsData.admins.to || 0);
          setPage(adminsData.admins.current_page || page);
          setTotalPage(adminsData.admins.last_page || 1);
        } else if (Array.isArray(adminsData)) {
          adminsArray = adminsData;
          setTotalRows(adminsArray.length || 0);
          setFrom(adminsArray.length > 0 ? 1 : 0);
          setTo(adminsArray.length || 0);
          setPage(1);
          setTotalPage(1);
        }
        setData(adminsArray);
      }
      setSkelitonLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("clientAdminList.toast.fetchFailed"));
      setSkelitonLoading(false);
    }
  };

  useEffect(() => {
    getClientAdminsList();
  }, [page, pageSize, clientId]);

  const mappedData = data?.map((item: any) => ({
    id: item?.id,
    name: item?.name || "-",
    email: item?.email || "-",
    phone: item?.phone || "-",
    dob: item?.dob ? new Date(item.dob).toLocaleDateString() : "-",
    address: item?.address || "-",
    status: item?.status === 1 || item?.status === true ? "Active" : "Inactive",
  }));

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t("clientAdminList.title")}</h2>
        <Button
          type="primary"
          style={{ backgroundColor: "var(--foreground)" }}
          onClick={() => navigate(`/ThirdPartyManagement/Clients/${clientId}/Admins/Add`)}
        >
          {t("clientAdminList.addClientAdmin")}
        </Button>
      </div>
      <TableView
        header={ClientAdmin_Headers}
        data={mappedData}
        totalRows={totalRows}
        isLoading={skelitonLoading}
        from={from}
        page={page}
        totalPage={totalPage}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={to}
      />
    </div>
  );
};

export default ClientAdminList;

