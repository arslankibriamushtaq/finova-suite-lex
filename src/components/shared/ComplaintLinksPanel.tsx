import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link2, Trash2 } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  COMPLAINT_SUBJECT_TYPES,
  addComplaintLink,
  getComplaintLinks,
  isLinkNotFound,
  removeComplaintLink,
  toSupportError,
  type ComplaintLink,
  type ComplaintSubjectType,
} from "../../redux/apis/apisSupport";

/** Underscores are the wire format, not a label. */
const label = (type: string) => type.replace(/_/g, " ").toLowerCase();

/**
 * What the complaint is about — the difference between one that is logged and
 * one that is answerable. Without it an agent reads "double charge on my card"
 * and then goes looking for which card.
 *
 * Tenant-scoped: the links endpoints exist under `/tenant` only, so this panel
 * is rendered on the tenant register and not on the platform one.
 */
export default function ComplaintLinksPanel({ complaintId }: { complaintId: string }) {
  const [links, setLinks] = useState<ComplaintLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subjectType, setSubjectType] = useState<ComplaintSubjectType | "">("");
  const [subjectId, setSubjectId] = useState("");
  const [subjectReference, setSubjectReference] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setLinks(await getComplaintLinks(complaintId));
    } catch (error) {
      setLinks([]);
      toast.error(toSupportError(error, "Could not load what this complaint is about.").message);
    } finally {
      setIsLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Safe to press twice: a POST for a subject already linked returns the
   * existing link unchanged, so a double-click does not produce two rows.
   */
  const add = async () => {
    if (!subjectType || !subjectId.trim()) return;
    setSaving(true);
    try {
      await addComplaintLink(complaintId, {
        subjectType,
        // TEXT, not a UUID — most are UUIDs, a Fineract loan id is a number,
        // a national id is neither. The owning service's own key goes as-is.
        subjectId: subjectId.trim(),
        subjectReference: subjectReference.trim() || undefined,
        note: note.trim() || undefined,
      });
      setSubjectId("");
      setSubjectReference("");
      setNote("");
      await load();
    } catch (error) {
      toast.error(toSupportError(error, "Could not link that subject.").message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (link: ComplaintLink) => {
    if (
      !window.confirm(
        `Remove the link to ${label(link.subjectType)} ${link.subjectReference || link.subjectId}? The removal itself stays in the history.`
      )
    )
      return;
    try {
      await removeComplaintLink(complaintId, link.id);
      await load();
    } catch (error) {
      // Already gone is not a failure worth a red toast — the list is just
      // stale, and rereading it settles the question.
      if (isLinkNotFound(error)) await load();
      else toast.error(toSupportError(error, "Could not remove that link.").message);
    }
  };

  return (
    <div className="rounded-lg border border-[var(--surface-border)] p-3">
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Link2 className="h-4 w-4" />
        What it is about
      </h4>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : links.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nothing linked yet. A loan, card or payment here is what saves an agent the search.
        </p>
      ) : (
        <ul className="mb-3 space-y-1.5">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex items-center gap-2 rounded-[2px] border border-[var(--surface-border)] px-2 py-1.5 text-xs"
            >
              <span className="shrink-0 rounded-[2px] bg-muted px-1 py-0.5 uppercase tracking-wide">
                {label(link.subjectType)}
              </span>
              {/* `subjectReference` is what a row renders — a loan number, a
                  masked PAN, an amount and a date — so the queue never calls
                  four services to draw one line. */}
              <span className="min-w-0 truncate font-medium text-foreground">
                {link.subjectReference || link.subjectId}
              </span>
              {link.note && <span className="truncate text-muted-foreground">{link.note}</span>}
              <span dir="ltr" className="ms-auto shrink-0 font-mono text-muted-foreground">
                {link.subjectId}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0"
                title="Remove this link"
                onClick={() => remove(link)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1">
          <Label htmlFor="link-type" className="text-xs text-muted-foreground">
            Subject
          </Label>
          <Select
            value={subjectType}
            onValueChange={(value) => setSubjectType(value as ComplaintSubjectType)}
          >
            <SelectTrigger id="link-type" className="w-full data-[size=default]:h-10">
              <SelectValue placeholder="Choose a subject type" />
            </SelectTrigger>
            <SelectContent>
              {COMPLAINT_SUBJECT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <Label htmlFor="link-id" className="text-xs text-muted-foreground">
            Id in the owning service
          </Label>
          <Input
            id="link-id"
            dir="ltr"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            placeholder="txn-88213"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <Label htmlFor="link-ref" className="text-xs text-muted-foreground">
            What to show (recommended)
          </Label>
          <Input
            id="link-ref"
            maxLength={200}
            value={subjectReference}
            onChange={(e) => setSubjectReference(e.target.value)}
            placeholder="SAR 1,240.00 on 01 Sep"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <Label htmlFor="link-note" className="text-xs text-muted-foreground">
            Note (optional)
          </Label>
          <Input
            id="link-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="The disputed charge"
          />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={add}
          disabled={!subjectType || !subjectId.trim() || saving}
        >
          {saving ? "Linking…" : "Link subject"}
        </Button>
        {/* The id is deliberately not verified by the service: a link pointing
            at nothing is a wrong label on a real complaint, while a complaint
            refused because lending-service was slow is a lost one. */}
        <p className="text-xs text-muted-foreground">
          The id is not checked against the owning service — resolve it on the screen that shows
          it.
        </p>
      </div>
    </div>
  );
}
