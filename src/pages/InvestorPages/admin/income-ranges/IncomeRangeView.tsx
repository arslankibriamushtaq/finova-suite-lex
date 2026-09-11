import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, SearchX, Wallet } from "lucide-react";
import toast from "react-hot-toast";

import { getIncomeRangeById, IncomeRange } from "../../../../redux/apis/apisInvestor";
import { Button } from "../../../../components/ui/button";
import { Block, EmptyState, Field, TabSkeleton } from "../../../../components/shared/detailKit";
import { LexPageHeader } from "../../../../components/shared/lexKit";

const LIST_PATH = "/InvestorDashboard/SystemSettings/IncomeRanges";

const IncomeRangeView = () => {
  const { t } = useTranslation("investor");
  const { incomeRangeId } = useParams<{ incomeRangeId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [incomeRangeData, setIncomeRangeData] = useState<IncomeRange | null>(null);

  const fetchIncomeRangeData = useCallback(async () => {
    if (!incomeRangeId) return;
    try {
      setLoading(true);
      const response = await getIncomeRangeById(incomeRangeId);
      if (response?.success) {
        setIncomeRangeData(response.data || null);
      } else {
        toast.error(response?.notificationMessage || t("irv.fetchError"));
      }
    } catch (error: any) {
      toast.error(error?.notificationMessage || error?.message || t("irv.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [incomeRangeId, t]);

  useEffect(() => {
    fetchIncomeRangeData();
  }, [fetchIncomeRangeData]);

  // The list renders amounts as `SAR 1,234`; the detail page used to put the
  // currency after the number, so the same figure read differently either side
  // of a click.
  const money = (value?: number) => `SAR ${Number(value ?? 0).toLocaleString()}`;
  const stamp = (value?: string | null) => (value ? new Date(value).toLocaleString() : "—");

  return (
    <div className="service">
      <LexPageHeader icon={Wallet} title={t("irv.detailsTitle")} subtitle={t("irv.subtitle")}>
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(LIST_PATH)}>
          <ArrowLeft className="h-4 w-4" />
          {t("irv.backToList")}
        </Button>
      </LexPageHeader>

      {loading ? (
        <TabSkeleton variant="fields" />
      ) : !incomeRangeData ? (
        <div className="pro-card p-4">
          <EmptyState icon={SearchX} text={t("irv.notFound")} />
        </div>
      ) : (
        <Block title={t("irv.infoTitle")} icon={Wallet}>
          {/* A range is one fact, not two, so the band leads and the two
              endpoints stay below it. */}
          <p className="m-0 mb-1 text-xs text-muted-foreground">{t("irv.spanLabel")}</p>
          <p className="m-0 mb-4 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {money(incomeRangeData.minimumAmount)} &ndash; {money(incomeRangeData.maximumAmount)}
          </p>

          <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
            <Field label={t("irv.label.minAmount")} value={money(incomeRangeData.minimumAmount)} />
            <Field label={t("irv.label.maxAmount")} value={money(incomeRangeData.maximumAmount)} />
            <Field label={t("common:createdAt")} value={stamp(incomeRangeData.createdAt)} />
            <Field label={t("common:updatedAt")} value={stamp(incomeRangeData.updatedAt)} />
            <Field label={t("irv.label.id")} value={incomeRangeData.id} mono />
          </div>
        </Block>
      )}
    </div>
  );
};

export default IncomeRangeView;
