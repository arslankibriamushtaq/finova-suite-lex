import { useState, useEffect } from "react";
import { Button, Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getClientAdmins, deleteClientAdmin } from "../../redux/apis/apisThirdParty";

const ClientAdminList = () => {
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
        Edit
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => handleMenuClick("delete", row)}>
        Delete
      </Menu.Item>
    </Menu>
  );

  const handleMenuClick = async (action: string, row: any) => {
    if (action === "edit") {
      navigate(`/ThirdPartyManagement/Clients/${clientId}/Admins/Edit/${row.id}`);
    } else if (action === "delete") {
      if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
        try {
          await deleteClientAdmin(row.id);
          toast.success("Client admin deleted successfully");
          getClientAdminsList();
        } catch (error: any) {
          toast.error(error?.response?.data?.message || error?.message || "Failed to delete client admin");
        }
      }
    }
  };

  const ClientAdmin_Headers = [
    {
      name: "Name",
      selector: (row: { name: any }) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row: { email: any }) => row.email,
      sortable: true,
      width: "200px",
    },
    {
      name: "Phone",
      selector: (row: { phone: any }) => row.phone,
      sortable: true,
    },
    {
      name: "Date of Birth",
      selector: (row: { dob: any }) => row.dob,
      sortable: true,
      width: "150px",
    },
    {
      name: "Address",
      selector: (row: { address: any }) => row.address || "-",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            backgroundColor: row.status === "Active" || row.status === 1 ? "var(--color-success)" : "var(--color-error)",
            color: "white",
            fontSize: "12px",
          }}
        >
          {row.status === "Active" || row.status === 1 ? "Active" : "Inactive"}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button type="primary" style={{ backgroundColor: "var(--foreground)" }}>
            Select <DownOutlined />
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
      toast.error(error?.response?.data?.message || "Failed to fetch client admins");
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
        <h2>Client Admins</h2>
        <Button
          type="primary"
          style={{ backgroundColor: "var(--foreground)" }}
          onClick={() => navigate(`/ThirdPartyManagement/Clients/${clientId}/Admins/Add`)}
        >
          Add Client Admin
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

