import axios from "../../utils/axios";

/**
 * GL entry enquiry and correction — ledger-service.
 *
 * `tenant_id` comes off the JWT; never send it.
 *
 * The rule behind every signature here: a journal entry holds exactly ONE
 * currency, and amounts are never added across currencies. So anything that
 * totals is per currency and carries no grand total, while the plain list —
 * where an operator is hunting for one entry and does not yet know its
 * currency — leaves `currency` optional.
 */

const BASE = "/ledger-service/api/v1/transactions/gl-entries";
const ENTRIES = "/ledger-service/api/v1/journal-entries";

const qs = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GlEntryStatus = "PENDING" | "POSTED" | "REVERSED" | "FAILED";

/** One leg of an entry. `debitAmount` / `creditAmount` are raw — no direction. */
export interface GlEntryLine {
  lineNumber: number;
  accountCode: string;
  accountName?: string;
  accountType?: string;
  debitAmount: number;
  creditAmount: number;
  currency?: string;
  description?: string | null;
  /**
   * Whose money moved on this line. Only wallet legs carry it — clearing, bank,
   * income and expense accounts are the platform's own position and belong to
   * no customer, so tagging them would put the same person on both sides of
   * their own transfer.
   *
   * Null on entries posted before the tag existed; it was never recorded at the
   * time and is not reconstructed after the fact.
   */
  subLedgerType?: string | null;
  subLedgerId?: string | null;
  /**
   * The party's display name, resolved by the ledger. May be null even when
   * `subLedgerId` is set — the id is the record, the name is a convenience.
   */
  subLedgerName?: string | null;
}

export interface GlEntry {
  id: string;
  entryNumber: string;
  referenceNumber?: string;
  entryType?: string;
  referenceType?: string;
  referenceId?: string | null;
  /** The entry's single currency. */
  currency: string;
  entryDate: string;
  valueDate?: string;
  description?: string | null;
  lines: GlEntryLine[];
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
  status: GlEntryStatus | string;
  /** True on a correcting entry; `originalEntryId` points at what it reverses. */
  reversal: boolean;
  originalEntryId?: string | null;
  fineractJournalEntryId?: number | null;
  fineractSynced?: boolean;
  /** Set on BOTH legs of a cross-currency conversion, joining the two entries. */
  fxTransactionId?: string | null;
  createdAt?: string;
}

export interface GlEntryListResponse {
  /** null when the list spans currencies — nothing on the list is totalled. */
  currency: string | null;
  totalCount: number;
  entries: GlEntry[];
}

export interface GlDailySummaryCurrency {
  currency: string;
  totalEntries: number;
  totalDebits: number;
  totalCredits: number;
  balanced: boolean;
  byStatus?: { status: string; count: number }[];
  byTransactionType?: { transactionType: string; count: number; totalAmount: number }[];
}

export interface GlDailySummary {
  date: string;
  /** One block per currency. There is deliberately no grand total. */
  currencies: GlDailySummaryCurrency[];
}

export interface GlReconciliationCurrency {
  currency: string;
  totalEntries: number;
  totalDebits: number;
  totalCredits: number;
  difference: number;
  balanced: boolean;
  syncedToFineract: number;
  pendingFineractSync: number;
  failedEntries: number;
}

export interface GlReconciliation {
  date: string;
  /** True only when EVERY currency below balances AND has reached Fineract. */
  reconciled: boolean;
  currencies: GlReconciliationCurrency[];
}

export interface GlRetryResult {
  journalEntryId: string;
  entryNumber: string;
  synced: boolean;
  /** Someone else already synced it — success, not an error. */
  alreadySynced: boolean;
  fineractTransactionId?: number | null;
  message?: string;
}

export interface GlReversalResult {
  originalEntryId: string;
  originalEntryNumber: string;
  reversalEntryId: string;
  reversalEntryNumber: string;
  /** Already reversed — the existing reversal is returned, nothing was posted. */
  alreadyReversed: boolean;
  message?: string;
}

export interface GlEntryQuery {
  from?: string;
  to?: string;
  status?: string;
  type?: string;
  /** Optional here on purpose — nothing on the list is totalled. */
  currency?: string;
  loanId?: string;
  /** Matches entries with a line on this account. */
  accountCode?: string;
  /**
   * Matches entries with a line tagged to this party. This is the only way to
   * answer "what moved for this customer" from the GL alone: every customer
   * sits on the same `110401` control account, so an account-code filter
   * cannot separate them.
   */
  subLedgerId?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

// ---------------------------------------------------------------------------
// Enquiry — permission `gl.entries:read`
// ---------------------------------------------------------------------------

export const getGlEntries = (params: GlEntryQuery = {}) =>
  axios.get(`${BASE}${qs(params as Record<string, string | number | undefined>)}`);

export const getGlEntry = (id: string) => axios.get(`${BASE}/${id}`);

export const getGlEntriesByType = (type: string, currency?: string) =>
  axios.get(`${BASE}/filter/by-type${qs({ type, currency })}`);

export const getGlEntriesByStatus = (status: string, currency?: string) =>
  axios.get(`${BASE}/filter/by-status${qs({ status, currency })}`);

export const getGlEntriesByLoan = (loanId: string, currency?: string) =>
  axios.get(`${BASE}/filter/by-loan/${loanId}${qs({ currency })}`);

/**
 * The work queue: entries the ledger could not post at all. Entries that posted
 * but have not reached Fineract are not here — they show up as
 * `pendingFineractSync` on the reconciliation instead.
 */
export const getFailedGlEntries = (currency?: string) =>
  axios.get(`${BASE}/failed${qs({ currency })}`);

export const getGlDailySummary = (date: string) =>
  axios.get(`${BASE}/daily-summary${qs({ date })}`);

export const getGlReconciliation = (date: string) =>
  axios.get(`${BASE}/reconciliation${qs({ date })}`);

// ---------------------------------------------------------------------------
// Corrections
// ---------------------------------------------------------------------------

/**
 * Re-push a POSTED entry to Fineract. Permission `gl.entries:retry`.
 * Only POSTED can be retried — anything else returns 422.
 */
export const retryGlEntrySync = (id: string) => axios.post(`${BASE}/${id}/retry`, {});

/**
 * Reverse a posted entry. Permission `ledger.entries:reverse`.
 *
 * A posted entry is never edited or deleted: the correction is a second entry
 * with the same lines the other way round, and both stay in the ledger. Omit
 * `entryDate` to land the correction in the original's accounting period.
 *
 * Idempotent — reversing twice returns the existing reversal and posts nothing.
 */
export const reverseJournalEntry = (id: string, reason: string, entryDate?: string) =>
  axios.post(`${ENTRIES}/${id}/reverse`, { reason, ...(entryDate ? { entryDate } : {}) });

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/** Amounts are never rendered bare — two rows can be in different currencies. */
export const formatGlAmount = (value: number | null | undefined, currency?: string) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  const amount = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${amount}` : amount;
};

export const GL_ENTRY_STATUSES: GlEntryStatus[] = ["PENDING", "POSTED", "REVERSED", "FAILED"];
