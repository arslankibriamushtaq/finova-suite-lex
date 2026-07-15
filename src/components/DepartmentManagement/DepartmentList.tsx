import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Modal, Form, Switch } from "antd";
import TableView from "../TableView/TableView";
import {
  getDepartments,
  storeDepartment,
  updateDefaultDepartment,
  updateDepartmenStatus,
} from "../../redux/apis/apisCrudFactoring";
import toast from "react-hot-toast";

const DepartmentList = () => {
  const { t } = useTranslation("adminMisc");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPage, setTotalPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    by_default: false,
    status: false,
  });

  const columns = [
    {
      name: t("dept.col.name"),
      selector: (row: any) => row.name,
    },
    {
      name: t("dept.col.byDefault"),
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 14px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor: row.by_default ? "var(--color-success)" : "var(--color-error)",
            color: "white",
          }}
        >
          {row.by_default ? t("common:active") : t("common:inactive")}
        </span>
      ),
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 14px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor: row.status ? "var(--color-success)" : "var(--color-error)",
            color: "white",
          }}
        >
          {row.status ? t("common:active") : t("common:inactive")}
        </span>
      ),
    },
    {
      name: t("dept.col.changeStatus"),
      cell: (row: any) => (
        <Switch
          checked={!!row.status}
          onChange={(checked) => handleChangeStatus(row, checked)}
        />
      ),
    },
    {
      name: t("dept.col.action"),
      cell: (row: any) =>
        row.by_default ? (
          <span></span>
        ) : (
          <Button
            className="gradient-btn"
            type="primary"
            size="small"
            style={{ fontSize: "12px", borderRadius: "2px" }}
            onClick={() => handleSetDefault(row)}
          >
            {t("dept.setDefault")}
          </Button>
        ),
    },
  ];

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await getDepartments(page, pageSize);
      if (res?.data?.success) {
        const apiData = res.data.data;
        const list = Array.isArray(apiData?.data) ? apiData.data : Array.isArray(apiData) ? apiData : [];
        setData(list);
        setTotalRows(apiData?.total || list.length);
        setFrom(apiData?.from || 1);
        setTo(apiData?.to || list.length);
        setTotalPage(apiData?.last_page || 1);
      }
    } catch (error: any) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, pageSize]);

  const handleSetDefault = async (row: any) => {
    try {
      const res = await updateDefaultDepartment(row.id);
      if (res?.data?.success) {
        toast.success(res.data.message || t("dept.toast.defaultUpdated"));
        fetchDepartments();
      } else {
        toast.error(res?.data?.message || t("dept.toast.setDefaultFailed"));
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || t("dept.toast.somethingWentWrong");
      toast.error(msg);
    }
  };

  const handleChangeStatus = async (row: any, checked: boolean) => {
    try {
      const body = {
        department_id: String(row.id),
        department_status: checked ? "1" : "0",
      };
      const res = await updateDepartmenStatus(body);
      if (res?.data?.success) {
        toast.success(res.data.message || t("dept.toast.statusUpdated"));
        fetchDepartments();
      } else {
        toast.error(res?.data?.message || t("dept.toast.statusUpdateFailed"));
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || t("dept.toast.somethingWentWrong");
      toast.error(msg);
    }
  };

  const handleOpenModal = () => {
    setFormData({ name: "", by_default: false, status: false });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error(t("dept.toast.enterName"));
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("by_default", formData.by_default ? "1" : "0");
      fd.append("status", formData.status ? "1" : "0");

      const res = await storeDepartment(fd);
      if (res?.data?.success) {
        toast.success(res.data.message || t("dept.toast.addSuccess"));
        setShowModal(false);
        fetchDepartments();
      } else {
        toast.error(res?.data?.message || t("dept.toast.addFailed"));
      }
    } catch (error: any) {
      console.error("Error storing department:", error);
      const errData = error?.response?.data;
      if (errData?.errors && typeof errData.errors === "object") {
        Object.values(errData.errors)
          .flat()
          .forEach((msg: any) => {
            if (typeof msg === "string") toast.error(msg);
          });
      } else {
        toast.error(errData?.message || error?.message || t("dept.toast.somethingWentWrong"));
      }
    } finally {
      setSaving(false);
    }
  };

  const mappedData = data.map((item: any, index: number) => ({
    id: item.id,
    Sr: index + 1,
    name: item.name,
    by_default: item.by_default,
    status: item.status,
  }));

  return (
    <div
      className="service"
      style={{ background: "white", padding: "1rem", borderRadius: "2px" }}
    >
      <div className="d-flex mb-3 col-12 justify-content-between align-items-center">
        <h5 style={{ fontWeight: 600, margin: 0 }}>{t("dept.title")}</h5>
        <button className="theme-btn-next" onClick={handleOpenModal}>
          {t("dept.addBtn")}
        </button>
      </div>

      <TableView
        header={columns}
        data={mappedData}
        totalRows={totalRows}
        isLoading={loading}
        from={from}
        page={page}
        totalPage={totalPage}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={to}
      />

      <Modal
        className="custom-mod"
        style={{ maxWidth: "500px" }}
        title={t("dept.modalTitle")}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowModal(false)}>
            {t("common:cancel")}
          </Button>,
          <Button
            key="save"
            className="theme-btn-next"
            loading={saving}
            onClick={handleSave}
          >
            {t("common:save")}
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label={t("dept.col.name")} required>
            <Input
              placeholder={t("dept.form.namePlaceholder")}
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </Form.Item>
          <div className="d-flex gap-4 mt-3">
            <div className="d-flex align-items-center gap-2">
              <Switch
                checked={formData.by_default}
                onChange={(checked) => setFormData((prev) => ({ ...prev, by_default: checked }))}
              />
              <label style={{ fontWeight: 500 }}>{t("dept.setDefault")}</label>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Switch
                checked={formData.status}
                onChange={(checked) => setFormData((prev) => ({ ...prev, status: checked }))}
              />
              <label style={{ fontWeight: 500 }}>{t("common:status")}</label>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentList;
