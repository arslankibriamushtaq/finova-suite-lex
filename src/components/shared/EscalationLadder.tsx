import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Archive, Plus, ScanLine } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { EmptyState } from "./detailKit";
import { FilterField } from "./filterKit";
import { LexNotice } from "./lexKit";
import { minutesInWords } from "./supportKitUtils";
import {
  createEscalationRule,
  getEscalationRules,
  retireEscalationRule,
  runSlaScan,
  taxonomyMessage,
  toSupportError,
  updateEscalationRule,
  type EscalationRule,
  type SupportSubCategory,
} from "../../redux/apis/apisSupport";

/**
 * The escalation ladder — the rungs a complaint climbs when its clock runs on.
 *
 * Levels are ordered and climbed one at a time, and escalation stops at the
 * top rung. There is deliberately **no manual escalate control** anywhere here:
 * an escalation that skipped the clock would make the SLA report a work of
 * fiction. The only button that acts on live complaints is the scan, which
 * changes nothing the scheduler would not have changed a minute later.
 */
export default function EscalationLadder({
  subCategories,
}: {
  subCategories: SupportSubCategory[];
}) {
  const [subCategoryId, setSubCategoryId] = useState("");
  const [rules, setRules] = useState<EscalationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<EscalationRule> | null>(null);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);

  const load = useCallback(async () => {
    if (!subCategoryId) {
      setRules([]);
      return;
    }
    setIsLoading(true);
    try {
      setRules(await getEscalationRules(subCategoryId));
    } catch (error) {
      setRules([]);
      toast.error(toSupportError(error, "Could not load the escalation ladder.").message);
    } finally {
      setIsLoading(false);
    }
  }, [subCategoryId]);

  useEffect(() => {
    load();
  }, [load]);

  const isEdit = !!editing?.id;

  const openForm = (rule?: EscalationRule) =>
    setEditing(
      rule ?? {
        subCategoryId,
        // The next rung up. Levels are handed out in order and never moved, so
        // the only sane default is one above the highest that exists.
        level: rules.reduce((top, r) => Math.max(top, r.level), 0) + 1,
        afterMinutes: 60,
        targetTeam: "",
        targetRole: "",
      }
    );

  const save = async () => {
    if (!editing) return;
    const team = String(editing.targetTeam || "").trim();
    const role = String(editing.targetRole || "").trim();
    // A rung that names neither escalates to nobody. The API answers 400; the
    // form says so first.
    if (!team && !role) {
      toast.error("A rung must name a team or a role — otherwise it escalates to nobody.");
      return;
    }
    const minutes = Number(editing.afterMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      toast.error("Minutes must be a positive number.");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        // Everything but `level`: complaints already sitting on rung two would
        // jump or stall depending on which way it moved.
        await updateEscalationRule(editing.id as string, {
          afterMinutes: minutes,
          targetTeam: team || null,
          targetRole: role || null,
        });
      } else {
        await createEscalationRule({
          subCategoryId,
          level: Number(editing.level),
          afterMinutes: minutes,
          targetTeam: team || null,
          targetRole: role || null,
        });
      }
      toast.success("Saved.");
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(taxonomyMessage(error, "Could not save that rung."));
    } finally {
      setSaving(false);
    }
  };

  /** Deactivates. A rung complaints already climbed keeps its meaning. */
  const retire = async (rule: EscalationRule) => {
    if (!window.confirm(`Retire level ${rule.level}? Complaints already on it keep their history.`))
      return;
    try {
      await retireEscalationRule(rule.id);
      await load();
    } catch (error) {
      toast.error(taxonomyMessage(error, "Could not retire that rung."));
    }
  };

  /**
   * The same pass the scheduler makes every minute, run by hand — useful to an
   * operator, and safe because it changes nothing the scheduled run would not
   * have changed anyway.
   */
  const scan = async () => {
    setScanning(true);
    try {
      const result = await runSlaScan();
      toast.success(
        result.skippedBecauseAnotherInstanceWasRunning
          ? "A scan was already running — nothing to do."
          : `${result.acknowledgementBreaches} acknowledgement and ${result.resolutionBreaches} resolution breach(es), ${result.escalations} escalation(s), ${result.failures} failure(s).`
      );
    } catch (error) {
      toast.error(toSupportError(error, "Could not run the SLA scan.").message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      <LexNotice tone="slate">
        A rung's minutes count from the rung below it — or from the opening, for level 1 — on the
        same clock the SLA uses, so a complaint waiting on the customer does not climb. Escalation
        stops at the top rung, and there is no way to escalate by hand.
      </LexNotice>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <FilterField label="Sub-category" htmlFor="ladder-sub" className="w-full sm:w-80">
          <Select value={subCategoryId} onValueChange={setSubCategoryId}>
            <SelectTrigger id="ladder-sub" className="w-full data-[size=default]:h-10">
              <SelectValue placeholder="Choose a sub-category" />
            </SelectTrigger>
            <SelectContent>
              {subCategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={scan} disabled={scanning}>
            <ScanLine className="me-1 h-3.5 w-3.5" />
            {scanning ? "Scanning…" : "Run SLA scan"}
          </Button>
          <Button size="sm" onClick={() => openForm()} disabled={!subCategoryId}>
            <Plus className="me-1 h-3.5 w-3.5" />
            New rung
          </Button>
        </div>
      </div>

      {!subCategoryId ? (
        <EmptyState
          icon={ScanLine}
          text="Choose a sub-category — a ladder belongs to one, because that is what carries the priority."
        />
      ) : isLoading ? (
        <div className="grid gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <EmptyState icon={ScanLine} text="No rungs yet. Breaches will be recorded but nothing will climb." />
      ) : (
        <ol className="space-y-2">
          {[...rules]
            .sort((a, b) => a.level - b.level)
            .map((rule) => (
              <li
                key={rule.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--surface-border)] p-3"
              >
                <Badge variant="outline" className="border-violet-500/40 bg-violet-500/10 text-violet-600">
                  Level {rule.level}
                </Badge>
                <span className="text-sm">
                  after <strong>{rule.afterMinutes} min</strong>{" "}
                  <span className="text-muted-foreground">
                    ({minutesInWords(rule.afterMinutes)})
                  </span>
                </span>
                <span className="text-sm text-muted-foreground">→</span>
                <span className="text-sm font-medium">
                  {rule.targetTeam || rule.targetRole}
                  {rule.targetTeam && rule.targetRole ? ` · ${rule.targetRole}` : ""}
                </span>
                {!rule.active && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Retired
                  </Badge>
                )}
                <span className="ms-auto flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openForm(rule)}>
                    Edit
                  </Button>
                  {rule.active && (
                    <Button size="sm" variant="ghost" title="Retire" onClick={() => retire(rule)}>
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </span>
              </li>
            ))}
        </ol>
      )}

      <Dialog open={!!editing} onOpenChange={(isOpen) => !isOpen && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit rung" : "New rung"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="rung-level" className="text-xs text-muted-foreground">
                Level {isEdit && "(immutable)"}
              </Label>
              {/* Not editable after creation, in the form as in the API:
                  complaints already sitting on rung two would jump or stall
                  depending on which way it moved. Retire it and add another. */}
              <Input
                id="rung-level"
                type="number"
                min={1}
                disabled={isEdit}
                value={String(editing?.level ?? "")}
                onChange={(e) =>
                  setEditing((prev) => prev && { ...prev, level: Number(e.target.value) })
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="rung-minutes" className="text-xs text-muted-foreground">
                After (minutes)
              </Label>
              <Input
                id="rung-minutes"
                type="number"
                min={1}
                value={String(editing?.afterMinutes ?? "")}
                onChange={(e) =>
                  setEditing((prev) => prev && { ...prev, afterMinutes: Number(e.target.value) })
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="rung-team" className="text-xs text-muted-foreground">
                Target team
              </Label>
              <Input
                id="rung-team"
                value={String(editing?.targetTeam ?? "")}
                onChange={(e) =>
                  setEditing((prev) => prev && { ...prev, targetTeam: e.target.value })
                }
                placeholder="Fraud Tier 2"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="rung-role" className="text-xs text-muted-foreground">
                Target role
              </Label>
              <Input
                id="rung-role"
                value={String(editing?.targetRole ?? "")}
                onChange={(e) =>
                  setEditing((prev) => prev && { ...prev, targetRole: e.target.value })
                }
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            One of the two is enough; a rung that names neither escalates to nobody.
          </p>

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
