import type { BusinessDocumentKind } from "../../redux/apis/apisBusinessOnboarding";

/** The kinds `/upload-document` accepts. */
export const BUSINESS_DOCUMENT_KINDS: BusinessDocumentKind[] = [
  "BUSINESS_REGISTRATION_CERT",
  "BUSINESS_LICENSE",
  "VAT_CERTIFICATE",
  "OTHER_BUSINESS_DOC",
];

/**
 * Translation key for a document kind.
 *
 * Falls back to a generic label rather than printing the raw enum: the server
 * may add kinds ahead of the client, and `OTHER_BUSINESS_DOC` reads better than
 * `OTHER_BUSINESS_DOC` on a public page.
 */
export const documentKindLabelKey = (kind: string): string =>
  BUSINESS_DOCUMENT_KINDS.includes(kind as BusinessDocumentKind)
    ? `documentKind.${kind}`
    : "documentKind.OTHER_BUSINESS_DOC";
