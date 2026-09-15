import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, Lock, Plus, Trash2 } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";
import { LexNotice } from "../../../components/shared/lexKit";
import { toTenancyError } from "../../../redux/apis/apisTenancyAdmin";
import {
  updateSiteSections,
  type SiteSection,
  type TenantSite,
} from "../../../redux/apis/apisTenantSiteAdmin";
import AssetField from "./AssetField";

/**
 * The page's sections, in order.
 *
 * `PUT /sections` is a **replace**: the server renumbers `sortOrder` from the
 * array order and deletes anything not in it. So this holds the array from the
 * last response, mutates it, and sends it back whole — building a partial
 * payload would delete the rest of the page.
 *
 * There is no pricing, subscribe, module-catalogue or Book-a-Demo section, and
 * no affordance to add one: a tenant buys the platform, it does not resell it.
 */

const SECTION_LABELS: Record<string, { title: string; hint: string }> = {
  HERO: { title: "Banner", hint: "The headline visitors see first." },
  ABOUT: { title: "About", hint: "Who your company is." },
  PRODUCTS: { title: "Products", hint: "Your financing products." },
  WHY_US: { title: "Why us", hint: "What sets you apart — one card per point." },
  INVESTOR_CTA: { title: "Invest with us", hint: "An invitation for investors." },
  FAQ: { title: "FAQ", hint: "Questions and answers." },
  CONTACT: { title: "Contact", hint: "How customers reach you." },
  FOOTER: { title: "Footer", hint: "Links and legal text at the bottom." },
};

/** Card-shaped sections get the free-form `items` editor. */
const ITEM_FIELDS: Record<string, { key: string; keyAr: string; label: string }[]> = {
  WHY_US: [
    { key: "title", keyAr: "titleAr", label: "Heading" },
    { key: "body", keyAr: "bodyAr", label: "Text" },
  ],
  FAQ: [
    { key: "question", keyAr: "questionAr", label: "Question" },
    { key: "answer", keyAr: "answerAr", label: "Answer" },
  ],
};

/** English and Arabic side by side. Arabic is genuinely optional: the public
 *  page falls back to English when it is empty. */
const BilingualField = ({
  label,
  en,
  ar,
  onChange,
  multiline,
  disabled,
}: {
  label: string;
  en: string | null;
  ar: string | null;
  onChange: (en: string | null, ar: string | null) => void;
  multiline?: boolean;
  disabled?: boolean;
}) => {
  // Plain text, never rich text: the API stores and the public page renders
  // exactly these characters, so markup would show as literal angle brackets.
  // Input and Textarea take the same props this uses, so one component serves
  // both and the call sites read the same whether the field is one line or ten.
  const Field = (multiline ? Textarea : Input) as React.ComponentType<
    React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>
  >;
  const read = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    event.target.value || null;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground">{label}</label>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field
          value={en ?? ""}
          placeholder="English"
          disabled={disabled}
          onChange={(event) => onChange(read(event), ar)}
        />
        <Field
          value={ar ?? ""}
          dir="rtl"
          placeholder="العربية — optional"
          disabled={disabled}
          onChange={(event) => onChange(en, read(event))}
        />
      </div>
    </div>
  );
};

