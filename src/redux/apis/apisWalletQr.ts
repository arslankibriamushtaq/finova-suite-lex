import axiosWalletService from "../../utils/axiosWalletService";

/**
 * Wallet QR payments — wallet-service, mounted on the gateway at
 * /wallet-service. `tenant_id` and the caller's customer come from the JWT;
 * never send either.
 *
 * A QR code belongs to exactly one wallet, so the credited account — and
 * therefore the currency — is settled when the code is minted, not inferred
 * when it is scanned. A customer holding CAD and USD wallets has two static
 * codes, one per wallet.
 *
 * STATIC  — one permanent code per wallet, minted lazily on first read.
 * DYNAMIC — a one-shot "bill" carrying an amount and an expiry.
 *
 * The scanned payload only *claims* a token, amount and expiry; the row in
 * `wallet_qr_codes` is the authority and is re-read on every resolve and pay,
 * which is why a screenshot of a spent code buys nothing. Paying is not a
 * separate money path: /pay validates the code and delegates to the ordinary
 * wallet-to-wallet transfer (channel = P2P_QR), so limits, idempotency, the
 * insufficient-funds check and settlement behave exactly as for a transfer
 * typed by wallet number.
 *
 * Casbin object `wallet.qr` — acts read (list/resolve), create (dynamic/pay)
 * and update (revoke). Without those policies every call here returns 403.
 */

const BASE = "/api/v1/wallets/qr";

export type WalletQrType = "STATIC" | "DYNAMIC";

export type WalletQrStatus = "ACTIVE" | "USED" | "EXPIRED" | "REVOKED";

export interface WalletQrCode {
  id: string;
  walletId: string;
  customerId?: string;
  /**
   * Denormalised at mint time — an already-printed code keeps meaning what it
   * meant, even if the wallet is later renumbered.
   */
  walletNumber?: string;
  currency: string;
  qrType: WalletQrType;
  /** The opaque token embedded in the payload; the lookup key on scan. */
  qrToken: string;
  /** The signed string encoded into the image, and what /resolve expects back. */
  payload?: string;
  status: WalletQrStatus;
  /** DYNAMIC only — a STATIC code carries neither. */
  amount?: number | null;
  expiresAt?: string | null;
  usedAt?: string | null;
  usedByTransferId?: string | null;
  revokedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  /** Rendered PNG. The service has shipped it under more than one name. */
  qrImageBase64?: string | null;
  imageBase64?: string | null;
  qrImageUrl?: string | null;
}

/** What a payer is shown *before* committing — never the full account number. */
export interface ResolvedWalletQr {
  qrId: string;
  qrToken: string;
  qrType: WalletQrType;
  status: WalletQrStatus;
  /** Masked for display: a public sticker must not leak a full account number. */
  maskedWalletNumber?: string;
  payeeName?: string | null;
  currency: string;
  amount?: number | null;
  expiresAt?: string | null;
  /**
   * Echo this back on /pay. It is what stops a code being revoked and
   * re-pointed between preview and payment, quietly crediting an account the
   * payer never saw.
   */
  expectedCreditWalletId: string;
}

export interface CreateDynamicQrRequest {
  amount: number;
  /**
   * Optional. Omitted, the service applies QR_DYNAMIC_TTL_MINUTES; it is
   * capped server-side at QR_MAX_DYNAMIC_TTL_MINUTES so a "bill" cannot be
   * made effectively permanent.
   */
  ttlMinutes?: number;
  reference?: string;
}

export interface PayWalletQrRequest {
  /** The scanned string, exactly as it came off the camera. */
  payload: string;
  sourceWalletId: string;
  /** Straight from the /resolve response — see the field note above. */
  expectedCreditWalletId: string;
  /** DYNAMIC codes carry their own amount; STATIC codes need one here. */
  amount?: number;
  note?: string;
  idempotencyKey: string;
}

/**
 * The wallet-service endpoints answer with `{ data: … }`, a bare object, or a
 * Spring page depending on the handler. Unwrap once, defensively, rather than
 * teaching every caller the shapes.
 */
