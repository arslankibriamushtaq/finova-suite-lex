import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, Code2, Copy, Download, Loader2, Search, ServerCog } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/shared/detailKit";
import { LexPageHeader } from "../../components/shared/lexKit";
import {
  getApiDocsIndex,
  getOpenApiDocument,
  toTenancyError,
  type ApiDocProduct,
  type ApiDocService,
  type ApiDocsIndex,
  type OpenApiDocument,
  type OpenApiOperation,
} from "../../redux/apis/apisTenancyAdmin";
import { mergeProductDocuments, saveJson } from "./openApiBundle";
import "./tenantApiDocs.css";

/**
 * The API documentation this workspace is entitled to.
 *
 * Every document is the owning service's own live springdoc output, so nothing
 * here is written by hand and nothing can drift from the service it describes.
 *
 * Two failures matter more than the rest, and neither should empty the page: a
 * service that did not answer in time is temporarily unavailable rather than
 * gone, and a service the subscription no longer covers is an upgrade prompt
 * rather than an error. Both are per service — one failing has to leave the
 * others readable, which is why each row carries its own state.
 */

/** Ordered the way a reader scans: safe things first, destructive last. */
const METHODS = ["get", "post", "put", "patch", "delete", "head", "options"];

type DocState =
  | { status: "loading" }
  | { status: "ready"; doc: OpenApiDocument }
  | { status: "error"; message: string; upgrade: boolean; retry: boolean };

type Operation = { method: string; path: string; op: OpenApiOperation };

const copyText = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Could not copy — select the text and copy it manually.");
  }
};

