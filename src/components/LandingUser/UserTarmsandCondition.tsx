import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { Checkbox } from "antd";
import { uploadStepDocuments } from "../../utils/uploadStepDocuments";
import RequiredDocFields from "./RequiredDocFields";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const UserTermsandCondition: React.FC = () => {
  const { t } = useTranslation("landingUser");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docFiles, setDocFiles] = useState<Record<number, File | null>>({});
  const navigate = useNavigate();
  const productDetails = useSelector((state: RootState) => state.block.productDetails);
  const requiredDocuments = useSelector((state: RootState) => state.block.requiredDocuments);

  const handleDocFileChange = (docId: number, file: File | null) => {
    setDocFiles((prev) => ({ ...prev, [docId]: file }));
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      const docsOk = await uploadStepDocuments(2, requiredDocuments, docFiles);
      if (!docsOk) return;
      navigate("/applyloan/businessdetails");
    } catch (error: any) {
      toast.error(error?.message || t("common.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  const termsHtml = productDetails?.product?.terms_and_conditions?.en;

  return (
    <div className="m-4">
      <div className="row mx-0 mb-3">
        <div className="col-12 tos">
          {termsHtml ? (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: termsHtml }}
            />
          ) : (
            <div>
              <h2 style={{ textAlign: "left" }}>{t("terms.notAvailable.title")}</h2>
              <p>{t("terms.notAvailable.desc")}</p>
            </div>
          )}

          {/* ✅ Checkbox Section */}
          <div className="col-6 form-check mt-3">
            <Checkbox
              checked = {agree}
              onChange={(e: any)=>setAgree(e?.target?.checked)}
            >
              {t("terms.agree")}
            </Checkbox>
          </div>

          {/* ✅ Hidden Fields */}
          <input
            type="hidden"
            className="form-control"
            id="details_business"
            name="details_business"
            value=""
          />
          <input
            type="hidden"
            className="form-control"
            id="details_consumer"
            name="details_consumer"
            value=""
          />
        </div>
        {/* Dynamic Required Documents for Step 2 */}
        <RequiredDocFields
          stepNo={2}
          docFiles={docFiles}
          onFileChange={handleDocFileChange}
        />

        <div
        className="py-4"
        style={{ display: "flex", justifyContent: "flex-start", gap: 8 }}
      >
        <button
          className="step-buttons"
          style={{ background: "#616161", padding: "10px 5px", borderRadius: "0", minWidth: "100px",lineHeight:"24px" }}
          onClick={() => {
            navigate("/applyloan/partner");
          }}
        >
          {t("common:previous")}
        </button>
        <button
          type="button"
          disabled={!agree || loading}
          className="step-buttons"
          style={{
            background: "#1963b9",
            padding: "10px 5px",
            borderRadius: "0",
            minWidth: "100px",
            lineHeight: "24px",
            opacity: !agree || loading ? 0.7 : 1,
          }}
          onClick={handleNext}
        >
          {loading ? t("action.submitting") : t("action.nextStep")}
        </button>
      </div>
      </div>
    </div>
  );
};

export default UserTermsandCondition;
