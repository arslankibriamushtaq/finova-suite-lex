import { createContext, useContext, type ReactNode } from "react";

/**
 * True while a report renders inside the reports hub (ReportsCenter).
 *
 * The hub already names the screen twice — the category heading and the report
 * picker — so a report that also draws its own title shows the name three
 * times. Rather than deleting those titles (the same components are still
 * reachable on their own routes under /Lms/Reports/*, where the title is the
 * only thing naming the page), each report asks whether it is inside the hub
 * and skips its header when it is.
 */
const ReportsCenterContext = createContext(false);

export const ReportsCenterProvider = ({ children }: { children: ReactNode }) => (
  <ReportsCenterContext.Provider value={true}>{children}</ReportsCenterContext.Provider>
);

// Not exported: nothing outside this file needs to branch on the hub, and
// exporting a non-component alongside the components breaks fast refresh.
const useInReportsCenter = () => useContext(ReportsCenterContext);

interface ReportHeaderProps {
  /** Lucide icon element; omitted on the reports that never had one. */
  icon?: ReactNode;
  title: ReactNode;
  /** Trailing muted text, e.g. the currency a money report is scoped to. */
  suffix?: ReactNode;
  subtitle?: ReactNode;
}

/** A report's own page header. Renders nothing inside the hub. */
const ReportHeader = ({ icon, title, suffix, subtitle }: ReportHeaderProps) => {
  if (useInReportsCenter()) return null;

  return (
    <div className="mb-3 pb-2 border-bottom">
      <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
        {icon ? <span className="pro-head-badge">{icon}</span> : null}
        {title}
        {suffix ? <span className="fs-6 fw-normal text-muted">· {suffix}</span> : null}
      </h3>
      {subtitle ? <p className="mb-0 mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
};

export default ReportHeader;