const TenantApiDocs = () => {
  const [index, setIndex] = useState<ApiDocsIndex | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  /** Keyed by serviceCode: a service listed under two products fetches once. */
  const [docs, setDocs] = useState<Record<string, DocState>>({});
  /** Keyed by product+service, so the same service opens independently. */
  const [open, setOpen] = useState<Set<string>>(new Set());

  /** What is being fetched purely to be saved, so a row can say so. */
  const [saving, setSaving] = useState<Set<string>>(new Set());

  useEffect(() => {
    getApiDocsIndex()
      .then(setIndex)
      .catch((error) => {
        const failure = toTenancyError(error, "Could not load the API documentation.");
        // A platform operator is on the wrong console, and a role without the
        // permission should not see the page at all. Neither is worth a toast
        // that suggests trying again.
        if (
          failure.code === "TENANCY.TENANT.PLATFORM_ACCOUNT" ||
          failure.code === "COMMON.AUTH.ACCESS_DENIED"
        ) {
          setDenied(true);
        } else {
          toast.error(failure.message);
        }
        setIndex(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  /**
   * Fetched when a service is first expanded, never up front.
   *
   * The index can list a dozen services, each document is a service's whole API
   * surface, and a reader opens one. Loading all of them to render a list of
   * names would spend a dozen upstream calls on eleven nobody asked for.
   */
  const loadDoc = async (service: ApiDocService) => {
    if (docs[service.serviceCode]?.status === "ready") return;

    setDocs((current) => ({ ...current, [service.serviceCode]: { status: "loading" } }));

    try {
      const doc = await getOpenApiDocument(service.specUrl);
      setDocs((current) => ({ ...current, [service.serviceCode]: { status: "ready", doc } }));
    } catch (error) {
      const failure = toTenancyError(error, "Could not load this document.");
      setDocs((current) => ({
        ...current,
        [service.serviceCode]: {
          status: "error",
          message: failure.message,
          upgrade: failure.code === "TENANCY.API_DOCS.SERVICE_NOT_ENTITLED",
          retry: failure.code === "TENANCY.API_DOCS.UPSTREAM_UNAVAILABLE",
        },
      }));
    }
  };

  // Several at once, not one: this is a reference, and closing what you were
  // reading to glance at something else is the wrong trade for tidiness.
  const toggle = (rowKey: string, service: ApiDocService) => {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(rowKey)) next.delete(rowKey);
      else {
        next.add(rowKey);
        void loadDoc(service);
      }
      return next;
    });
  };

  /**
   * The document for a service, from cache or from the network.
   *
   * Downloading must work from a collapsed row, and a collapsed row has never
   * fetched anything — so this is the one path that both the expand and the
   * save go through, and neither has to know which of them warmed the cache.
   */
  const documentFor = async (service: ApiDocService): Promise<OpenApiDocument> => {
    const cached = docs[service.serviceCode];
    if (cached?.status === "ready") return cached.doc;

    const doc = await getOpenApiDocument(service.specUrl);
    setDocs((current) => ({ ...current, [service.serviceCode]: { status: "ready", doc } }));
    return doc;
  };

  const mark = (key: string, busy: boolean) =>
    setSaving((current) => {
      const next = new Set(current);
      if (busy) next.add(key);
      else next.delete(key);
      return next;
    });

  const downloadService = async (service: ApiDocService) => {
    mark(service.serviceCode, true);
    try {
      saveJson(`${service.serviceCode}-openapi.json`, await documentFor(service));
    } catch (error) {
      toast.error(toTenancyError(error, "Could not download this document.").message);
    } finally {
      mark(service.serviceCode, false);
    }
  };

  /**
   * Every service in a product, as one document.
   *
   * Fetched in parallel and deduplicated first: a service can be listed under
   * two products, and within one product the same code should still only be
   * asked for once. A single service failing fails the bundle rather than
   * quietly shipping a document that is missing a third of the API — a partial
   * file that does not say it is partial is worse than no file.
   */
  const downloadProduct = async (product: ApiDocProduct) => {
    if (!index) return;

    mark(product.packageCode, true);
    try {
      const unique = [
        ...new Map(product.services.map((service) => [service.serviceCode, service])).values(),
      ];

      const entries = await Promise.all(
        unique.map(async (service) => ({ service, doc: await documentFor(service) }))
      );

      saveJson(
        `${product.packageCode.toLowerCase()}-openapi.json`,
        mergeProductDocuments(product, index.gatewayPublicUrl, entries)
      );
    } catch (error) {
      toast.error(toTenancyError(error, `Could not build the ${product.nameEn} bundle.`).message);
    } finally {
      mark(product.packageCode, false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <LexPageHeader icon={Code2} title="API Documentation" subtitle="Loading…" />
        <Skeleton className="mb-3 h-16 w-full" />
        <div className="grid gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (denied) {
    return (
      <div>
        <LexPageHeader icon={Code2} title="API Documentation" />
        <EmptyState
          icon={Code2}
          text="This page is for workspace administrators. Your account does not have access to it."
        />
      </div>
    );
  }

  const serviceCount = new Set(
    (index?.products ?? []).flatMap((product) =>
      product.services.map((service) => service.serviceCode)
    )
  ).size;

  return (
    <div className="tn-docs">
      <LexPageHeader
        icon={Code2}
        title="API Documentation"
        subtitle="Live documentation for the services your plan includes."
      />

      {!index || index.products.length === 0 ? (
        <EmptyState
          icon={Code2}
          text="No services yet. Documentation appears here once your subscription is active."
        />
      ) : (
        <>
          {/* The gateway, once, at the top. Every service's base URL is this
              plus a route prefix, so repeating the host on each row would be
              repeating the same string a dozen times. */}
          <div className="tn-gateway">
            <ServerCog className="tn-gateway__icon" aria-hidden="true" />
            <div className="min-w-0">
              <p className="tn-gateway__label">API gateway</p>
              <p className="tn-gateway__url" dir="ltr">
                {index.gatewayPublicUrl}
              </p>
            </div>
            <div className="tn-gateway__meta">
              {serviceCount} service{serviceCount === 1 ? "" : "s"} across {index.products.length}{" "}
              product{index.products.length === 1 ? "" : "s"}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void copyText(index.gatewayPublicUrl, "Gateway URL")}
            >
              <Copy className="me-1 h-3.5 w-3.5" />
              Copy
            </Button>
          </div>

          <div className="grid gap-3">
            {index.products.map((product) => (
              <section className="pro-card p-4" key={product.packageCode}>
                <div className="tn-prod__head">
                  <div className="flex min-w-0 flex-wrap items-baseline gap-2">
                    <h2 className="pro-card-title">{product.nameEn}</h2>
                    <span className="tn-docs__code">{product.packageCode}</span>
                    {product.bundle && <span className="tn-docs__bundle">everything tier</span>}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={saving.has(product.packageCode)}
                    onClick={() => void downloadProduct(product)}
                  >
                    {saving.has(product.packageCode) ? (
                      <Loader2 className="me-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="me-1 h-3.5 w-3.5" />
                    )}
                    Download all {product.packageCode} APIs
                  </Button>
                </div>

                <div className="grid gap-2">
                  {product.services.map((service) => {
                    const rowKey = `${product.packageCode}:${service.serviceCode}`;
                    const state = docs[service.serviceCode];
                    const expanded = open.has(rowKey);

                    return (
                      <article className="tn-svc" key={rowKey} data-open={expanded}>
                        <div className="tn-svc__row">
                          <button
                            type="button"
                            className="tn-svc__head"
                            aria-expanded={expanded}
                            onClick={() => toggle(rowKey, service)}
                          >
                            <ChevronDown className="tn-svc__chev" aria-hidden="true" />

                            <span className="min-w-0 flex-1 text-start">
                              <span className="tn-svc__name">{service.nameEn}</span>
                              <span className="tn-svc__base" dir="ltr">
                                {service.gatewayPath}
                              </span>
                            </span>

                            {/* Only once it is known. A count invented before the
                              document arrives would be a guess. */}
                            {state?.status === "ready" && (
                              <span className="tn-svc__count">
                                {countOperations(state.doc)} endpoints
                              </span>
                            )}
                            {state?.status === "loading" && (
                              <Loader2
                                className="h-4 w-4 shrink-0 animate-spin"
                                aria-hidden="true"
                              />
                            )}
                          </button>

                          {/* Outside the toggle, not inside it: a button nested
                            in a button is invalid, and clicking to save would
                            also expand the row it saved from. */}
                          <button
                            type="button"
                            className="tn-svc__dl"
                            aria-label={`Download ${service.nameEn} OpenAPI JSON`}
                            disabled={saving.has(service.serviceCode)}
                            onClick={() => void downloadService(service)}
                          >
                            {saving.has(service.serviceCode) ? (
                              <Loader2 className="animate-spin" aria-hidden="true" />
                            ) : (
                              <Download aria-hidden="true" />
                            )}
                          </button>
                        </div>

                        {expanded && (
                          <div className="tn-svc__body">
                            {(!state || state.status === "loading") && (
                              <Skeleton className="h-24 w-full" />
                            )}

                            {state?.status === "error" && (
                              <div className="tn-svc__error">
                                <p>{state.message}</p>
                                {state.upgrade && (
                                  <a className="ts-link text-xs" href="/TenantPortal/Subscription">
                                    Upgrade your plan to include this service
                                  </a>
                                )}
                                {state.retry && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void loadDoc(service)}
                                  >
                                    Try again
                                  </Button>
                                )}
                              </div>
                            )}

                            {state?.status === "ready" && (
                              <ServiceDocument service={service} doc={state.doc} />
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/** Only the methods that are operations; `parameters` and `$ref` are not. */
const operationsOf = (doc: OpenApiDocument): Operation[] =>
  Object.entries(doc.paths ?? {}).flatMap(([path, methods]) =>
    Object.entries(methods)
      .filter(([method]) => METHODS.includes(method.toLowerCase()))
      .map(([method, op]) => ({ method: method.toLowerCase(), path, op }))
  );

const countOperations = (doc: OpenApiDocument): number => operationsOf(doc).length;

/** One service's operations, grouped the way its own document groups them. */
function ServiceDocument({ service, doc }: { service: ApiDocService; doc: OpenApiDocument }) {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("");

  const all = useMemo(() => operationsOf(doc), [doc]);

  /** Which methods this service actually uses — never the full list of seven. */
  const methodsUsed = useMemo(
    () => METHODS.filter((m) => all.some((entry) => entry.method === m)),
    [all]
  );

  /**
   * Filtered, then grouped by tag.
   *
   * Grouping is built from the operations rather than from `tags`: the server
   * prunes tags nothing references, so an operation carrying a pruned tag would
   * disappear from the page while still existing in the API.
   */
  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const matched = all.filter(({ method: m, path, op }) => {
      if (method && m !== method) return false;
      if (!needle) return true;
      return (
        path.toLowerCase().includes(needle) ||
        m.includes(needle) ||
        (op.summary ?? "").toLowerCase().includes(needle) ||
        (op.tags ?? []).some((tag) => tag.toLowerCase().includes(needle))
      );
    });

    const byTag = new Map<string, Operation[]>();
    matched.forEach((entry) => {
      const tag = entry.op.tags?.[0] || "Other";
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag)!.push(entry);
    });

    byTag.forEach((operations) =>
      operations.sort((a, b) =>
        a.path === b.path
          ? METHODS.indexOf(a.method) - METHODS.indexOf(b.method)
          : a.path.localeCompare(b.path)
      )
    );

    return [...byTag.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [all, query, method]);

  const shown = groups.reduce((total, [, operations]) => total + operations.length, 0);

  return (
    <>
      <div className="tn-doc__bar">
        <div className="min-w-0">
          <p className="tn-doc__title">{doc.info?.title || service.nameEn}</p>
          <p className="tn-doc__meta" dir="ltr">
            {service.publicBaseUrl}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void copyText(service.publicBaseUrl, "Base URL")}
          >
            <Copy className="me-1 h-3.5 w-3.5" />
            Base URL
          </Button>
        </div>
      </div>

      {all.length === 0 ? (
        <p className="tn-doc__empty">
          This service publishes no public endpoints. Internal routes are not documented here.
        </p>
      ) : (
        <>
          {/* Scoped to this document, not the page: a search across all of them
              would mean fetching every service to answer it, which is the cost
              the lazy load exists to avoid. */}
          <div className="tn-filter">
            <span className="tn-filter__search">
              <Search aria-hidden="true" />
              <input
                type="search"
                value={query}
                placeholder={`Filter ${all.length} endpoints`}
                aria-label={`Filter ${service.nameEn} endpoints`}
                onChange={(event) => setQuery(event.target.value)}
              />
            </span>

            <span className="tn-filter__methods">
              <button type="button" data-active={method === ""} onClick={() => setMethod("")}>
                All
              </button>
              {methodsUsed.map((m) => (
                <button
                  key={m}
                  type="button"
                  data-method={m}
                  data-active={method === m}
                  onClick={() => setMethod(method === m ? "" : m)}
                >
                  {m}
                </button>
              ))}
            </span>
          </div>

          {shown === 0 ? (
            <p className="tn-doc__empty">No endpoint matches that filter.</p>
          ) : (
            groups.map(([tag, operations]) => (
              <div className="tn-tag" key={tag}>
                <h3 className="tn-tag__name">
                  {tag}
                  <span>{operations.length}</span>
                </h3>

                <ul className="tn-ops">
                  {operations.map(({ method: m, path, op }) => (
                    <li className="tn-op" key={`${m} ${path}`}>
                      <span className="tn-op__method" data-method={m}>
                        {m}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="tn-op__path" dir="ltr">
                          {path}
                          {op.deprecated && <span className="tn-op__dep">deprecated</span>}
                        </p>
                        {op.summary && <p className="tn-op__summary">{op.summary}</p>}

                        {op.parameters && op.parameters.length > 0 && (
                          <p className="tn-op__params">
                            {op.parameters.map((parameter) => (
                              <span key={`${parameter.in}:${parameter.name}`}>
                                <code>{parameter.name}</code>
                                <em>{parameter.in}</em>
                                {parameter.required && <b>required</b>}
                              </span>
                            ))}
                          </p>
                        )}

                        {op.responses && (
                          <p className="tn-op__responses">
                            {Object.keys(op.responses)
                              .sort()
                              .map((status) => (
                                <span key={status} data-ok={status.startsWith("2")}>
                                  {status}
                                </span>
                              ))}
                          </p>
                        )}
                      </div>

                      {/* The path is the thing a developer takes away from this
                          page, so it is one click rather than a careful drag. */}
                      <button
                        type="button"
                        className="tn-op__copy"
                        aria-label={`Copy ${m.toUpperCase()} ${path}`}
                        onClick={() => void copyText(service.publicBaseUrl + path, "Endpoint")}
                      >
                        <Copy aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </>
      )}
    </>
  );
}

export default TenantApiDocs;
