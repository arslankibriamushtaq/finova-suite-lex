/**
 * Card Management enums + display helpers.
 * Values mirror the card-service contracts (see docs). Labels/colors are for the
 * admin UI only. Product catalog is fetched dynamically from GET /api/v1/cards/products;
 * these enums back the filter dropdowns and status badges.
 */

export const CARD_STATUSES = [
  "REQUESTED",
  "ISSUED",
  "ACTIVE",
  "BLOCKED",
  "EXPIRED",
  "CANCELLED",
] as const;

export const CARD_TYPES = ["VIRTUAL_DEBIT", "PHYSICAL_DEBIT"] as const;

export const CARD_TIERS = ["CLASSIC", "GOLD", "PLATINUM"] as const;

export const SHIPMENT_STATUSES = [
  "ORDER",
  "PROCESSING",
  "CARD_GENERATED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
] as const;

export const DELIVERY_METHODS = ["STANDARD", "EXPRESS"] as const;

// Human-readable labels ------------------------------------------------------
export const CARD_TYPE_LABELS: Record<string, string> = {
  VIRTUAL_DEBIT: "Virtual Debit",
  PHYSICAL_DEBIT: "Physical Debit",
};

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  ORDER: "Order",
  PROCESSING: "Processing",
  CARD_GENERATED: "Card generated",
  DISPATCHED: "Dispatched",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
};

export const prettyEnum = (value?: string | null) =>
  value
    ? value
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "-";

// Status badge classes (Tailwind utility classes only — no hardcoded hex) -----
export const cardStatusClasses = (status?: string): string => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700 border border-green-200";
    case "ISSUED":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "REQUESTED":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "BLOCKED":
      return "bg-orange-100 text-orange-700 border border-orange-200";
    case "EXPIRED":
      return "bg-gray-100 text-gray-600 border border-gray-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border border-red-200";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
};

export const shipmentStatusClasses = (status?: string): string => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-700 border border-green-200";
    case "IN_TRANSIT":
    case "DISPATCHED":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "CARD_GENERATED":
    case "PROCESSING":
    case "ORDER":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
};

export const isPhysical = (cardType?: string) => cardType === "PHYSICAL_DEBIT";

export const formatDate = (value?: string | null): string => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatMoney = (value?: number | null, currency?: string): string => {
  if (value === null || value === undefined) return "-";
  const num = Number(value).toLocaleString(undefined, { minimumFractionDigits: 0 });
  return currency ? `${num} ${currency}` : num;
};
