import { Checkbox, Input } from "antd";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getProductById } from "../../redux/apis/apisCrud";
import { listPartners } from "../../redux/apis/apisCrudProductManagement";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TableView from "../TableView/TableView";
import { usePermissions, PRODUCT_PARTNERS_PERMISSIONS } from "../../hooks/useProductPermissions";

const PartnerAffiliation = () => {
  const { t } = useTranslation("productManagement2");
  // TODO: Re-enable when permission API is implemented
  // const { hasPermission } = usePermissions();
  // const canUpdatePartner = hasPermission(PRODUCT_PARTNERS_PERMISSIONS.UPDATE);
  const canUpdatePartner = true;
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get("id");
  const mode = searchParams.get("mode");
  const readOnly = mode === "view";
const [data, setData] = useState<any[]>([]);

const [skelitonLoading, setSkelitonLoading] = useState(false);

  const columns = [
    { name: t("partnerAffiliation.partnerNameEn"), selector: (row: any) => row.name_en, width: "30%" },
    { name: t("partnerAffiliation.partnerNameAr"), selector: (row: any) => row.name_ar, width: "30%" },
    {
      name: t("partnerAffiliation.affiliation"),
      cell: (row: any, idx: number) => (
        <Checkbox
          checked={!!row.affiliated}
          disabled={readOnly || !canUpdatePartner}
          onChange={(e) => handleToggle(idx, e.target.checked)}
        />
      ),
      width: "20%",
    },
    {
      name: t("partnerAffiliation.commission"),
      cell: (row: any, idx: number) => (
        <Input
          type="number"
          min={0}
          max={100}
          value={row.commission ?? 0}
          disabled={readOnly || !row.affiliated || !canUpdatePartner}
          onChange={(e) => handleCommission(idx, Number(e.target.value))}
        />
      ),
      width: "20%",
    },
  ];

  const handleToggle = (index: number, checked: boolean) => {
    setPartners((prev: any[]) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], affiliated: checked };
      if (!checked) copy[index].commission = 0;
      return copy;
    });
  };

  const handleCommission = (index: number, value: number) => {
    setPartners((prev: any[]) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], commission: value };
      return copy;
    });
  };

  const loadPartners = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await getProductById(productId, "partnerAffiliations");
      const list =
        res?.data?.data?.partners || res?.data?.data?.partner_affiliations || [];
      const normalized = list.map((p: any) => ({
        id: p.id,
        name_en: p.nameEn || p.name_en || "-",
        name_ar: p.nameAr || p.name_ar || "-",
        affiliated: !!(p.affiliated ?? p.is_affiliated),
        commission: p.commission ?? 0,
      }));
      setPartners(normalized);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("partnerAffiliation.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, [productId]);
  const getProducts = async () => {
    try {
      setSkelitonLoading(true);

      const response = await listPartners();
      if (response?.data?.message === "success") {
        const data = response?.data?.data || [];
        setData(data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || t("partnerAffiliation.loadFailed"));
    } finally {
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getProducts();
  }, []);

 

  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item?.id,
        name_en: item?.nameEn || item?.name_en || "-",
        name_ar: item?.nameAr || item?.name_ar || "-",
        logo: item?.logoUrl || item?.logo,
        email: item?.email || "-",
        country: item?.country || "-",
        category: item?.category,
        status: item?.status === "ACTIVE" ? "Active" : item?.status === "INACTIVE" ? "Inactive" : (item?.status || "-"),
      };
    });
  return (
    <div className="service">
      <h1 className="pt-2 pb-3" style={{ fontSize: "16px", fontWeight: "bold" }}>
        {t("partnerAffiliation.title")}
      </h1>
      <TableView
        header={columns}
        data={mappedData}
        
        isLoading={skelitonLoading}
       
      />

      <div className="d-flex justify-content-end mt-3">
        <button className="theme-btn-next" disabled={loading}>{t("common:next")}</button>
      </div>
    </div>
  );
};

export default PartnerAffiliation;
