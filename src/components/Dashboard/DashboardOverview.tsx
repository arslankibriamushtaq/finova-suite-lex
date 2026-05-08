import React from "react";
import { useNavigate } from "react-router-dom";
import AntDesignIcon from "../../assets/img/ant-design.png";
import FileMinusIcon from "../../assets/img/la_file-.png";
import FileRejectIcon from "../../assets/img/la_file-i.png";
import FileInIcon from "../../assets/img/la_file-in.png";
import FileInvoiIcon from "../../assets/img/la_file-invoi.png";
import FileIcon from "../../assets/img/la_file.png";
import FileInvoi1Icon from "../../assets/img/la_file-invoi-1.png";
import { PulseLoader } from "react-spinners";

interface StatCard {
  title: string;
  value: string | number;
  image: string;
  link?: string;
  activeClass?: string;
}



const DashboardOverview: React.FC<{applicationData: any,loading: boolean}> = ({applicationData,loading}) => {
  const navigate = useNavigate();
  
  const statsData: StatCard[] = [
    {
      title: "Total Applied Applications",
      value:loading?<PulseLoader/>:applicationData?.totalAppliedApplications,
      image: AntDesignIcon,
      activeClass: "active3",
      link: "/LOS/FinancingApplications/AllApplications",
    },
    {
      title: "Total Completed Applications",
      value:loading?<PulseLoader/>:applicationData?.totalCompletedApplications,
      image: FileInvoiIcon,
    },
    {
      title: "Total In Progress Applications",
      value:loading?<PulseLoader/>:applicationData?.totalInProgressApplications,
      image: FileIcon,
      link: "/LOS/FinancingApplications/InProgressFinancing",
    },
    {
      title: "Total Approved Applications",
      value:loading?<PulseLoader/>:applicationData?.totalApprovedApplications,
      image: FileInIcon,
      link: "/LOS/FinancingApplications/ApprovedFinancing",
    },
    {
      title: "Total Rejected Applications",
      value:loading?<PulseLoader/>:applicationData?.totalRejectedApplications,
      image: FileRejectIcon,
      activeClass: "active4",
      link: "/LOS/FinancingApplications/RejectedFinancing",
    },
    {
      title: "Today's Completed Applications",
      value:loading?<PulseLoader/>:applicationData?.todaysCompletedApplications || 0,
      image: FileInIcon,
    },
    {
      title: "Total Disbursed Amount",
      value:loading?<PulseLoader/>:applicationData?.totalDisbursedAmount,
      image: FileInvoi1Icon,
    },
    {
      title: "Total Customers",
      value:loading?<PulseLoader/>:applicationData?.totalCustomers,
      image: FileMinusIcon,
      activeClass: "active4",
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
        return (
          <div
            key={index}
            className="col-12 col-sm-6 col-lg-3 d-flex"
          >
            <div
              className={`total-loan ${stat.activeClass || ""}`}
              style={{
                ...styles.totalLoan,
                cursor: stat.link ? "pointer" : "default",
              }}
              onClick={() => handleCardClick(stat.link)}
            >
              <div className="cardLeft" style={styles.cardLeft}>
                <label className="label-theme" style={styles.labelTheme}>
                  {stat.title}
                </label>

                <p className="p-theme cards-text" style={styles.value}>
                  {formatValue(stat.value)}
                </p>
              </div>

              <div className="cardRite" style={styles.cardRite}>
                <img
                  src={stat.image}
                  alt={stat.title}
                  style={styles.img}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  totalLoan: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    borderRadius: 10,
    padding: "18px 20px",
    background: "var(--background)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease-in-out",
    width: "100%",
    height: "100%",
    minHeight: 110,
  },
  cardLeft: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 8,
    minWidth: 0,
    flex: 1,
  },
  labelTheme: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--muted-foreground)",
    lineHeight: 1.3,
  },
  value: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--foreground)",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardRite: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexShrink: 0,
  },
  img: {
    height: 40,
    width: "auto",
    objectFit: "contain",
  },
};

export default DashboardOverview;
