import React from "react";
import { useTranslation } from "react-i18next";
import { Images } from "../Config/Images";

interface ModalEditProps {
  open: any;
  buttonText: string;
  setOpen: (value: boolean) => void;
  setFormValue: (value: string) => void;
  handleButtonText: () => void;
}
const ModalEdit: React.FC<ModalEditProps> = ({
  open,
  buttonText,
  setOpen,
  setFormValue,
  handleButtonText,
}) => {
  const { t } = useTranslation("webPages");
  return (
    <>
      {open ? (
        <>
          <div className="finance-table show">
            <div className="d-flex table-data">
              <div
                className="d-flex justify-content-between"
                style={{ background: "#004D72", color: "white" }}
              >
                <h2 className="ps-3 m-0 fs-7 ">{t("modal.editButtonDetails")}</h2>
                <div className="cursor-pointer d-flex ">
                  <img
                    className="me-3"
                    onClick={() => {
                      setOpen(false);
                    }}
                    // src={Images.closeBtn}
                    alt=""
                  />
                </div>
              </div>
              <div className="ps-3 mt-3">
                <div className="mb-2 text-secondary">{t("field.buttonText")}</div>
                <input
                  placeholder={buttonText}
                  type="text"
                  className="text-dark"
                  onChange={(e: any) => {
                    setFormValue(e.target.value);
                  }}
                />
              </div>
              <div className="mb-2 text-secondary">{t("field.buttonUrlAlt")}</div>
              <input type="text" />
              <div>
                <button
                  onClick={() => {
                    handleButtonText();
                    setOpen(false);
                  }}
                  className="btn-theme mt-3"
                  style={{ width: "80px", height: "40px" }}
                >
                  {t("common:apply")}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
    </>
  );
};
export default ModalEdit;
