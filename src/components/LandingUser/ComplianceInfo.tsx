import { Input, Form, Select } from "antd";
import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getPurposeOfFinancePublic,
  getSourceOfRevenuePublic,
} from "../../redux/apis/apisCrud";
import { getComplianceQuestions, storeComplianceAnswers } from "../../redux/apis/apisCrudFactoring";
import { uploadStepDocuments } from "../../utils/uploadStepDocuments";
import { RootState } from "../../redux/rootReducer";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import RequiredDocFields from "./RequiredDocFields";
import { useTranslation } from "react-i18next";
import "./Landing.css";

const { Option } = Select;

const ComplianceInfo: React.FC = () => {
  const { t } = useTranslation("landingUser");
  const navigate = useNavigate();
  const location = useLocation();

  const [complianceQuestions, setComplianceQuestions] = useState<any[]>([]);
  const [fatcaQuestions, setFatcaQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [docFiles, setDocFiles] = useState<Record<number, File | null>>({});

  const handleDocFileChange = (docId: number, file: File | null) => {
    setDocFiles((prev) => ({ ...prev, [docId]: file }));
  };

  const applicationNoFromRedux = useSelector(
    (state: RootState) => state.block.applicationNo
  );
  const userId = useSelector((state: RootState) => state.block.userId);
  const requiredDocuments = useSelector((state: RootState) => state.block.requiredDocuments);

  const savedComplianceFormData = (location.state as any)?.complianceFormData;
  const factoringFormData = (location.state as any)?.factoringFormData;
  const businessFormData = (location.state as any)?.businessFormData;

  const [purposes, setPurposes] = useState<any>([]);
  const [sources, setSources] = useState<any>([]);
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({
    applicationNumber:
      savedComplianceFormData?.applicationNumber || applicationNoFromRedux || "PaMy20DBE2063",
    purposeOfFactoring: savedComplianceFormData?.purposeOfFactoring || "Select",
    sourceOfIncome: savedComplianceFormData?.sourceOfIncome || "Select",
    
    // Compliance Questions
    politicallyExposed: savedComplianceFormData?.politicallyExposed || "no",
    businessOwner: savedComplianceFormData?.businessOwner || "yes",
    beneficiaryOwner: savedComplianceFormData?.beneficiaryOwner || "no",
    legalProblem: savedComplianceFormData?.legalProblem || "no",
    simahDefault: savedComplianceFormData?.simahDefault || "yes",
    realBeneficial: savedComplianceFormData?.realBeneficial || "no",
    
    // FATCA Questions
    taxResident: savedComplianceFormData?.taxResident || "no",
    bornIn: savedComplianceFormData?.bornIn || "no",
    resided31Days: savedComplianceFormData?.resided31Days || "no",
    resided183Days: savedComplianceFormData?.resided183Days || "no",
    residency: savedComplianceFormData?.residency || "no",
    
    // Entity ownership details
    entityType: savedComplianceFormData?.entityType || "publicly_owned",
    saudiFundsAccount: savedComplianceFormData?.saudiFundsAccount || "yes",
    cftRequirements: savedComplianceFormData?.cftRequirements || "yes",
    externalAuditing: savedComplianceFormData?.externalAuditing || "yes",
    internalAuditing: savedComplianceFormData?.internalAuditing || "yes",
    trainingProgram: savedComplianceFormData?.trainingProgram || "yes",
    studyRisk: savedComplianceFormData?.studyRisk || "yes",
    disabilityStatus: savedComplianceFormData?.disabilityStatus || "no",
  });

  useEffect(() => {
    fetchComplianceQuestions();
    // Uncomment when APIs are ready
    // getPurposeList();
    // getSourceList();
  }, []);

  const fetchComplianceQuestions = async () => {
    try {
      const res = await getComplianceQuestions();
      if (res?.data?.success && res?.data?.data) {
        const apiData = res.data.data;

        // Handle paginated response: questions are in apiData.data
        const questions: any[] = Array.isArray(apiData.data)
          ? apiData.data
          : Array.isArray(apiData)
          ? apiData
          : [];

        // Split by category
        const compliance = questions.filter((q: any) => q.category === "compliance");
        const fatca = questions.filter((q: any) => q.category === "fatca");

        if (compliance.length > 0) setComplianceQuestions(compliance);
        if (fatca.length > 0) setFatcaQuestions(fatca);
      }
    } catch (error: any) {
      console.error("Error fetching compliance questions:", error);
    }
  };

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const getPurposeList = async () => {
    try {
      const res = await getPurposeOfFinancePublic();
      if (res) {
        const data = res?.data?.data?.data;
        setPurposes(data);
      }
    } catch (error: any) {
      console.error("Error fetching Financing purpose:", error);
    }
  };

  const getSourceList = async () => {
    try {
      const res = await getSourceOfRevenuePublic();
      if (res) {
        const data = res?.data?.data?.data;
        setSources(data);
      }
    } catch (error: any) {
      console.error("Error fetching source of revenue:", error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("user_id", String(userId || ""));
      fd.append("application_no", applicationNoFromRedux || "");
      fd.append("application_step", "6");

      const allQuestions = [...complianceQuestions, ...fatcaQuestions];
      let idx = 0;
      for (const q of allQuestions) {
        const answer = answers[q.id];
        if (answer !== undefined && answer !== null && answer !== "") {
          fd.append(`answers[${idx}][question_id]`, String(q.id));
          if (answer instanceof File) {
            fd.append(`answers[${idx}][answer]`, answer);
          } else {
            fd.append(`answers[${idx}][answer]`, String(answer));
          }
          idx++;
        }
      }

      const res = await storeComplianceAnswers(fd);
      if (!res?.data?.success) {
        toast.error(res?.data?.message || t("compliance.toast.storeFailed"));
        return;
      }

      toast.success(res?.data?.message || t("compliance.toast.storeSuccess"));

      // Upload dynamic required documents for this step
      const docsOk = await uploadStepDocuments(6, requiredDocuments, docFiles);
      if (!docsOk) return;

      navigate("/applyloan/factoringInfo", {
        state: {
          complianceFormData: formValues,
          factoringFormData: factoringFormData,
          businessFormData: businessFormData,
        },
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || error?.message || t("common.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  const renderDynamicQuestion = (q: any) => {
    // Radio type with list of values → Select dropdown
    if (q.type === "radio" && q.lov_data && q.lov_data.length > 0) {
      return (
        <Row className="mb-3" key={q.id}>
          <Col md={6}>
            <label className="mb-2" style={{ fontWeight: 500, fontSize: "14px", color: "#333" }}>
              {q.question}
            </label>
            <Select
              placeholder={t("compliance.select")}
              value={answers[q.id] || undefined}
              onChange={(value: string) => handleAnswerChange(q.id, value)}
              style={{ width: "100%" }}
            >
              {q.lov_data.map((opt: any) => (
                <Option key={opt.title} value={opt.title}>
                  {opt.title}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      );
    }

    // Radio type without lov_data → Yes/No pills
    if (q.type === "radio") {
      return (
        <div className="d-flex mb-3 justify-content-between align-items-center" key={q.id}>
          <div style={{ flex: 1, fontSize: "14px", color: "#333" }}>{q.question}</div>
          <div className="pill-group">
            <label className="pill">
              <input
                type="radio"
                name={`question_${q.id}`}
                value="yes"
                checked={answers[q.id] === "yes"}
                onChange={() => handleAnswerChange(q.id, "yes")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:yes")}</span>
              </span>
            </label>
            <label className="pill">
              <input
                type="radio"
                name={`question_${q.id}`}
                value="no"
                checked={answers[q.id] === "no"}
                onChange={() => handleAnswerChange(q.id, "no")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:no")}</span>
              </span>
            </label>
          </div>
        </div>
      );
    }

    // Text type → Input
    if (q.type === "text") {
      return (
        <Row className="mb-3" key={q.id}>
          <Col md={6}>
            <label className="mb-2" style={{ fontWeight: 500, fontSize: "14px", color: "#333" }}>
              {q.question}
            </label>
            <Input
              placeholder={t("compliance.enterAnswer")}
              className="form-control"
              value={answers[q.id] || ""}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            />
          </Col>
        </Row>
      );
    }

    // PDF / File type → File upload
    if (q.type === "pdf" || q.type === "file") {
      return (
        <Row className="mb-3" key={q.id}>
          <Col md={6}>
            <label className="mb-2" style={{ fontWeight: 500, fontSize: "14px", color: "#333" }}>
              {q.question}
            </label>
            <div className="d-flex align-items-center">
              <input
                type="file"
                id={`question_file_${q.id}`}
                style={{ display: "none" }}
                accept={q.type === "pdf" ? ".pdf" : ".pdf,.png,.jpg,.jpeg"}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleAnswerChange(q.id, file);
                }}
              />
              <label
                htmlFor={`question_file_${q.id}`}
                className="btn btn-secondary btn-sm me-2"
                style={{ cursor: "pointer" }}
              >
                {t("action.chooseFile")}
              </label>
              <span style={{ fontSize: "14px" }}>
                {answers[q.id]?.name || t("action.noFileChosen")}
              </span>
            </div>
          </Col>
        </Row>
      );
    }

    // Default fallback → text input
    return (
      <Row className="mb-3" key={q.id}>
        <Col md={6}>
          <label className="mb-2" style={{ fontWeight: 500, fontSize: "14px", color: "#333" }}>
            {q.question}
          </label>
          <Input
            placeholder="Enter your answer"
            className="form-control"
            value={answers[q.id] || ""}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
          />
        </Col>
      </Row>
    );
  };

  return (
    <>
      <Form>
        {/* Application Info */}
        <Row className="mb-4">
          <Col md={12}>
            <label
              className="mb-2"
              style={{ fontWeight: 500, fontSize: "14px", color: "#666" }}
            >
              {t("compliance.applicationNo.label")}
            </label>
            <Input
              placeholder={t("compliance.applicationNo.placeholder")}
              className="form-control"
              value={formValues.applicationNumber}
              readOnly
              style={{ backgroundColor: "#f5f5f5" }}
            />
          </Col>
        </Row>

        {/* Compliance Questions Section */}
        <h5 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", color: "#333" }}>
          {t("compliance.complianceQuestions")}
        </h5>
        <div className="mb-4">
          {complianceQuestions.map(renderDynamicQuestion)}
        </div>

        {/* Purpose of Factoring */}
        <Row className="mb-3">
          <Col md={6}>
            <label className="mb-2" style={{ fontWeight: 500, fontSize: "14px", color: "#666" }}>
              {t("compliance.purposeOfFactoring")}
            </label>
            <Select
              placeholder={t("compliance.select")}
              value={formValues.purposeOfFactoring}
              onChange={(value) => handleChange("purposeOfFactoring", value)}
              style={{ width: "100%" }}
            >
              <Option value="Select">{t("compliance.select")}</Option>
              {purposes?.map((item: any) => (
                <Option key={item.id} value={item.title}>
                  {item.title}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Source of Income */}
          <Col md={6}>
            <label className="mb-2" style={{ fontWeight: 500, fontSize: "14px", color: "#666" }}>
              {t("compliance.sourceOfRevenue")}
            </label>
            <Select
              placeholder={t("compliance.select")}
              value={formValues.sourceOfIncome}
              onChange={(value) => handleChange("sourceOfIncome", value)}
              style={{ width: "100%" }}
            >
              <Option value="Select">{t("compliance.select")}</Option>
              {sources?.map((item: any) => (
                <Option key={item.id} value={item.title}>
                  {item.title}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Entity Type */}
        <Row className="mb-4">
          <Col md={12}>
            <div className="d-flex mb-3 justify-content-between align-items-center">
              <div style={{ flex: 1, fontSize: "14px", color: "#333" }}>
                {t("compliance.entity.question")}
              </div>
              <div className="pill-group">
                <label className="pill">
                  <input
                    type="radio"
                    name="entityType"
                    value="publicly_owned"
                    checked={formValues.entityType === "publicly_owned"}
                    onChange={() => handleChange("entityType", "publicly_owned")}
                  />
                  <span className="visual">
                    <span className="dot" />
                    <span>{t("compliance.entity.publiclyOwned")}</span>
                  </span>
                </label>
                <label className="pill">
                  <input
                    type="radio"
                    name="entityType"
                    value="partly_owned"
                    checked={formValues.entityType === "partly_owned"}
                    onChange={() => handleChange("entityType", "partly_owned")}
                  />
                  <span className="visual">
                    <span className="dot" />
                    <span>{t("compliance.entity.partlyOwned")}</span>
                  </span>
                </label>
                <label className="pill">
                  <input
                    type="radio"
                    name="entityType"
                    value="audit_exchange"
                    checked={formValues.entityType === "audit_exchange"}
                    onChange={() => handleChange("entityType", "audit_exchange")}
                  />
                  <span className="visual">
                    <span className="dot" />
                    <span>{t("compliance.entity.auditExchange")}</span>
                  </span>
                </label>
              </div>
            </div>
          </Col>
        </Row>

        {/* Additional Questions */}
        <div className="d-flex mb-3 justify-content-between align-items-center">
          <div style={{ flex: 1, fontSize: "14px", color: "#333" }}>
            {t("compliance.q.saudiFundsAccount")}
          </div>
          <div className="pill-group">
            <label className="pill">
              <input
                type="radio"
                name="saudiFundsAccount"
                value="yes"
                checked={formValues.saudiFundsAccount === "yes"}
                onChange={() => handleChange("saudiFundsAccount", "yes")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:yes")}</span>
              </span>
            </label>
            <label className="pill">
              <input
                type="radio"
                name="saudiFundsAccount"
                value="no"
                checked={formValues.saudiFundsAccount === "no"}
                onChange={() => handleChange("saudiFundsAccount", "no")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:no")}</span>
              </span>
            </label>
          </div>
        </div>

        <div className="d-flex mb-3 justify-content-between align-items-center">
          <div style={{ flex: 1, fontSize: "14px", color: "#333" }}>
            {t("compliance.q.cftRequirements")}
          </div>
          <div className="pill-group">
            <label className="pill">
              <input
                type="radio"
                name="cftRequirements"
                value="yes"
                checked={formValues.cftRequirements === "yes"}
                onChange={() => handleChange("cftRequirements", "yes")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:yes")}</span>
              </span>
            </label>
            <label className="pill">
              <input
                type="radio"
                name="cftRequirements"
                value="no"
                checked={formValues.cftRequirements === "no"}
                onChange={() => handleChange("cftRequirements", "no")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:no")}</span>
              </span>
            </label>
          </div>
        </div>

        <div className="d-flex mb-3 justify-content-between align-items-center">
          <div style={{ flex: 1, fontSize: "14px", color: "#333" }}>
            {t("compliance.q.externalAuditing")}
          </div>
          <div className="pill-group">
            <label className="pill">
              <input
                type="radio"
                name="externalAuditing"
                value="yes"
                checked={formValues.externalAuditing === "yes"}
                onChange={() => handleChange("externalAuditing", "yes")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:yes")}</span>
              </span>
            </label>
            <label className="pill">
              <input
                type="radio"
                name="externalAuditing"
                value="no"
                checked={formValues.externalAuditing === "no"}
                onChange={() => handleChange("externalAuditing", "no")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:no")}</span>
              </span>
            </label>
          </div>
        </div>

        <div className="d-flex mb-3 justify-content-between align-items-center">
          <div style={{ flex: 1, fontSize: "14px", color: "#333" }}>
            {t("compliance.q.internalAuditing")}
          </div>
          <div className="pill-group">
            <label className="pill">
              <input
                type="radio"
                name="internalAuditing"
                value="yes"
                checked={formValues.internalAuditing === "yes"}
                onChange={() => handleChange("internalAuditing", "yes")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:yes")}</span>
              </span>
            </label>
            <label className="pill">
              <input
                type="radio"
                name="internalAuditing"
                value="no"
                checked={formValues.internalAuditing === "no"}
                onChange={() => handleChange("internalAuditing", "no")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:no")}</span>
              </span>
            </label>
          </div>
        </div>

        <div className="d-flex mb-3 justify-content-between align-items-center">
          <div style={{ flex: 1, fontSize: "14px", color: "#333" }}>
            {t("compliance.q.trainingProgram")}
          </div>
          <div className="pill-group">
            <label className="pill">
              <input
                type="radio"
                name="trainingProgram"
                value="yes"
                checked={formValues.trainingProgram === "yes"}
                onChange={() => handleChange("trainingProgram", "yes")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:yes")}</span>
              </span>
            </label>
            <label className="pill">
              <input
                type="radio"
                name="trainingProgram"
                value="no"
                checked={formValues.trainingProgram === "no"}
                onChange={() => handleChange("trainingProgram", "no")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:no")}</span>
              </span>
            </label>
          </div>
        </div>

        <div className="d-flex mb-4 justify-content-between align-items-center">
          <div style={{ flex: 1, fontSize: "14px", color: "#333" }}>
            {t("compliance.q.studyRisk")}
          </div>
          <div className="pill-group">
            <label className="pill">
              <input
                type="radio"
                name="studyRisk"
                value="yes"
                checked={formValues.studyRisk === "yes"}
                onChange={() => handleChange("studyRisk", "yes")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:yes")}</span>
              </span>
            </label>
            <label className="pill">
              <input
                type="radio"
                name="studyRisk"
                value="no"
                checked={formValues.studyRisk === "no"}
                onChange={() => handleChange("studyRisk", "no")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:no")}</span>
              </span>
            </label>
          </div>
        </div>

        {/* FATCA Questions Section */}
        <h5 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", marginTop: "24px", color: "#333" }}>
          {t("compliance.fatcaQuestions")}
        </h5>
        <div className="mb-4">
          {fatcaQuestions.map(renderDynamicQuestion)}
        </div>

        {/* Disability Status */}
        <div className="d-flex mb-4 justify-content-between align-items-center">
          <div style={{ flex: 1, fontSize: "14px", color: "#333" }}>
            {t("compliance.q.disabilityStatus")}
          </div>
          <div className="pill-group">
            <label className="pill">
              <input
                type="radio"
                name="disabilityStatus"
                value="yes"
                checked={formValues.disabilityStatus === "yes"}
                onChange={() => handleChange("disabilityStatus", "yes")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:yes")}</span>
              </span>
            </label>
            <label className="pill">
              <input
                type="radio"
                name="disabilityStatus"
                value="no"
                checked={formValues.disabilityStatus === "no"}
                onChange={() => handleChange("disabilityStatus", "no")}
              />
              <span className="visual">
                <span className="dot" />
                <span>{t("common:no")}</span>
              </span>
            </label>
          </div>
        </div>
        {/* Dynamic Required Documents for Step 6 */}
        <RequiredDocFields
          stepNo={6}
          docFiles={docFiles}
          onFileChange={handleDocFileChange}
        />
      </Form>

      {/* Action Buttons */}
      <div
        className="py-4"
        style={{ display: "flex", justifyContent: "flex-start", gap: 8 }}
      >
        <button
          className="step-buttons"
          style={{ background: "#616161", padding: "10px 5px", borderRadius: "0", minWidth: "100px",lineHeight:"24px" }}
          onClick={() => {
            navigate("/applyloan/factoringInfo", {
              state: {
                complianceFormData: formValues,
                factoringFormData: factoringFormData,
                businessFormData: businessFormData,
              },
            });
          }}
        >
          {t("common:previous")}
        </button>
        <button
          className="step-buttons"
          style={{ background: "#1963b9", padding: "10px 5px", borderRadius: "0", minWidth: "100px",lineHeight:"24px" }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? t("action.submitting") : t("action.nextStep")}
        </button>
      </div>
    </>
  );
};

export default ComplianceInfo;
