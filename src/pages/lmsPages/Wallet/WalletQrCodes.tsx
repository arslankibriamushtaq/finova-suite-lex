import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  QrCode,
  RefreshCw,
  Plus,
  Ban,
  ScanLine,
  Send,
  Copy,
  Wallet as WalletIcon,
} from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Textarea } from "../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { SearchField } from "../../../components/shared/filterKit";
import { TONES, formatDateTime } from "../../../components/shared/detailKitUtils";

import {
  getWalletStaticQr,
  createDynamicWalletQr,
  resolveWalletQr,
  payWalletQr,
  revokeWalletQr,
  qrErrorMessage,
  qrImageSrc,
  formatQrAmount,
  isQrPayable,
  newQrIdempotencyKey,
  type WalletQrCode,
  type ResolvedWalletQr,
} from "../../../redux/apis/apisWalletQr";
import {
  listAdminWallets,
  type WalletResponse,
} from "../../../redux/apis/apisWalletAdmin";

const STATUS_TONE: Record<string, string> = {
  ACTIVE: TONES.emerald,
  USED: TONES.slate,
  EXPIRED: TONES.amber,
  REVOKED: TONES.red,
};

const WalletQrCodes = () => {
  const { t } = useTranslation("walletQr");

  /**
   * The tab lives in the URL, not in state: the sidebar has a child entry per
   * tab, so a stale highlight or a deep link opening the wrong half would both
   * be lies. Switching tabs replaces rather than pushes — flipping between the
   * two is not a step worth walking back through.
   */
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const tab: "codes" | "pay" = pathname.includes("/ScanPay") ? "pay" : "codes";
  const setTab = (next: "codes" | "pay") =>
    navigate(next === "pay" ? "/LOS/Wallet/Qr/ScanPay" : "/LOS/Wallet/Qr/Codes", {
      replace: true,
    });

  // ---- wallet selection -------------------------------------------------
  const [walletSearch, setWalletSearch] = useState("");
  const [wallets, setWallets] = useState<WalletResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);

  // ---- codes ------------------------------------------------------------
  const [staticCode, setStaticCode] = useState<WalletQrCode | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  /**
   * Dynamic codes minted here. The service exposes no per-wallet history
   * endpoint — only the wallet's permanent code — so anything older than this
   * session is looked up in support, not listed here.
   */
  const [dynamicCodes, setDynamicCodes] = useState<WalletQrCode[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", ttlMinutes: "", reference: "" });
  const [isSaving, setIsSaving] = useState(false);

  // ---- scan & pay -------------------------------------------------------
  const [payload, setPayload] = useState("");
  const [resolved, setResolved] = useState<ResolvedWalletQr | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const searchWallets = async (term: string) => {
    const q = term.trim();
    if (!q) return setWallets([]);
    setIsSearching(true);
    try {
      const res = await listAdminWallets({ page: 0, size: 10, search: q });
      const body = res?.data ?? {};
      const inner = body?.data ?? body;
      const rows = Array.isArray(inner) ? inner : inner?.content ?? [];
      setWallets(Array.isArray(rows) ? rows : []);
    } catch (error) {
      toast.error(qrErrorMessage(error, t("toast.walletSearchFailed")));
      setWallets([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced so typing a wallet number does not fire a request per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => searchWallets(walletSearch), 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletSearch]);

  const loadStaticCode = async (walletId: string) => {
    setIsLoadingCode(true);
    try {
      setStaticCode(await getWalletStaticQr(walletId));
    } catch (error) {
      toast.error(qrErrorMessage(error, t("toast.loadFailed")));
      setStaticCode(null);
    } finally {
      setIsLoadingCode(false);
    }
  };

  const selectWallet = (row: WalletResponse) => {
    setWallet(row);
    setWallets([]);
    setWalletSearch("");
    setDynamicCodes([]);
    // Reading the code is what mints it, so selecting a wallet is enough.
    loadStaticCode(row.id);
  };

  const createDynamic = async () => {
    if (!wallet) return;
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0)
      return toast.error(t("valid.amount"));
    const ttl = form.ttlMinutes.trim() ? Number(form.ttlMinutes) : undefined;
    if (ttl !== undefined && (!Number.isFinite(ttl) || ttl <= 0))
      return toast.error(t("valid.ttl"));

    setIsSaving(true);
    try {
      const code = await createDynamicWalletQr(wallet.id, {
        amount,
        ttlMinutes: ttl,
        reference: form.reference.trim() || undefined,
      });
      setDynamicCodes((list) => [code, ...list]);
      setDialogOpen(false);
      setForm({ amount: "", ttlMinutes: "", reference: "" });
      toast.success(t("toast.dynamicCreated"));
    } catch (error) {
      toast.error(qrErrorMessage(error, t("toast.dynamicFailed")));
    } finally {
      setIsSaving(false);
    }
  };

  const revoke = async (code: WalletQrCode) => {
    try {
      await revokeWalletQr(code.id);
      toast.success(t("toast.revoked"));
      if (code.qrType === "STATIC") {
        // A revoked permanent code is not the end — the next read mints a new
        // one, so re-reading immediately is the whole recovery.
        if (wallet) loadStaticCode(wallet.id);
      } else {
        setDynamicCodes((list) =>
          list.map((c) => (c.id === code.id ? { ...c, status: "REVOKED" } : c))
        );
      }
    } catch (error) {
      toast.error(qrErrorMessage(error, t("toast.revokeFailed")));
    }
  };

  const copy = (value?: string | null) => {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    toast.success(t("toast.copied"));
  };

  const resolve = async () => {
    const raw = payload.trim();
    if (!raw) return toast.error(t("valid.payload"));
    setIsResolving(true);
    try {
      const result = await resolveWalletQr(raw);
      setResolved(result);
      // A dynamic code carries its own amount; a static one is an open request.
      setPayAmount(result.amount != null ? String(result.amount) : "");
    } catch (error) {
      setResolved(null);
      toast.error(qrErrorMessage(error, t("toast.resolveFailed")));
    } finally {
      setIsResolving(false);
    }
  };

  const pay = async () => {
    if (!resolved) return;
    if (!wallet) return toast.error(t("valid.sourceWallet"));
    const needsAmount = resolved.amount == null;
    const amount = Number(payAmount);
    if (needsAmount && (!Number.isFinite(amount) || amount <= 0))
      return toast.error(t("valid.amount"));

    setIsPaying(true);
    try {
      await payWalletQr({
        payload: payload.trim(),
        sourceWalletId: wallet.id,
        // Echoed from /resolve — this is what stops the code being re-pointed
        // between the preview above and this call.
        expectedCreditWalletId: resolved.expectedCreditWalletId,
        amount: needsAmount ? amount : undefined,
        note: payNote.trim() || undefined,
        idempotencyKey: newQrIdempotencyKey(),
      });
      toast.success(t("toast.paid"));
      setResolved(null);
      setPayload("");
      setPayAmount("");
      setPayNote("");
    } catch (error) {
      toast.error(qrErrorMessage(error, t("toast.payFailed")));
    } finally {
      setIsPaying(false);
    }
  };

  const rows = useMemo(
    () => (staticCode ? [staticCode, ...dynamicCodes] : dynamicCodes),
    [staticCode, dynamicCodes]
  );

  const headers = [
    {
      name: t("col.type"),
      cell: (row: WalletQrCode) => (
        <Badge
          variant="outline"
          className={`border font-medium whitespace-nowrap ${
            row.qrType === "STATIC" ? TONES.slate : TONES.sky
          }`}
        >
          {row.qrType === "STATIC" ? t("type.static") : t("type.dynamic")}
        </Badge>
      ),
      width: "120px",
    },
    {
      name: t("col.amount"),
      cell: (row: WalletQrCode) => (
        <span className="font-medium whitespace-nowrap">
          {row.amount == null ? t("anyAmount") : formatQrAmount(row.amount, row.currency)}
        </span>
      ),
      width: "160px",
    },
    {
      name: t("col.status"),
      cell: (row: WalletQrCode) => (
        <Badge
          variant="outline"
          className={`border font-medium whitespace-nowrap ${
            STATUS_TONE[row.status] || TONES.slate
          }`}
        >
          {t(`status.${row.status}`)}
        </Badge>
      ),
      width: "120px",
    },
    {
      name: t("col.expiresAt"),
      cell: (row: WalletQrCode) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {row.expiresAt ? formatDateTime(row.expiresAt) : "-"}
        </span>
      ),
      width: "180px",
    },
    {
      name: t("col.token"),
      cell: (row: WalletQrCode) => (
        <span className="font-mono text-xs">
          {row.qrToken ? `…${row.qrToken.slice(-10)}` : "-"}
        </span>
      ),
      width: "140px",
    },
    {
      name: t("col.action"),
      cell: (row: WalletQrCode) =>
        row.status === "ACTIVE" ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => revoke(row)}
          >
            <Ban className="h-4 w-4" />
            {t("action.revoke")}
          </Button>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      width: "140px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <QrCode className="h-4 w-4" />
          </span>
          {t("title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* The wallet is the subject of both tabs: it is whose code is shown, and
          it is the account a payment is debited from. */}
      <Card className="mb-4 pro-card-glow">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
              <WalletIcon className="h-4 w-4" />
            </span>
            {t("wallet.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wallet ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-3">
              <div>
                <p className="font-mono font-medium">{wallet.walletNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {wallet.currency} · {wallet.status}
                  {wallet.maskedName ? ` · ${wallet.maskedName}` : ""}
                </p>
              </div>
              <Button variant="outline" onClick={() => { setWallet(null); setStaticCode(null); setDynamicCodes([]); }}>
                {t("wallet.change")}
              </Button>
            </div>
          ) : (
            <>
              <SearchField
                id="wallet-qr-wallet-search"
                placeholder={t("wallet.search")}
                value={walletSearch}
                onChange={setWalletSearch}
              />
              {isSearching && (
                <p className="mt-2 text-xs text-muted-foreground">{t("wallet.searching")}</p>
              )}
              {wallets.length > 0 && (
                <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                  {wallets.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-start hover:bg-muted"
                        onClick={() => selectWallet(row)}
                      >
                        <span className="font-mono text-sm">{row.walletNumber}</span>
                        <span className="text-xs text-muted-foreground">
                          {row.currency} · {row.status}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "codes" | "pay")}>
        <TabsList className="mb-4 coa-tabs">
          <TabsTrigger value="codes" className="coa-tab-trigger">
            {t("tab.codes")}
          </TabsTrigger>
          <TabsTrigger value="pay" className="coa-tab-trigger">
            {t("tab.pay")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="codes">
          {!wallet ? (
            <div className="pro-card p-4 text-sm text-muted-foreground">
              {t("empty.pickWallet")}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
                <Card className="pro-card-glow">
                  <CardHeader>
                    <CardTitle className="text-base">{t("static.title")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isLoadingCode ? (
                      <p className="text-sm text-muted-foreground">{t("static.loading")}</p>
                    ) : staticCode ? (
                      <>
                        {qrImageSrc(staticCode) ? (
                          <img
                            src={qrImageSrc(staticCode) as string}
                            alt={t("static.title")}
                            className="mx-auto h-48 w-48 rounded-lg border border-border bg-white p-2"
                          />
                        ) : (
                          <p className="break-all rounded-lg border border-border p-3 font-mono text-xs">
                            {staticCode.payload || staticCode.qrToken}
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <Badge
                            variant="outline"
                            className={`border font-medium ${STATUS_TONE[staticCode.status] || TONES.slate}`}
                          >
                            {t(`status.${staticCode.status}`)}
                          </Badge>
                          <span className="text-muted-foreground">{staticCode.currency}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => copy(staticCode.payload || staticCode.qrToken)}
                          >
                            <Copy className="h-4 w-4" />
                            {t("action.copyPayload")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => loadStaticCode(wallet.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                            {t("common:refresh")}
                          </Button>
                        </div>
                        {!isQrPayable(staticCode) && (
                          <p className="text-xs text-muted-foreground">
                            {t("static.inactiveHint")}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("static.none")}</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="pro-card-glow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between gap-2">
                      {t("list.title")}
                      <Button
                        className="wallet-brand-btn h-9 gap-2"
                        onClick={() => setDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        {t("action.requestMoney")}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TableView
                      header={headers}
                      data={rows}
                      isLoading={isLoadingCode}
                      paginationShow={false}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("list.sessionHint")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* The newest dynamic code is shown large — it is the thing the
                  payer has to point a camera at right now. */}
              {dynamicCodes[0] && qrImageSrc(dynamicCodes[0]) && (
                <Card className="mt-4 pro-card-glow">
                  <CardHeader>
                    <CardTitle className="text-base">{t("dynamic.latest")}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-4">
                    <img
                      src={qrImageSrc(dynamicCodes[0]) as string}
                      alt={t("dynamic.latest")}
                      className="h-48 w-48 rounded-lg border border-border bg-white p-2"
                    />
                    <div className="space-y-1 text-sm">
                      <p className="text-lg font-semibold">
                        {formatQrAmount(dynamicCodes[0].amount, dynamicCodes[0].currency)}
                      </p>
                      <p className="text-muted-foreground">
                        {t("dynamic.expires", {
                          when: dynamicCodes[0].expiresAt
                            ? formatDateTime(dynamicCodes[0].expiresAt)
                            : "-",
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="pay">
          <Card className="pro-card-glow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                  <ScanLine className="h-4 w-4" />
                </span>
                {t("pay.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("pay.payload")}</Label>
                <Textarea
                  rows={3}
                  placeholder={t("pay.payloadPlaceholder")}
                  value={payload}
                  onChange={(e) => {
                    setPayload(e.target.value);
                    // The preview belongs to the payload that produced it.
                    setResolved(null);
                  }}
                />
                <p className="text-xs text-muted-foreground">{t("pay.payloadHint")}</p>
              </div>
              <Button variant="outline" className="gap-2" onClick={resolve} disabled={isResolving}>
                <ScanLine className="h-4 w-4" />
                {isResolving ? t("pay.resolving") : t("pay.resolve")}
              </Button>

              {resolved && (
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <Detail label={t("pay.payee")} value={resolved.payeeName || "-"} />
                    <Detail
                      label={t("pay.creditWallet")}
                      value={resolved.maskedWalletNumber || "-"}
                      mono
                    />
                    <Detail
                      label={t("col.amount")}
                      value={
                        resolved.amount == null
                          ? t("anyAmount")
                          : formatQrAmount(resolved.amount, resolved.currency)
                      }
                    />
                    <Detail label={t("col.status")} value={t(`status.${resolved.status}`)} />
                  </div>

                  {resolved.amount == null && (
                    <div className="space-y-2">
                      <Label>
                        {t("pay.amount")}
                        <span className="text-destructive"> *</span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>{t("pay.note")}</Label>
                    <Input
                      placeholder={t("pay.notePlaceholder")}
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                    />
                  </div>

                  {!wallet && (
                    <p className="text-xs text-destructive">{t("pay.needsSourceWallet")}</p>
                  )}

                  <div className="flex justify-end">
                    <Button
                      className="wallet-brand-btn gap-2"
                      onClick={pay}
                      disabled={isPaying || !wallet || resolved.status !== "ACTIVE"}
                    >
                      <Send className="h-4 w-4" />
                      {isPaying ? t("pay.paying") : t("pay.confirm")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="pro-dialog sm:max-w-[460px]">
          <DialogHeader className="text-start">
            <DialogTitle>{t("dynamic.dialogTitle")}</DialogTitle>
            <DialogDescription>{t("dynamic.dialogDescription")}</DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto overflow-x-hidden">
            <div className="space-y-2">
              <Label>
                {t("dynamic.amount")}
                <span className="text-destructive"> *</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                {t("dynamic.amountHint", { currency: wallet?.currency || "" })}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("dynamic.ttl")}</Label>
              <Input
                type="number"
                min="1"
                placeholder="15"
                value={form.ttlMinutes}
                onChange={(e) => setForm((s) => ({ ...s, ttlMinutes: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">{t("dynamic.ttlHint")}</p>
            </div>
            <div className="space-y-2">
              <Label>{t("dynamic.reference")}</Label>
              <Input
                placeholder={t("dynamic.referencePlaceholder")}
                value={form.reference}
                onChange={(e) => setForm((s) => ({ ...s, reference: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={createDynamic} disabled={isSaving}>
              {isSaving ? t("dynamic.creating") : t("common:create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Detail = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`mt-0.5 font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
  </div>
);

export default WalletQrCodes;
