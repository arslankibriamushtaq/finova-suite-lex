import { Accordion, Button, } from "react-bootstrap";
import { useState } from "react";
import {
  deleteDisburseApprovedAmountApiLog,
  postDisburseApprovedAmount,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";

interface ApiLogEntry {
  timestamp: string;
  requestBody: string;
  responseBody: string;
  apiName: string;
  id: string;
  name: string;
  request: string;
  response: string;
  created: string;
  channel: string;
  anbStatus: number;
  message: string;
}

interface Props {
  logs: ApiLogEntry[];
  SetRefresh: any;
  logsByDate:boolean;
}

export const ApiLogAccordion = ({ logs, SetRefresh,logsByDate }: Props) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toggleAccordion = (key: string) => {
    setActiveKey(activeKey === key ? null : key);
  };
  const safeJsonParse = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Invalid JSON string:', jsonString);
      return jsonString; // Return the original string if parsing fails
    }
  };

  const retryDisburseApprovedAmount = async (payload: any) => {
    try {
      const parsedPayload = safeJsonParse(payload);
      const response = await postDisburseApprovedAmount(
        JSON.stringify(parsedPayload, null, 2)
      );
      setLoading(true);

      if (response.data?.success) {
        const data = response.data.data;
      } else {
        toast.error(response.data?.notificationMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  };
  const deleteLogEntry = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this log entry?"))
      return;
    try {
      setLoading(true);
      const response = await deleteDisburseApprovedAmountApiLog(id);
      if (response.data?.success) {
        toast.success("Log deleted successfully");
        SetRefresh((prev: any) => !prev); // reload logs if passed
      } else {
        toast.error(response.data?.notificationMessage || "Delete failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "Delete error");
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  return (
    <Accordion activeKey={activeKey}>
      {logs.map((log, index) => (
        <Accordion.Item
          eventKey={log.id || index.toString()}
          key={log.id || index.toString()}
          className="border-end-0 border-start-0"
        >
          <Accordion.Header onClick={() => toggleAccordion(log.id || index.toString())}>
            <div className="d-flex justify-content-between w-100 px-2 align-items-center fs-14 fw-600">
              {log.name || log?.apiName || log?.message}
              {
                !logsByDate &&
                <div>
                {log?.anbStatus === 2 && (
                  <Button
                    disabled={loading}
                    className="btn application-btn me-2"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); retryDisburseApprovedAmount(log?.request || log?.requestBody)}}
                  >
                    Retry
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  disabled={loading}
                  onClick={(e) => { e.stopPropagation(); deleteLogEntry(log.id)}}
                >
                  Delete
                </Button>
              </div>
              }
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <div className="mb-2 text-muted small">
              <strong>Date:</strong> {formatDate(log.created || log.timestamp)}
            </div>
            {(log.request || log.requestBody) && (
              <div className="mb-3">
                <strong>Request:</strong>
                <pre className="bg-light p-2 rounded">
                  {JSON.stringify(safeJsonParse(log.request || log.requestBody), null, 2)}
                </pre>
              </div>
            )}
            {(log.response || log.responseBody ) && (
              <div>
                <strong>Response:</strong>
                <pre className="bg-light p-2 rounded">
                  {JSON.stringify(safeJsonParse(log.response || log.responseBody), null, 2)}
                </pre>
              </div>
            )}
            {!log.request && !log.response && !log.requestBody && !log.responseBody && (
              <div>No request or response found.</div>
            )}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};
