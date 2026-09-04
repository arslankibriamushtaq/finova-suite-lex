import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Archive, FolderTree, Pencil, Plus, RefreshCw } from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import { Tabs, TabsContent } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { DetailTabsList, DetailTabsTrigger, EmptyState } from "../../components/shared/detailKit";
import { LexNotice, LexPageHeader } from "../../components/shared/lexKit";
import TableView from "../../components/TableView/TableView";
import {
  createCategory,
  createPriority,
  createSubCategory,
  getCategories,
  getPriorities,
  getSubCategories,
  retireCategory,
  retirePriority,
  retireSubCategory,
  taxonomyMessage,
  updateCategory,
  updatePriority,
  updateSubCategory,
  type SupportCategory,
  type SupportPriority,
  type SupportSubCategory,
} from "../../redux/apis/apisSupport";

/** Minutes are what the API stores. This only annotates them; it never replaces them. */
const inHours = (minutes?: number) => {
  if (!minutes && minutes !== 0) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return hours < 24 ? `≈ ${+hours.toFixed(1)}h` : `≈ ${+(hours / 24).toFixed(1)}d`;
};

type Draft = Record<string, string | number>;

/**
 * One row of any of the three tables. They share a code, both names, an order
 * and an active flag; what differs is optional, which is what lets one set of
 * shared cells render all three.
 */
type TaxonomyRow = {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  displayOrder: number;
  active: boolean;
  acknowledgeMinutes?: number;
  resolveMinutes?: number;
  categoryId?: string;
  priorityId?: string;
  owningTeam?: string | null;
};

/** react-data-table takes untyped column descriptors; this is the shape we hand it. */
type Column = { name: string; width?: string } & Record<string, unknown>;

/**
 * The taxonomy: what a complaint can be about, and how fast each kind must be
 * answered.
 *
 * Every tenant is seeded with a working set at provisioning — four priorities
 * and six categories, bilingual — so this screen is for adjusting a taxonomy,
 * never for building one from nothing.
 */
