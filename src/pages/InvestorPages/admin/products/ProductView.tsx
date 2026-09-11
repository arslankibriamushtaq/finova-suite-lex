import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CalendarClock,
  Coins,
  Package,
  PackageX,
  Percent,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";

import { getProductById, Product } from "../../../../redux/apis/apisInvestor";
import {
  PRODUCT_STATUSES,
  PRODUCT_CATEGORIES,
  enumToNumber,
  humaniseEnum,
} from "./productEnums";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Block, EmptyState, Field, TabSkeleton } from "../../../../components/shared/detailKit";
import { TONES } from "../../../../components/shared/detailKitUtils";
import { LexMetricTile, LexPageHeader } from "../../../../components/shared/lexKit";
import { cn } from "../../../../lib/utils";

/**
 * ProductStatus, in the order the service numbers them.
 *
 * These were five inline hex values, and two of them were the same colour:
 * Active was `#AB1920` (labelled "Green for Active" in a comment, though it is
 * the brand red) and Closed `#ff4d4f`. A live product and a closed one both
 * rendered as a red pill — the two states an operator most needs to tell apart.
 *
 * Indexed by ordinal, which is why the status goes through `enumToNumber`
 * first: the service sends the name ("ACTIVE") and takes the number back.
 */
const PRODUCT_STATUS = [
  { key: "pv.status.active", tone: TONES.emerald },
  { key: "pv.status.inactive", tone: TONES.slate },
  { key: "pv.status.closed", tone: TONES.red },
  { key: "pv.status.suspended", tone: TONES.amber },
  { key: "pv.status.launching", tone: TONES.sky },
];

const ProductView = () => {
  const { t } = useTranslation("investor");
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<Product | null>(null);

  const fetchProductData = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const response = await getProductById(productId);
      if (response?.success) {
        setProductData(response.data || null);
      } else {
        toast.error(response?.notificationMessage || t("pv.fetchError"));
      }
    } catch (error: any) {
      toast.error(error?.notificationMessage || error?.message || t("pv.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [productId, t]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const money = (value?: number) => `SAR ${Number(value ?? 0).toLocaleString()}`;
  const stamp = (value?: string | null) => (value ? new Date(value).toLocaleString() : "—");

  const getProductCategoryText = (category: number | string | undefined) => {
    const categoryMap: { [key: number]: string } = {
      0: t("pln.cat.equity"),
      1: t("pln.cat.fixedIncome"),
      2: t("pln.cat.realEstate"),
      3: t("pln.cat.commodities"),
      4: t("pln.cat.mutualFunds"),
      5: t("pln.cat.etf"),
      6: t("pln.cat.crypto"),
      7: t("pln.cat.altInvestments"),
      8: t("pln.cat.cash"),
    };
    if (category === undefined || category === null || category === "") return "—";
    return (
      categoryMap[enumToNumber(category, PRODUCT_CATEGORIES, -1)] || humaniseEnum(category) || "—"
    );
  };

  /* The service sends a named term ("MEDIUM_TERM"), not a month count —
     "MEDIUM_TERM months" was the old rendering. A number still reads as months. */
  const durationText = (value: Product["investmentDuration"]) => {
    if (!value) return "—";
    return typeof value === "number" || !Number.isNaN(Number(value))
      ? t("pv.months", { value })
      : humaniseEnum(value);
  };

  const status = productData
    ? PRODUCT_STATUS[enumToNumber(productData.productStatus, PRODUCT_STATUSES, -1)]
    : undefined;

  const statusBadge = productData ? (
    <Badge variant="outline" className={cn("border font-medium", status?.tone ?? TONES.slate)}>
      {status ? t(status.key) : t("pv.status.unknown")}
    </Badge>
  ) : null;

  return (
    <div className="service">
      <LexPageHeader
        icon={Package}
        title={productData?.name || t("pv.detailsTitle")}
        subtitle={t("pv.subtitle")}
      >
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => navigate("/InvestorDashboard/Products")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("pv.backToList")}
        </Button>
        {productData && (
          <Button
            size="sm"
            className="gap-2"
            onClick={() => navigate(`/InvestorDashboard/Products/${productData.id}/config`)}
          >
            <Settings className="h-4 w-4" />
            {t("pln.menu.configurations")}
          </Button>
        )}
      </LexPageHeader>

      {loading ? (
        <TabSkeleton variant="fields" />
      ) : !productData ? (
        <div className="pro-card p-4">
          <EmptyState icon={PackageX} text={t("pv.notFound")} />
        </div>
      ) : (
        <>
          {/* The three numbers that decide whether this product is worth
              opening — they were rows fourteen deep in a description list. */}
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <LexMetricTile
              label={t("pv.label.expectedReturn")}
              icon={Percent}
              tone="emerald"
              value={`${productData.expectedReturn ?? 0}%`}
            />
            <LexMetricTile
              label={t("pv.label.minInvestment")}
              icon={Coins}
              tone="sky"
              value={money(productData.minimumInvestment)}
            />
            <LexMetricTile
              label={t("pv.label.duration")}
              icon={CalendarClock}
              tone="slate"
              value={durationText(productData.investmentDuration)}
            />
          </div>

          <Block title={t("pv.infoTitle")} icon={Package} right={statusBadge}>
            <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
              <Field label={t("pv.label.name")} value={productData.name || "—"} />
              <Field label={t("pv.label.status")} value={statusBadge} />
              <Field label={t("pv.label.type")} value={humaniseEnum(productData.type) || "—"} />
              <Field label={t("pv.label.code")} value={productData.code || "—"} />
              <Field
                label={t("pv.label.category")}
                value={getProductCategoryText(productData.productCategory)}
              />
              <Field
                label={t("pv.label.launchDate")}
                value={
                  productData.launchDate
                    ? new Date(productData.launchDate).toLocaleDateString()
                    : "—"
                }
              />
              <Field label={t("pv.label.id")} value={productData.id} mono />
              <Field label={t("pv.label.segmentId")} value={productData.segmentId || "—"} mono />
              <Field label={t("common:createdAt")} value={stamp(productData.createdAt)} />
              <Field label={t("common:updatedAt")} value={stamp(productData.updatedAt)} />
            </div>

            {/* Description reads as prose, so it gets the full width rather than
                being squeezed into a label/value row. */}
            <div className="mt-4 border-t pt-3">
              <p className="m-0 mb-1 text-xs text-muted-foreground">{t("common:description")}</p>
              <p className="m-0 text-sm leading-relaxed text-foreground">
                {productData.description || "—"}
              </p>
            </div>
          </Block>
        </>
      )}
    </div>
  );
};

export default ProductView;
