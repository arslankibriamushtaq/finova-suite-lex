import { useState } from "react";
import { Link } from "react-router-dom";
import { Images } from "../Config/Images";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";

const DasbhboardSideBarCreateAccount = () => {
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
  const [activeBar, setActiveBar] = useState<any>("Application");
  const [activeSubBar, setActiveSubBar] = useState<string | null>(null);
  const [sidebarLinksApi, setSidebarLinksApi] = useState([]);
  const [sidebarLinksApiCompliance, setSidebarLinksApiCompliance] = useState(
    []
  );
  const [sidebarLinks, setSidebarLinks] = useState([]);
  const sidebarItems = [
    {
      label: "Application",
      link: "LoanManagement/Application",
      img: Images.navigationLogo,
    },

    { label: "Bureau", link: "LoanManagement/Bureau", img: Images.searchLogo },
    // {
    //   label: "Applicant",
    //   link: "LoanManagement/Applicant",
    //   img: Images.dashboardLogo,
    // },
    // {
    //   label: "Link Bank Account",
    //   link: "LoanManagement/LinkBankAccount",
    //   img: Images.dashboardLogo,
    // },
    // {
    //   label: "Request",
    //   link: "LoanManagement/Request",
    // },
    // {
    //   label: "Master Account",
    //   link: "LoanManagement/MasterAccount",
    //   img: Images.customerLogo,
    // },
    // {
    //   label: "Comments",
    //   link: "LoanManagement/Comments",
    //   img: Images.customerLogo,
    // },
    // {
    //   label: "Document",
    //   link: "LoanManagement/Document",
    //   img: Images.securizationLogo,
    // },
    // {
    //   label: "Correspondence",
    //   link: "LoanManagement/Correspondence",
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
          className="pb-1 ps-3"
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
                  ? { backgroundColor: "#373435", color: "#FFFFFF" }
                  : { backgroundColor: "#EDEDED", color: "#000000" }
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

export default DasbhboardSideBarCreateAccount;
