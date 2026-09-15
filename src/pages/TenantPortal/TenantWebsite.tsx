import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ExternalLink, Eye, Globe, Rocket } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { PermissionDenied } from "../../components/shared/detailKit";
import { LexNotice, LexPageHeader } from "../../components/shared/lexKit";
import { isForbidden, toTenancyError } from "../../redux/apis/apisTenancyAdmin";
import {
  createSitePreviewLink,
  getTenantSite,
  publishSite,
  unpublishSite,
  type TenantSite,
} from "../../redux/apis/apisTenantSiteAdmin";
import BrandingPanel from "./website/BrandingPanel";
import DomainsPanel from "./website/DomainsPanel";
import ReadinessPanel from "./website/ReadinessPanel";
import SectionsPanel from "./website/SectionsPanel";

/**
 * The tenant's public website, edited from inside the portal.
 *
 * One GET drives the whole screen, and **every mutating call returns that same
 * shape** — so every panel here hands its response back through `setSite`
 * rather than refetching. The readiness checklist recomputes on each of them,
 * which is what keeps the Launch button's enabled state honest.
 *
 * The page these edits produce is `src/pages/TenantSite/`.
 */

/**
 * The address to open for a published site.
 *
 * `primaryHost` is whatever the platform currently serves this tenant on, and
 * the zone is configuration that differs per environment — DEV answers on
 * `{tenant-code}.148.251.185.111.sslip.io` over plain http, not on a
 * `.finova.sa` name at all. So the host is used exactly as given and never
 * assembled here; only the scheme is supplied, taken from the portal's own,
 * because the same platform serves both in any one environment. Hardcoding
 * `https://` sent admins to an address that resolved nowhere right after a
 * successful Launch.
 */
const siteUrl = (primaryHost: string): string =>
  /^https?:\/\//i.test(primaryHost)
    ? primaryHost
    : `${window.location.protocol}//${primaryHost}`;

const STATUS_COPY: Record<string, { label: string; detail: string }> = {
  DRAFT: {
    label: "Not published yet",
    detail: "Only you can see this. Launch when you're ready.",
  },
  LIVE: { label: "Published", detail: "Your site is live." },
  PAUSED: { label: "Unpublished", detail: "Your site is down. Your content is kept — launch to put it back." },
};

