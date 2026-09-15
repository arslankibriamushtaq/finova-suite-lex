import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { LexNotice } from "../../../components/shared/lexKit";
import { toTenancyError } from "../../../redux/apis/apisTenancyAdmin";
import {
  updateSiteBranding,
  type BrandingPayload,
  type TenantSite,
} from "../../../redux/apis/apisTenantSiteAdmin";
import AssetField from "./AssetField";

/**
 * Logo, colours, radius, locale and contact details.
 *
 * `PUT /branding` takes the **whole** object, so this keeps a full draft in
 * state and sends all of it; a partial payload would clear whatever it omitted.
 *
 * There is no custom-CSS field and there will not be one — the API has nowhere
 * to put a stylesheet, and the public page renders copy as plain text.
 */

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Six-digit hex only. Shorthand and named colours are rejected server-side. */
const ColorField = ({
  label,
  value,
  onChange,
  optional,
}: {
  label: string;
  value: string | null;
  onChange: (next: string | null) => void;
  optional?: boolean;
}) => {
  const valid = !value || HEX.test(value);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground">
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
      </label>
      <div className="flex items-center gap-2">
        {/* `<input type="color">` only ever emits six-digit hex, which is
            exactly what the API accepts. The text field beside it is for
            pasting a brand colour from a style guide. */}
        <input
          type="color"
          className="h-9 w-10 shrink-0 cursor-pointer rounded-[2px] border border-[var(--surface-border)] bg-transparent p-0.5"
          value={valid && value ? value : "#000000"}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
        <Input
          value={value ?? ""}
          placeholder={optional ? "Not set" : "#1F6F5C"}
          className="font-mono text-xs"
          onChange={(event) => onChange(event.target.value.trim() || null)}
        />
        {optional && value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            Clear
          </Button>
        )}
      </div>
      {!valid && (
        <p className="text-[11px] font-semibold text-destructive">
          Use a six-digit hex colour, like #1F6F5C.
        </p>
      )}
    </div>
  );
};

const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string | null;
  onChange: (next: string | null) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-foreground">{label}</label>
    <Input
      type={type}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value || null)}
    />
  </div>
);

const toPayload = (site: TenantSite): BrandingPayload => ({
  logoKey: site.branding.logoKey,
  logoDarkKey: site.branding.logoDarkKey,
  faviconKey: site.branding.faviconKey,
  heroImageKey: site.branding.heroImageKey,
  primaryColor: site.branding.primaryColor,
  secondaryColor: site.branding.secondaryColor,
  accentColor: site.branding.accentColor,
  backgroundColor: site.branding.backgroundColor,
  textColor: site.branding.textColor,
  fontFamily: site.branding.fontFamily,
  cornerRadiusPx: site.branding.cornerRadiusPx,
  defaultLocale: site.branding.defaultLocale,
  supportEmail: site.branding.supportEmail,
  supportPhone: site.branding.supportPhone,
  socialLinks: site.branding.socialLinks ?? {},
});

