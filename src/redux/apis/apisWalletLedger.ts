import axios from "../../utils/axios";

/**
 * Wallet slice of the general ledger — currency-wise, full double entry.
 *
 * Service: ledger-service, mounted on the gateway at /ledger-service.
 * `tenant_id` is read from the JWT by the backend — never send it.
 *
 * Every view is scoped to ONE currency: the API never sums across currencies
 * and neither should the UI (no grand total, no implicit conversion).
 */

const BASE = "/ledger-service/api/v1/wallet-ledger";

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
// Shared types
// ---------------------------------------------------------------------------

export interface LedgerPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/** One side of a movement (the `from` / `to` arrays on an entry). */
export interface EntrySide {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  amount: number;
}

export interface EntryLine {
  lineNumber: number;
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debitAmount: number;
  creditAmount: number;
  currency: string;
  description?: string;
}

/** A wallet on the platform, on either side of a movement. */
export interface WalletParty {
  walletId: string;
  walletNumber: string;
  currency: string;
  customerId: string;
  customerName: string;
  /** Populated on a P2P_MOBILE transfer — the number the sender typed. */
  mobileNumber?: string | null;
}

/** The party outside the platform: bank account, SWIFT beneficiary, employee. */
export interface WalletCounterparty {
  name?: string | null;
  mobileNumber?: string | null;
  accountNumber?: string | null;
  bankCode?: string | null;
  email?: string | null;
}

/**
 * Who actually moved the money. GL codes say `110401 → 120603`, which tells a
 * human nothing — an internal P2P transfer even hits the same account on both
 * sides. Build the table from this block; keep GL codes for the accounting view.
 *
 * `null` on a row whose reference could not be resolved (source record deleted,
 * or wallet-service unavailable). Never drop such a row — the accounting fields
 * are always present, so render it and leave the wallet columns blank.
 */
export interface WalletContext {
  /** WALLET_TRANSFER | EXTERNAL_TRANSFER | IBFT | SWIFT | PAYROLL */
  rail?: string | null;
  transactionNumber?: string | null;
  /** Only for WALLET_TRANSFER: P2P_MOBILE, P2P_WALLET_ID, SELF_WALLET, … */
  channel?: string | null;
  direction?: string | null;
  status?: string | null;
  /** The wallet the money left; null when it came from outside the platform. */
  debitWallet?: WalletParty | null;
  /** The wallet the money reached; null when it left the platform. */
  creditWallet?: WalletParty | null;
  counterparty?: WalletCounterparty | null;
  feeAmount?: number | null;
  /** Set only on a cross-currency transfer — a non-null rate means show the FX line. */
  creditAmount?: number | null;
  creditCurrency?: string | null;
  exchangeRate?: number | null;
  purposeNote?: string | null;
}

export interface WalletLedgerEntry {
  entryId: string;
  entryNumber: string;
  entryDate: string;
  valueDate?: string;
  referenceType?: string;
  referenceId?: string;
  transactionType?: string;
  description?: string;
  currency: string;
  /** The entry total, always unsigned. Use `signedAmount` for direction. */
  amount: number;

  /**
   * "Is this a debit?" is meaningless until you say for whom — the four fields
   * below are measured from this account (your `accountCode` filter, else
   * 110401 Consumer Wallet). Show the perspective once above the table.
   */
  perspectiveAccountCode?: string;
  perspectiveAccountName?: string;
  /**
   * DEBIT / CREDIT relative to the perspective account; INTERNAL when both legs
   * sit on it (customer-to-customer transfer, balance genuinely unmoved); null
   * when the entry never touches it.
   */
  direction?: "DEBIT" | "CREDIT" | "INTERNAL" | null;
  debitAmount?: number | null;
  creditAmount?: number | null;
  /** Positive when the perspective account's balance rose, negative when it fell. */
  signedAmount?: number | null;

