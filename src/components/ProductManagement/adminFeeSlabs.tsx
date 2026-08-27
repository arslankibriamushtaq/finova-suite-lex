import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TableView from "../TableView/TableView";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Button as UIButton } from "../ui/button";
import { adminFeeProducts, createFeeSlab, getProductById, updateFeeSlab, deleteProcessingFeeSlab, updateFeeSlabStatus } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { Pencil, Trash2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";


const AdminFeeSlabs = ({ readOnly = false,setSelectedTab }: any) => {
  const { t } = useTranslation("productManagement2");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>("add");
  const [newSlab, setNewSlab] = useState<any>({
    from_amount: "",
    to_amount: "",
    profit_percent: 0,
    admin_fee: 0,
    processing_fee: 0,
  });
  
  const location = useLocation();
  const dispatch = useDispatch();
  const product = useSelector((s: any) => s.block.productData);
  const searchParams = new URLSearchParams(location.search);
  // For edit/view: use URL id, For add: use Redux state id
  const productId = searchParams.get("id") || product?.id;
  useEffect(() => {
    const loadProductData = async () => {
      if (productId) {
        try {
          const response = await getProductById(productId, 'admin_fee_slabs');
          if (response?.data?.message === "success") {
            // Don't overwrite the full product data, just load admin fee slabs data
            if (response.data.data?.admin_fee_slabs) {
              setData(response.data.data.admin_fee_slabs);
            }
          }
        } catch (error: any) {
          toast.error(error?.response?.data?.message || t("adminFee.loadFailed"));
        }
      }
    };
    loadProductData();
  }, [productId, dispatch]);
const handleNext=()=>{
  localStorage.setItem("tabs", "EnvConfig");
  setSelectedTab("EnvConfig")
}
  const handleSubmit = async () => {
    try {
      const isEdit = selectedItem === "edit" && (newSlab as any).id;
      let response;
      if (isEdit) {
        const updateBody: any = {
          processing_fee_slab_id: (newSlab as any).id,
          from_amount: Number(newSlab.from_amount || 0),
          to_amount: Number(newSlab.to_amount || 0),
          processing_fee: Number(newSlab.processing_fee || 0),
          product_id: productId,
          admin_fee: Number(newSlab.admin_fee || 0),
        };
        response = await updateFeeSlab(updateBody);
      } else {
        const createBody: any = {
          product_id: productId,
          from_amount: Number(newSlab.from_amount || 0),
          to_amount: Number(newSlab.to_amount || 0),
          profit_percent: Number(newSlab.profit_percent || 0),
          admin_fee: Number(newSlab.admin_fee || 0),
          processing_fee: Number(newSlab.processing_fee || 0),
        };
        response = await createFeeSlab(createBody);
      }
      if (response?.data?.message === "success") {
        toast.success(response?.data?.message || t("adminFee.created"));
        setIsModalVisible(false);
        setNewSlab({ from_amount: "", to_amount: "", profit_percent: 0, admin_fee: 0, processing_fee: 0 });
        getList();
        return;
      }
      toast.error(response?.data?.message || t("adminFee.createFailed"));
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        Object.keys(err?.response?.data?.errors).forEach((field) => {
          err?.response?.data.errors[field].forEach((msg: any) => {
            toast.error(`${field}: ${msg}`);
          });
        });
        return;
      }
      toast.error(err?.response?.data?.message || t("adminFee.createFailed"));
    }
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Status change handling can be added when API is available

  // No row actions currently
  const Activity_Loans_Header = [
    { name: t("adminFee.fromAmount"), selector: (row: any) => `SR ${row.from_amount}`, sortable: true },
    { name: t("adminFee.toAmount"), selector: (row: any) => `SR ${row.to_amount}`, sortable: true },
    { name: t("adminFee.profitPct"), selector: (row: any) => `${row.profit_percent || 0}%`, sortable: true },
    { name: t("adminFee.adminFee"), selector: (row: any) => `SR ${row.admin_fee || 0}`, sortable: true },
    { name: t("adminFee.processingFee"), selector: (row: any) => `SR ${row.processing_fee || 0}`, sortable: true },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "2px",
            backgroundColor:
              row.status === "active" || row.status === 1
                ? "var(--chart-2)"
                : "var(--destructive)",
            color: "var(--primary-foreground)",
          }}
        >
          {row.status === "active" || row.status === 1 ? t("common:active") : t("common:inactive")}
        </div>
      ),
    },
    {
      name: t("adminFee.changeStatus"),
      cell: (row: { status: any; id?: number }) => (
        <Switch
          checked={row.status === 1}
          onCheckedChange={async (checked) => {
            if (row.id == null) return;
            const newStatus = checked ? 1 : 0;
            try {
              const res = await updateFeeSlabStatus(row.id, newStatus);
              if (res?.data?.success) {
                toast.success(res?.data?.message || t("adminFee.statusUpdated"));
                getList();
                setData((prevData: any) =>
                  prevData.map((item: any) =>
                    item.id === row.id ? { ...item, status: newStatus } : item
                  )
                );
              }
            } catch (error) {
              toast.error(t("adminFee.statusUpdateFailed"));
              console.error("Error updating status:", error);
            }
          }}
          disabled={readOnly}
        />
      ),
    },
    
    {
      name: t("common:actions"),

      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <UIButton
              className="gradient-btn bg-red-600 text-foreground border border-primary-foreground rounded-lg py-2.5 px-5"
              disabled={readOnly}
            >
              {t("list.select")} <ChevronDown className="h-4 w-4" />
            </UIButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => openEdit(row)}>
              <Pencil className="h-4 w-4" />
              {t("common:edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleDelete(row)}>
              <Trash2 className="h-4 w-4" />
              {t("common:delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const getList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await adminFeeProducts(productId, "");
      if (response) {
        const data = response?.data?.data?.data;
        setData(data || []);
        setSkelitonLoading(false);
        setTotalRows(response?.data?.data?.total || 0);
        setFrom(response?.data?.data?.from || 0);
        setTo(response?.data?.data?.to || 0);
        setPage(response?.data?.data?.current_page);
        setTotalPage(response?.data?.data?.last_page);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const openEdit = (row: any) => {
    setNewSlab({
      id: row.id,
      from_amount: row.from_amount,
      to_amount: row.to_amount,
      profit_percent: row.profit_percent,
      admin_fee: row.admin_fee,
      processing_fee: row.processing_fee,
    });
    setSelectedItem("edit");
    setIsModalVisible(true);
  };

  const handleDelete = async (row: any) => {
    try {
     const res= await deleteProcessingFeeSlab(row.id);
      toast.success(res?.data?.message || t("adminFee.deleted"));
      getList();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("adminFee.deleteFailed"));
    }
  };
  useEffect(() => {
    getList();
  }, [page, pageSize]);
  const mappedData =
    data &&
    data?.map((item: any) => ({
      id: item?.id,
      from_amount: item?.from_amount ?? item?.from ?? 0,
      to_amount: item?.to_amount ?? item?.to ?? 0,
      profit_percent: item?.profit_percent ?? item?.profit ?? 0,
      admin_fee: item?.admin_fee ?? 0,
      processing_fee: item?.processing_fee ?? 0,
      status: item?.status ?? 0, // Keep the original status value (0 or 1)
    }));

  return (
    <div className="service">
      <h1
        className="pt-2 pb-3"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        {t("adminFee.title")}
      </h1>
      <div className="d-flex justify-content-end mb-3 gap-2">
        {/* <Select defaultValue="All Partners" style={{ width: 160 }} disabled>
          <option>All Partners</option>
        </Select> */}
        <UIButton className="theme-btn-next" onClick={() => { setSelectedItem("add"); setIsModalVisible(true); }}>
          {t("adminFee.addNewRecord")}
        </UIButton>
      </div>

      <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{readOnly ? t("adminFee.viewTitle") : t("adminFee.addTitle")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t("adminFee.amountFrom")}</Label>
              <Input placeholder={t("adminFee.amountFrom")} value={newSlab.from_amount} onChange={(e) => setNewSlab({ ...newSlab, from_amount: e.target.value })} disabled={readOnly} />
            </div>
            <div className="space-y-2">
              <Label>{t("adminFee.amountTo")}</Label>
              <Input placeholder={t("adminFee.amountTo")} value={newSlab.to_amount} onChange={(e) => setNewSlab({ ...newSlab, to_amount: e.target.value })} disabled={readOnly} />
            </div>
            <div className="space-y-2">
              <Label>{t("adminFee.profit")}</Label>
              <Input placeholder={t("adminFee.profit")} value={newSlab.profit_percent} onChange={(e) => setNewSlab({ ...newSlab, profit_percent: e.target.value })} disabled={readOnly} />
            </div>
            <div className="space-y-2">
              <Label>{t("adminFee.adminFee")}</Label>
              <Input placeholder={t("adminFee.adminFee")} value={newSlab.admin_fee} onChange={(e) => setNewSlab({ ...newSlab, admin_fee: e.target.value })} disabled={readOnly} />
            </div>
            <div className="space-y-2">
              <Label>{t("adminFee.processingFee")}</Label>
              <Input placeholder={t("adminFee.processingFee")} value={newSlab.processing_fee} onChange={(e) => setNewSlab({ ...newSlab, processing_fee: e.target.value })} disabled={readOnly} />
            </div>
          </div>
          <DialogFooter>
            {readOnly ? (
              <UIButton onClick={handleCancel}>{t("common:close")}</UIButton>
            ) : (
              <>
                <UIButton variant="outline" onClick={handleCancel}>{t("common:cancel")}</UIButton>
                <UIButton className="theme-btn-next" onClick={handleSubmit}>{t("common:save")}</UIButton>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TableView
        header={Activity_Loans_Header}
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
      <div className="d-flex justify-content-end mt-3"><UIButton className="theme-btn-next" onClick={handleNext}>{t("common:next")}</UIButton></div>
    </div>
  );
};

export default AdminFeeSlabs;
