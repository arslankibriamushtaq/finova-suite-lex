import axiosFactoring from "../../utils/axiosFactoring";

/**
 * Department administration (identity-service).
 *
 * A department is the tier above roles: it holds a permission set of its own and
 * every role inside it inherits that set in full, so a role's effective
 * permissions are `department ∪ role`. The union is resolved server-side, which
 * is why nothing here has to merge anything — the role endpoints already return
 * the flattened result.
 */

const BASE = "/identity-service/api/v1/departments";

export interface Department {
  id: string;
  tenantId?: string;
  departmentCode: string;
  departmentName: string;
  departmentNameAr?: string | null;
  description?: string | null;
  active: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export interface CreateDepartmentRequest {
  departmentCode: string;
  departmentName: string;
  departmentNameAr?: string;
  description?: string;
  displayOrder?: number;
}

/** Every field optional — null means "leave unchanged". */
export interface UpdateDepartmentRequest {
  departmentName?: string;
  departmentNameAr?: string | null;
  description?: string | null;
  active?: boolean;
  displayOrder?: number;
}

const qs = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

/** Paged list. `page` is 0-based, matching the rest of identity-service. */
export function getDepartments(page?: number, size?: number, search?: string) {
  return axiosFactoring.get(`${BASE}${qs({ page, size, search })}`);
}

export function getDepartment(id: string) {
  return axiosFactoring.get(`${BASE}/${id}`);
}

export function getDepartmentByCode(departmentCode: string) {
  return axiosFactoring.get(`${BASE}/code/${encodeURIComponent(departmentCode)}`);
}

export function createDepartment(body: CreateDepartmentRequest) {
  return axiosFactoring.post(BASE, body);
}

export function updateDepartment(id: string, body: UpdateDepartmentRequest) {
  return axiosFactoring.put(`${BASE}/${id}`, body);
}

/**
 * Refused with 422 IDENTITY.DEPARTMENT.HAS_ROLES while any role still points at
 * the department — detach those roles first. The backend fails loudly rather
 * than nulling `department_id` across N roles and silently stripping their
 * inherited grants.
 */
export function deleteDepartment(id: string) {
  return axiosFactoring.delete(`${BASE}/${id}`);
}

/** The department's own set, grouped by module (same shape as the role endpoint). */
export function getDepartmentPermissions(id: string) {
  return axiosFactoring.get(`${BASE}/${id}/permissions`);
}

/**
 * REPLACES the whole set — an empty array clears it. This is the cascade
 * trigger: on success every role in the department is re-flattened and Redis is
 * rebuilt once for the batch. An unknown permissionId aborts the sync entirely.
 */
export function syncDepartmentPermissions(id: string, permissionIds: string[]) {
  return axiosFactoring.put(`${BASE}/${id}/permissions/sync`, { permissionIds });
}

/** Roles that inherit from this department, each already carrying its department fields. */
export function getDepartmentRoles(id: string) {
  return axiosFactoring.get(`${BASE}/${id}/roles`);
}

/**
 * Repair lever: re-flattens every role in the department from the database into
 * Casbin and Redis. Idempotent — use it when a cascade died partway through.
 */
export function recomputeDepartment(id: string) {
  return axiosFactoring.post(`${BASE}/${id}/recompute`);
}

// ---------------------------------------------------------------------------
// Role side
// ---------------------------------------------------------------------------

/**
 * Attach a role to a department. Separate from the role update endpoint because
 * `UpdateRoleRequest` treats null as "leave unchanged" and so cannot express a
 * detach. Recomputes only this role.
 */
export function setRoleDepartment(roleId: string, departmentId: string) {
  return axiosFactoring.put(`/identity-service/api/v1/roles/${roleId}/department`, {
    departmentId,
  });
}

/** Detach a role from its department; it keeps only its own permissions. */
export function clearRoleDepartment(roleId: string) {
  return axiosFactoring.delete(`/identity-service/api/v1/roles/${roleId}/department`);
}

/**
 * The permission catalog, optionally annotated for a department.
 *
 * With `departmentId` every permission gains `inheritedFromDepartment: boolean`
 * so a role editor can show the full catalog with inherited entries pre-checked
 * and locked. It annotates — it does not filter — because hiding them would
 * make it impossible to see WHY a role holds a permission it was never granted.
 */
export function getPermissionCatalog(departmentId?: string) {
  return axiosFactoring.get(
    `/identity-service/api/v1/permissions${qs({ departmentId })}`
  );
}

/** Error codes the department endpoints return; switch on these, never on message. */
export const DEPARTMENT_ERRORS = {
  NOT_FOUND: "IDENTITY.DEPARTMENT.NOT_FOUND",
  DUPLICATE: "IDENTITY.DEPARTMENT.DUPLICATE",
  HAS_ROLES: "IDENTITY.DEPARTMENT.HAS_ROLES",
} as const;

/** Pull the backend's stable error code out of an axios error, if present. */
export const departmentErrorCode = (error: unknown): string | undefined =>
  (error as { response?: { data?: { code?: string } } })?.response?.data?.code;