  status?: string;
  reversal?: boolean;
  /** Credited side — money came OUT of these accounts. */
  from?: EntrySide[];
  /** Debited side — money went INTO these accounts. */
  to?: EntrySide[];
  /** Flat convenience fields; comma-joined when an entry has multiple legs. */
  fromAccountCode?: string;
  fromAccountName?: string;
  toAccountCode?: string;
  toAccountName?: string;
  lines?: EntryLine[];
  /** Who moved the money. May be null — render the row anyway. */
  wallet?: WalletContext | null;
  createdAt?: string;
}

/**
 * Footer figures, one block per currency in the filtered set — computed
 * server-side over the WHOLE set, not the current page. Never a grand total
 * across currencies.
 */
export interface EntriesTotals {
  currency: string;
  /** The same perspective account the rows are measured from. */
  accountCode: string;
  accountName: string;
  entryCount: number;
  totalDebit: number;
  totalCredit: number;
  /** Signed net of the filtered set — how much the balance moved because of it. */
  netAmount: number;
  /**
   * What the account holds in this currency as of `toDate`. Deliberately
   * ignores every filter but the date — a balance that changed when you
   * filtered by type would not be a balance. Equals `netAmount` only when the
   * filter happens to cover everything.
   */
  balance: number;
}

export interface WalletLedgerEntriesData {
  fromDate: string;
  toDate: string;
  currency?: string;
  totalEntries: number;
  totals?: EntriesTotals[];
  entries: WalletLedgerEntry[];
}

export interface SummaryByTransactionType {
  transactionType: string;
  entryCount: number;
  totalAmount: number;
}

export interface CurrencySummary {
  currency: string;
  entryCount: number;
  totalDebit: number;
  totalCredit: number;
  /** false = debits ≠ credits in that currency: a broken posting, warn loudly. */
  balanced: boolean;
  byTransactionType: SummaryByTransactionType[];
}

export interface WalletLedgerSummaryData {
  fromDate: string;
  toDate: string;
  currencies: CurrencySummary[];
}

export interface AccountMovement {
  entryDate: string;
  entryId?: string;
  entryNumber: string;
  referenceType?: string;
  referenceId?: string;
  transactionType?: string;
  description?: string;
  currency: string;
  debitAmount: number;
  creditAmount: number;
  /** Signed by whether THIS account's balance rose or fell — moves with runningBalance. */
  signedAmount?: number | null;
  runningBalance: number;
  /** IN = this account was debited, OUT = credited. */
  direction: "IN" | "OUT" | string;
  /** The other side, relative to the account being read. */
  contraAccountCode?: string;
  contraAccountName?: string;
  fromAccountCode?: string;
  fromAccountName?: string;
  toAccountCode?: string;
  toAccountName?: string;
  /** Same block as on an entry — lets the statement name a person, not a GL code. */
  wallet?: WalletContext | null;
  status?: string;
}

/** One (account, currency) pair — an account holding two currencies = two rows. */
export interface AccountLedger {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  currency: string;
  openingBalance: number;
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
  movementCount: number;
  movements: AccountMovement[];
}

