import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getReqDocument, requestDoc } from "../../redux/apis/apisCrud";
import TableView from "../TableView/TableView";
import Loader from "../Loader/Loader";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const RequestFinancialDocument = () => {
  const { t } = useTranslation("dashboard");
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDocuments();
    }
  }, [id]);

  const productId = useSelector((state: any) => state.block.productDetails?.product?.id);
  const fetchDocuments = async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      const response = await getReqDocument(productId);

      if (response?.data?.data?.data) {
        const docs = Array.isArray(response.data.data.data) ? response.data.data.data : [];
        setDocuments(docs);
      } else {
        toast.error(t("reqDoc.toast.loadFailed"));
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error?.response?.data?.message || error?.message || t("reqDoc.toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = documents.map((doc) => doc.id);
      setSelectedDocs(allIds);
    } else {
      setSelectedDocs([]);
    }
  };

  const handleSelectDoc = (docId: number) => {
    setSelectedDocs((prev) => {
      if (prev.includes(docId)) {
        return prev.filter((id) => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };

  const handleRequestDocument = async () => {
    if (!id) {
      toast.error(t("reqDoc.toast.appIdRequired"));
      return;
    }

    if (selectedDocs.length === 0) {
      toast.error(t("reqDoc.toast.selectOne"));
      return;
    }

    setRequesting(true);
    try {
      const body = {
        application_no: id,
        required_docs: selectedDocs
      };

      const response = await requestDoc(body);

      if (response?.data?.success || response?.status === 200) {
        toast.success(response?.data?.message || t("reqDoc.toast.requested"));
        setSelectedDocs([]);
        await fetchDocuments();
      } else {
        toast.error(response?.data?.message || t("reqDoc.toast.requestFailed"));
      }
    } catch (error: any) {
      console.error("Request Document Error:", error);
      toast.error(error?.response?.data?.message || error?.message || t("reqDoc.toast.requestFailed"));
    } finally {
      setRequesting(false);
    }
  };

  // Prepare table headers with checkbox column
  const headers = [
    {
      name: (
        <input
          type="checkbox"
          checked={documents.length > 0 && selectedDocs.length === documents.length}
          onChange={handleSelectAll}
          style={{ cursor: "pointer" }}
        />
      ),
      selector: (row: any) => (
        <input
          type="checkbox"
          checked={selectedDocs.includes(row.id)}
          onChange={() => handleSelectDoc(row.id)}
          style={{ cursor: "pointer" }}
        />
      ),
      width: "60px"
    },
    ...Object.keys(documents[0] || {})
      .filter((key) => key !== "id")
      .map((key) => ({
        name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        selector: (row: any) => row[key] || "--",
        sortable: true,
        grow: key.includes('name') || key.includes('description') ? 2 : undefined
      }))
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="d-flex flex-column gap-2" style={{ backgroundColor: "#FFF8", padding: "20px" }}>
        <div className="d-flex justify-content-end mb-1">
          <button 
            className="theme-btn-next"
            onClick={handleRequestDocument}
            disabled={requesting || selectedDocs.length === 0}
            style={{ opacity: requesting || selectedDocs.length === 0 ? 0.6 : 1 }}
          >
            {requesting ? t("reqDoc.requesting") : t("reqDoc.button")}
          </button>
        </div>

        {documents.length > 0 ? (
          <div className="mt-3">
            <TableView 
              header={headers} 
              data={documents}
            />
          </div>
        ) : (
          <div className="text-center p-4" style={{ color: "#6C6C6C" }}>
            {t("reqDoc.noDocuments")}
          </div>
        )}
      </div>
    </>
  );
};

export default RequestFinancialDocument;
