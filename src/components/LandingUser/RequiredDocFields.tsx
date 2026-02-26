import React from "react";
import { Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";

interface Props {
  stepNo: number;
  docFiles: Record<number, File | null>;
  onFileChange: (docId: number, file: File | null) => void;
}

const RequiredDocFields: React.FC<Props> = ({ stepNo, docFiles, onFileChange }) => {
  const requiredDocuments = useSelector(
    (state: RootState) => state.block.requiredDocuments
  );

  const stepDocs = (requiredDocuments || []).filter(
    (doc: any) => Number(doc.step_no) === stepNo
  );

  if (stepDocs.length === 0) return null;

  return (
    <div className="mb-4">
      <h5
        className="mb-3"
        style={{ color: "#1963b9", fontWeight: 600, fontSize: "16px" }}
      >
        Required Documents
      </h5>
      <Row>
        {stepDocs.map((doc: any) => (
          <Col md={6} key={doc.id} className="mb-3">
            <label
              className={`mb-1 ${doc.is_required ? "required-asterisk" : ""}`}
              style={{ fontWeight: 500 }}
            >
              {doc.name_en}
            </label>
            <div className="d-flex align-items-center">
              <input
                type="file"
                id={`req_doc_${doc.id}`}
                style={{ display: "none" }}
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  onFileChange(doc.id, file);
                }}
              />
              <label
                htmlFor={`req_doc_${doc.id}`}
                className="btn btn-secondary btn-sm me-2"
                style={{ cursor: "pointer" }}
              >
                Choose File
              </label>
              <span style={{ fontSize: "14px" }}>
                {docFiles[doc.id]?.name || "No file chosen"}
              </span>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RequiredDocFields;
