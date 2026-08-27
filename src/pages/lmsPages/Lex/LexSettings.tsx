import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Building2, ClipboardList, FileStack, ListChecks, ScanEye } from "lucide-react";

import { Tabs, TabsContent } from "../../../components/ui/tabs";
import {
  DetailTabsList,
  DetailTabsTrigger,
  PermissionDenied,
} from "../../../components/shared/detailKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";

import LexReasonCodeDocuments from "./LexReasonCodeDocuments";
import LexChecks from "./LexChecks";
import LexDocumentTypes from "./LexDocumentTypes";
import LexAnalyses from "./LexAnalyses";
import LexEmployers from "./LexEmployers";

/**
 * The LEX configuration desks, gathered behind one door.
 *
 * These five were five sidebar rows, which put the document chain — the checks
 * library, the types that reference it, the findings that ask for those types,
 * and what the analyser made of them — rows apart from one another in a list of
 * fifteen. They are one subject, so they are now one page.
 *
 * Each panel is the screen exactly as it was at its own route: its own header,
 * its own filters, its own permissions. This page adds a row of tabs above them
 * and nothing else — no wrapper, no second title. A page whose only job is to
 * choose between five screens should not also take a header of its own, or
 * every tab would open under two titles.
 */

/**
 * Tabs in the order they are read, each carrying the permission its own screen
 * checks — the same constant, not a coarser grouping, so the mapping from tab
 * to Casbin object stays visible here the way it is inside each page.
 */
const TABS = [
  {
    value: "reasonCodeDocuments",
    labelKey: "set.tab.reasonCodeDocuments",
    icon: ClipboardList,
    permission: LEX_PERMISSIONS.REASON_CODE_DOC_READ,
    Panel: LexReasonCodeDocuments,
  },
  {
    value: "checks",
    labelKey: "set.tab.checks",
    icon: ListChecks,
    permission: LEX_PERMISSIONS.CHECK_READ,
    Panel: LexChecks,
  },
  {
    value: "documentTypes",
    labelKey: "set.tab.documentTypes",
    icon: FileStack,
    permission: LEX_PERMISSIONS.DOC_TYPE_READ,
    Panel: LexDocumentTypes,
  },
  {
    value: "analyses",
    labelKey: "set.tab.analyses",
    icon: ScanEye,
    permission: LEX_PERMISSIONS.ANALYSIS_READ,
    Panel: LexAnalyses,
  },
  {
    value: "employers",
    labelKey: "set.tab.employers",
    icon: Building2,
    permission: LEX_PERMISSIONS.EMPLOYER_READ,
    Panel: LexEmployers,
  },
];

const LexSettings = () => {
  const { t } = useTranslation("lex");
  const { can } = useLexAccess();

  /**
   * A tab the role cannot read is not rendered at all. An empty tab that says
   * only "denied" invites the operator to ask what they are missing; an absent
   * one is simply not part of their job.
   */
  const tabs = useMemo(
    () => TABS.filter((tab) => can(tab.permission)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /**
   * The open tab lives in the URL, so it is linkable, survives a refresh and
   * comes back on the browser's back button — the three things that were free
   * when each of these was a route of its own, and would otherwise be lost by
   * folding them into one page.
   */
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const active = tabs.some((tab) => tab.value === requested) ? String(requested) : tabs[0]?.value;

  if (!tabs.length) return <PermissionDenied />;

  return (
    // `.service` here and NOT inside the panels: each panel still brings its
    // own, and this one only has to hold the tab row above them.
    <div className="service">
      <Tabs
        value={active}
        onValueChange={(value) => {
          // `replace` so paging through the tabs does not fill the back stack
          // with steps the operator has to walk back out of to leave the page.
          setParams({ tab: value }, { replace: true });
        }}
      >
        <DetailTabsList className="mb-1">
          {tabs.map(({ value, labelKey, icon: Icon }) => (
            <DetailTabsTrigger key={value} value={value} className="gap-2">
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </DetailTabsTrigger>
          ))}
        </DetailTabsList>

        {tabs.map(({ value, Panel }) => (
          // Mounted only while selected: each of these fetches on mount, and
          // loading five screens to show one is five times the requests.
          <TabsContent key={value} value={value}>
            {active === value && <Panel />}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default LexSettings;
