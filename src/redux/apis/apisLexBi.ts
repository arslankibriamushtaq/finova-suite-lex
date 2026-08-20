import { lexBiApi } from "../../utils/axiosLexService";
import {
  clean,
  pageOf,
  toServerPage,
  unwrap,
  unwrapList,
  type LexPage,
  type LexPageQuery,
} from "./apisLexCore";

/**
 * lex-bi-service (:8206) — the gallery, the report renderer, the builder and
 * schedules.
 *
 * Casbin objects: `lex.bi.reports`, `lex.bi.schedules`.
 *
 * Standard and custom reports return the SAME shape, which is why there is one
 * renderer and not two. Exports offer XLSX and CSV only — PDF is in the BRD but
 * not in this build, so it is absent from the menu rather than present and
 * failing.
 */

const BI = "/api/v1/lex/bi";

export type LexVisualization = "TABLE" | "BAR" | "LINE" | "PIE" | "FUNNEL";
export type LexUnit = "count" | "percent" | "minutes";
export type LexExportFormat = "XLSX" | "CSV";

export const EXPORT_FORMATS: LexExportFormat[] = ["XLSX", "CSV"];

export interface LexReportFilters {
  productId?: string;
  sectorId?: string;
  from?: string;
  to?: string;
}

export interface LexGalleryCard {
  key: string;
  title: string;
  group: string;
  visualization: LexVisualization | string;
  available: boolean;
  /** Why a card cannot run yet. Rendered as the card body — never hidden. */
  unavailableReason?: string | null;
  summaryValue?: number | string | null;
  summaryLabel?: string | null;
  miniSeries?: LexReportRow[];
}

export interface LexReportRow {
  label: string;
  value: number;
  count?: number;
  /** Null means nothing sits behind this row — render it as non-clickable. */
  drillKey?: string | null;
}

export interface LexReportResult {
  reportKey?: string;
  title: string;
  visualization: LexVisualization | string;
  measure: string;
  unit: LexUnit | string;
  dimensionLabel?: string;
  summaryValue?: number | string;
  summaryLabel?: string;
  rows: LexReportRow[];
  filters?: LexReportFilters;
  /** Usually says what was excluded and why. Always rendered. */
  note?: string;
}

