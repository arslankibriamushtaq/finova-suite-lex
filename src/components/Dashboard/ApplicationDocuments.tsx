import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tab, Tabs, Form, Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { getReqDocument, requestApplicationDocuments } from "../../redux/apis/apisCrud";
import TableView from "../TableView/TableView";
import { useSelector } from "react-redux";
import Loader from "../Loader/Loader";

interface Document {
  id: number;
  name: string;
  type: string;
  status: number;
  slug: string | null;
  created_at: string;
  created_by: string;
}

function ApplicationDocuments() {
  const [activeTab, setActiveTab] = useState("RequestDocuments");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [loadingUploaded, setLoadingUploaded] = useState(false);
  const [requiredDocumentsData, setRequiredDocumentsData] = useState<any>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get product ID from Redux store
  const productId = useSelector((state: any) => state.block.productDetails?.product?.id);

  

  // Fetch required documents and uploaded documents
  useEffect(() => {
    fetchDocuments();
    if (activeTab === "ViewDocuments") {
      // Fetch required documents for the table
      if (productId) {
        getInfo(productId);
      }
    }
  }, [id, activeTab, productId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Use product ID from Redux store
 
      
      const response = await getReqDocument(productId, undefined);
      
      if (response?.data?.success) {
        // Access the nested data array: response.data.data.data
        const documentsData = response.data.data?.data || [];
        setDocuments(documentsData);
      }
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (documentId: number) => {
    setSelectedDocuments((prev) => {
      if (prev.includes(documentId)) {
        return prev.filter((id) => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  const getInfo = async (productId: any) => {
    try {
      setLoadingUploaded(true);
      const response = await getReqDocument(productId, undefined);
      if (response) {
        const data = response?.data?.data?.data;
        setRequiredDocumentsData(data);
      }
    } catch (error: any) {
      console.error("Error fetching required documents:", error);
      toast.error(error?.message || "Failed to fetch required documents");
    } finally {
      setLoadingUploaded(false);
    }
  };


  const handleRequestNow = async () => {
    if (selectedDocuments.length === 0) {
      toast.error("Please select at least one document");
      return;
    }

    try {
      setRequesting(true);
      const body = {
        application_no: id,
        required_docs: selectedDocuments
      };
      const response = await requestApplicationDocuments(body);
      
      if (response?.data?.success) {
        toast.success(response?.data?.message || "Documents requested successfully");
        setSelectedDocuments([]);
      } else {
        toast.error(response?.data?.message || "Failed to request documents");
      }
    } catch (error: any) {
      console.error("Error requesting documents:", error);
      toast.error(error?.response?.data?.message || "Failed to request documents");
    } finally {
      setRequesting(false);
    }
  };

  const handleViewAllDocuments = () => {
    // Navigate to ProductManagement RequiredDoc tab with the product ID
    if (productId) {
      navigate(`/ProductManagement/RequiredDoc?id=${productId}`);
    } else {
      navigate("/ProductManagement/RequiredDoc");
    }
  };

  // Define column structure for TableView
  const headers = [
    { name: "Name", selector: (row: any) => row.name, sortable: true },
    { name: "Type", selector: (row: any) => row.type, sortable: true },
    { name: "Requested By", selector: (row: any) => row.created_by || "-", sortable: true },
    { name: "Updated By", selector: (row: any) => row.created_by || "-", sortable: true },
    { name: "Request Date", selector: (row: any) => row.created_at || "-", sortable: true },
    {
      name: "Status",
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "2px",
            backgroundColor: row.status ? "var(--color-success)" : "var(--color-error)",
            color: "white",
          }}
        >
          {row.status ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      name: "Document",
      cell: () => (
        <span className="text-muted">Required</span>
      ),
    },
    {
      name: "Action",
      cell: () => (
        <span className="text-muted">-</span>
      ),
    },
  ];

  // Map data similar to requiredDoc component
  const mappedRequiredDocuments = requiredDocumentsData && requiredDocumentsData.map((item: any) => {
    return {
      id: item.id,
      name: item?.name,
      type: item?.type,
      created_by: item?.created_by,
      created_at: item?.created_at,
      status: item?.status,
    };
  });

  return (
    <div className="application-documents-container" style={{ padding: "20px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontSize: "24px", fontWeight: "600", margin: 0 }}>
          Application Documents
        </h2>
        <Button
          variant="link"
          onClick={() => navigate(-1)}
          style={{ textDecoration: "none", color: "#666" }}
        >
          ← Back
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(tab: any) => setActiveTab(tab)}
        className="mb-4"
      >
        {/* Request Documents Tab */}
        <Tab eventKey="RequestDocuments" title="Request Documents">
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "2px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>
                Please select documents required for this application:
              </h5>
              <Button
                variant="danger"
                onClick={handleViewAllDocuments}
                style={{
                  backgroundColor: "#000000",
                  borderColor: "#000000",
                  padding: "8px 20px",
                }}
              >
                View All Documents
              </Button>
            </div>

            {loading ? (
              <Loader />
            ) : (
              <>
                <div style={{ minHeight: "300px" }}>
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          padding: "15px 0",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        <Form.Check
                          type="checkbox"
                          id={`doc-${doc.id}`}
                          label={doc.name}
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => handleCheckboxChange(doc.id)}
                          style={{ fontSize: "15px" }}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-5">
                      <p style={{ color: "#666", margin: 0 }}>
                        No documents available
                      </p>
                    </div>
                  )}
                </div>

             
                  <div className="text-end mt-4">
                    <Button
                      variant="danger"
                      onClick={handleRequestNow}
                      disabled={requesting}
                      style={{
                        backgroundColor: "#000000",
                        borderColor: "#000000",
                        padding: "10px 30px",
                        minWidth: "150px",
                      }}
                    >
                      {requesting ? "Requesting..." : "Request now"}
                    </Button>
                  </div>
             
              </>
            )}
          </div>
        </Tab>

        {/* View Documents Tab */}
        <Tab eventKey="ViewDocuments" title="View Documents">
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "2px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              minHeight: "400px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>
                Documents against this application
              </h5>
              <Button
                variant="danger"
                onClick={handleViewAllDocuments}
                style={{
                  backgroundColor: "#000000",
                  borderColor: "#000000",
                  padding: "8px 20px",
                }}
              >
                View All Documents
              </Button>
            </div>
            
            {loadingUploaded ? (
              <Loader />
            ) : (mappedRequiredDocuments && mappedRequiredDocuments.length > 0) ? (
              <TableView
                header={headers}
                data={mappedRequiredDocuments}
                totalRows={mappedRequiredDocuments.length}
                isLoading={loadingUploaded}
                from={1}
                page={1}
                totalPage={1}
                setPage={() => {}}
                pageSize={mappedRequiredDocuments.length || 15}
                setPageSize={() => {}}
                to={mappedRequiredDocuments.length}
              />
            ) : (
              <div className="text-center py-5">
                <p style={{ color: "#666", margin: 0 }}>
                  No Record Found
                </p>
              </div>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default ApplicationDocuments;

