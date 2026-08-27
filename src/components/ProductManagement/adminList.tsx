import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import TableView from "../TableView/TableView";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import toast from "react-hot-toast";
import { deleteAdmin, getProductAdminList, createAdmin, updateAdmin, getCountries } from "../../redux/apis/apisCrud";
import { Pencil, Trash2, Eye, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button as UIButton } from "../ui/button";
import { usePermissions, PRODUCT_PERMISSIONS_LOS } from "../../hooks/useProductPermissions";

const AdminList = () => {
  const { t } = useTranslation("productManagement2");
  const { hasPermission } = usePermissions();
  const canViewAdmin = hasPermission(PRODUCT_PERMISSIONS_LOS.SHOW);
  const canCreateAdmin = hasPermission(PRODUCT_PERMISSIONS_LOS.CREATE_ADMIN);
  const canEditAdmin = hasPermission(PRODUCT_PERMISSIONS_LOS.EDIT_ADMIN);
  const canDeleteAdmin = hasPermission(PRODUCT_PERMISSIONS_LOS.DELETE_ADMIN);
  const canAdminRowActions = canViewAdmin || canEditAdmin || canDeleteAdmin;
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [updateId, setUpdateId] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const initialFormState = { name: "", email: "", phone: "", address: "", dob: "", country: "", password: "", status: true };
  const [formState, setFormState] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get("id");

  // Function to get country ID by name
  const getCountryIdByName = (countryName: string) => {
    const country = countries.find((country: any) => country.country_name === countryName);
    return country ? country.id : null;
  };

  const AdminList_Header = [
    {
      name: t("common:name"),
      selector: (row: { name: any }) => row.name,
      width: "200px",
      sortable: true,
    },
    {
      name: t("common:email"),
      selector: (row: { email: any }) => row.email,
      width: "250px",
      sortable: true,
    },
    {
      name: t("common:phone"),
      selector: (row: { phone: any }) => row.phone,
      width: "150px",
      sortable: true,
    },
    {
      name: t("admin.address"),
      selector: (row: { address: any }) => row.address,
      width: "200px",
      sortable: true,
    },
    {
      name: t("adminList.dob"),
      selector: (row: { dob: any }) => row.dob,
      width: "120px",
      sortable: true,
    },
    {
      name: t("field.country"),
      selector: (row: { country: any }) => row.country,
      width: "150px",
      sortable: true,
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <div
          style={{
            padding: "8px 10px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor:
              row.status === "Active" || row.status === 1 || row.status === true
                ? "var(--chart-2)"
                : row.status === "Inactive" || row.status === 0 || row.status === false
                ? "var(--destructive)"
                : "var(--chart-4)",
            color: "var(--primary-foreground)",
            cursor: row.status === "Active" || row.status === 1 || row.status === true ? "pointer" : "default",
          }}
        >
          {row.status === "Active" || row.status === 1 || row.status === true ? t("common:active") : t("common:inactive")}
        </div>
      ),
      width: "120px",
    },
    {
      name: t("adminList.registeredDate"),
      selector: (row: { registered_date: any }) => row.registered_date,
      width: "180px",
      sortable: true,
    },
    {
      name: t("common:actions"),
      cell: (row: any) =>
        !canAdminRowActions ? (
          <span className="text-muted-foreground">-</span>
        ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <UIButton className="gradient-btn bg-red-600 text-foreground border border-primary-foreground rounded-lg py-2.5 px-5">
              {t("list.select")} <ChevronDown className="h-4 w-4" />
            </UIButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canViewAdmin && (
            <DropdownMenuItem onSelect={() => handleMenuClick("view", row)}>
              <Eye className="h-4 w-4" />
              {t("common:viewDetails")}
            </DropdownMenuItem>
            )}
            {canEditAdmin && (
            <DropdownMenuItem onSelect={() => handleMenuClick("edit", row)}>
              <Pencil className="h-4 w-4" />
              {t("common:edit")}
            </DropdownMenuItem>
            )}
            {canDeleteAdmin && (
            <DropdownMenuItem onSelect={() => handleMenuClick("delete", row)}>
              <Trash2 className="h-4 w-4" />
              {t("common:delete")}
            </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        ),
      width: "150px",
    },
  ];

  const handleMenuClick = (key: string, row: any) => {
    setSelectedItem(key);

    switch (key) {
      case "view":
        setShowModal(true);
        setIsViewOnly(true);
        setFormState({
          name: row.name || "",
          email: row.email || "",
          phone: row.phone?.startsWith("966") ? row.phone.substring(3) : row.phone || "",
          address: row.address || "",
          dob: row.dob || "",
          country: String(row.country_id || getCountryIdByName(row.country) || ""),
          password: "",
          status: row.status === 1 || row.status === true || row.status === "Active",
        });
        break;

      case "edit":
        setShowModal(true);
        setIsViewOnly(false);
        setFormState({
          name: row.name || "",
          email: row.email || "",
          phone: row.phone?.startsWith("966") ? row.phone.substring(3) : row.phone || "",
          address: row.address || "",
          dob: row.dob || "",
          country: String(getCountryIdByName(row.country) || row.country_id || ""),
          password: "",
          status: row.status === 1 || row.status === true || row.status === "Active",
        });
        setUpdateId(row?.id);
        break;

      case "delete":
        handleDelete(row);
        break;

      default:
        break;
    }
  };

  const handleDelete = (row: any) => {
    setDeleteItem(row);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    
    setIsLoading(true);
    try {
      
      const response = await deleteAdmin(deleteItem.id, productId);
      
      toast.success(response?.data?.message || t("adminList.deleted"));
      fetchAdminList(); // Refresh the list
      setIsDeleteModalVisible(false);
      setDeleteItem(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      console.error("Error response:", error?.response?.data);

      // Check for specific error messages
      const errorMessage = error?.response?.data?.message ||
                          error?.response?.data?.error ||
                          error?.message ||
                          t("adminList.deleteFailed");
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const fetchAdminList = async () => {
    try {
      setSkelitonLoading(true);
      
      const response = await getProductAdminList(productId);
      
      if (response?.data?.message === "success") {
        const adminData = response?.data?.data?.data || [];
        setData(adminData);
        setSkelitonLoading(false);
        setTotalRows(adminData.length);
        setFrom(1);
        setTo(adminData.length);
        setPage(1);
        setTotalPage(1);
        toast.success(response?.data?.message || t("adminList.fetched"));
      } else {
        toast.error(response?.data?.message || t("adminList.fetchFailed"));
        setSkelitonLoading(false);
      }

    } catch (error: any) {
      toast.error(error?.message || t("adminList.fetchFailed"));
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await getCountries();
      if (response?.data?.message === "success") {
        setCountries(response?.data?.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching countries:", error);
    }
  };

  const validateForm = () => {
    const err: Record<string, string> = {};
    if (!formState.name?.trim()) err.name = t("admin.nameRequired");
    if (!formState.email?.trim()) err.email = t("admin.emailRequired");
    if (!formState.phone?.trim()) err.phone = t("adminList.phoneRequired");
    else if (!/^\d{9}$/.test(formState.phone.replace(/\D/g, ""))) err.phone = t("adminList.phoneDigits");
    if (!formState.address?.trim()) err.address = t("admin.addressRequired");
    if (!formState.dob?.trim()) err.dob = t("adminList.dobRequired");
    if (!formState.country) err.country = t("admin.countryRequired");
    if (selectedItem === "add" && !formState.password) err.password = t("adminList.passwordRequired");
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const addAdmin = async () => {
    if (!validateForm()) {
      toast.error(t("adminList.fixErrors"));
      return;
    }
    try {
      const adminData = {
        name: formState.name,
        phone: formState.phone,
        email: formState.email,
        dob: formState.dob,
        address: formState.address,
        country_id: parseInt(formState.country, 10),
        password: formState.password,
        status: formState.status ? 1 : 0,
      };
      await createAdmin(productId, adminData);
      toast.success(t("admin.created"));
      setShowModal(false);
      setFormState(initialFormState);
      setFormErrors({});
      fetchAdminList();
    } catch (error: any) {
      toast.error(error?.message || t("adminList.createFailed"));
    }
  };

  const editAdmin = async () => {
    if (!validateForm()) {
      toast.error(t("adminList.fixErrors"));
      return;
    }
    try {
      const adminData = {
        name: formState.name,
        phone: formState.phone,
        email: formState.email,
        dob: formState.dob,
        address: formState.address,
        country_id: parseInt(formState.country, 10),
        password: formState.password,
        status: formState.status ? 1 : 0,
      };
      const response = await updateAdmin(updateId, adminData);
      toast.success(response?.data?.message || t("admin.updated"));
      setShowModal(false);
      setFormState(initialFormState);
      setFormErrors({});
      fetchAdminList();
    } catch (error: any) {
      toast.error(error?.message || t("adminList.updateFailed"));
    }
  };

  useEffect(() => {
    if (productId) {
      fetchAdminList();
      fetchCountries();
    }
  }, [productId, page, pageSize]);

  useEffect(() => {
    if (showModal && selectedItem === "add") {
      setFormState(initialFormState);
      setFormErrors({});
    }
  }, [showModal, selectedItem]);

  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item?.id,
        name: item?.name || "-",
        email: item?.email || "-",
        phone: item?.phone || "-",
        address: item?.address || "-",
        dob: item?.dob || "-",
        country: item?.country || "-",
        status: item?.status === 1 || item?.status === true || item?.status === "Active" ? "Active" : "Inactive",
        registered_date: item?.registered_date || item?.created_at || "-",
      };
    });
    
  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{t("adminList.title")}</h4>
        {canCreateAdmin && (
        <UIButton
          className="theme-btn-next"
          onClick={() => {
            setShowModal(true);
            setSelectedItem("add");
            setIsViewOnly(false);
            setFormState(initialFormState);
            setFormErrors({});
          }}
        >
          {t("admin.addAdmin")}
        </UIButton>
        )}
      </div>
      <TableView
        header={AdminList_Header}
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
      
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-[732px]">
          <DialogHeader>
            <DialogTitle>{selectedItem === "edit" ? t("admin.editAdmin") : selectedItem === "view" ? t("admin.viewAdmin") : t("admin.addAdmin")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{t("adminList.adminName")}</Label>
              <Input
                placeholder={t("adminList.enterAdminName")}
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                disabled={isViewOnly}
              />
              {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t("common:email")}</Label>
              <Input
                placeholder={t("adminList.enterEmail")}
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                disabled={isViewOnly}
              />
              {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t("common:phone")}</Label>
              <Input
                placeholder={t("adminList.enterPhone9")}
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                disabled={isViewOnly}
                maxLength={9}
              />
              {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t("admin.address")}</Label>
              <Input
                placeholder={t("adminList.enterAddress")}
                value={formState.address}
                onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                disabled={isViewOnly}
              />
              {formErrors.address && <p className="text-sm text-destructive">{formErrors.address}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t("admin.dob")}</Label>
              <Input
                type="date"
                value={formState.dob}
                onChange={(e) => setFormState({ ...formState, dob: e.target.value })}
                disabled={isViewOnly}
              />
              {formErrors.dob && <p className="text-sm text-destructive">{formErrors.dob}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t("field.country")}</Label>
              <Select value={formState.country || undefined} onValueChange={(v) => setFormState({ ...formState, country: v })} disabled={isViewOnly}>
                <SelectTrigger><SelectValue placeholder={t("adminList.selectCountry")} /></SelectTrigger>
                <SelectContent>
                  {countries.map((country: any) => (
                    <SelectItem key={country.id} value={String(country.id)}>{country.country_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.country && <p className="text-sm text-destructive">{formErrors.country}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t("adminList.password")}</Label>
              <Input
                type="password"
                placeholder={t("adminList.enterPassword")}
                value={formState.password}
                onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                disabled={isViewOnly}
              />
              {formErrors.password && <p className="text-sm text-destructive">{formErrors.password}</p>}
            </div>
            <div className="space-y-2 flex items-end pb-2">
              <Label className="me-3">{t("common:status")}</Label>
              <Switch checked={formState.status} onCheckedChange={(c) => setFormState({ ...formState, status: c })} disabled={isViewOnly} />
            </div>
          </div>
          <DialogFooter>
            <UIButton variant="outline" onClick={() => setShowModal(false)}>{t("common:cancel")}</UIButton>
            {!isViewOnly && (
              <UIButton onClick={() => (selectedItem === "edit" ? editAdmin() : addAdmin())}>
                {selectedItem === "edit" ? t("common:update") : t("common:add")}
              </UIButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalVisible} onOpenChange={setIsDeleteModalVisible}>
        <DialogContent className="max-w-[378px]">
          <p className="text-center text-base font-semibold py-2">{t("adminList.confirmDeleteAdmin")}</p>
          <DialogFooter className="flex justify-center gap-2 sm:justify-center">
            <UIButton variant="outline" onClick={() => setIsDeleteModalVisible(false)}>{t("common:no")}</UIButton>
            <UIButton onClick={handleDeleteConfirm} disabled={isLoading}>{isLoading ? t("list.deleting") : t("common:yes")}</UIButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminList;