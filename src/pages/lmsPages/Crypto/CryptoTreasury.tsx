import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AlertTriangle, ChevronDown, KeyRound, Plus, RefreshCw, Vault, Wallet } from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { SearchField } from "../../../components/shared/filterKit";
import { TONES, formatDateTime } from "../../../components/shared/detailKitUtils";
import { useProductPermissions, CRYPTO_PERMISSIONS } from "../../../hooks/useProductPermissions";
import {
  CRYPTO_ASSETS,
  TREASURY_WALLET_TYPES,
  cryptoErrorMessage,
  formatCryptoAmount,
  getTreasuryBalance,
  getTreasuryWallets,
  registerTreasuryWallet,
  truncateHex,
  type TreasuryBalance,
  type TreasuryWallet,
  type TreasuryWalletType,
} from "../../../redux/apis/apisCryptoAdmin";

const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

/**
 * The platform's own inventory — the pool a buy settles out of.
 *
 * Two things on this screen are deliberate:
 *
 * - the KMS reference is never shown in full, only whether one is attached and
 *   its last six characters. It is a handle rather than a key, but it names the
 *   exact HSM object that can move platform funds, and an admin screen is a
 *   screenshot, a support ticket and a log line waiting to happen.
 * - registering an asset and tier that already has an address ROTATES it, and
 *   rotation does not move funds. The server has no confirmation step, so the
 *   screen asks — a stranded treasury balance is not recoverable from here.
 */
