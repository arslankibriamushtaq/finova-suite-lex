import React, { useState } from "react";

type InProgressApp = {
  ref: string;
  amount: string;
  invoices: number;
  submittedAt: string;
  status: string;
};

type AcceptedApp = {
  ref: string;
  debtor?: string;
  invoice?: string;
  dueDate?: string;
  amount?: string;
};
type ApplicationsTabsProps = {
  inProgress?: InProgressApp[];
  accepted?: AcceptedApp[];
};
function ApplicationsTabs({ inProgress = [], accepted = [] }: ApplicationsTabsProps) {
  const [tab, setTab] = useState("inprogress");

  return (
    <div className="applications-tabs">
      {/* Tabs header */}
      <div className="d-flex gap-2 mb-1">
        <button
          className={`apptab ${tab === "inprogress" ? "active" : ""}`}
          onClick={() => setTab("inprogress")}
          type="button"
        >
          In progress
        </button>
        <button
          className={`apptab ${tab === "accepted" ? "active" : ""}`}
          onClick={() => setTab("accepted")}
          type="button"
        >
          Accepted
        </button>
      </div>

      {/* Panel */}
      <div className="panel shadow-sm rounded-3 p-3">
        {tab === "inprogress" && (
          <>
            {inProgress.length === 0 ? (
              <div className="text-muted py-4 text-center">
                No applications in progress.
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-3">
                {inProgress.map((item, i) => (
                  <div key={i} className="app-card rounded-3 p-3 shadow-sm">
                    <div className="mb-2">{item.ref}</div>
                    <div className="fs-3 fw-semibold">{item.amount}</div>

                    <div className="mt-2" style={{fontSize: "12px"}}>
                      <div className="d-flex mt-2">
                        <span className="me-auto">Invoices:</span>
                        <span>{item.invoices}</span>
                      </div>
                      <div className="d-flex mt-2">
                        <span className="me-auto">Submitted Date:</span>
                        <span>{item.submittedAt}</span>
                      </div>
                      <div className="d-flex mt-2">
                        <span className="me-auto">Status:</span>
                        <span className="text-uppercase">{item.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "accepted" && (
          <>
            {accepted.length === 0 ? (
              <div className="text-muted py-4 text-center">
                No accepted applications yet.
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-3">
                {accepted.map((item, i) => (
                  <div key={i} className="app-card rounded-3 p-3 shadow-sm">
                    {/* render accepted card similarly */}
                    <div className="mb-2 fw-semibold">{item.ref}</div>
                    <div className="fs-4 fw-bold">{item.amount}</div>
                    <div className="small mt-2 text-secondary">Accepted</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ApplicationsTabs;
