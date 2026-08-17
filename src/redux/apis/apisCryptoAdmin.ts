import axiosCryptoService from "../../utils/axiosCryptoService";

/**
 * Crypto admin — the platform's own treasury, and every user's transfers.
 *
 * Service: crypto-service, mounted on the gateway at /crypto-service.
 * `tenant_id` is read from the JWT by the backend — never send it.
 *
 * Casbin objects:
 *   `crypto.admin.treasury`  — create / read
 *   `crypto.admin.transfers` — read / update
 *
 * Live against real testnets (`CHAIN_MOCK_ENABLED=false`): Ethereum Sepolia and
 * Polygon Amoy. Every balance and status here comes from the network.
 *
 * On UAT the treasury cannot pay out — `kms_key_ref` is NULL on every wallet and
 * the hot balance is zero — so settlement runs `LEDGER_ONLY` and an on-chain
 * attempt fails with `CRYPTO.CHAIN.UNAVAILABLE` naming the missing signer. The
 * screens say so rather than leaving it to be discovered.
 *
 * **There is no admin send endpoint and there will not be one.** A transfer
 * needs a signature from the user's device and no operator holds a key that
 * could produce one, so `crypto.admin.transfers` has `read` and `update` but
 * deliberately no `create`. Nothing in this file sends a user's crypto, moves
 * funds between users, reverses a confirmed transfer, or reads key material —
 * those capabilities do not exist, and an admin screen that implied otherwise
 * would have support processes built on top of nothing.
 */

const TREASURY = "/api/v1/admin/crypto/treasury";
const TRANSFERS = "/api/v1/admin/crypto/transfers";

/**
 * `HOT` is the small online balance the backend can sign from; `COLD` is bulk
 * and offline. One wallet per asset per tier.
 */
export type TreasuryWalletType = "HOT" | "COLD";

export const TREASURY_WALLET_TYPES: TreasuryWalletType[] = ["HOT", "COLD"];

/**
 * The chains wired on UAT: Ethereum Sepolia and Polygon Amoy.
 *
 * Offered for a funding check even when no treasury row exists for them yet,
 * because each chain is funded and checked separately — a funded ETH treasury
 * says nothing about whether a POL payout can go out, and "no hot treasury for
 * this asset" is itself the answer an operator needs. Merged with whatever the
 * treasury actually holds rather than replacing it, so a newly supported asset
 * appears without a frontend release.
 */
export const CRYPTO_ASSETS = ["ETH", "POL"];