type Envelope = { data?: unknown; content?: unknown; items?: unknown };

const unwrap = <T>(response: { data?: unknown }): T => {
  const body = (response?.data ?? {}) as Envelope;
  return (body?.data ?? body) as T;
};

const unwrapList = <T>(response: { data?: unknown }): T[] => {
  const inner = unwrap<Envelope | T[]>(response);
  if (Array.isArray(inner)) return inner as T[];
  const page = inner as Envelope;
  return (page?.content ?? page?.items ?? page?.data ?? []) as T[];
};

/** Every QR code belonging to the caller's own wallets. */
export async function listMyWalletQrCodes(): Promise<WalletQrCode[]> {
  return unwrapList<WalletQrCode>(await axiosWalletService.get(BASE));
}

/**
 * The wallet's permanent code. Minted on first read — there is no backfill and
 * no separate "create" call, and a concurrent double-read is safe (the partial
 * unique index picks one winner and the loser is handed the winner's row).
 */
export async function getWalletStaticQr(walletId: string): Promise<WalletQrCode> {
  return unwrap<WalletQrCode>(
    await axiosWalletService.get(`${BASE}/wallet/${walletId}`)
  );
}

/** A one-shot code for a specific amount — the request-money / "bill" flow. */
export async function createDynamicWalletQr(
  walletId: string,
  body: CreateDynamicQrRequest
): Promise<WalletQrCode> {
  return unwrap<WalletQrCode>(
    await axiosWalletService.post(`${BASE}/wallet/${walletId}/dynamic`, body)
  );
}

/** Preview a scanned payload. Read-only — nothing is claimed or moved. */
export async function resolveWalletQr(payload: string): Promise<ResolvedWalletQr> {
  return unwrap<ResolvedWalletQr>(
    await axiosWalletService.post(`${BASE}/resolve`, { payload })
  );
}

/**
 * The response is the ordinary transfer result — /pay delegates to the
 * wallet-to-wallet use case rather than moving money itself.
 */
export async function payWalletQr(
  body: PayWalletQrRequest
): Promise<Record<string, unknown>> {
  return unwrap<Record<string, unknown>>(
    await axiosWalletService.post(`${BASE}/pay`, body)
  );
}

/**
 * Kill a code. A revoked STATIC code is not the end of the road — the next
 * read of that wallet mints a fresh one.
 */
export async function revokeWalletQr(qrId: string): Promise<WalletQrCode> {
  return unwrap<WalletQrCode>(
    await axiosWalletService.post(`${BASE}/${qrId}/revoke`, {})
  );
}

// ============================================================
// Helpers
// ============================================================

interface ApiFailure {
  response?: { data?: { message?: string; error?: string } };
}

/** The API's own message when it sent one, else the caller's translated text. */
export const qrErrorMessage = (error: unknown, fallback: string): string =>
  (error as ApiFailure)?.response?.data?.message || fallback;

/**
 * A displayable `src` for the rendered code, whichever field the service used.
 * Returns null when it sent no image, so the caller can fall back to the raw
 * payload rather than render a broken tile.
 */
export const qrImageSrc = (code?: WalletQrCode | null): string | null => {
  if (!code) return null;
  if (code.qrImageUrl) return code.qrImageUrl;
  const raw = code.qrImageBase64 || code.imageBase64;
  if (!raw) return null;
  return raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
};

export const formatQrAmount = (
  value: number | null | undefined,
  currency?: string
) => {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "-";
  const amount = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${amount}` : amount;
};

/** Only an ACTIVE, unexpired code is worth showing as payable. */
export const isQrPayable = (code?: WalletQrCode | null): boolean => {
  if (!code || code.status !== "ACTIVE") return false;
  if (!code.expiresAt) return true;
  return new Date(code.expiresAt).getTime() > Date.now();
};

export const newQrIdempotencyKey = () => {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  return `qr-pay-${rand}`;
};