export interface WalletLedgerAccountsData {
  fromDate: string;
  toDate: string;
  currency?: string;
  totalLedgers: number;
  ledgers: AccountLedger[];
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/** Currency filter options — call this first, never hardcode the list. */
export function getWalletLedgerCurrencies() {
  return axios.get<{ data: string[] }>(`${BASE}/currencies`);
}

export interface WalletLedgerSummaryParams {
  fromDate?: string;
  toDate?: string;
}

/** Currency-wise roll-up for the dashboard tiles (not paginated). */
export function getWalletLedgerSummary(params: WalletLedgerSummaryParams = {}) {
  return axios.get<{ data: WalletLedgerSummaryData }>(`${BASE}/summary${qs(params)}`);
}

export interface WalletLedgerEntriesParams {
  fromDate?: string;
  toDate?: string;
  currency?: string;
  referenceType?: string;
  transactionType?: string;
  status?: string;
  accountCode?: string;
  search?: string;
  /** 0-based. */
  page?: number;
  size?: number;
}

/** Transaction list — one row per journal entry, both sides included. */
export function getWalletLedgerEntries(params: WalletLedgerEntriesParams = {}) {
  return axios.get<{
    data: WalletLedgerEntriesData;
    pagination: LedgerPagination;
  }>(`${BASE}/entries${qs(params)}`);
}

export interface WalletLedgerAccountsParams {
  fromDate?: string;
  toDate?: string;
  currency?: string;
  accountCode?: string;
  search?: string;
  /** 0-based; counted in (account, currency) ledgers. */
  page?: number;
  size?: number;
}

/** T-account statements: opening balance, movements, closing balance. */
export function getWalletLedgerAccounts(params: WalletLedgerAccountsParams = {}) {
  return axios.get<{
    data: WalletLedgerAccountsData;
    pagination: LedgerPagination;
  }>(`${BASE}/accounts${qs(params)}`);
}

// ---------------------------------------------------------------------------
// Helpers shared by the wallet-ledger screens
// ---------------------------------------------------------------------------

/** Amounts are never rendered bare — two rows can be in different currencies. */
export const formatLedgerAmount = (value: number | null | undefined, currency?: string) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  const amount = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${amount}` : amount;
};

/** "EXTERNAL_TRANSFER_OUTBOUND" → "External Transfer Outbound". */
export const humanizeCode = (value?: string) =>
  value
    ? value
        .toLowerCase()
        .split("_")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "-";

/**
 * Wallet postings now carry their real currency, but older entries landed on
 * the DB default of SAR — a currency no wallet on this platform holds. Treat
 * SAR on a wallet entry as "currency unknown", not Saudi Riyal.
 */
export const isUnknownCurrency = (currency?: string) => (currency || "").toUpperCase() === "SAR";

/**
 * The amount with its direction, from the perspective account's point of view.
 *
 * `up` = that balance rose, `down` = it fell, `flat` = no meaningful direction
 * (INTERNAL, or an entry that never touches the perspective account) — those
 * render unsigned, because a sign there would assert something untrue.
 */
export const signedLedgerAmount = (row: {
  amount: number;
  currency: string;
  direction?: string | null;
  signedAmount?: number | null;
}): { text: string; tone: "up" | "down" | "flat" } => {
  const signed = row.signedAmount;
  if (signed === null || signed === undefined || row.direction === "INTERNAL" || signed === 0) {
    return { text: formatLedgerAmount(row.amount, row.currency), tone: "flat" };
  }
  const sign = signed > 0 ? "+" : "−";
  return {
    text: `${sign}${formatLedgerAmount(Math.abs(signed), row.currency)}`,
    tone: signed > 0 ? "up" : "down",
  };
};

/** One side of a row as a human reads it: who, and how they're identified. */
export interface PartyView {
  name: string;
  /** Mobile number on a P2P_MOBILE transfer, else wallet/account number. */
  detail?: string;
}

const partyFromWallet = (party: WalletParty, channel?: string | null): PartyView => ({
  name: party.customerName || party.walletNumber,
  // On a mobile transfer the number is how the sender recognises the row;
  // on every other channel it would just be noise, so show the wallet number.
  detail:
    channel === "P2P_MOBILE" && party.mobileNumber
      ? party.mobileNumber
      : party.walletNumber || undefined,
});

const partyFromCounterparty = (party: WalletCounterparty): PartyView => ({
  name: party.name || party.accountNumber || party.bankCode || "-",
  detail: party.mobileNumber || party.accountNumber || party.bankCode || undefined,
});

/**
 * Who the money left / reached, for the "From" and "To" columns. Falls back to
 * the counterparty for whichever side is external, and returns null when the
 * wallet block is missing entirely (caller then shows the GL account).
 */
export const walletSide = (
  wallet: WalletContext | null | undefined,
  side: "from" | "to"
): PartyView | null => {
  if (!wallet) return null;
  const own = side === "from" ? wallet.debitWallet : wallet.creditWallet;
  if (own) return partyFromWallet(own, wallet.channel);
  // No wallet on this side means it is the external one, so it's the counterparty.
  if (wallet.counterparty) return partyFromCounterparty(wallet.counterparty);
  return null;
};
