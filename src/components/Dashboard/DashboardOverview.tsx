import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardOverview.css";
import {
  ClipboardList,
  FileCheck2,
  Hourglass,
  BadgeCheck,
  FileX2,
  CalendarCheck2,
  Banknote,
  Users,
  type LucideIcon,
} from "lucide-react";
import PulseLoading from "../Loader/PulseLoader";

type CardTheme =
  | "emerald"
  | "teal"
  | "amber"
  | "green"
  | "rose"
  | "cyan"
  | "violet"
  | "indigo";

interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  theme: CardTheme;
  link?: string;
}

const DashboardOverview: React.FC<{ applicationData: any; loading: boolean }> = ({
  applicationData,
  loading,
}) => {
  const navigate = useNavigate();

  const statsData: StatCard[] = [
    {
      title: "Total Applied Applications",
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalAppliedApplications,
      icon: ClipboardList,
      theme: "emerald",
      link: "/LOS/FinancingApplications/AllApplications",
    },
    {
      title: "Total Completed Applications",
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalCompletedApplications,
      icon: FileCheck2,
      theme: "teal",
    },
    {
      title: "Total In Progress Applications",
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalInProgressApplications,
      icon: Hourglass,
      theme: "amber",
      link: "/LOS/FinancingApplications/InProgressFinancing",
    },
    {
      title: "Total Approved Applications",
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalApprovedApplications,
      icon: BadgeCheck,
      theme: "green",
      link: "/LOS/FinancingApplications/ApprovedFinancing",
    },
    {
      title: "Total Rejected Applications",
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalRejectedApplications,
      icon: FileX2,
      theme: "rose",
      link: "/LOS/FinancingApplications/RejectedFinancing",
    },
    {
      title: "Today's Completed Applications",
      value: loading ? <PulseLoading size="sm" /> : applicationData?.todaysCompletedApplications || 0,
      icon: CalendarCheck2,
      theme: "cyan",
    },
    {
      title: "Total Disbursed Amount",
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalDisbursedAmount,
      icon: Banknote,
      theme: "violet",
    },
    {
      title: "Total Customers",
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalCustomers,
      icon: Users,
      theme: "indigo",
      link: "/LOS/CustomerManagement/CustomerList",
    },
  ];

  const handleCardClick = (link?: string) => {
    if (link) {
      navigate(link);
    }
  };

  const formatValue = (val: any) => {
    if (val == null || typeof val === "object") return val;
    const num = Number(val);
    if (isNaN(num)) return val;
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="row gy-3 dashboard-stats">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="col-12 col-sm-6 col-lg-3 d-flex">
            <div
              className={`stat-card stat-card--${stat.theme} ${stat.link ? "has-link" : ""}`}
              onClick={() => handleCardClick(stat.link)}
            >
              <div className="stat-card__row">
                <span className="stat-card__title">{stat.title}</span>
                <span className="stat-card__icon">
                  <Icon strokeWidth={2} />
                </span>
              </div>
              <p className="stat-card__value">{formatValue(stat.value)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardOverview;