const TenantSupportTaxonomy = () => {
  const [tab, setTab] = useState("categories");
  const [priorities, setPriorities] = useState<SupportPriority[]>([]);
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SupportSubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Retired rows are read too: a taxonomy nobody can see the retired half of is
  // one where the same code gets created twice and answers DUPLICATE_CODE.
  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, c, s] = await Promise.all([
        getPriorities(false),
        getCategories(false),
        getSubCategories({ activeOnly: false }),
      ]);
      setPriorities(p);
      setCategories(c);
      setSubCategories(s);
    } catch (error) {
      toast.error(taxonomyMessage(error, "Could not load the support taxonomy."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const priorityName = useMemo(
    () => (id?: string) => priorities.find((p) => p.id === id)?.nameEn || "—",
    [priorities]
  );
  const categoryName = useMemo(
    () => (id?: string) => categories.find((c) => c.id === id)?.nameEn || "—",
    [categories]
  );

  const activePriorities = priorities.filter((p) => p.active);

  // --- the form ------------------------------------------------------------

  const [editing, setEditing] = useState<{ kind: string; row: Draft | null } | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [saving, setSaving] = useState(false);

  const openForm = (kind: string, row?: Draft) => {
    setEditing({ kind, row: row || null });
    setDraft(
      row || {
        code: "",
        nameEn: "",
        nameAr: "",
        displayOrder: 0,
        ...(kind === "priority" ? { acknowledgeMinutes: 120, resolveMinutes: 1440 } : {}),
        ...(kind === "subCategory" ? { categoryId: "", priorityId: "", owningTeam: "" } : {}),
      }
    );
  };

  const set = (field: string, value: string | number) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  const isEdit = !!editing?.row;

  /**
   * What the API will refuse, refused here first — with one exception. The
   * duplicate-code and in-use rules need the whole tenant's data to judge, so
   * those stay the server's to answer and are surfaced by `taxonomyMessage`.
   */
  const invalid = (() => {
    if (!editing) return "";
    if (!String(draft.nameEn || "").trim()) return "An English name is required.";
    if (!String(draft.nameAr || "").trim()) return "An Arabic name is required.";
    if (!isEdit && !/^[A-Z][A-Z0-9_]{1,39}$/.test(String(draft.code || "")))
      return "Code must be A–Z, digits and underscores, starting with a letter.";
    if (editing.kind === "priority") {
      const ack = Number(draft.acknowledgeMinutes);
      const res = Number(draft.resolveMinutes);
      if (!(ack > 0) || !(res > 0)) return "Both targets must be a number of minutes.";
      // Not a stricter promise — a contradiction. The API says so too.
      if (res < ack) return "The resolution target cannot be shorter than the acknowledgement.";
    }
    if (editing.kind === "subCategory") {
      if (!draft.categoryId) return "Choose the category this belongs to.";
      // The whole SLA ladder rests on this, which is why the form requires it
      // rather than letting the save come back rejected.
      if (!draft.priorityId) return "A sub-category must have a priority.";
    }
    return "";
  })();

  const save = async () => {
    if (!editing || invalid) return;
    setSaving(true);
    try {
      const { kind, row } = editing;
      const id = row?.id as string | undefined;
      // `code` is immutable once created, so an edit never sends it.
      const body: Draft = { ...draft };
      if (id) delete body.code;

      if (kind === "priority") {
        if (id) await updatePriority(id, body as never);
        else await createPriority(body as never);
      } else if (kind === "category") {
        if (id) await updateCategory(id, body as never);
        else await createCategory(body as never);
      } else {
        if (id) await updateSubCategory(id, body as never);
        else await createSubCategory(body as never);
      }
      toast.success(id ? "Saved." : "Created.");
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(taxonomyMessage(error, "Could not save."));
    } finally {
      setSaving(false);
    }
  };

  /**
   * "Retire", never "Delete".
   *
   * DELETE deactivates: complaints already filed under one of these keep
   * pointing at it, and removing the row would take their history and their SLA
   * target with them. Calling the button Delete would be a promise the service
   * does not keep.
   */
  const retire = async (kind: string, id: string, label: string) => {
    if (!window.confirm(`Retire "${label}"? Existing complaints keep pointing at it.`)) return;
    try {
      if (kind === "priority") await retirePriority(id);
      else if (kind === "category") await retireCategory(id);
      else await retireSubCategory(id);
      toast.success("Retired.");
      await load();
    } catch (error) {
      toast.error(taxonomyMessage(error, "Could not retire this."));
    }
  };

  const activeCell = (row: { active: boolean }) =>
    row.active ? (
      <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
        Retired
      </Badge>
    );

  const actionsCell = (kind: string, row: TaxonomyRow) => (
    <div className="flex gap-1">
      <Button size="sm" variant="outline" onClick={() => openForm(kind, row)}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      {row.active && (
        <Button
          size="sm"
          variant="outline"
          title="Retire"
          onClick={() => retire(kind, row.id, row.nameEn)}
        >
          <Archive className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );

  const nameColumns = [
    {
      name: "Code",
      cell: (row: TaxonomyRow) => <span className="font-mono text-xs">{row.code}</span>,
    },
    { name: "Name", selector: (row: TaxonomyRow) => row.nameEn },
    // Arabic is a first-class name here, not a translation bolted on — the
    // customer picking in the app may only ever see this one.
    { name: "الاسم", cell: (row: TaxonomyRow) => <span dir="rtl">{row.nameAr}</span> },
  ];

  const priorityColumns = [
    ...nameColumns,
    {
      name: "Acknowledge",
      cell: (row: SupportPriority) => (
        <span className="tabular-nums">
          {row.acknowledgeMinutes} min{" "}
          <span className="text-muted-foreground">{inHours(row.acknowledgeMinutes)}</span>
        </span>
      ),
    },
    {
      name: "Resolve",
      cell: (row: SupportPriority) => (
        <span className="tabular-nums">
          {row.resolveMinutes} min{" "}
          <span className="text-muted-foreground">{inHours(row.resolveMinutes)}</span>
        </span>
      ),
    },
    { name: "Status", cell: activeCell },
    { name: "Action", width: "12%", cell: (row: TaxonomyRow) => actionsCell("priority", row) },
  ];

  const categoryColumns = [
    ...nameColumns,
    { name: "Order", selector: (row: SupportCategory) => row.displayOrder },
    { name: "Status", cell: activeCell },
    { name: "Action", width: "12%", cell: (row: TaxonomyRow) => actionsCell("category", row) },
  ];

  const subCategoryColumns = [
    ...nameColumns,
    { name: "Category", cell: (row: SupportSubCategory) => categoryName(row.categoryId) },
    { name: "Priority", cell: (row: SupportSubCategory) => priorityName(row.priorityId) },
    { name: "Team", cell: (row: SupportSubCategory) => row.owningTeam || "—" },
    { name: "Status", cell: activeCell },
    { name: "Action", width: "12%", cell: (row: TaxonomyRow) => actionsCell("subCategory", row) },
  ];

  const table = (columns: Column[], data: TaxonomyRow[], emptyText: string, kind: string) =>
    isLoading ? (
      <div className="grid gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    ) : data.length === 0 ? (
      <EmptyState icon={FolderTree} text={emptyText} />
    ) : (
      <div className="pro-card overflow-hidden">
        <TableView
          header={columns}
          data={data.map((row, index) => ({ ...row, Sr: index + 1, kind }))}
          isLoading={isLoading}
          paginationShow={false}
        />
      </div>
    );

  return (
    <div>
      <LexPageHeader
        icon={FolderTree}
        title="Complaint Categories & SLA"
        subtitle="What a complaint can be about, and how fast each kind must be answered."
      >
        <Button size="sm" variant="outline" onClick={load} disabled={isLoading}>
          <RefreshCw className={`me-1 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button
          size="sm"
          onClick={() =>
            openForm(
              tab === "priorities" ? "priority" : tab === "categories" ? "category" : "subCategory"
            )
          }
        >
          <Plus className="me-1 h-3.5 w-3.5" />
          New
        </Button>
      </LexPageHeader>

      <LexNotice tone="slate">
        Retiring keeps the row: complaints already filed under a category or priority go on
        pointing at it, so nothing here is ever deleted.
      </LexNotice>

      <Tabs value={tab} onValueChange={setTab}>
        <DetailTabsList>
          <DetailTabsTrigger value="categories">Categories</DetailTabsTrigger>
          <DetailTabsTrigger value="subCategories">Sub-categories</DetailTabsTrigger>
          <DetailTabsTrigger value="priorities">Priorities & SLA</DetailTabsTrigger>
        </DetailTabsList>

        <TabsContent value="categories" className="mt-3">
          {table(categoryColumns, categories, "No categories yet.", "category")}
        </TabsContent>
        <TabsContent value="subCategories" className="mt-3">
          {table(subCategoryColumns, subCategories, "No sub-categories yet.", "subCategory")}
        </TabsContent>
        <TabsContent value="priorities" className="mt-3">
          {table(priorityColumns, priorities, "No priorities yet.", "priority")}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(isOpen) => !isOpen && setEditing(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit" : "New"}{" "}
              {editing?.kind === "priority"
                ? "priority"
                : editing?.kind === "category"
                  ? "category"
                  : "sub-category"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid max-h-[65vh] gap-3 overflow-y-auto pe-1 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="tx-code" className="text-xs text-muted-foreground">
                Code {isEdit && "(immutable)"}
              </Label>
              <Input
                id="tx-code"
                value={String(draft.code || "")}
                disabled={isEdit}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="PAYMENT_DELAY"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="tx-order" className="text-xs text-muted-foreground">
                Display order
              </Label>
              <Input
                id="tx-order"
                type="number"
                value={String(draft.displayOrder ?? 0)}
                onChange={(e) => set("displayOrder", Number(e.target.value))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="tx-name-en" className="text-xs text-muted-foreground">
                Name (English)
              </Label>
              <Input
                id="tx-name-en"
                value={String(draft.nameEn || "")}
                onChange={(e) => set("nameEn", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="tx-name-ar" className="text-xs text-muted-foreground">
                Name (Arabic)
              </Label>
              {/* `dir="rtl"` on the field itself: the API takes any script here
                  and a customer may only ever see this name. */}
              <Input
                id="tx-name-ar"
                dir="rtl"
                value={String(draft.nameAr || "")}
                onChange={(e) => set("nameAr", e.target.value)}
              />
            </div>

            {editing?.kind === "priority" && (
              <>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="tx-ack" className="text-xs text-muted-foreground">
                    Acknowledge within (minutes)
                  </Label>
                  {/* Minutes, not hours — a thirty-minute target for suspected
                      fraud has to be expressible. */}
                  <Input
                    id="tx-ack"
                    type="number"
                    value={String(draft.acknowledgeMinutes ?? "")}
                    onChange={(e) => set("acknowledgeMinutes", Number(e.target.value))}
                  />
                  <span className="text-xs text-muted-foreground">
                    {inHours(Number(draft.acknowledgeMinutes))}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="tx-res" className="text-xs text-muted-foreground">
                    Resolve within (minutes)
                  </Label>
                  <Input
                    id="tx-res"
                    type="number"
                    value={String(draft.resolveMinutes ?? "")}
                    onChange={(e) => set("resolveMinutes", Number(e.target.value))}
                  />
                  <span className="text-xs text-muted-foreground">
                    {inHours(Number(draft.resolveMinutes))}
                  </span>
                </div>
              </>
            )}

            {editing?.kind === "subCategory" && (
              <>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="tx-category" className="text-xs text-muted-foreground">
                    Category
                  </Label>
                  <Select
                    value={String(draft.categoryId || "")}
                    onValueChange={(value) => set("categoryId", value)}
                  >
                    <SelectTrigger id="tx-category" className="w-full data-[size=default]:h-10">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.active)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nameEn}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="tx-priority" className="text-xs text-muted-foreground">
                    Priority (required)
                  </Label>
                  <Select
                    value={String(draft.priorityId || "")}
                    onValueChange={(value) => set("priorityId", value)}
                  >
                    <SelectTrigger id="tx-priority" className="w-full data-[size=default]:h-10">
                      <SelectValue placeholder="Choose a priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePriorities.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nameEn} · {p.acknowledgeMinutes}/{p.resolveMinutes} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <Label htmlFor="tx-team" className="text-xs text-muted-foreground">
                    Owning team (optional)
                  </Label>
                  <Input
                    id="tx-team"
                    value={String(draft.owningTeam || "")}
                    onChange={(e) => set("owningTeam", e.target.value)}
                    placeholder="Matches a team name in the support console"
                  />
                </div>
              </>
            )}

            {editing?.kind !== "priority" && (
              <>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="tx-desc-en" className="text-xs text-muted-foreground">
                    Description (English)
                  </Label>
                  <Textarea
                    id="tx-desc-en"
                    rows={2}
                    value={String(draft.descriptionEn || "")}
                    onChange={(e) => set("descriptionEn", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="tx-desc-ar" className="text-xs text-muted-foreground">
                    Description (Arabic)
                  </Label>
                  <Textarea
                    id="tx-desc-ar"
                    dir="rtl"
                    rows={2}
                    value={String(draft.descriptionAr || "")}
                    onChange={(e) => set("descriptionAr", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {invalid && (
            <p className="text-xs text-muted-foreground" role="status">
              {invalid}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={!!invalid || saving}>
              {saving ? "Saving…" : isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantSupportTaxonomy;
