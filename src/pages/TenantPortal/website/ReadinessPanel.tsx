import { AlertCircle, CheckCircle2 } from "lucide-react";

import type { SiteReadiness } from "../../../redux/apis/apisTenantSiteAdmin";

/**
 * What still stands between the draft and going live.
 *
 * Rendered **from the response**. The list is not hardcoded here on purpose:
 * the server adds and changes checks, and a front end holding its own copy
 * leaves an admin with a disabled Launch button and no reason for it. `key`
 * picks the copy and the tab to jump to; `detail` (English, from the server)
 * is the fallback for a key we have no wording for yet.
 */

/** Where the fix lives, so a failing item is clickable. */
const CHECK_TARGET: Record<string, { tab: string; label: string }> = {
  "tenant.active": { tab: "", label: "" },
  "branding.logo": { tab: "branding", label: "Go to Branding" },
  "branding.contrast": { tab: "branding", label: "Go to Colours" },
  "section.hero": { tab: "sections", label: "Go to Sections" },
  "section.body": { tab: "sections", label: "Go to Sections" },
  "section.entitlements": { tab: "sections", label: "Go to Sections" },
  "domain.primary": { tab: "address", label: "Go to Address" },
};

const CHECK_COPY: Record<string, string> = {
  "tenant.active": "Your workspace is active",
  // The platform fills in every other check from the tenant's own registration
  // details, so on a new site this is usually the only one left failing.
  "branding.logo": "Upload your logo",
  "branding.contrast": "Your brand colour is readable on your background",
  "section.hero": "Your banner is switched on and has a headline",
  "section.body": "At least one more section is switched on",
  "section.entitlements": "Every section you switched on is included in your plan",
  "domain.primary": "You have a verified web address",
};

const ReadinessPanel = ({
  readiness,
  onGoTo,
}: {
  readiness: SiteReadiness;
  onGoTo: (tab: string) => void;
}) => (
  <section className="pro-card p-4">
    <h2 className="pro-card-title mb-3">Before you launch</h2>
    <ul className="space-y-2">
      {readiness.checks.map((check) => {
        const target = CHECK_TARGET[check.key];
        const Icon = check.passed ? CheckCircle2 : AlertCircle;
        return (
          <li key={check.key} className="flex items-start gap-2.5">
            <Icon
              className={`mt-0.5 h-4 w-4 shrink-0 ${check.passed ? "text-[var(--color-success,#15803d)]" : "text-[var(--color-warning,#b45309)]"}`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className={`mb-0 text-xs ${check.passed ? "text-muted-foreground" : "font-semibold text-foreground"}`}>
                {CHECK_COPY[check.key] ?? check.detail ?? check.key}
              </p>
              {!check.passed && check.detail && CHECK_COPY[check.key] && (
                <p className="mb-0 text-[11px] text-muted-foreground">{check.detail}</p>
              )}
            </div>
            {!check.passed && target?.tab && (
              <button
                type="button"
                className="shrink-0 text-[11px] font-semibold text-[var(--primary)] hover:underline"
                onClick={() => onGoTo(target.tab)}
              >
                {target.label}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  </section>
);

export default ReadinessPanel;
