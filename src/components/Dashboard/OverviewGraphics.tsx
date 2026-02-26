import React from "react";
import { Card } from "antd";

interface OverviewCardProps {
  title: string;
  value: any;
  icon?: React.ReactNode;
  subtitle1?: string;
  value1?: string;
  subtitle2?: string;
  value2?: string;
  cardType?: string;
  extraInfo?: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  icon,
  subtitle1,
  value1,
  subtitle2,
  value2,
  cardType,
  extraInfo,
}) => {
  return (
    <Card className={`overview-card ${cardType}`}>
      {cardType === "highlight" && <div className="highlight-border"></div>}
      <div className="overview-card-content">
        {icon && <div className="overview-card-icon">{icon}</div>}
        <div className="overview-card-title">{title}</div>
        <div className="overview-card-value">{value}</div>
        {subtitle1 && value1 && (
          <div className="overview-card-subinfo">
            <span>{subtitle1}</span>
            <span>{value1}</span>
          </div>
        )}
        {subtitle2 && value2 && (
          <div className="overview-card-subinfo">
            <span>{subtitle2}</span>
            <span>{value2}</span>
          </div>
        )}
        {extraInfo && <div className="overview-card-extra">{extraInfo}</div>}
      </div>
    </Card>
  );
};

export default OverviewCard;