const BrandingPanel = ({
  site,
  onSaved,
  canEdit,
}: {
  site: TenantSite;
  onSaved: (next: TenantSite) => void;
  canEdit: boolean;
}) => {
  const [draft, setDraft] = useState<BrandingPayload>(() => toPayload(site));
  /** Addresses for images uploaded in this session, before the next GET. */
  const [freshUrls, setFreshUrls] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // A save elsewhere on the screen (sections, publish) returns fresh branding
  // too, so the draft follows the server rather than drifting from it.
  useEffect(() => {
    setDraft(toPayload(site));
    setFreshUrls({});
  }, [site]);

  const set = <K extends keyof BrandingPayload>(key: K, value: BrandingPayload[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const required: (keyof BrandingPayload)[] = ["primaryColor", "backgroundColor", "textColor"];
  const invalid = required.some((key) => !HEX.test(String(draft[key] ?? "")));
  const optionalInvalid = [draft.secondaryColor, draft.accentColor].some(
    (value) => value && !HEX.test(value)
  );

  const save = () => {
    if (invalid || optionalInvalid) {
      toast.error("Colours must be six-digit hex, like #1F6F5C.");
      return;
    }
    setSaving(true);
    updateSiteBranding(draft)
      .then((next) => {
        onSaved(next);
        toast.success("Branding saved.");
      })
      .catch((error) => toast.error(toTenancyError(error, "Could not save your branding.").message))
      .finally(() => setSaving(false));
  };

  const asset = (key: keyof BrandingPayload, urlKey: keyof typeof site.branding) => ({
    objectKey: draft[key] as string | null,
    url: freshUrls[key as string] ?? (site.branding[urlKey] as string | null),
    dirty: draft[key] !== (site.branding[key as keyof typeof site.branding] as string | null),
    onUploaded: ({ objectKey, url }: { objectKey: string; url: string }) => {
      set(key, objectKey as BrandingPayload[typeof key]);
      setFreshUrls((current) => ({ ...current, [key as string]: url }));
    },
    onCleared: () => {
      set(key, null as BrandingPayload[typeof key]);
      setFreshUrls((current) => ({ ...current, [key as string]: "" }));
    },
    disabled: !canEdit,
  });

  return (
    <div className="space-y-4">
      {/* Live, at the picker. It is also a blocking checklist item, so an
          admin who ignores it finds out at Launch — better to say so while
          they are still looking at the colour. */}
      {site.branding.readableContrast === false && (
        <LexNotice tone="amber" icon={AlertTriangle}>
          Your brand colour is hard to read on your background colour. Visitors with low vision may
          not be able to read your buttons and links — and this blocks publishing.
        </LexNotice>
      )}

      <section className="pro-card p-4">
        <h2 className="pro-card-title mb-3">Colours</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ColorField
            label="Brand colour"
            value={draft.primaryColor}
            onChange={(value) => set("primaryColor", value ?? "")}
          />
          <ColorField
            label="Page background"
            value={draft.backgroundColor}
            onChange={(value) => set("backgroundColor", value ?? "")}
          />
          <ColorField
            label="Text colour"
            value={draft.textColor}
            onChange={(value) => set("textColor", value ?? "")}
          />
          <ColorField
            label="Secondary"
            optional
            value={draft.secondaryColor}
            onChange={(value) => set("secondaryColor", value)}
          />
          <ColorField
            label="Accent"
            optional
            value={draft.accentColor}
            onChange={(value) => set("accentColor", value)}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Corner radius</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={64}
                value={draft.cornerRadiusPx}
                className="flex-1 accent-[var(--primary)]"
                onChange={(event) => set("cornerRadiusPx", Number(event.target.value))}
              />
              <span className="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {draft.cornerRadiusPx}px
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="pro-card p-4">
        <h2 className="pro-card-title mb-1">Images</h2>
        <p className="mb-3.5 text-xs text-muted-foreground">
          Uploading puts the file on our servers; it only reaches your site when you save.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <AssetField kind="LOGO" label="Logo" {...asset("logoKey", "logoUrl")} />
          <AssetField kind="LOGO_DARK" label="Logo (dark backgrounds)" {...asset("logoDarkKey", "logoDarkUrl")} />
          <AssetField kind="FAVICON" label="Browser tab icon" {...asset("faviconKey", "faviconUrl")} />
          <AssetField kind="HERO" label="Banner image" {...asset("heroImageKey", "heroImageUrl")} />
        </div>
      </section>

      <section className="pro-card p-4">
        <h2 className="pro-card-title mb-3">Details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            label="Font family"
            value={draft.fontFamily}
            placeholder="Leave empty for the default"
            onChange={(value) => set("fontFamily", value)}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Default language</label>
            <div className="flex gap-2">
              {["en", "ar"].map((locale) => (
                <Button
                  key={locale}
                  type="button"
                  size="sm"
                  variant={draft.defaultLocale === locale ? "default" : "outline"}
                  onClick={() => set("defaultLocale", locale)}
                >
                  {locale === "en" ? "English" : "العربية"}
                </Button>
              ))}
            </div>
          </div>
          <TextField
            label="Support email"
            type="email"
            value={draft.supportEmail}
            onChange={(value) => set("supportEmail", value)}
          />
          <TextField
            label="Support phone"
            value={draft.supportPhone}
            onChange={(value) => set("supportPhone", value)}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="button" disabled={!canEdit || saving} onClick={save}>
          {saving ? "Saving…" : "Save branding"}
        </Button>
      </div>
    </div>
  );
};

export default BrandingPanel;