export interface TreasuryWallet {
  id: string;
  assetCode: string;
  address: string;
  walletType: TreasuryWalletType | string;
  /** The question operators actually have: can this wallet pay out? */
  kmsKeyConfigured: boolean;
  /** Last six characters only. The full handle is never returned. */
  kmsKeyRefMasked?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterTreasuryWalletRequest {
  assetCode: string;
  address: string;
  walletType: TreasuryWalletType;
  /**
   * A HANDLE — an ARN or key id naming an object in KMS/HSM. It is not a
   * private key. A private key must never be sent here, and there is nowhere in
   * this system that stores one.
   */
  kmsKeyRef?: string;
}

export interface TreasuryBalance {
  assetCode: string;
  walletType: TreasuryWalletType | string;
  /**
   * Read from the chain, never from the ledger. The omnibus ledger account says
   * what we believe we owe; this says what we can actually send. When the two
   * disagree, settlement fails — and this is the number that explains why.
   */
  onchainBalance: number;
}

/**
 * The statuses this screen can filter on.
 *
 * A free-text status box would be a trap: the API rejects an unknown value with
 * `COMMON.VALIDATION.FAILED` rather than ignoring it, so a typo is an error the
 * operator has to decode. A select can only send values that exist.
 */
export type CryptoTransferStatus = "BROADCAST" | "CONFIRMED" | "FAILED" | "ABANDONED";

export const CRYPTO_TRANSFER_STATUSES: CryptoTransferStatus[] = [
  "BROADCAST",
  "CONFIRMED",
  "FAILED",
  "ABANDONED",
];

/** `CONFIRMED` and `FAILED` are terminal: reconcile returns them unchanged. */
export const isTerminalTransferStatus = (status?: string) =>
  status === "CONFIRMED" || status === "FAILED";

/**
 * A transfer as the ADMIN sees it. Three fields the customer view does not
 * carry — `userId`, `idempotencyKey` and `journalEntryId` — tie a transfer back
 * to a person, a request and a ledger entry.
 */
export interface CryptoTransfer {
  id: string;
  userId?: string;
  assetCode: string;
  amount: number;
  fromAddress?: string | null;
  toAddress?: string | null;
  txHash?: string | null;
  status: CryptoTransferStatus | string;
  confirmations?: number | null;
  requiredConfirmations?: number | null;
  networkFee?: number | null;
  failureReason?: string | null;
  idempotencyKey?: string | null;
  journalEntryId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  confirmedAt?: string | null;
}

export interface CryptoTransferQuery {
  userId?: string;
  asset?: string;
  status?: string;
  /** Defaults to 50 server-side, capped at 500 — one query cannot pull the table. */
  limit?: number;
}

/** The cap the backend enforces, mirrored so the UI cannot ask for more. */
export const CRYPTO_TRANSFER_LIMIT_MAX = 500;
export const CRYPTO_TRANSFER_LIMIT_DEFAULT = 50;

/**
 * crypto-service answers `{ data: … }` on some routes and the bare body on
 * others. Unwrap once here so no screen has to guess which shape it got.
 */
const unwrap = <T>(body: unknown): T => {
  const envelope = body as { data?: unknown } | null | undefined;
  return (envelope && envelope.data !== undefined ? envelope.data : body) as T;
};

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
// Treasury — `crypto.admin.treasury`
// ---------------------------------------------------------------------------

export async function getTreasuryWallets(): Promise<TreasuryWallet[]> {
  const res = await axiosCryptoService.get(TREASURY);
  const data = unwrap<TreasuryWallet[]>(res?.data);
  return Array.isArray(data) ? data : [];
}

/**
 * Registers the address, or ROTATES it in place when this asset already has one
 * at this tier.
 *
 * Rotating a funded treasury strands its balance — the rotation does not move
 * funds. Sweep the old address first. There is no confirmation on the server;
 * the call IS the confirmation, which is why the screen asks first.
 */
export async function registerTreasuryWallet(
  body: RegisterTreasuryWalletRequest
): Promise<TreasuryWallet> {
  const res = await axiosCryptoService.post(TREASURY, body);
  return unwrap<TreasuryWallet>(res?.data);
}

/** Live funding for one asset's hot wallet, read from the chain. */
export async function getTreasuryBalance(asset: string): Promise<TreasuryBalance> {
  const res = await axiosCryptoService.get(`${TREASURY}/balance${qs({ asset })}`);
  return unwrap<TreasuryBalance>(res?.data);
}

// ---------------------------------------------------------------------------
// Transfers — `crypto.admin.transfers`. read + update only; there is no create.
// ---------------------------------------------------------------------------

/** Every filter optional; omitting one means no filter. */
export async function getCryptoTransfers(
  params: CryptoTransferQuery = {}
): Promise<CryptoTransfer[]> {
  const res = await axiosCryptoService.get(
    `${TRANSFERS}${qs(params as Record<string, string | number | undefined>)}`
  );
  const data = unwrap<CryptoTransfer[]>(res?.data);
  return Array.isArray(data) ? data : [];
}

/**
 * Any user's transfer within the tenant. Another tenant's returns
 * `CRYPTO.TRANSFER.NOT_FOUND`, not 403 — the existence of the row is itself
 * not something to leak.
 */
export async function getCryptoTransfer(transferId: string): Promise<CryptoTransfer> {
  const res = await axiosCryptoService.get(`${TRANSFERS}/${transferId}`);
  return unwrap<CryptoTransfer>(res?.data);
}

/**
 * Re-checks the transfer against the chain now instead of waiting for the
 * 15-second poller — for when support is on the phone.
 *
 * Runs the same reconciler as the poller, so both reach the same verdict.
 * Terminal transfers come back unchanged.
 */
export async function reconcileCryptoTransfer(transferId: string): Promise<CryptoTransfer> {
  const res = await axiosCryptoService.post(`${TRANSFERS}/${transferId}/reconcile`, {});
  return unwrap<CryptoTransfer>(res?.data);
}

/**
 * Marks OUR RECORD dead. It does not touch the transaction: one sitting in the
 * mempool can still be mined afterwards, and a customer may be replacing it
 * with the same nonce at a higher gas price. Reconcile first.
 *
 * `reason` is required and is stored on the row prefixed
 * `Abandoned by operator:` — this is the one state change a human makes by
 * hand, and one with no recorded reason is unauditable.
 */
export async function abandonCryptoTransfer(
  transferId: string,
  reason: string
): Promise<CryptoTransfer> {
  const res = await axiosCryptoService.post(`${TRANSFERS}/${transferId}/abandon`, { reason });
  return unwrap<CryptoTransfer>(res?.data);
}

// ---------------------------------------------------------------------------
// Errors and formatting
// ---------------------------------------------------------------------------

/**
 * Switch on `code`, never on `message` or `error` — both are localised
 * (en / ar / fr), so matching on text breaks the moment the operator's language
 * changes.
 */
export const CRYPTO_ERROR_CODES = {
  TRANSFER_NOT_FOUND: "CRYPTO.TRANSFER.NOT_FOUND",
  CHAIN_UNAVAILABLE: "CRYPTO.CHAIN.UNAVAILABLE",
  ASSET_NOT_SUPPORTED: "CRYPTO.ASSET.NOT_SUPPORTED",
  VALIDATION_FAILED: "COMMON.VALIDATION.FAILED",
  ACCESS_DENIED: "COMMON.AUTH.ACCESS_DENIED",
} as const;

interface ApiFailure {
  response?: { status?: number; data?: { code?: string; message?: string } };
}

export const cryptoErrorCode = (error: unknown): string | undefined =>
  (error as ApiFailure)?.response?.data?.code;

/**
 * Prefers a caller-supplied message keyed on the error CODE, then the API's own
 * localised message, then the generic fallback. The code table comes first
 * because the API's message is written for a developer; the screen's is written
 * for whoever is on the phone.
 */
export const cryptoErrorMessage = (
  error: unknown,
  fallback: string,
  byCode: Record<string, string> = {}
): string => {
  const code = cryptoErrorCode(error);
  if (code && byCode[code]) return byCode[code];
  return (error as ApiFailure)?.response?.data?.message || fallback;
};

/** The smallest amount shown in full. Below this, dust is labelled, not rounded. */
const DISPLAY_PRECISION = 8;
const SMALLEST_SHOWN = 1e-8;

/**
 * Crypto amounts are not money-formatted: 2dp would round 0.000045 ETH to zero.
 * Eight covers BTC's satoshi, with trailing zeros trimmed so a whole number does
 * not pretend to a precision nobody entered.
 *
 * Balances arrive as 18-decimal BigDecimal — the service answers `0E-18`, which
 * `Number` reads fine. But a dust balance like `4.5E-15` rounds to `0.00000000`
 * at eight places, and printing `0` on the screen whose entire question is
 * "can this wallet pay out?" is the one wrong answer. Anything non-zero but
 * below display precision is labelled as such instead.
 */
export const formatCryptoAmount = (value: number | string | null | undefined, asset?: string) => {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) {
    return "-";
  }
  const n = Number(value);
  const suffix = asset ? ` ${asset}` : "";
  if (n !== 0 && Math.abs(n) < SMALLEST_SHOWN) {
    return `< ${SMALLEST_SHOWN.toFixed(DISPLAY_PRECISION)}${suffix}`;
  }
  const amount = Number(n.toFixed(DISPLAY_PRECISION)).toLocaleString("en-US", {
    maximumFractionDigits: DISPLAY_PRECISION,
  });
  return `${amount}${suffix}`;
};

/**
 * An address or hash, head and tail only. Full values are 42 (address) or 66
 * (hash) characters and would push every other column off a table; the middle
 * is the part nobody reads. The full value stays available on hover and in the
 * detail view.
 */
export const truncateHex = (value?: string | null, head = 10, tail = 8) => {
  if (!value) return "-";
  return value.length <= head + tail + 1 ? value : `${value.slice(0, head)}…${value.slice(-tail)}`;
};
