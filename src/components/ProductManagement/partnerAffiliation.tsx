import { Checkbox, Input } from "antd";
import { useLocation } from "react-router-dom";
import { getPartnerAffiliateDashboard, getProductById } from "../../redux/apis/apisCrud";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TableView from "../TableView/TableView";
import { usePermissions, PRODUCT_PARTNERS_PERMISSIONS } from "../../hooks/useProductPermissions";

const PartnerAffiliation = () => {
  // Permissions
  const { hasPermission } = usePermissions();
  const canUpdatePartner = hasPermission(PRODUCT_PARTNERS_PERMISSIONS.UPDATE);
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
    { name: "Partner Name (En)", selector: (row: any) => row.name_en, width: "30%" },
    { name: "Partner Name (Ar)", selector: (row: any) => row.name_ar, width: "30%" },
    {
      name: "Affiliation",
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
      name: "Commission (%)",
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
        name_en: p.name_en || p.nameEn || "-",
        name_ar: p.name_ar || p.nameAr || "-",
        affiliated: !!(p.affiliated ?? p.is_affiliated),
        commission: p.commission ?? 0,
      }));
      setPartners(normalized);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load partners");
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

      const response = await getPartnerAffiliateDashboard(productId);
      if (response) {
        const data = response?.data?.data?.data;
 
        setData(data || []);
        setSkelitonLoading(false);
   
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
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
        id:item?.id,
        name_en: item?.name_en || "-",
        name_ar: item?.name_ar || "-",
        logo: item?.logo,
        email: item?.email || "-",
        country: item?.country || "-",
        category: item?.category,
        status: item?.status,
      };
    });
  return (
    <div className="service">
      <h1 className="pt-2 pb-3" style={{ fontSize: "16px", fontWeight: "bold" }}>
        Partners Affiliation
      </h1>
      <TableView
        header={columns}
        data={mappedData}
        
        isLoading={skelitonLoading}
       
      />

      <div className="d-flex justify-content-end mt-3">
        <button className="theme-btn-next" disabled={loading}>Next</button>
      </div>
    </div>
  );
};

export default PartnerAffiliation;
