import { useState, useEffect } from "react";
import { Button, Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getClientsList } from "../../redux/apis/apisThirdParty";

const ClientsList = () => {
  const navigate = useNavigate();
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
      <Menu.Item key="admins" onClick={() => handleMenuClick("admins", row)}>
        Admin List
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => handleMenuClick("delete", row)}>
        Delete
      </Menu.Item>
    </Menu>
  );

  const handleMenuClick = (action: string, row: any) => {
    if (action === "edit") {
      navigate(`/ThirdPartyManagement/Clients/Edit/${row.id}`);
    } else if (action === "admins") {
      navigate(`/ThirdPartyManagement/Clients/${row.id}/Admins`);
    } else if (action === "delete") {
      // TODO: Implement delete functionality
    }
  };

  const Client_Headers = [
    {
      name: "Client Name",
      selector: (row: { clientName: any }) => row.clientName,
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
      // width: "150px",
    },
    // {
    //   name: "Environment",
    //   selector: (row: { environment: any }) => row.environment,
    //   sortable: true,
    // },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            backgroundColor: row.status === "Active" ? "var(--color-success)" : "var(--color-error)",
            color: "white",
            fontSize: "12px",
          }}
        >
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Creation Date",
      selector: (row: { creationDate: any }) => row.creationDate,
      sortable: true,
      width: "180px",
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

  const getClients = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getClientsList(pageSize, page);
      
      if (response?.data?.success && response?.data?.data?.clients) {
        const clientsData = response.data.data.clients;
        setData(clientsData.data || []);
        setTotalRows(clientsData.total || 0);
        setFrom(clientsData.from || 0);
        setTo(clientsData.to || 0);
        setPage(clientsData.current_page || page);
        setTotalPage(clientsData.last_page || 1);
      }
      setSkelitonLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch clients");
      setSkelitonLoading(false);
    }
  };

  useEffect(() => {
    getClients();
  }, [page, pageSize]);

  const mappedData = data?.map((item: any) => ({
    id: item?.id,
    clientName: item?.name || "-",
    email: item?.email || "-",
    phone: item?.phone || "-",
    // environment: item?.environment || "-",
    status: item?.status === 1 || item?.status === true ? "Active" : "Inactive",
    creationDate: item?.created_at ? new Date(item.created_at).toLocaleDateString() : "-",
  }));

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Client List</h2>
        <Button
          type="primary"
          style={{ backgroundColor: "var(--foreground)" }}
          onClick={() => navigate("/ThirdPartyManagement/Clients/Add")}
        >
          Add New Client
        </Button>
      </div>
      <TableView
        header={Client_Headers}
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

export default ClientsList;

