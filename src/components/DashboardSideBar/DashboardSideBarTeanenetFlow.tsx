import { useEffect, useState } from "react";
import { Sidebar, MenuItem, SubMenu } from "react-pro-sidebar";
import { Images } from "../Config/Images";
import BrandLogo from "../shared/BrandLogo";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RootState } from "../../redux/rootReducer";
import { authSlice } from "../../redux/apis/apisSlice";
import Loader from "../Loader/Loader";

const DasbhboardSidebarTeanenetFlow = () => {
  const { t } = useTranslation("sidebar");
  const dispatch = useDispatch();
  const location = useLocation();
  const product = useSelector((state: RootState) => state.block.product);
  const business = useSelector((state: RootState) => state.block.business);
  const payment = useSelector((state: RootState) => state.block.payment);
  const password = useSelector((state: RootState) => state.block.password);
  const [activeBar, setActiveBar] = useState<string | null>(null);
  const [activeSubBar, setActiveSubBar] = useState<string | null>(null);
  const [sidebarLinksApi, setSidebarLinksApi] = useState([]);
  const [sidebarLinksApiCompliance, setSidebarLinksApiCompliance] = useState(
    []
  );
  const [sidebarLinks, setSidebarLinks] = useState([]);
  const [table, setTable] = useState();
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toggled = useSelector((state: RootState) => state.block.toggled);

  const updateView = () => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/");
    return parts[2];
  };

  const [view, setView] = useState(updateView);
  let tokenValue = localStorage.getItem("accessToken");

  useEffect(() => {
    setView(updateView);
    if (view == "finish") {
      dispatch(
        authSlice.actions.setPassword({
          password: false,
        })
      );
    }
  }, [location.pathname]);

  const onSmash = (item: any) => {
    setActiveBar(item);
    setActiveSubBar(null);
    item === "Compliance Dashboard"
      ? setSidebarLinksApi(sidebarLinksApiCompliance)
      : setSidebarLinksApi(sidebarLinks);
  };

  const renderSubmenu = (item: any) => (
    <div className="menu-items" key={item.label}>
      <SubMenu
        prefix={
          <img
            src={item.img}
            style={{ background: "none", color: "#fff" }}
            width={20}
            height={20}
          />
        }
        label={item.label}
        onClick={() => setActiveBar(item.label)}
      >
        {item.menu.map((submenuItem: any, subIndex: any) => (
          <Link
            to={`${submenuItem.Link}`}
            style={{
              color: "#fff",
              textDecoration: "none",
              fontSize: "12px",
            }}
            className={submenuItem.label === activeSubBar ? "active" : ""}
            key={subIndex}
          >
            <MenuItem
              style={{
                fontSize: "12px",
                fontWeight: "400",
                color: "#000000",
                textDecoration: "none",
              }}
              onClick={() => setActiveSubBar(submenuItem.label)}
            >
              {submenuItem.label}
            </MenuItem>
          </Link>
        ))}
      </SubMenu>
    </div>
  );

  return (
    <>
      <div>
        {loading && <Loader />}

        <Sidebar
          transitionDuration={1000}
          onBackdropClick={() => dispatch(authSlice.actions.toggleSidebar())}
          toggled={toggled}
          customBreakPoint="768px"
          collapsedWidth="80px"
          width="100%"
          className="col-12 fw-bold menu-items"
          style={{ fontSize: "14px", color: "black" }}
        >
          <a
            href={`lms/dashboard`}
            className="d-flex justify-content-center p-3"
          >
            <BrandLogo height={80} />
          </a>
          <section
            className="jss271 d-flex justify-content-center"
            style={{ height: "80vh" }}
          >
            <div className="col-9">
              <ul className="jss272">
                <li className="jss273 jss278">
                  <span
                    className="jss274  d-flex justify-content-center align-items-center"
                    style={
                      view === "product"
                        ? { background: " #1963b9" }
                        : product
                        ? { background: "#e60000" }
                        : {}
                    }
                  >
                    <img
                      src={Images.productLogo}
                      alt=""
                      width={17}
                      height={17}
                    />
                  </span>
                  <div className="jss277">
                    <div className="">
                      <span
                        className="status-title"
                        style={
                          view === "product"
                            ? { color: "#292929" }
                            : product
                            ? { color: "#292929" }
                            : {}
                        }
                      >
                        {t("productPackageDetail")}
                      </span>
                    </div>
                    <div className="jss280"></div>
                  </div>
                </li>
                <li className="jss273">
                  <span
                    className="jss274 d-flex justify-content-center align-items-center"
                    style={
                      business
                        ? { background: "#e60000" }
                        : view === "info"
                        ? { background: " #1963b9" }
                        : { background: "#B8B8B8" }
                    }
                  >
                    <img
                      src={Images.businessLogo}
                      alt=""
                      width={17}
                      height={17}
                    />
                  </span>
                  <div className="jss277">
                    <div className="jss276">
                      <span
                        className="status-title"
                        style={
                          business
                            ? { color: "#292929" }
                            : view === "info"
                            ? { color: "#292929" }
                            : { color: "#838383" }
                        }
                      >
                        {t("businessInfo")}
                      </span>
                    </div>
                    <div className="jss280"></div>
                  </div>
                </li>
                <li className="jss273">
                  <span
                    className="jss274 d-flex justify-content-center align-items-center"
                    style={
                      view === "payment"
                        ? { background: " #1963b9" }
                        : payment
                        ? { background: "#e60000" }
                        : { background: "#B8B8B8" }
                    }
                  >
                    <img
                      src={Images.paymentLogo}
                      alt=""
                      width={17}
                      height={17}
                    />
                  </span>
                  <div className="jss277">
                    <div className="jss276">
                      <span
                        className="status-title"
                        style={
                          view === "payment"
                            ? { color: "#292929" }
                            : payment
                            ? { color: "#292929" }
                            : { color: "#838383" }
                        }
                      >
                        {t("payment")}
                      </span>
                    </div>
                    <div className="jss280"></div>
                  </div>
                </li>
                <li className="jss273">
                  <span
                    className="jss274 d-flex justify-content-center align-items-center"
                    style={
                      view === "setpassword"
                        ? { background: " #1963b9" }
                        : password
                        ? { background: "#e60000" }
                        : { background: "#B8B8B8" }
                    }
                  >
                    <img
                      src={Images.passwordLogo}
                      alt=""
                      width={17}
                      height={17}
                    />
                  </span>
                  <div className="jss277">
                    <div className="jss276">
                      <span
                        className="status-title"
                        style={
                          view === "setpassword"
                            ? { color: "#292929" }
                            : password
                            ? { color: "#292929" }
                            : { color: "#838383" }
                        }
                      >
                        {t("setPassword")}
                      </span>
                    </div>
                    <div className="jss280"></div>
                  </div>
                </li>
                <li className="jss273">
                  <span
                    className="jss274 d-flex justify-content-center align-items-center"
                    style={
                      view === "finish"
                        ? { background: " #1963b9" }
                        : { background: "#B8B8B8" }
                    }
                  >
                    <img
                      src={Images.finishLogo}
                      alt=""
                      width={17}
                      height={17}
                    />
                  </span>
                  <div className="jss277">
                    <div className="jss276">
                      <span
                        className="status-title"
                        style={
                          view === "finish"
                            ? { color: "#292929" }
                            : { color: "#838383" }
                        }
                      >
                        {t("finish")}
                      </span>
                    </div>
                    <div className="jss280"></div>
                  </div>
                </li>
              </ul>
            </div>
          </section>
          <a
            href={`lms/dashboard`}
            className="d-flex justify-content-center align-items-end p-3"
          >
            <img src={Images.AwnLogo} alt="logo" height={80}/>
          </a>
        </Sidebar>
      </div>
    </>
  );
};

export default DasbhboardSidebarTeanenetFlow;
