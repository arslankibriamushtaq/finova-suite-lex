import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { Button } from "antd";

function KYC() {
  const [selectTab, setSelectedTab] = useState<string>("ConsumerManualVerification");
  const [comment, setComment] = useState<string>("");

  const tabOptions = [
    {
      title: "Consumer Manual Verification",
      key: "ConsumerManualVerification",
    },
    {
      title: "Consumer Verification",
      key: "ConsumerVerification",
    },
    {
      title: "Approve Consumer Verification",
      key: "ApproveConsumerVerification",
    },
  ];

  const handleApprove = () => {
    console.log("Approved with comment:", comment);
    // Add your approval logic here
  };

  const handleReject = () => {
    console.log("Rejected with comment:", comment);
    // Add your rejection logic here
  };

  return (
    <div>
      <Tabs
        id="kyc-tabs"
        className="mb-3"
        activeKey={selectTab}
        onSelect={(tab: any) => {
          setSelectedTab(tab);
        }}
      >
        {tabOptions.map((item: any) => (
          <Tab key={item.key} eventKey={item.key} title={item.title}>
            {selectTab === item.key && (
              <div>
                {/* Comment Box Section */}
                <div style={{ marginTop: "20px" }}>
                  <h6 style={{ marginBottom: "10px", fontWeight: 600 }}>Comment Box</h6>
                  <textarea
                    placeholder="Write comment here"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      padding: "10px",
                      border: "1px solid var(--color-border-light)",
                      borderRadius: "2px",
                      fontSize: "14px",
                      resize: "vertical",
                    }}
                  />
                  <div style={{ marginTop: "15px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <Button
                      danger
                      onClick={handleReject}
                      style={{ minWidth: "100px" }}
                    >
                      Reject
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleApprove}
                      style={{ minWidth: "100px" }}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}

export default KYC;