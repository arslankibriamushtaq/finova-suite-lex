import { Component, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";

import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import type { Invoice } from "../../redux/apis/apisTenancyAdmin";
import { TENANCY_TONES, money } from "./tenancyKitUtils";

/**
 * Shared rendering for the tenant console and the tenant portal.
 *
 * The components are shared because the documents are identical — an invoice is
 * the same invoice whoever is looking at it. The COPY is not shared, and lives
 * in the screens.
 */

export const TenancyStatusBadge = ({ status }: { status?: string | null }) => (
  <Badge
    variant="outline"
    className={cn(
      "border font-medium",
      TENANCY_TONES[status || ""] || "border-border bg-muted text-muted-foreground"
    )}
  >
    {status || "—"}
  </Badge>
);

/**
 * qrcode.react THROWS when the payload will not fit the chosen error-correction
 * level, and a throw during render unmounts the whole tree — one long TLV would
 * take the entire invoices page down rather than just losing the code. ZATCA
 * payloads carry the seller name, VAT number, timestamp and both totals, so
 * they run long by nature.
 *
 * A boundary keeps that failure local: the invoice still renders, and the code
 * is replaced by a note rather than a blank square that looks like a bug.
 */
class QrBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <span className="rounded-[2px] border border-[var(--surface-border)] px-2 py-1 text-[11px] text-muted-foreground">
          QR unavailable
        </span>
      );
    }
    return this.props.children;
  }
}

/**
 * The ZATCA QR.
 *
 * `zatcaQr` is a Base64-encoded TLV payload, generated once when the invoice was
 * issued and stored, so the code on the printed document always matches the
 * document. It is passed through **unchanged** — decoding, reformatting or
 * re-encoding it is exactly what ZATCA's tamper check exists to catch.
 */
export const ZatcaQr = ({ payload, size = 128 }: { payload?: string | null; size?: number }) => {
  if (!payload) return null;
  return (
    <QrBoundary>
      <div className="flex flex-col items-center gap-1">
        {/* The white plate is required: a QR scans from dark-on-light, so it
            must not inherit a dark surface. */}
        <div className="rounded-[2px] border border-[var(--surface-border)] bg-white p-2">
          {/* Level L carries the most data for a given size. The payload is a
              fixed TLV we cannot shorten, so capacity is the constraint that
              matters, not redundancy. */}
          <QRCodeSVG value={payload} size={size} level="L" />
        </div>
        <span className="text-[11px] text-muted-foreground">ZATCA</span>
      </div>
    </QrBoundary>
  );
};

/** One label over its value. Grouped into blocks rather than strung across the
 *  full width: on a wide modal a justify-between row leaves the value so far
 *  from its label that the pair stops reading as a pair.
 */
const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="min-w-0">
    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
    {/* Nullish coalescing only catches null/undefined, so a field the API
        returns as an empty string printed as nothing at all — which is how
        Seller VAT, Buyer VAT and Due came out blank instead of as a dash. */}
    <div className="mt-0.5 break-words text-sm font-medium text-foreground">
      {value === null || value === undefined || value === "" ? "—" : value}
    </div>
  </div>
);

/**
 * The document itself. Everything ZATCA requires on a printed invoice is here:
 * the QR, both VAT numbers and the per-line VAT breakdown. Values are printed
 * as given.
 */
export const InvoiceDocument = ({ invoice }: { invoice: Invoice }) => (
  <div className="space-y-5">
    {/* Identity band. The QR sits inline with the number rather than opposite
        it: opposite, its 128px height set the row and left a block of dead
        space under the badges. */}
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2px] border border-[color-mix(in_srgb,var(--primary)_14%,var(--surface-border))] bg-[color-mix(in_srgb,var(--primary)_4%,var(--surface-card))] p-3">
      <div className="min-w-0">
        <div className="font-mono text-base font-semibold text-foreground">{invoice.invoiceNo}</div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <TenancyStatusBadge status={invoice.status} />
          <Badge variant="outline" className="border-border font-medium">
            {invoice.invoiceType}
          </Badge>
        </div>
      </div>
      <ZatcaQr payload={invoice.zatcaQr} size={84} />
    </div>

    {/* Who, and when. Seller and buyer are separate parties, so they get
        separate blocks instead of six rows a reader has to pair up. */}
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-3 rounded-[2px] border border-[var(--surface-border)] p-3">
        <Field label="Seller" value={invoice.sellerName} />
        <Field label="Seller VAT" value={invoice.sellerVatNumber} />
      </div>
      <div className="space-y-3 rounded-[2px] border border-[var(--surface-border)] p-3">
        <Field label="Buyer" value={invoice.buyerName} />
        <Field label="Buyer VAT" value={invoice.buyerVatNumber} />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <Field label="Issued" value={invoice.issueDate} />
      <Field label="Due" value={invoice.dueDate} />
    </div>

    <div className="overflow-x-auto rounded-[2px] border border-[color-mix(in_srgb,var(--primary)_14%,var(--surface-border))]">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--theme-table-background-color)] text-xs uppercase tracking-wide text-white">
            <th className="px-3 py-2.5 text-start font-semibold">#</th>
            <th className="px-3 py-2.5 text-start font-semibold">Description</th>
            <th className="px-3 py-2.5 text-end font-semibold">Qty</th>
            <th className="px-3 py-2.5 text-end font-semibold">Unit</th>
            <th className="px-3 py-2.5 text-end font-semibold">Subtotal</th>
            <th className="px-3 py-2.5 text-end font-semibold">VAT</th>
            <th className="px-3 py-2.5 text-end font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines?.map((line) => (
            <tr
              key={line.lineNo}
              className="border-t border-[var(--surface-border)] odd:bg-[var(--theme-table-row-alt)]"
            >
              <td className="px-3 py-2.5 text-muted-foreground">{line.lineNo}</td>
              <td className="px-3 py-2.5">
                <div className="font-medium text-foreground">{line.descriptionEn}</div>
                <div dir="rtl" className="text-xs text-muted-foreground">
                  {line.descriptionAr}
                </div>
              </td>
              <td className="px-3 py-2.5 text-end tabular-nums">{line.quantity}</td>
              <td className="px-3 py-2.5 text-end tabular-nums">{money(line.unitPrice)}</td>
              <td className="px-3 py-2.5 text-end tabular-nums">{money(line.lineSubtotal)}</td>
              <td className="px-3 py-2.5 text-end tabular-nums">{money(line.lineVatAmount)}</td>
              <td className="px-3 py-2.5 text-end font-semibold tabular-nums">
                {money(line.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Totals read as a receipt: labels and figures adjacent, the payable last
        and heaviest. */}
    <div className="flex justify-end">
      <dl className="w-full max-w-xs space-y-2 rounded-[2px] border border-[var(--surface-border)] p-3">
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums font-medium text-foreground">
            {money(invoice.subtotal, invoice.currency)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <dt className="text-muted-foreground">
            VAT ({(Number(invoice.vatRate || 0) * 100).toFixed(0)}%)
          </dt>
          <dd className="tabular-nums font-medium text-foreground">
            {money(invoice.vatAmount, invoice.currency)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-[var(--surface-border)] pt-2">
          <dt className="text-sm font-semibold text-foreground">Total</dt>
          <dd className="text-lg font-bold tabular-nums text-[var(--primary)]">
            {money(invoice.totalAmount, invoice.currency)}
          </dd>
        </div>
      </dl>
    </div>
  </div>
);