const SectionCard = ({
  section,
  index,
  total,
  onChange,
  onMove,
  canEdit,
}: {
  section: SiteSection;
  index: number;
  total: number;
  onChange: (next: SiteSection) => void;
  onMove: (direction: -1 | 1) => void;
  canEdit: boolean;
}) => {
  const meta = SECTION_LABELS[section.type] ?? { title: section.type, hint: "" };
  const locked = !section.available;
  const editable = canEdit && !locked;
  const itemFields = ITEM_FIELDS[section.type];

  const patch = (changes: Partial<SiteSection>) => onChange({ ...section, ...changes });

  const patchItem = (itemIndex: number, changes: Record<string, string>) =>
    patch({
      items: section.items.map((item, i) => (i === itemIndex ? { ...item, ...changes } : item)),
    });

  return (
    <section className={`pro-card p-4 ${locked ? "opacity-70" : ""}`}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--surface-border)] pb-3">
        <div className="min-w-0">
          <h3 className="mb-0 flex items-center gap-2 text-sm font-bold text-foreground">
            {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />}
            {meta.title}
          </h3>
          <p className="mb-0 mt-1 text-xs text-muted-foreground">{meta.hint}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canEdit || index === 0}
            onClick={() => onMove(-1)}
            aria-label="Move up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canEdit || index === total - 1}
            onClick={() => onMove(1)}
            aria-label="Move down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Switch
            checked={section.enabled}
            disabled={!editable}
            onCheckedChange={(checked) => patch({ enabled: checked })}
            aria-label={`Show the ${meta.title} section`}
          />
        </div>
      </div>

      {/* Greyed, never hidden: this is the one place a tenant discovers the
          feature exists, so the upsell has to be visible. */}
      {locked && (
        <LexNotice tone="slate" icon={Lock}>
          This section needs the <strong>{section.requiresModule}</strong> module. Your investor
          pages are hidden, not deleted — add the module and they come back exactly as you left
          them.{" "}
          <a className="font-semibold underline" href="/TenantPortal/Subscription">
            View plans
          </a>
        </LexNotice>
      )}

      <div className="space-y-4">
        <BilingualField
          label="Heading"
          en={section.titleEn}
          ar={section.titleAr}
          disabled={!editable}
          onChange={(titleEn, titleAr) => patch({ titleEn, titleAr })}
        />
        <BilingualField
          label="Sub-heading"
          en={section.subtitleEn}
          ar={section.subtitleAr}
          disabled={!editable}
          onChange={(subtitleEn, subtitleAr) => patch({ subtitleEn, subtitleAr })}
        />
        <BilingualField
          label="Text"
          multiline
          en={section.bodyEn}
          ar={section.bodyAr}
          disabled={!editable}
          onChange={(bodyEn, bodyAr) => patch({ bodyEn, bodyAr })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <BilingualField
            label="Button label"
            en={section.ctaLabelEn}
            ar={section.ctaLabelAr}
            disabled={!editable}
            onChange={(ctaLabelEn, ctaLabelAr) => patch({ ctaLabelEn, ctaLabelAr })}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Button link</label>
            <Input
              value={section.ctaTarget ?? ""}
              placeholder="/apply or https://…"
              disabled={!editable}
              onChange={(event) => patch({ ctaTarget: event.target.value || null })}
            />
          </div>
        </div>

        <AssetField
          kind="SECTION_IMAGE"
          label="Section image"
          objectKey={section.imageKey}
          url={section.imageUrl}
          onUploaded={({ objectKey, url }) => patch({ imageKey: objectKey, imageUrl: url })}
          onCleared={() => patch({ imageKey: null, imageUrl: null })}
          disabled={!editable}
        />

        {itemFields && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                {section.type === "FAQ" ? "Questions" : "Cards"}
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!editable}
                onClick={() => patch({ items: [...section.items, {}] })}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add
              </Button>
            </div>

            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="space-y-3 rounded-[2px] border border-[var(--surface-border)] p-3"
              >
                {itemFields.map((field) => (
                  <BilingualField
                    key={field.key}
                    label={field.label}
                    multiline={field.key === "body" || field.key === "answer"}
                    en={item[field.key] ?? null}
                    ar={item[field.keyAr] ?? null}
                    disabled={!editable}
                    onChange={(en, ar) =>
                      patchItem(itemIndex, { [field.key]: en ?? "", [field.keyAr]: ar ?? "" })
                    }
                  />
                ))}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!editable}
                    onClick={() =>
                      patch({ items: section.items.filter((_, i) => i !== itemIndex) })
                    }
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const SectionsPanel = ({
  site,
  onSaved,
  canEdit,
}: {
  site: TenantSite;
  onSaved: (next: TenantSite) => void;
  canEdit: boolean;
}) => {
  const [draft, setDraft] = useState<SiteSection[]>(site.sections);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(site.sections), [site]);

  const move = (index: number, direction: -1 | 1) =>
    setDraft((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const save = () => {
    // One enabled-but-unavailable section makes the server refuse the whole
    // save with MODULE_REQUIRED, so an unrelated edit to the banner would be
    // lost. The toggle is already disabled; this catches stale state after an
    // entitlement changed under the admin's feet.
    const blocked = draft.find((section) => section.enabled && !section.available);
    if (blocked) {
      toast.error(
        `The ${SECTION_LABELS[blocked.type]?.title ?? blocked.type} section needs the ${blocked.requiresModule} module. Switch it off to save.`
      );
      return;
    }

    setSaving(true);
    // Sent whole and in order: the server renumbers sortOrder from this array.
    updateSiteSections(draft.map((section, index) => ({ ...section, sortOrder: index })))
      .then((next) => {
        onSaved(next);
        toast.success("Sections saved.");
      })
      .catch((error) => {
        const failure = toTenancyError(error, "Could not save your sections.");
        if (failure.code === "TENANCY.SITE.MODULE_REQUIRED") {
          toast.error("A section you switched on needs a module your plan doesn't include.");
        } else {
          toast.error(failure.message);
        }
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="space-y-4">
      {/* Starter copy, not fixtures: a save replaces it outright and there is
          no way back to it, so an admin clearing a field should know that is
          permanent rather than expecting a reset button that cannot exist. */}
      <LexNotice tone="slate">
        These blocks came pre-written from your company details — edit them, switch off the ones you
        don't want, or reorder them. Once you save your own wording, the original text is gone.
      </LexNotice>

      {draft.map((section, index) => (
        <SectionCard
          key={section.type}
          section={section}
          index={index}
          total={draft.length}
          canEdit={canEdit}
          onMove={(direction) => move(index, direction)}
          onChange={(next) =>
            setDraft((current) => current.map((item, i) => (i === index ? next : item)))
          }
        />
      ))}

      <div className="flex justify-end">
        <Button type="button" disabled={!canEdit || saving} onClick={save}>
          {saving ? "Saving…" : "Save sections"}
        </Button>
      </div>
    </div>
  );
};

export default SectionsPanel;
