import React from "react";

const LoanApproval = () => {
  const actionOptions = [
    {
      children: [
        { label: "Requested Loan Amount:", value: "2,000.00" },
        { label: "Processing Fee:", value: "SR 0.00" },
        { label: "Profit (0 %):", value: "SR 0.00" },
        { label: "Total Repayment Amount:", value: "SR 2,000.00" },
        { label: "Total Payable Amount to Customer :", value: "SR 1,970.00" },
      ],
    },
  ];

  return (
    <>
      <div className="col-12 myTab">
        <div className="card-body">
          <div className="col-12 myTab">
            <div className="card mb-4">
              <div className="p-2">
                <div className="row">
                  {actionOptions.map((item) => (
                    <>
                      <div className="col-md-6">
                        {item.children
                          ?.slice(0, Math.ceil(item.children.length / 2))
                          .map((item: any) => (
                            <>
                              <div className="flex-mode">
                                <div className="flex-heading">{item.label}</div>
                                <div className="flex-text">{item.value}</div>
                              </div>
                            </>
                          ))}
                      </div>
                      <div className="col-md-6">
                        {item.children
                          ?.slice(Math.ceil(item.children.length / 2))
                          .map((item: any) => (
                            <>
                              <div className="flex-mode">
                                <div className="flex-heading">{item.label}</div>
                                <div className="flex-text">{item.value}</div>
                              </div>
                            </>
                          ))}
                      </div>
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div></div>
    </>
  );
};
export default LoanApproval;
