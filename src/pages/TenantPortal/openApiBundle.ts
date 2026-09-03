import type {
  ApiDocProduct,
  ApiDocService,
  OpenApiDocument,
} from "../../redux/apis/apisTenancyAdmin";

/**
 * Saving API documents, one service at a time or a whole product at once.
 *
 * The per-product file is a real, single OpenAPI 3 document rather than a
 * folder of them in a trench coat: a developer who asks for "all of LOS" wants
 * something they can drop into Postman or a generator, and a bag of documents
 * is not that. Merging honestly means three things — paths have to carry the
 * gateway prefix that used to live in each document's own `servers`, component
 * names that mean different things in different services cannot share a key,
 * and every `$ref` pointing at a renamed component has to move with it.
 */

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

/** The buckets `#/components/…` can point into. */
const COMPONENT_BUCKETS = [
  "schemas",
  "responses",
  "parameters",
  "examples",
  "requestBodies",
  "headers",
  "securitySchemes",
  "links",
  "callbacks",
] as const;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const isObject = (value: JsonValue): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Same shape, same meaning — compared by content so identical copies share a key. */
const sameDefinition = (a: JsonValue, b: JsonValue): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

/** `lending-service` → `LendingService`, for a readable rename suffix. */
const pascal = (serviceCode: string): string =>
  serviceCode
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

/**
 * Rewrites `$ref` strings in place for components this service had to rename.
 *
 * Walks the whole document rather than the component section alone: a ref can
 * appear anywhere — inside a response, a parameter, an array item, a nested
 * schema — and one missed ref is a document that resolves to nothing at the
 * point somebody actually uses it.
 */
function rewriteRefs(node: JsonValue, renames: Map<string, string>): void {
  if (Array.isArray(node)) {
    node.forEach((child) => rewriteRefs(child, renames));
    return;
  }
  if (!isObject(node)) return;

  Object.entries(node).forEach(([key, value]) => {
    if (key === "$ref" && typeof value === "string") {
      const moved = renames.get(value);
      if (moved) node[key] = moved;
      return;
    }
    rewriteRefs(value, renames);
  });
}

/**
 * One service's document, folded into the accumulating product document.
 *
 * Returns nothing; `into` is mutated, which is the point — the caller is
 * building one document out of several and copying it per service would be
 * quadratic for no benefit.
 */
function foldIn(into: JsonObject, service: ApiDocService, source: OpenApiDocument): void {
  const doc = clone(source) as unknown as JsonObject;

  // --- components, renaming only on a genuine clash ------------------------
  const renames = new Map<string, string>();
  const components = isObject(doc.components ?? null) ? (doc.components as JsonObject) : {};
  const target = into.components as JsonObject;

  COMPONENT_BUCKETS.forEach((bucket) => {
    const incoming = components[bucket];
    if (!isObject(incoming)) return;

    if (!isObject(target[bucket])) target[bucket] = {};
    const existing = target[bucket] as JsonObject;

    Object.entries(incoming).forEach(([name, definition]) => {
      // A name already taken by an identical definition is the same thing said
      // twice — `bearerAuth` is declared by every service and means the same
      // in each. Only a name that means something DIFFERENT needs moving.
      if (name in existing && !sameDefinition(existing[name], definition)) {
        const renamed = `${name}__${pascal(service.serviceCode)}`;
        renames.set(`#/components/${bucket}/${name}`, `#/components/${bucket}/${renamed}`);
        existing[renamed] = definition;
        return;
      }
      existing[name] = definition;
    });
  });

  if (renames.size > 0) rewriteRefs(doc, renames);

  // --- tags, namespaced by service ----------------------------------------
  // Two services can both call a group "Health". Merged under one name their
  // operations pile into a single section that belongs to neither, so each tag
  // carries the service it came from and the merged document stays navigable.
  const tagRenames = new Map<string, string>();
  const sourceTags = Array.isArray(doc.tags) ? doc.tags : [];
  const outTags = into.tags as JsonValue[];

  sourceTags.forEach((tag) => {
    if (!isObject(tag) || typeof tag.name !== "string") return;
    const renamed = `${service.nameEn} · ${tag.name}`;
    tagRenames.set(tag.name, renamed);
    outTags.push({ ...tag, name: renamed });
  });

  // --- paths, prefixed with the gateway route -----------------------------
  // Each document's own `servers` entry is the gateway plus this prefix. The
  // merged document has one server — the gateway — so the prefix moves onto
  // the paths, or every operation would resolve to the wrong service.
  const paths = isObject(doc.paths ?? null) ? (doc.paths as JsonObject) : {};
  const outPaths = into.paths as JsonObject;

  Object.entries(paths).forEach(([path, item]) => {
    if (isObject(item)) {
      Object.values(item).forEach((operation) => {
        if (!isObject(operation) || !Array.isArray(operation.tags)) return;
        operation.tags = operation.tags.map((tag) =>
          typeof tag === "string" ? (tagRenames.get(tag) ?? `${service.nameEn} · ${tag}`) : tag
        );
      });
    }
    outPaths[`${service.gatewayPath}${path}`] = item;
  });
}

/** One product's services as a single document. */
export function mergeProductDocuments(
  product: ApiDocProduct,
  gatewayPublicUrl: string,
  entries: { service: ApiDocService; doc: OpenApiDocument }[]
): JsonObject {
  const merged: JsonObject = {
    openapi: entries[0]?.doc.openapi ?? "3.0.1",
    info: {
      title: `${product.nameEn} API`,
      version: "1.0.0",
      description:
        `Every service included in ${product.nameEn} (${product.packageCode}), as one document. ` +
        `Paths carry each service's gateway prefix, so they are callable against the single ` +
        `server below. Generated from the live documentation on ${new Date().toISOString().slice(0, 10)}.`,
    },
    servers: [{ url: gatewayPublicUrl }],
    tags: [],
    paths: {},
    components: {},
    // Every service declares bearerAuth and applies it globally; the merged
    // document says the same thing once.
    security: [{ bearerAuth: [] }],
  };

  entries.forEach(({ service, doc }) => foldIn(merged, service, doc));
  return merged;
}

/**
 * Hands a JSON document to the browser as a file.
 *
 * Two details that are easy to get wrong and silent when wrong: the anchor has
 * to be in the document for Firefox to honour the click, and the object URL
 * must outlive the click — revoking it on the next line can abort the save
 * before it has read a byte.
 */
export function saveJson(filename: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Long enough for the download to have started; the blob is freed either way.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
