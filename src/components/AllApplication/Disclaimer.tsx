import React, { useState } from "react";

const Disclaimer = () => {
  const [isYesSelected, setIsYesSelected] = useState(false);

  const handleRadioChange = (event: any) => {
    setIsYesSelected(event.target.value === "yes");
  };
  return (
    <>
      <div className="disclaimerInfo">
        <div className="flex-radio radios-buttons">
          <span>I agreed and accepted the following disclaimer:</span>
          <div>
            <label className="mb-0">
              <span>Yes</span>
              <input
                type="radio"
                value="yes"
                checked={isYesSelected}
                onChange={handleRadioChange}
              />
            </label>
            <label className="mb-0">
              <span>No</span>
              <input
                type="radio"
                value="no"
                checked={!isYesSelected}
                onChange={handleRadioChange}
              />
            </label>
          </div>
        </div>
        <p>Selected option: {isYesSelected ? "Yes" : "No"}</p>

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
