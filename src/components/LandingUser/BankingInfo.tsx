import { Form, Input, Badge, Card } from "antd";
import { useState } from "react";
import { Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { uploadStepDocuments } from "../../utils/uploadStepDocuments";
import { verifyIBAN, submitApplication } from "../../redux/apis/apisCrudFactoring";
import RequiredDocFields from "./RequiredDocFields";
import toast from "react-hot-toast";

const BankingInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationNo = useSelector(
    (state: RootState) => state.block.applicationNo
  );
  const requiredDocuments = useSelector(
    (state: RootState) => state.block.requiredDocuments
  );
  const businessDetails = useSelector(
    (state: RootState) => state.block.businessDetails
  );

  // Get saved form data from location state
  const savedBankingData = (location.state as any)?.bankingData;
  const complianceFormData = (location.state as any)?.complianceFormData;
  const factoringFormData = (location.state as any)?.factoringFormData;
  const businessFormData = (location.state as any)?.businessFormData;

  const [formValues, setFormValues] = useState({
    iban: savedBankingData?.iban || "",
    application_no: applicationNo,
    application_step: "8",
  });

  // Dynamic required document files keyed by doc id
  const [docFiles, setDocFiles] = useState<Record<number, File | null>>({});
  const [loading, setLoading] = useState(false);
  const [ibanVerified, setIbanVerified] = useState(false);
  const [ibanData, setIbanData] = useState<any>(null);

  const handleDocFileChange = (docId: number, file: File | null) => {
    setDocFiles((prev) => ({ ...prev, [docId]: file }));
  };

  const handleVerifyIban = async () => {
    if (!formValues.iban) {
      toast.error("Please enter IBAN.");
      return;
    }

    setLoading(true);
    try {
      // Upload required documents for this step (validates required ones)
      const docsOk = await uploadStepDocuments(8, requiredDocuments, docFiles);
      if (!docsOk) {
        setLoading(false);
        return;
      }

      // Call IBAN verification API
      const fd = new FormData();
      fd.append("iban", formValues.iban);
      fd.append("application_no", applicationNo || "");
      fd.append("supplier_iqama_id", businessDetails?.supplier_national_id || "");

      const res = await verifyIBAN(fd);
      if (!res?.data?.success) {
        toast.error(res?.data?.message || "IBAN verification failed.");
        return;
      }

      toast.success(res?.data?.message || "IBAN verified successfully.");
      setIbanData(res.data.data);
      setIbanVerified(true);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("application_no", applicationNo || "");
      fd.append("application_step", "8");

      const res = await submitApplication(fd);
      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Application submission failed.");
        return;
      }

      toast.success(res?.data?.message || "Application submitted successfully.");

      navigate("/applyloan/finish", {
        state: {
          bankingData: formValues,
          complianceFormData: complianceFormData,
          factoringFormData: factoringFormData,
          businessFormData: businessFormData,
        },
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form>
        <Row className="mt-4 mb-3">
          <Col md={6}>
            <label
              className="mb-1 required-asterisk"
              style={{ fontWeight: 500 }}
            >
              IBAN
            </label>
            <Input
              placeholder="Enter IBAN"
              maxLength={24}
              minLength={24}
              className="form-control"
              value={formValues.iban}
              disabled={ibanVerified}
              onChange={(e) =>
                setFormValues({ ...formValues, iban: e.target.value })
              }
            />
          </Col>
        </Row>

        {/* Dynamic Required Documents for Step 8 */}
        <RequiredDocFields
          stepNo={8}
          docFiles={docFiles}
          onFileChange={handleDocFileChange}
        />
      </Form>

      {/* IBAN Verification Result Card */}
      {ibanVerified && ibanData && (
        <Card
          title="IBAN Verification Details"
          className="mb-4"
          style={{ borderRadius: "2px", border: "1px solid #e8e8e8" }}
          headStyle={{ background: "#f5f7fa", fontWeight: 600, fontSize: "16px" }}
        >
          <Row>
            <Col md={6} className="mb-3">
              <div style={{ color: "#999", fontSize: "13px", marginBottom: "4px" }}>
                Bank Name
              </div>
              <div style={{ fontWeight: 500, fontSize: "15px" }}>
                {ibanData?.bank?.bankName || "—"}
              </div>
            </Col>
            <Col md={6} className="mb-3">
              <div style={{ color: "#999", fontSize: "13px", marginBottom: "4px" }}>
                Bank Identifier
              </div>
              <div style={{ fontWeight: 500, fontSize: "15px" }}>
                {ibanData?.bank?.bankIdentifier || "—"}
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-3">
              <div style={{ color: "#999", fontSize: "13px", marginBottom: "4px" }}>
                Identity Number
              </div>
              <div style={{ fontWeight: 500, fontSize: "15px" }}>
                {ibanData?.identityNumber || "—"}
              </div>
            </Col>
            <Col md={6} className="mb-3">
              <div style={{ color: "#999", fontSize: "13px", marginBottom: "4px" }}>
                Beneficiary Name
              </div>
              <div style={{ fontWeight: 500, fontSize: "15px" }}>
                {ibanData?.beneficiaryName || "—"}
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <div style={{ color: "#999", fontSize: "13px", marginBottom: "4px" }}>
                Status
              </div>
              <Badge
                status={ibanData?.status === 1 ? "success" : "error"}
                text={
                  <span style={{ fontWeight: 500, fontSize: "14px" }}>
                    {ibanData?.status === 1 ? "Active" : "Inactive"}
                  </span>
                }
              />
            </Col>
          </Row>
        </Card>
      )}

      <div
        className="py-4"
        style={{ display: "flex", justifyContent: "flex-start", gap: 8 }}
      >
        <button
          className="step-buttons"
          style={{ background: "#616161", padding: "10px 5px", borderRadius: "0", minWidth: "100px", lineHeight: "24px" }}
          onClick={() => {
            navigate("/applyloan/factoringInfo", {
              state: {
                bankingData: formValues,
                complianceFormData: complianceFormData,
                factoringFormData: factoringFormData,
                businessFormData: businessFormData,
              },
            });
          }}
        >
          Previous
        </button>
        <button
          className="step-buttons"
          disabled={loading}
          style={{
            background: "#1963b9",
            padding: "10px 5px",
            borderRadius: "0",
            minWidth: "100px",
            lineHeight: "24px",
            opacity: loading ? 0.7 : 1,
          }}
          onClick={ibanVerified ? handleSubmitApplication : handleVerifyIban}
        >
          {loading
            ? "Processing..."
            : ibanVerified
            ? "Submit"
            : "Verify"}
        </button>
      </div>
    </>
  );
};

export default BankingInfo;
