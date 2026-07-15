import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RootState } from "../../redux/rootReducer";
import { Images } from "../Config/Images";

const LandingPageManage = () => {
  const { t } = useTranslation("webPages");
  const navigate = useNavigate();
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
  const [showButton, setShowButton] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const Image = [
    {
      img: Images.template1,
    },
    {
      img: Images.template2,
    },
    {
      img: Images.template3,
    },
    {
      img: Images.template4,
    },
    {
      img: Images.template4,
    },
  ];
  return (
    <>
      <div className="container-fluid ">
        <div className="col-md-12">
          <div className="page-header pb-2 align-items-center">
            <h3 className="welcome-heading">{t("header.landingPageManagement")}</h3>
            <div className="d-flex ">
              <a href="/HomePageManagement/home-page/setting">
                <button
                  className="btn-theme float-end button-margin"
                  style={{
                    backgroundColor: themeBuilder?.table?.backgroundColor,
                  }}
                >
                  {t("previewHomePage")}
                </button>
              </a>
              <a href="/HomePageManagement/home-page/setting">
                <button
                  className="btn-theme float-end"
                  style={{
                    backgroundColor: themeBuilder?.table?.backgroundColor,
                  }}
                >
                  {t("previewHomePage")}
                </button>
              </a>
            </div>
          </div>
          <div className="row">
            {Image.map((item, index: any) => (
              <div className="col-lg-3 col-md-4 col-sm-6 " key={index}>
                <div className="py-2" onClick={() => setSelectedIndex(index)}>
                  <div>
                    <img
                      className="p-relative"
                      onMouseEnter={() => setShowButton(true)}
                      onMouseLeave={() => setShowButton(false)}
                      src={item.img}
                      height={600}
                    />
                  </div>
                  <div className="over-lay">
                    {selectedIndex == index ? (
                      <div className="template-default">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id="flexCheckCheckedDisabled"
                          checked
                        />
                      </div>
                    ) : (
                      <div className="template-non-default"></div>
                    )}
                    {selectedIndex == index ? (
                      <div
                        className=""
                        onClick={() => {
                          navigate(`/HomePageManagement/home-page/setting`);
                        }}
                      >
                        <button
                          className="btn btn-theme"
                          style={{
                            backgroundColor:
                              themeBuilder?.table?.backgroundColor,
                          }}
                        >
                          {t("editTemplate")}
                        </button>
                      </div>
                    ) : (
                      <div className="">
                        <button
                          className="btn btn-theme"
                          style={{
                            backgroundColor:
                              themeBuilder?.table?.backgroundColor,
                          }}
                        >
                          {t("useThisTemplate")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* <div className="middle">
              <div className="flex-100">
                {showButton && (
                   <div
                   className=""
                 >
                   <button className="btn btn-theme">
                   Edit Template
                   </button>
                 </div>
                )}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPageManage;
