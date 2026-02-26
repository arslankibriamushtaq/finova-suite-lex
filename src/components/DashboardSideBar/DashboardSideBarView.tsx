import { useState } from "react";
import { Link } from "react-router-dom";
import { Images } from "../Config/Images";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { themeStyle } from "../Config/Theme";

const DasbhboardSidebarView = () => {
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
  const [activeBar, setActiveBar] = useState<any>("Detail");
  const [activeSubBar, setActiveSubBar] = useState<string | null>(null);
  const [sidebarLinksApi, setSidebarLinksApi] = useState([]);
  const [sidebarLinksApiCompliance, setSidebarLinksApiCompliance] = useState(
    []
  );
  const [sidebarLinks, setSidebarLinks] = useState([]);
  const sidebarItems = [
    {
      label: "Detail",
      link: "/view/viewdetails/Individuals/000",
      img: Images.navigationLogo,
    },
    // { label: "Service Screen", link: "", img: Images.searchLogo },
    // { label: "Summary", link: "", img: Images.dashboardLogo },
    // { label: "Collection", link: "", img: Images.dashboardLogo },
    {
      label: "Customer Services",
      link: "/view/CustomerManagement/customerServices",
    },
    {
      label: "Account Details",
      link: "/view/accountdetails",
      img: Images.customerLogo,
    },
    // {
    //   label: "Associated Account",
    //   link: "",
    //   img: Images.customerLogo,
    // },
    // {
    //   label: "Customer/Business Details",
    //   link: "",
    //   img: Images.securizationLogo,
    // },
    // {
    //   label: "Customer/Business Preferences",
    //   link: "/view/businesspreferences",
    //   img: Images.transactionLogo,
    // },
    {
      label: "Transaction History",
      link: "/view/History/TransactionHistory",
      img: Images.customerLogo,
    },
    // { label: "Pmt Modes", link: "/notification", img: Images.securizationLogo },
    // { label: "Bankruptcy", link: "/notification", img: Images.transactionLogo },
    // {
    //   label: "Repo/Foreclosure",
    //   link: "",
    //   img: Images.customerLogo,
    // },
    // {
    //   label: "Deficiency",
    //   link: "",
    //   img: Images.securizationLogo,
    // },
    // {
    //   label: "Collecterul",
    //   link: "",
    //   img: Images.transactionLogo,
    // },
    // { label: "Bereau", link: "/notification", img: Images.customerLogo },
    // { label: "Timeline", link: "/notification", img: Images.securizationLogo },
    // {
    //   label: "Cross/Upsell Activities",
    //   link: "",
    //   img: Images.transactionLogo,
    // },
    // {
    //   label: "External interface",
    //   link: "/notification",
    //   img: Images.securizationLogo,
    // },
    // {
    //   label: "Review Request",
    //   link: "/notification",
    //   img: Images.transactionLogo,
    // },
  ];

  const onSmash = (item: any) => {
    setActiveBar(item.label);
    setActiveSubBar(null);
    item.label === "Introduction"
      ? setSidebarLinksApi(sidebarLinksApiCompliance)
      : setSidebarLinksApi(sidebarLinks);
  };

  return (
    <div style={{ width: "290px" }}>
      {sidebarItems.map((item) => (
        <div
          className="pb-1"
          key={item.link}
          onClick={() => onSmash(item)}
        >
          <Link
            to={item.link}
            style={{ textDecoration: "none", color: "black" }}
          >
            <div
              className="p-2"
              style={
                activeBar === item.label
                  ? {
                    backgroundColor: themeStyle?.dashboardSideBarView.activeColorBg,
                    color: themeStyle?.dashboardSideBarView.activeTextColor,
                  }
                  : { backgroundColor: themeStyle?.dashboardSideBarView.inActiveColorBg, color: themeStyle?.dashboardSideBarView.inActiveTextColor }
              }
            >
              {item.label}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default DasbhboardSidebarView;
