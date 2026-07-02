import axiosCardManagement from "../../utils/axiosCardManagement";

/**
 * Card Management (admin) API layer — card-service `/api/v1/admin/cards`.
 * Every response is wrapped in { data, message, timestamp }; callers read `response.data`.
 */

const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return queryParams ? `?${queryParams}` : "";
};

export interface AdminCardListParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  status?: string;
  cardType?: string;
  tier?: string;
  shipmentStatus?: string;
  customerId?: string;
  walletId?: string;
}

// 4.1 — List all cards (server-side pagination / sort / search / filters)
export function getAllAdminCards(params: AdminCardListParams = {}) {
  return axiosCardManagement.get(`/api/v1/admin/cards${buildQueryString(params)}`);
}

// 4.2 — Dashboard stats (summary cards)
export function getAdminCardStats() {
  return axiosCardManagement.get(`/api/v1/admin/cards/stats`);
}

// 4.3 — Card detail
export function getAdminCardById(id: string) {
  return axiosCardManagement.get(`/api/v1/admin/cards/${id}`);
}

// 4.4 — Issue a card
export function issueAdminCard(body: any) {
  return axiosCardManagement.post(`/api/v1/admin/cards`, body);
}

// 4.5 — Lifecycle actions
export function blockAdminCard(id: string) {
  return axiosCardManagement.post(`/api/v1/admin/cards/${id}/block`);
}

export function unblockAdminCard(id: string) {
  return axiosCardManagement.post(`/api/v1/admin/cards/${id}/unblock`);
}

export function cancelAdminCard(id: string) {
  return axiosCardManagement.post(`/api/v1/admin/cards/${id}/cancel`);
}

export function updateAdminCardLimits(
  id: string,
  body: { dailyLimit?: number; monthlyLimit?: number }
) {
  return axiosCardManagement.put(`/api/v1/admin/cards/${id}/limits`, body);
}

// 4.6 — Shipment tracking (physical cards)
export function getAdminCardTracking(id: string) {
  return axiosCardManagement.get(`/api/v1/admin/cards/${id}/tracking`);
}

export function advanceAdminCardTracking(id: string) {
  return axiosCardManagement.post(`/api/v1/admin/cards/${id}/tracking/advance`);
}

// 4.7 — Tier limits (admin-managed default limits per tier)
export function getAdminTierLimits() {
  return axiosCardManagement.get(`/api/v1/admin/cards/tier-limits`);
}

export function updateAdminTierLimit(body: {
  tier: string;
  dailyLimit: number;
  monthlyLimit: number;
}) {
  return axiosCardManagement.put(`/api/v1/admin/cards/tier-limits`, body);
}

// 4.8 — Card order fees (per card type + tier)
export function getAdminCardFees() {
  return axiosCardManagement.get(`/api/v1/admin/cards/fees`);
}

export function updateAdminCardFee(body: {
  cardType: string;
  tier: string;
  issuanceFee: number;
  shipmentFee: number;
  currency?: string;
}) {
  return axiosCardManagement.put(`/api/v1/admin/cards/fees`, body);
}

// 5 — Issuable products catalog (labels / features / default limits)
export function getCardProducts() {
  return axiosCardManagement.get(`/api/v1/cards/products`);
}

// 7 — Admin card products catalog (DB-backed, admin-managed)
export function getAdminCardProducts() {
  return axiosCardManagement.get(`/api/v1/admin/card-products`);
}

export function getAdminCardProductById(id: string) {
  return axiosCardManagement.get(`/api/v1/admin/card-products/${id}`);
}

export function createAdminCardProduct(body: any) {
  return axiosCardManagement.post(`/api/v1/admin/card-products`, body);
}

export function updateAdminCardProduct(id: string, body: any) {
  return axiosCardManagement.put(`/api/v1/admin/card-products/${id}`, body);
}

export function activateAdminCardProduct(id: string) {
  return axiosCardManagement.post(`/api/v1/admin/card-products/${id}/activate`);
}

export function deactivateAdminCardProduct(id: string) {
  return axiosCardManagement.post(`/api/v1/admin/card-products/${id}/deactivate`);
}

export function deleteAdminCardProduct(id: string) {
  return axiosCardManagement.delete(`/api/v1/admin/card-products/${id}`);
}
