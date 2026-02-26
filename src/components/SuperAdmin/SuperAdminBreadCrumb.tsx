import { ClassAttributes, HTMLAttributes } from "react";
import { useLocation } from "react-router-dom";
import { JSX } from "react/jsx-runtime";

const breadcrumbNameMap: { [key: string]: string } = {
  superadmin: "Dashboard",
  tenants: "Tenants",
  leads: "Leads",
  totalEPF: "Total EPF",
  opportunities: "Opportunities",
  productmanagement: "Product Management",
  assignedproducts: "Assigned Products",
  loancalculator: "Loan Calculator",
  view: "View Details",
};

const DynamicBreadcrumb = ({
  className,
  ...props
}: JSX.IntrinsicAttributes &
  ClassAttributes<HTMLDivElement> &
  HTMLAttributes<HTMLDivElement>) => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  let breadcrumbParts: string[] = ["Dashboard"];

  if (pathSegments[0] === "view" && pathSegments.length > 1) {
    // Handle "View Details" pages separately
    breadcrumbParts = [
      breadcrumbNameMap[pathSegments[1]] || pathSegments[1],
      "View Details",
    ];
  } else if (pathSegments[0] === "edit" && pathSegments.length > 1) {
    breadcrumbParts = [
      breadcrumbNameMap[pathSegments[1]] || pathSegments[1],
      "Edit Details",
    ];
  } else {
    // General breadcrumb logic (ignores 'superadmin')
    const filteredSegments = pathSegments.filter((seg) => seg !== "superadmin");
    breadcrumbParts.push(
      ...filteredSegments.map((seg) => breadcrumbNameMap[seg] || seg)
    );
  }

  return (
    <div
      {...props}
      className={`product-breadcrumb text-capitalize ${className || ""}`}
    >
      {breadcrumbParts.map((part, index) => (
        <span
          key={index}
          className={index === breadcrumbParts.length - 1 ? "active" : ""}
        >
          {part}
          {index !== breadcrumbParts.length - 1 && " | "}
        </span>
      ))}
    </div>
  );
};

export default DynamicBreadcrumb;
