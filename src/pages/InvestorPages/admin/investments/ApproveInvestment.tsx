import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ChevronDown, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import TableView from "../../../../components/TableView/TableView";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { LexPageHeader } from "../../../../components/shared/lexKit";
import { TONES } from "../../../../components/shared/detailKitUtils";
import {
  getAllInvestments,
  approveInvestment,
  updateWalletBalance,
  getAllProducts,
  getAllKycInvestors,
  getAllKybInvestors,
} from "../../../../redux/apis/apisInvestor";
import { usePermissions } from "../../../../hooks/useProductPermissions";

const formatMoney = (amount?: number) =>
  `SAR ${Number(amount ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const ApproveInvestment = () => {
  const { hasPermission } = usePermissions();
  const canApprove = hasPermission('PORTFOLIO_INVESTMENT_APPROVE');
  const { t } = useTranslation("investor");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  // The queue rows carry investorId and productId and no names, so both
  // catalogues are read once and used as lookup tables — the two name columns
  // rendered "-" for every row without them.
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [investorNames, setInvestorNames] = useState<Record<string, string>>({});
  const [totalPage, setTotalPage] = useState(0);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    getInvestmentsList();
  }, [page, pageSize]);

  useEffect(() => {
    (async () => {
      try {
        const products = await getAllProducts(1, 100);
        if (products?.success) {
          setProductNames(
            Object.fromEntries((products.data || []).map((p: any) => [p.id, p.name]))
          );
        }
      } catch {
        /* the id is shown instead */
      }
      try {
        const [kyc, kyb] = await Promise.all([
          getAllKycInvestors(1, 100),
          getAllKybInvestors(1, 100),
        ]);
        const names: Record<string, string> = {};
        for (const k of kyc?.data || []) {
          if (k.investorId)
            names[k.investorId] = `${k.firstNameInEnglish || ""} ${k.lastNameInEnglish || ""}`.trim();
        }
        for (const k of kyb?.data || []) {
          if (k.investorId)
            names[k.investorId] =
              k.companyName || `${k.firstNameInEnglish || ""} ${k.lastNameInEnglish || ""}`.trim();
        }
        setInvestorNames(names);
      } catch {
        /* the id is shown instead */
      }
    })();
  }, []);

  const getInvestmentsList = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getAllInvestments(page, pageSize);

      if (response?.success) {
        const investmentsData = response?.data || [];
        const pageInfo = response.pageInfo || {};

        setData(investmentsData);
        const totalItems = pageInfo.totalItems || pageInfo.totalCount || 0;
        setTotalRows(totalItems);
        setFrom(pageInfo.page ? (pageInfo.page - 1) * pageInfo.pageSize + 1 : 1);
        setTo(pageInfo.page ? Math.min(pageInfo.page * pageInfo.pageSize, totalItems) : 0);
        setPage(pageInfo.page || page);
        setTotalPage(pageInfo.totalPages || 1);
      }
      setSkelitonLoading(false);
    } catch (error: any) {
      toast.error(error?.notificationMessage || error?.message || t("appinv.fetchError"));
      setSkelitonLoading(false);
    }
  };

  const handleApproveClick = (row: any) => {
    setSelectedInvestment(row);
    setApproveModalVisible(true);
  };

  const handleApprove = async () => {
    if (!selectedInvestment) {
      toast.error(t("appinv.selectError"));
      return;
    }

    try {
      setApproving(true);

      // Step 1: Approve the investment
      const approveResult = await approveInvestment({
        investmentId: selectedInvestment.id,
        verificationStatus: 1,
      });

      if (approveResult.success === false) {
        // Show notification message if approval fails
        const errorMessage = approveResult.notificationMessage || t("appinv.approveError");
        toast.error(errorMessage);
        setApproving(false);
        return;
      }

      if (approveResult.success) {
        // Step 2: If approval succeeds, update wallet balance
        const walletUpdateResult = await updateWalletBalance({
          userId: selectedInvestment.investorId,
          investment: selectedInvestment.investmentAmount || 0,
        });

        // Only update status and refresh if BOTH APIs succeeded
        if (walletUpdateResult.success) {
          // Both APIs succeeded - update the status in the table
          setData((prevData: any[]) =>
            prevData.map((item: any) =>
              item.id === selectedInvestment.id ? { ...item, verificationStatus: 1 } : item
            )
          );

          toast.success(
            walletUpdateResult?.data?.notificationMessage ||
              walletUpdateResult?.message ||
              t("appinv.success")
          );
          setApproveModalVisible(false);
          setSelectedInvestment(null);
          // Refresh the list to get latest data
          getInvestmentsList();
        } else {
          // Wallet update failed - don't update status or refresh list
          toast.error(walletUpdateResult.error || t("appinv.walletError"));
        }
      }
      setApproving(false);
    } catch (error: any) {
      toast.error(error?.notificationMessage || error?.message || t("appinv.approveError"));
      setApproving(false);
    }
  };

  /** verificationStatus: 0 = pending, anything else = approved. */
  const isApproved = (row: any) =>
    row.verificationStatus !== undefined && row.verificationStatus !== 0;

  const Headers = [
    {
      name: t("appinv.col.productName"),
      selector: (row: any) => row.productName || productNames[row.productId] || row.productId || "-",
      sortable: true,
    },
    {
      name: t("appinv.col.investmentAmount"),
      selector: (row: any) => (row.investmentAmount ? formatMoney(row.investmentAmount) : "-"),
      sortable: true,
    },
    {
      name: t("appinv.col.investorName"),
      selector: (row: any) =>
        row.investorName || investorNames[row.investorId] || row.investorId || "-",
      sortable: true,
    },
    {
      name: t("common:status"),
      // Was a solid pill filled with var(--color-success) — which is the brand
      // RED in this app — so an approved investment rendered as a red block and
      // read as a failure. Outline badges on the shared tones instead.
      cell: (row: any) => (
        <Badge
          variant="outline"
          className={`border font-medium ${isApproved(row) ? TONES.emerald : TONES.amber}`}
        >
          {isApproved(row) ? t("appinv.status.approved") : t("appinv.status.pending")}
        </Badge>
      ),
      sortable: true,
    },
    {
      name: t("common:createdAt"),
      selector: (row: any) =>
        row.createdAt ? (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {new Date(row.createdAt).toLocaleString()}
          </span>
        ) : (
          "-"
        ),
      sortable: true,
    },
    {
      name: t("common:actions"),
      cell: (row: any) => {
        // Nothing left to do on an approved row, so it states that rather than
        // offering a menu whose only item would be disabled. The old version
        // said it in a pill hardcoded to #434948.
        if (isApproved(row)) {
          return (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("appinv.alreadyApproved")}
            </span>
          );
        }
        if (!canApprove) {
          return <span className="text-xs text-muted-foreground">&mdash;</span>;
        }
        return (
          <div
            className="relative inline-block"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  {t("appinv.select")}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="z-[9999]">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleApproveClick(row);
                  }}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t("appinv.approve")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      width: "150px",
    },
  ];

  return (
    <div className="service">
      <LexPageHeader icon={ShieldCheck} title={t("appinv.title")} />

      <div className="pro-card p-4">
        <TableView
          header={Headers}
          data={data}
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

      {/* Approving moves money: it credits the investor's wallet as its second
          step. So the dialog restates who and how much, and closing is blocked
          while the two calls are in flight — a dismissed dialog mid-flight
          would leave the approval done and the wallet update unaccounted for. */}
      <Dialog
        open={approveModalVisible}
        onOpenChange={(open) => {
          if (approving) return;
          if (!open) {
            setApproveModalVisible(false);
            setSelectedInvestment(null);
          }
        }}
      >
        <DialogContent className="pro-dialog confirm-dialog sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
              <ShieldCheck className="size-6 text-red-600 dark:text-red-400" />
            </span>
            <DialogTitle className="text-center">{t("appinv.title")}</DialogTitle>
            <DialogDescription className="text-center">
              {t("appinv.confirmDescription")}
            </DialogDescription>
          </DialogHeader>

          {selectedInvestment && (
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-md border bg-muted/40 px-4 py-3 text-sm">
              <dt className="text-muted-foreground">{t("appinv.modalInvestorName")}</dt>
              <dd className="m-0 truncate font-medium text-foreground">
                {selectedInvestment.investorName || "-"}
              </dd>
              <dt className="text-muted-foreground">{t("appinv.modalProductName")}</dt>
              <dd className="m-0 truncate font-medium text-foreground">
                {selectedInvestment.productName || "-"}
              </dd>
              <dt className="text-muted-foreground">{t("appinv.modalInvestmentAmount")}</dt>
              <dd className="m-0 font-semibold tabular-nums text-foreground">
                {formatMoney(selectedInvestment.investmentAmount)}
              </dd>
            </dl>
          )}

          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              variant="outline"
              disabled={approving}
              onClick={() => {
                setApproveModalVisible(false);
                setSelectedInvestment(null);
              }}
            >
              {t("common:cancel")}
            </Button>
            <Button onClick={handleApprove} disabled={approving} className="gap-2">
              {approving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("appinv.approve")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApproveInvestment;
