import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AlertTriangle, Info, Pencil, RefreshCw, Wallet } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { TONES, humanizeCode } from "../../../components/shared/detailKitUtils";
import {
  useProductPermissions,
  WALLET_GL_ACCOUNT_PERMISSIONS,
} from "../../../hooks/useProductPermissions";
import { ledgerErrorMessage } from "../../../utils/ledgerErrors";
import { getLedgerAccount } from "../../../redux/apis/apisCrudLms";
import {
  getWalletGlAccounts,
  updateWalletGlAccount,
  type WalletGlAccountSetting,
} from "../../../redux/apis/apisWalletGlAccounts";

interface PostableAccount {
  accountCode: string;
  accountName: string;
  accountType: string;
}

/**
 * Which GL account each wallet rail posts to.
 *
 * Two properties of this screen are deliberate rather than incidental:
 *
 * - the account is chosen from a list, not typed. The server rejects a header
 *   or inactive account but does not check the account TYPE against the rail,
 *   so pointing a fee rail at a liability account would post cleanly and only
 *   show up later as a wrong report. Showing the type at the point of choosing
 *   is the only place that mistake is catchable.
 * - the confirm step names what is changing and says the change is not
 *   retrospective, because it isn't: entries already posted stay where they
 *   are, and moving them is a reclassification entry nobody can make here.
 */
const WalletGlAccounts = () => {
  const { t } = useTranslation("walletGlAccounts");
  const { hasPermission } = useProductPermissions();

  const canRead = hasPermission(WALLET_GL_ACCOUNT_PERMISSIONS.READ);
  const canWrite = hasPermission(WALLET_GL_ACCOUNT_PERMISSIONS.WRITE);

  const [settings, setSettings] = useState<WalletGlAccountSetting[]>([]);
  const [accounts, setAccounts] = useState<PostableAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editing, setEditing] = useState<WalletGlAccountSetting | null>(null);
  const [chosenCode, setChosenCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const res = await getWalletGlAccounts();
      const body = res?.data?.data ?? res?.data;
      setSettings(Array.isArray(body) ? body : (body?.settings ?? []));
    } catch (error) {
      toast.error(ledgerErrorMessage(error, t("wga.toast.loadFailed")));
      setSettings([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * The picker offers postable accounts only. A header groups its children and
   * rejects postings, so offering one means offering a choice that always 422s.
   */
  const loadAccounts = async () => {
    if (!canWrite) return;
    try {
      const res = await getLedgerAccount(1, 1000, "");
      const list: Record<string, unknown>[] = res?.data?.data ?? [];
      setAccounts(
        list
          .filter((a) => !a.isHeader && a.isManualEntriesAllowed !== false)
          .map((a) => ({
            accountCode: String(a.accountCode ?? ""),
            accountName: String(a.accountName ?? a.accountTitle ?? ""),
            accountType: String(a.accountType ?? ""),
          }))
          .sort((a, b) => a.accountCode.localeCompare(b.accountCode))
      );
    } catch {
      // A failed account list only costs the picker its options — the settings
      // themselves still render, so this is not worth a toast over the page.
      setAccounts([]);
    }
  };

  useEffect(() => {
    load();
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accountByCode = useMemo(() => new Map(accounts.map((a) => [a.accountCode, a])), [accounts]);

  const openEdit = (setting: WalletGlAccountSetting) => {
    setEditing(setting);
    setChosenCode(setting.accountCode);
  };

  const closeEdit = () => {
    setEditing(null);
    setChosenCode("");
  };

  const onSave = async () => {
    if (!editing || !chosenCode || chosenCode === editing.accountCode) return;
    setBusy(true);
    try {
      await updateWalletGlAccount(editing.settingKey, chosenCode);
      toast.success(t("wga.toast.saved", { key: humanizeCode(editing.settingKey) }));
      closeEdit();
      load();
    } catch (error) {
      toast.error(ledgerErrorMessage(error, t("wga.toast.saveFailed")));
    } finally {
      setBusy(false);
    }
  };

  if (!canRead) return <PermissionDenied />;

  const chosen = accountByCode.get(chosenCode);
  const changed = !!editing && !!chosenCode && chosenCode !== editing.accountCode;

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <Wallet className="h-4 w-4" />
          </span>
          {t("wga.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("wga.subtitle")}</p>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{t("wga.notRetrospective")}</span>
          </div>
          <Button
            variant="outline"
            className="h-10 gap-2 sm:w-auto"
            onClick={() => {
              load();
              loadAccounts();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
        </div>
      </div>

      {settings.length === 0 ? (
        <div className="pro-card">
          <EmptyState icon={Wallet} text={isLoading ? t("common:loading") : t("wga.empty")} />
        </div>
      ) : (
        <div className="pro-card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="p-3 text-start font-medium">{t("wga.col.rail")}</th>
                <th className="p-3 text-start font-medium">{t("wga.col.account")}</th>
                <th className="p-3 text-start font-medium">{t("wga.col.type")}</th>
                {canWrite && <th className="p-3 text-end font-medium">{t("wga.col.action")}</th>}
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => {
                // Prefer what the server says the account is; fall back to the
                // picker's copy so the type still shows if the API omits it.
                const resolved = accountByCode.get(s.accountCode);
                const name = s.accountName || resolved?.accountName;
                const type = s.accountType || resolved?.accountType;
                return (
                  <tr key={s.settingKey} className="border-t">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{humanizeCode(s.settingKey)}</span>
                        {s.description && (
                          <span className="text-xs text-muted-foreground">{s.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs">{s.accountCode}</span>
                        <span>{name || "—"}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {type ? (
                        <Badge variant="outline" className={`border font-medium ${TONES.slate}`}>
                          {type}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    {canWrite && (
                      <td className="p-3 text-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => openEdit(s)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {t("common:edit")}
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>
              {t("wga.edit.title", { rail: humanizeCode(editing?.settingKey) })}
            </DialogTitle>
            <DialogDescription>{t("wga.edit.explain")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{t("wga.edit.current")}</span>
              <span className="text-sm text-muted-foreground">
                <span className="font-mono text-xs">{editing?.accountCode}</span>
                {editing?.accountName ? ` — ${editing.accountName}` : ""}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{t("wga.edit.new")}</span>
              <Select value={chosenCode} onValueChange={setChosenCode}>
                <SelectTrigger className="w-full data-[size=default]:h-10">
                  <SelectValue placeholder={t("wga.edit.choose")} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.accountCode} value={a.accountCode}>
                      {a.accountCode} — {a.accountName} ({a.accountType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {accounts.length === 0 && (
                <span className="text-xs text-red-600">{t("wga.edit.noAccounts")}</span>
              )}
            </div>

            {/* The server does not check the type against the rail, so the type
                is repeated here where someone can still stop. */}
            {changed && chosen && (
              <div className="flex items-start gap-2 rounded-sm border border-dashed p-2 text-xs text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {t("wga.edit.confirmHint", {
                    code: chosen.accountCode,
                    name: chosen.accountName,
                    type: chosen.accountType,
                  })}
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={closeEdit} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button onClick={onSave} disabled={busy || !changed}>
              {t("wga.edit.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletGlAccounts;
