import { useState } from "react";
import toast from "react-hot-toast";
import { Check, Globe, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { CopyButton } from "../../../components/shared/detailKit";
import { LexNotice } from "../../../components/shared/lexKit";
import { toTenancyError } from "../../../redux/apis/apisTenancyAdmin";
import {
  claimSiteDomain,
  deleteSiteDomain,
  makeSiteDomainPrimary,
  verifySiteDomain,
  type DomainClaim,
  type TenantSite,
} from "../../../redux/apis/apisTenantSiteAdmin";

/**
 * Web addresses.
 *
 * Every tenant already has a working one — `{tenant-code}.{platform zone}`,
 * created with the draft and verified on the spot because the platform owns
 * that zone. The zone itself is per-environment configuration (DEV answers on
 * `148.251.185.111.sslip.io`), so it is only ever read off a domain row, never
 * written down here. A tenant's own domain has to prove ownership with a TXT
 * record first.
 */
const DomainsPanel = ({
  site,
  onSaved,
  canEdit,
}: {
  site: TenantSite;
  onSaved: (next: TenantSite) => void;
  canEdit: boolean;
}) => {
  const [host, setHost] = useState("");
  const [claim, setClaim] = useState<DomainClaim | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const add = () => {
    const value = host.trim().toLowerCase();
    if (!value) return;
    setBusy("add");
    claimSiteDomain(value)
      .then((next) => {
        setClaim(next);
        setHost("");
        toast.success("Address added. Now add the DNS record below.");
      })
      .catch((error) => {
        const failure = toTenancyError(error, "Could not add that address.");
        if (failure.code === "TENANCY.SITE.DUPLICATE_HOST") {
          toast.error("That address is already in use.");
        } else {
          toast.error(failure.message);
        }
      })
      .finally(() => setBusy(null));
  };

  const verify = (id: string) => {
    setBusy(id);
    verifySiteDomain(id)
      .then((domain) => {
        if (domain.verified) {
          toast.success("Verified. You can now make it your primary address.");
          setClaim(null);
        }
        // This endpoint returns the domain, not the screen, so the checklist
        // and the domain list are refreshed by the caller.
        onSaved({
          ...site,
          domains: site.domains.map((d) => (d.id === domain.id ? domain : d)),
        });
      })
      .catch((error) => {
        const failure = toTenancyError(error, "Could not check that address.");
        // DNS takes minutes to hours to propagate. "Failed" would send an admin
        // hunting for a mistake they did not make.
        if (failure.code === "TENANCY.SITE.DOMAIN_NOT_VERIFIED") {
          toast.error("We can't see the record yet. DNS can take a while — try again shortly.");
        } else {
          toast.error(failure.message);
        }
      })
      .finally(() => setBusy(null));
  };

  const act = (id: string, run: () => Promise<TenantSite>, fallback: string, done: string) => {
    setBusy(id);
    run()
      .then((next) => {
        onSaved(next);
        toast.success(done);
      })
      .catch((error) => {
        const failure = toTenancyError(error, fallback);
        if (failure.code === "TENANCY.SITE.DOMAIN_NOT_RELEASABLE") {
          toast.error("The address the platform gave you can't be removed.");
        } else {
          toast.error(failure.message);
        }
      })
      .finally(() => setBusy(null));
  };

  return (
    <div className="space-y-4">
      <section className="pro-card p-4">
        <h2 className="pro-card-title mb-3">Your addresses</h2>
        <ul className="space-y-2">
          {site.domains.map((domain) => (
            <li
              key={domain.id}
              className="flex flex-wrap items-center gap-3 rounded-[2px] border border-[var(--surface-border)] px-3 py-2.5"
            >
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                {domain.host}
              </span>

              {domain.primary && (
                <span className="rounded-full bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
                  Primary
                </span>
              )}
              <span
                className={`text-[11px] font-semibold ${domain.verified ? "text-[var(--color-success,#15803d)]" : "text-muted-foreground"}`}
              >
                {domain.verified ? "Verified" : "Not verified yet"}
              </span>

              {!domain.verified && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canEdit || busy === domain.id}
                  onClick={() => verify(domain.id)}
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Check now
                </Button>
              )}
              {domain.verified && !domain.primary && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canEdit || busy === domain.id}
                  onClick={() =>
                    act(
                      domain.id,
                      () => makeSiteDomainPrimary(domain.id),
                      "Could not set that as primary.",
                      "Primary address updated."
                    )
                  }
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Make primary
                </Button>
              )}
              {/* No delete control on the platform address: the server refuses
                  it, and offering a button that always fails is worse than not
                  having one. */}
              {!domain.platformProvided && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!canEdit || busy === domain.id}
                  onClick={() =>
                    act(
                      domain.id,
                      () => deleteSiteDomain(domain.id),
                      "Could not remove that address.",
                      "Address removed."
                    )
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="pro-card p-4">
        <h2 className="pro-card-title mb-1">Use your own domain</h2>
        <p className="mb-3.5 text-xs text-muted-foreground">
          Add the address, then prove you own it by publishing one DNS record.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input
            value={host}
            placeholder="apply.yourcompany.com"
            className="max-w-sm font-mono text-xs"
            disabled={!canEdit}
            onChange={(event) => setHost(event.target.value)}
          />
          <Button type="button" disabled={!canEdit || !host.trim() || busy === "add"} onClick={add}>
            Add address
          </Button>
        </div>

        {claim && (
          <div className="mt-4 space-y-3 rounded-[2px] border border-[var(--surface-border)] p-3">
            <LexNotice tone="slate">
              Add this record with your DNS provider, then press <strong>Check now</strong> above.
              It can take anywhere from a few minutes to a few hours to appear.
            </LexNotice>
            {/* Copyable and verbatim. An admin transcribing a token out of a
                sentence gets it wrong, and a wrong TXT record looks exactly
                like a hostname they do not own. */}
            {[
              { label: "Type", value: claim.recordType },
              { label: "Name", value: claim.recordName },
              { label: "Value", value: claim.recordValue },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-xs font-semibold text-foreground">
                  {row.label}
                </span>
                <code className="min-w-0 flex-1 truncate rounded-[2px] bg-muted px-2 py-1.5 font-mono text-xs">
                  {row.value}
                </code>
                <CopyButton text={row.value} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DomainsPanel;
