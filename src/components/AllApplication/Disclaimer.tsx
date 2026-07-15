import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const Disclaimer = () => {
  const { t } = useTranslation("allApplication");
  const [isYesSelected, setIsYesSelected] = useState(false);

  const handleRadioChange = (event: any) => {
    setIsYesSelected(event.target.value === "yes");
  };
  return (
    <>
      <div className="disclaimerInfo">
        <div className="flex-radio radios-buttons">
          <span>{t("disclaimer.agree")}</span>
          <div>
            <label className="mb-0">
              <span>{t("common:yes")}</span>
              <input
                type="radio"
                value="yes"
                checked={isYesSelected}
                onChange={handleRadioChange}
              />
            </label>
            <label className="mb-0">
              <span>{t("common:no")}</span>
              <input
                type="radio"
                value="no"
                checked={!isYesSelected}
                onChange={handleRadioChange}
              />
            </label>
          </div>
        </div>
        <p>{t("disclaimer.selectedOption", { value: isYesSelected ? t("common:yes") : t("common:no") })}</p>

        <div className="row">
          <div className="col-md-6">
            <h3 className="welcome-heading mb-3 text-theme ">English</h3>
            <div className="col-12">--</div>
          </div>
          <div dir="rtl" className="col-md-6">
            <h3 className="welcome-heading mb-3 text-theme ">العربية</h3>
            <div className="col-12">--</div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Disclaimer;