const TenantWebsite = () => {
  const [site, setSite] = useState<TenantSite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [denied, setDenied] = useState<string | null>(null);
  const [tab, setTab] = useState("branding");
  const [busy, setBusy] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);

  /**
   * Launch is gated on a Casbin permission (`tenant-portal.site:publish`) that
   * the portal's own permission hook does not carry — it covers the
   * identity-service catalogue, not Casbin objects — so gating on it here
   * would hide the button from every legitimate tenant admin. Instead the
   * button is shown and a 403 latches this, which is the same pattern the API
   * docs screen uses for its permission.
   */
  const [cannotPublish, setCannotPublish] = useState(false);

  /** Previews can be switched off per environment; hide the button once we know. */
  const [previewOff, setPreviewOff] = useState(false);

  useEffect(() => {
    // The first GET creates the draft, the seeded sections and the free
    // subdomain — it is a write. Never call it outside this screen.
    getTenantSite()
      .then(setSite)
      .catch((error) => {
        const failure = toTenancyError(error, "Could not load your website.");
        if (failure.code === "TENANCY.TENANT.PLATFORM_ACCOUNT") {
          // The platform is not a tenant workspace and has no website.
          setDenied("The platform console doesn't have a tenant website. Manage tenants instead.");
        } else if (failure.code === "COMMON.AUTH.ACCESS_DENIED" || isForbidden(error)) {
          setDenied("Your role doesn't include access to the website editor.");
        } else {
          toast.error(failure.message);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const preview = () => {
    // A fresh link per press: it expires in about 30 minutes and cannot be
    // renewed, so a cached one silently becomes an "unavailable" page.
    setBusy(true);
    createSitePreviewLink()
      .then((link) => window.open(link.url, "_blank", "noopener"))
      .catch((error) => {
        const failure = toTenancyError(error, "Could not create a preview link.");
        if (failure.code === "TENANCY.SITE.PREVIEW_UNAVAILABLE") {
          setPreviewOff(true);
          toast.error("Previews aren't available in this environment.");
        } else {
          toast.error(failure.message);
        }
      })
      .finally(() => setBusy(false));
  };

  const launch = () => {
    setBusy(true);
    publishSite()
      .then((next) => {
        setSite(next);
        toast.success("Your site is live.");
      })
      .catch((error) => {
        const failure = toTenancyError(error, "Could not publish your site.");
        if (isForbidden(error)) {
          setCannotPublish(true);
          toast.error("Your role can edit the site but not publish it.");
        } else if (failure.code === "TENANCY.SITE.NOT_READY") {
          // Reachable even with the button gated on `ready`: entitlements and
          // the subscription can change between the page load and the click.
          toast.error(failure.message);
          getTenantSite().then(setSite).catch(() => undefined);
        } else {
          toast.error(failure.message);
        }
      })
      .finally(() => setBusy(false));
  };

  const takeDown = () => {
    setConfirmUnpublish(false);
    setBusy(true);
    unpublishSite()
      .then((next) => {
        setSite(next);
        toast.success("Your site is no longer public.");
      })
      .catch((error) => {
        if (isForbidden(error)) setCannotPublish(true);
        toast.error(toTenancyError(error, "Could not take your site down.").message);
      })
      .finally(() => setBusy(false));
  };

  if (denied) return <PermissionDenied message={denied} />;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!site) return <PermissionDenied message="Your website couldn't be loaded." />;

  const status = STATUS_COPY[site.status] ?? STATUS_COPY.DRAFT;
  const canLaunch = site.readiness.ready && !cannotPublish && !busy;

  return (
    <div>
      <LexPageHeader
        icon={Globe}
        title="Your website"
        subtitle="The public page your customers see: your logo, your colours, your products."
      >
        {!previewOff && (
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={preview}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Preview
          </Button>
        )}
        {site.status === "LIVE" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || cannotPublish}
            onClick={() => setConfirmUnpublish(true)}
          >
            Take down
          </Button>
        ) : null}
        <Button type="button" size="sm" disabled={!canLaunch} onClick={launch}>
          <Rocket className="mr-1.5 h-3.5 w-3.5" />
          {site.status === "LIVE" ? "Republish" : "Launch"}
        </Button>
      </LexPageHeader>

      <section className="pro-card mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="mb-0 text-sm font-bold text-foreground">{status.label}</p>
          <p className="mb-0 text-xs text-muted-foreground">{status.detail}</p>
        </div>
        {site.primaryHost && (
          <a
            href={siteUrl(site.primaryHost)}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            {site.primaryHost}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </section>

      {/* The first GET writes a complete draft — every block already carries a
          headline, body copy and a call to action built from what the company
          registered with, and everything it is entitled to is switched on. So
          this is a page to change, not a form to fill in, and saying so is the
          difference between an admin editing four fields and one wondering
          where to start. */}
      {site.status === "DRAFT" && (
        <LexNotice tone="slate">
          We've already written your site from your company details. Change anything you like —
          then add your logo and launch.
        </LexNotice>
      )}

      {/* An admin who edits a live site and sees no change on it will assume
          the save failed. Say what is actually happening. */}
      {site.status === "LIVE" && (
        <LexNotice tone="slate">
          Your edits are saved to a draft. Visitors keep seeing the version you last published until
          you press <strong>Republish</strong>.
        </LexNotice>
      )}

      {cannotPublish && (
        <LexNotice tone="amber">
          Your role can edit this site but not publish it. Ask an administrator to launch it for
          you.
        </LexNotice>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <BrandingPanel site={site} onSaved={setSite} canEdit />
          </TabsContent>
          <TabsContent value="sections">
            <SectionsPanel site={site} onSaved={setSite} canEdit />
          </TabsContent>
          <TabsContent value="address">
            <DomainsPanel site={site} onSaved={setSite} canEdit />
          </TabsContent>
        </Tabs>

        <ReadinessPanel readiness={site.readiness} onGoTo={setTab} />
      </div>

      {/* "Unpublish" reads like "delete" to most people, so the confirmation
          says plainly that nothing is lost. */}
      <AlertDialog open={confirmUnpublish} onOpenChange={setConfirmUnpublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Take your site down?</AlertDialogTitle>
            <AlertDialogDescription>
              Your customers will no longer be able to reach {site.primaryHost ?? "your site"}.
              Everything you've written is kept, and you can put it back at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it live</AlertDialogCancel>
            <AlertDialogAction onClick={takeDown}>Take it down</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TenantWebsite;