export interface LexSavedReport {
  id: string;
  name: string;
  description?: string;
  dataSource: string;
  dimension: string;
  granularity?: string | null;
  measure: string;
  visualization: string;
  visibility: "PERSONAL" | "SHARED" | string;
  sharedWith?: string[];
  /**
   * Sharing grants reading, not editing. A non-author sees Run and Export only
   * — no Rename, Reshare or Delete.
   */
  isAuthor?: boolean;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** The gallery takes the same filters as a report, so the tile figures match. */
export const getGallery = async (filters: LexReportFilters = {}): Promise<LexGalleryCard[]> => {
  return unwrapList(await lexBiApi.get(`${BI}/gallery`, { params: clean(filters) }));
};

export const getStandardReport = async (
  reportKey: string,
  filters: LexReportFilters = {}
): Promise<LexReportResult> =>
  unwrap(await lexBiApi.get(`${BI}/standard/${reportKey}`, { params: clean(filters) }));

export const getSavedReports = async (
  query: LexPageQuery = {}
): Promise<LexPage<LexSavedReport>> => {
  const { page = 1, size = 20, ...rest } = query;
  return pageOf(await lexBiApi.get(`${BI}/reports`, {
    params: clean({ page: toServerPage(page), size, ...rest }),
  }), size, page);
};

/**
 * A report the user may not see answers **422 `REPORT_NOT_VISIBLE`, not 404**.
 * Rendered as "personal to its author, or shared with a role you do not hold",
 * which is more useful than pretending it does not exist.
 */
export const runSavedReport = async (
  id: string,
  filters: LexReportFilters = {}
): Promise<LexReportResult> =>
  unwrap(await lexBiApi.get(`${BI}/reports/${id}/run`, { params: clean(filters) }));

export const getSavedReport = async (id: string): Promise<LexSavedReport> =>
  unwrap(await lexBiApi.get(`${BI}/reports/${id}`));

export const deleteSavedReport = async (id: string): Promise<void> => {
  await lexBiApi.delete(`${BI}/reports/${id}`);
};

export const updateReportSharing = async (
  id: string,
  body: { visibility: string; sharedWith?: string[] }
): Promise<LexSavedReport> => unwrap(await lexBiApi.put(`${BI}/reports/${id}/sharing`, body));

/** One application behind a figure. The shape the drill-down list renders. */
export interface LexDrillRow {
  id?: string;
  applicationId?: string;
  applicationNumber?: string;
  status?: string;
  stageCode?: string;
  reasonCode?: string;
  assignedLevelCode?: string;
}

/** The rows behind a bar, table row or funnel stage. */
export const getDrillDown = async (
  dimension: string,
  value: string,
  filters: LexReportFilters = {},
  limit = 50
): Promise<LexDrillRow[]> => {
  return unwrapList(await lexBiApi.get(`${BI}/drill-down`, {
    params: clean({ dimension, value, limit, ...filters }),
  }));
};

/* ------------------------------------------------------------------ */
/* Builder                                                             */
/* ------------------------------------------------------------------ */

/** Data sources carry availability; the other four lists are plain strings. */
export interface LexDataSourceOption {
  value: string;
  available: boolean;
  unavailableReason?: string | null;
}

export interface LexBuilderOptions {
  dataSources: LexDataSourceOption[];
  dimensions: string[];
  measures: string[];
  granularities: string[];
  visualizations: string[];
}

/**
 * Never hardcode the option lists: the server narrows dimensions and measures
 * to the chosen source, and offering a combination the API then rejects teaches
 * people not to trust the wizard.
 */
export const getBuilderOptions = async (dataSource?: string): Promise<LexBuilderOptions> => {
  const { data } = await lexBiApi.get(`${BI}/reports/builder/options`, {
    params: clean({ dataSource }),
  });
  return {
    dataSources: data?.dataSources || [],
    dimensions: data?.dimensions || [],
    measures: data?.measures || [],
    granularities: data?.granularities || [],
    visualizations: data?.visualizations || [],
  };
};

/** What `POST /preview` takes. `POST /reports` takes the same fields plus name and sharing. */
export interface LexReportDefinition {
  dataSource: string;
  dimension: string;
  granularity?: string | null;
  measure: string;
  visualization: string;
}

export interface LexReportSaveBody extends LexReportDefinition {
  name: string;
  description?: string;
  visibility?: "PERSONAL" | "SHARED";
  sharedWith?: string[];
}

/** Preview and save validate identically — a clean preview guarantees a clean save. */
export const previewReport = async (body: LexReportDefinition): Promise<LexReportResult> =>
  unwrap(await lexBiApi.post(`${BI}/preview`, body));

export const saveReport = async (body: LexReportSaveBody): Promise<LexSavedReport> =>
  unwrap(await lexBiApi.post(`${BI}/reports`, body));

/**
 * The combinations the server refuses, mirrored so the picker never offers them.
 *
 * - LINE needs a DATE breakdown: a line across categories implies a trend that
 *   never happened.
 * - PIE cannot show an average or a median: slices must sum to a whole.
 */
const AGGREGATE_ONLY_MEASURES = ["AVERAGE_HANDLING_MINUTES", "MEDIAN_HANDLING_MINUTES"];

/**
 * Why each refusal exists, so the picker can say it rather than just disabling:
 *
 * - a LINE joining unrelated categories implies a trend over time that never
 *   happened;
 * - a PIE asserts its slices sum to a whole, and averages do not.
 */
export const visualizationRefusal = (
  visualization: string,
  dimension?: string,
  measure?: string
): "line" | "pie" | null => {
  if (visualization === "LINE" && dimension !== "DATE") return "line";
  if (visualization === "PIE" && measure && AGGREGATE_ONLY_MEASURES.includes(measure)) return "pie";
  return null;
};

export const visualizationAllowed = (
  visualization: string,
  dimension?: string,
  measure?: string
): boolean => visualizationRefusal(visualization, dimension, measure) === null;

/**
 * Granularity appears only when the dimension is DATE, and is then required —
 * a date with no granularity is ambiguous, and a categorical dimension with one
 * is meaningless. Both are refused.
 */
export const granularityRequired = (dimension?: string) => dimension === "DATE";

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * The current filters go with the request, so the file matches the screen. The
 * file carries them in a header block — the export dialog says so, so users
 * know it is self-describing.
 */
export const exportStandardReport = async (
  reportKey: string,
  format: LexExportFormat,
  filters: LexReportFilters = {}
): Promise<void> => {
  const { data } = await lexBiApi.get(`${BI}/standard/${reportKey}/export`, {
    params: clean({ format, ...filters }),
    responseType: "blob",
  });
  downloadBlob(data, `${reportKey}.${format.toLowerCase()}`);
};

export const exportSavedReport = async (
  id: string,
  name: string,
  format: LexExportFormat,
  filters: LexReportFilters = {}
): Promise<void> => {
  const { data } = await lexBiApi.get(`${BI}/reports/${id}/export`, {
    params: clean({ format, ...filters }),
    responseType: "blob",
  });
  downloadBlob(data, `${name || id}.${format.toLowerCase()}`);
};

/* ------------------------------------------------------------------ */
/* Schedules                                                           */
/* ------------------------------------------------------------------ */

export type LexScheduleFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export const SCHEDULE_FREQUENCIES: LexScheduleFrequency[] = ["DAILY", "WEEKLY", "MONTHLY"];

export interface LexSchedule {
  id: string;
  reportKey?: string;
  reportDefinitionId?: string;
  reportName?: string;
  frequency: LexScheduleFrequency | string;
  dayOfWeek?: string;
  dayOfMonth?: number;
  timeOfDay?: string;
  timeZone?: string;
  format: LexExportFormat | string;
  recipients: string[];
  lastRunAt?: string;
  lastRunStatus?: string;
  /** Shown on a FAILED row — a failed run still arms the next one. */
  lastRunNote?: string;
  nextRunAt?: string;
  active: boolean;
}

export const getSchedules = async (): Promise<LexSchedule[]> => {
  return unwrapList(await lexBiApi.get(`${BI}/schedules`));
};

export const createSchedule = async (body: Partial<LexSchedule>): Promise<LexSchedule> =>
  unwrap(await lexBiApi.post(`${BI}/schedules`, body));

export const updateSchedule = async (
  id: string,
  body: Partial<LexSchedule>
): Promise<LexSchedule> => unwrap(await lexBiApi.put(`${BI}/schedules/${id}`, body));

export const setScheduleActive = async (id: string, active: boolean): Promise<LexSchedule> =>
  unwrap(await lexBiApi.put(`${BI}/schedules/${id}`, { active }));

export const deleteSchedule = async (id: string): Promise<void> => {
  await lexBiApi.delete(`${BI}/schedules/${id}`);
};

/** `delivered: false` with a reason is a useful outcome, not an error. Show the note either way. */
export const runScheduleNow = async (
  id: string
): Promise<{ delivered: boolean; note?: string; rowCount?: number }> =>
  unwrap(await lexBiApi.post(`${BI}/schedules/${id}/run`, {}));

/**
 * What the create form must enforce before it lets a schedule be saved.
 *
 * The month cap is 28 on purpose: a schedule on the 30th would skip February
 * entirely, and a monthly report that silently misses a month is worse than one
 * that runs three days early.
 */
export const scheduleProblem = (
  draft: Partial<LexSchedule>
): "target" | "dayOfWeek" | "dayOfMonth" | "recipients" | "format" | null => {
  const hasStandard = !!draft.reportKey;
  const hasSaved = !!draft.reportDefinitionId;
  if (hasStandard === hasSaved) return "target";
  if (draft.frequency === "WEEKLY" && !draft.dayOfWeek) return "dayOfWeek";
  if (
    draft.frequency === "MONTHLY" &&
    (!draft.dayOfMonth || draft.dayOfMonth < 1 || draft.dayOfMonth > 28)
  ) {
    return "dayOfMonth";
  }
  if (!draft.recipients?.length) return "recipients";
  if (!draft.format || !EXPORT_FORMATS.includes(draft.format as LexExportFormat)) return "format";
  return null;
};

export const MAX_MONTHLY_DAY = 28;
