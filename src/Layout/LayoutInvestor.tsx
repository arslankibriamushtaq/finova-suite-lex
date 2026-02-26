import { Outlet } from "react-router-dom";
import { useEffect } from "react";

/**
 * Layout wrapper for Investor Dashboard pages
 * This layout dynamically imports Tailwind CSS scoped only to InvestorPages
 * Uses a content wrapper to prevent conflicts with LayoutDashboard structure
 */
export default function LayoutInvestor() {
  useEffect(() => {
    // Dynamically import Tailwind CSS only when InvestorPages are active
    import("../pages/InvestorPages/investorPages.css");
  }, []);

  // Wrap content with investor-pages-container but don't break LayoutDashboard structure
  // This div only wraps the page content, not the header/sidebar
  return (
    <div className="investor-pages-container" style={{ width: '100%', height: '100%' }}>
      <Outlet />
    </div>
  );
}

