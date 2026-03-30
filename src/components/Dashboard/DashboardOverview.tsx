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

  return (
    <div className="row gy-2 dashboard-stats" style={styles.row}>
      {statsData.map((stat, index) => {
        return (
          <div
            key={index}
            className="col-md-3 mb-3"
            style={styles.col}
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
                  {stat.value}
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

// ✅ Inline styles
const styles: { [key: string]: React.CSSProperties } = {
  row: {
    display: "flex",
    flexWrap: "wrap",
  },

  totalLoan: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    padding: "18px 20px",
    background: "var(--background)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease-in-out",
  },
  cardLeft: {
    display: "flex",
    flexDirection: "column",
  },
  labelTheme: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--muted-foreground)",
  },
  value: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--foreground)",
    margin: "8px 0 0 0",
  },
  cardRite: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  img: {
    height: 45,
    width: "auto",
    objectFit: "contain",
  },
};

export default DashboardOverview;