const CryptoTreasury = () => {
  const { t } = useTranslation("crypto");
  const { hasPermission } = useProductPermissions();

  const canRead = hasPermission(CRYPTO_PERMISSIONS.TREASURY_READ);
  const canCreate = hasPermission(CRYPTO_PERMISSIONS.TREASURY_CREATE);

  const [wallets, setWallets] = useState<TreasuryWallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /** Null while closed; a wallet when rotating, an empty draft when registering. */
  const [editing, setEditing] = useState<TreasuryWallet | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [assetCode, setAssetCode] = useState("");
  const [address, setAddress] = useState("");
  const [walletType, setWalletType] = useState<TreasuryWalletType>("HOT");
  const [kmsKeyRef, setKmsKeyRef] = useState("");
  const [busy, setBusy] = useState(false);

  const [balanceAsset, setBalanceAsset] = useState("");
  const [balance, setBalance] = useState<TreasuryBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const errorsByCode = useMemo(
    () => ({
      "CRYPTO.ASSET.NOT_SUPPORTED": t("err.assetNotSupported"),
      "CRYPTO.CHAIN.UNAVAILABLE": t("err.chainUnavailable"),
      "COMMON.VALIDATION.FAILED": t("err.validation"),
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      setWallets(await getTreasuryWallets());
    } catch (error) {
      toast.error(cryptoErrorMessage(error, t("tre.toast.loadFailed"), errorsByCode));
      setWallets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * The hot wallet is the one that can pay out, so funding defaults to it.
   *
   * The known chains are included even when no row exists for them yet: each is
   * funded and checked separately, and "no hot treasury for this asset" is
   * itself the answer when a POL payout fails.
   */
  const hotAssets = useMemo(
    () =>
      Array.from(
        new Set([
          ...wallets.filter((w) => w.walletType === "HOT").map((w) => w.assetCode),
          ...CRYPTO_ASSETS,
        ])
      ).sort(),
    [wallets]
  );

  /**
   * Every registered wallet lacks a signing handle — the current UAT state. Said
   * once at the top rather than only as a red badge per row, because the
   * consequence is a property of the whole treasury: nothing can settle
   * on-chain, and an attempt fails rather than sending.
   */
  const noSigner = wallets.length > 0 && wallets.every((w) => !w.kmsKeyConfigured);

  useEffect(() => {
    if (!balanceAsset && hotAssets.length) setBalanceAsset(hotAssets[0]);
  }, [hotAssets, balanceAsset]);

  /** The row behind the funding panel — its address and whether it can sign. */
  const selectedHotWallet = useMemo(
    () => wallets.find((w) => w.walletType === "HOT" && w.assetCode === balanceAsset),
    [wallets, balanceAsset]
  );

  const openRegister = () => {
    setEditing(null);
    setAssetCode("");
    setAddress("");
    setWalletType("HOT");
    setKmsKeyRef("");
    setFormOpen(true);
  };

  const openRotate = (wallet: TreasuryWallet) => {
    setEditing(wallet);
    setAssetCode(wallet.assetCode);
    setAddress("");
    setWalletType((wallet.walletType as TreasuryWalletType) || "HOT");
    // Never prefilled: the server only ever returns the masked handle, so
    // prefilling would save the mask as the new reference.
    setKmsKeyRef("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const onSave = async () => {
    if (!assetCode.trim()) return toast.error(t("tre.valid.asset"));
    if (!address.trim()) return toast.error(t("tre.valid.address"));

    setBusy(true);
    try {
      await registerTreasuryWallet({
        assetCode: assetCode.trim().toUpperCase(),
        address: address.trim(),
        walletType,
        // Omitted rather than sent empty when left blank on a rotation, so an
        // untouched field cannot clear a configured signer.
        ...(kmsKeyRef.trim() ? { kmsKeyRef: kmsKeyRef.trim() } : {}),
      });
      toast.success(
        t("tre.toast.saved", { asset: assetCode.trim().toUpperCase(), type: walletType })
      );
      closeForm();
      load();
      // Re-read rather than blank it: a rotation changes which address the
      // funding figure belongs to, so a stale number is worse than a fresh call.
      if (balanceAsset) loadBalance(balanceAsset);
    } catch (error) {
      toast.error(cryptoErrorMessage(error, t("tre.toast.saveFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const loadBalance = async (asset: string) => {
    if (!asset) return;
    setBalanceLoading(true);
    try {
      setBalance(await getTreasuryBalance(asset));
    } catch (error) {
      toast.error(cryptoErrorMessage(error, t("tre.toast.balanceFailed"), errorsByCode));
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Read funding as soon as an asset is selected. The panel used to sit blank
  // until someone pressed the button, which read as a broken card rather than
  // as an unanswered question.
  useEffect(() => {
    if (balanceAsset) loadBalance(balanceAsset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceAsset]);

  const headers = [
    {
      name: t("tre.col.asset"),
      cell: (row: TreasuryWallet) => <span className="font-medium">{row.assetCode}</span>,
      width: "100px",
    },
    {
      name: t("tre.col.type"),
      cell: (row: TreasuryWallet) => (
        <Badge
          variant="outline"
          className={`border font-medium ${row.walletType === "HOT" ? TONES.amber : TONES.sky}`}
        >
          {row.walletType}
        </Badge>
      ),
      width: "110px",
    },
    {
      name: t("tre.col.address"),
      // Truncated with the full value on hover: 42 characters would push every
      // other column off the table, and the middle is the part nobody reads.
      cell: (row: TreasuryWallet) => (
        <span className="font-mono text-xs" title={row.address}>
          {truncateHex(row.address)}
        </span>
      ),
      width: "220px",
    },
    {
      name: t("tre.col.signing"),
      cell: (row: TreasuryWallet) =>
        row.kmsKeyConfigured ? (
          <div className="flex flex-col">
            <Badge variant="outline" className={`border gap-1 font-medium ${TONES.emerald}`}>
              <KeyRound className="h-3 w-3" />
              {t("tre.signing.configured")}
            </Badge>
            {row.kmsKeyRefMasked && (
              <span className="mt-1 font-mono text-xs text-muted-foreground">
                {row.kmsKeyRefMasked}
              </span>
            )}
          </div>
        ) : (
          <Badge
            variant="outline"
            title={t("tre.signing.missingHint")}
            className={`border gap-1 font-medium ${TONES.red}`}
          >
            <AlertTriangle className="h-3 w-3" />
            {t("tre.signing.missing")}
          </Badge>
        ),
      width: "200px",
    },
    {
      name: t("tre.col.status"),
      cell: (row: TreasuryWallet) => (
        <Badge
          variant="outline"
          className={`border font-medium ${row.status === "ACTIVE" ? TONES.emerald : TONES.slate}`}
        >
          {row.status}
        </Badge>
      ),
      width: "120px",
    },
    {
      name: t("tre.col.updated"),
      cell: (row: TreasuryWallet) => <span>{formatDateTime(row.updatedAt) || "-"}</span>,
      width: "180px",
    },
    ...(canCreate
      ? [
          {
            name: t("tre.col.action"),
            cell: (row: TreasuryWallet) => (
              <div
                className="relative inline-block"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className={SELECT_TRIGGER_CLS}>
                      {t("common:select")}
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="bottom"
                    className="z-[9999]"
                    sideOffset={4}
                  >
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        openRotate(row);
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t("tre.action.rotate")}
                    </DropdownMenuItem>
                    {row.walletType === "HOT" && (
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setBalanceAsset(row.assetCode);
                          loadBalance(row.assetCode);
                        }}
                      >
                        <Wallet className="h-4 w-4" />
                        {t("tre.action.balance")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ),
            width: "120px",
          },
        ]
      : []),
  ];

  if (!canRead) return <PermissionDenied />;

  // The endpoint returns every wallet in one response, so searching and paging
  // are both local.
  const needle = search.trim().toLowerCase();
  const filtered = needle
    ? wallets.filter((row) =>
        [row.assetCode, row.address, row.walletType, row.status]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle))
      )
    : wallets;

  const totalRows = filtered.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);
  const totalPage = Math.ceil(totalRows / pageSize) || 1;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const isRotation = !!editing;

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="min-w-0">
          <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
            <span className="pro-head-badge">
              <Vault className="h-4 w-4" />
            </span>
            {t("tre.title")}
          </h3>
          <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("tre.subtitle")}</p>
        </div>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField
            id="tre-search"
            className="flex-1"
            value={search}
            onChange={(next) => {
              setSearch(next);
              setPage(1);
            }}
            placeholder={t("tre.search")}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={load} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
            {canCreate && (
              <Button className="wallet-brand-btn gap-2" onClick={openRegister}>
                <Plus className="h-4 w-4" />
                {t("tre.register")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {noSigner && (
        <div
          className={`mb-3 flex items-start gap-2 rounded-[2px] px-3 py-2 text-xs ring-1 ${TONES.amber}`}
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{t("tre.signing.noneWarning")}</span>
        </div>
      )}

      {/* Funding sits above the table because it is the first question when a
          settlement fails, and it is read from the chain rather than the ledger. */}
      {hotAssets.length > 0 && (
        <div className="pro-card mb-3 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="pro-head-badge">
                <Wallet className="h-4 w-4" />
              </span>
              <h4 className="m-0 truncate text-sm font-semibold tracking-tight text-foreground">
                {t("tre.balance.title", { asset: balanceAsset })}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="tre-balance-asset" className="sr-only">
                {t("tre.balance.pick")}
              </Label>
              <Select value={balanceAsset} onValueChange={setBalanceAsset}>
                <SelectTrigger id="tre-balance-asset" className="w-28 bg-card">
                  <SelectValue placeholder={t("tre.balance.pick")} />
                </SelectTrigger>
                <SelectContent>
                  {hotAssets.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => loadBalance(balanceAsset)}
                disabled={balanceLoading || !balanceAsset}
              >
                <RefreshCw className={`h-4 w-4 ${balanceLoading ? "animate-spin" : ""}`} />
                {t("tre.action.balance")}
              </Button>
            </div>
          </div>

          {/* Balance alone answers "how much"; the address and signing state
              answer "can we actually send it", which is the same question an
              operator is really asking when a settlement fails. */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="pro-tile">
              <span className="pro-tile__label">{t("tre.balance.onchain")}</span>
              {balanceLoading ? (
                <span className="mt-1.5 block h-[18px] w-24 animate-pulse rounded-[2px] bg-emerald-500/20" />
              ) : (
                <span className="pro-tile__value pro-tile__value--accent">
                  {balance ? formatCryptoAmount(balance.onchainBalance, balance.assetCode) : "—"}
                </span>
              )}
            </div>

            <div className="pro-tile">
              <span className="pro-tile__label">{t("tre.col.address")}</span>
              <span
                className="pro-tile__value font-mono text-xs"
                title={selectedHotWallet?.address}
              >
                {selectedHotWallet ? truncateHex(selectedHotWallet.address) : "—"}
              </span>
            </div>

            <div className="pro-tile">
              <span className="pro-tile__label">{t("tre.col.signing")}</span>
              <div className="mt-1.5">
                {selectedHotWallet?.kmsKeyConfigured ? (
                  <Badge variant="outline" className={`border gap-1 font-medium ${TONES.emerald}`}>
                    <KeyRound className="h-3 w-3" />
                    {t("tre.signing.configured")}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    title={t("tre.signing.missingHint")}
                    className={`border gap-1 font-medium ${TONES.red}`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {t("tre.signing.missing")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pro-card">
        {!isLoading && totalRows === 0 ? (
          <EmptyState icon={Vault} text={t(needle ? "tre.noMatch" : "tre.empty")} />
        ) : (
          <TableView
            header={headers}
            data={pageRows}
            totalRows={totalRows}
            isLoading={isLoading}
            from={from}
            to={to}
            page={page}
            totalPage={totalPage}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={(size: number) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>
              {isRotation
                ? t("tre.form.rotateTitle", {
                    asset: editing?.assetCode,
                    type: editing?.walletType,
                  })
                : t("tre.form.newTitle")}
            </DialogTitle>
            <DialogDescription>{t("tre.form.explain")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {/* Rotation replaces an address that may still hold coin, and the
                server does nothing to stop it. Say so before the button. */}
            {isRotation && (
              <div
                className={`flex items-start gap-2 rounded-[2px] px-3 py-2 text-xs ring-1 ${TONES.amber}`}
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <div className="min-w-0">
                  <p className="m-0">{t("tre.form.rotateWarning")}</p>
                  <p className="m-0 mt-1 font-mono" title={editing?.address}>
                    {t("tre.form.current")}: {truncateHex(editing?.address, 14, 10)}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tre-asset">{t("tre.form.asset")}</Label>
                <Input
                  id="tre-asset"
                  placeholder={t("tre.form.assetPlaceholder")}
                  value={assetCode}
                  disabled={isRotation}
                  onChange={(e) => setAssetCode(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tre-type">{t("tre.form.type")}</Label>
                <Select
                  value={walletType}
                  onValueChange={(v) => setWalletType(v as TreasuryWalletType)}
                  disabled={isRotation}
                >
                  <SelectTrigger id="tre-type" className="w-full">
                    <SelectValue placeholder={t("tre.form.type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {TREASURY_WALLET_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tre-address">{t("tre.form.address")}</Label>
              <Input
                id="tre-address"
                className="font-mono text-xs"
                placeholder={t("tre.form.addressPlaceholder")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tre-kms">{t("tre.form.kmsKeyRef")}</Label>
              <Input
                id="tre-kms"
                className="font-mono text-xs"
                placeholder={t("tre.form.kmsKeyRefPlaceholder")}
                value={kmsKeyRef}
                onChange={(e) => setKmsKeyRef(e.target.value)}
              />
              <p className="m-0 text-xs text-muted-foreground">{t("tre.form.kmsKeyRefHint")}</p>
            </div>

            {/* Two things the API does not check, so the operator has to.
                Sharing one address across EVM assets is legitimate — ETH and POL
                derive from the same key and the uniqueness constraint is scoped
                per asset to allow it — so it must not read as a mistake. The
                user-wallet collision is a known gap: the two tables are
                validated independently, and the deposit watcher resolves an
                inbound transfer by address, so a treasury movement would be
                attributed to a customer. */}
            <div className="pro-tile flex flex-col gap-1.5 text-xs text-muted-foreground">
              <p className="m-0">{t("tre.form.sharedAddressNote")}</p>
              <p className="m-0">{t("tre.form.userWalletCheck")}</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={closeForm} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn gap-2" onClick={onSave} disabled={busy}>
              {isRotation ? t("tre.form.rotateSave") : t("tre.form.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CryptoTreasury;
