import { Form, Input } from "antd";
import React from "react";

function RevenueDetails({ setSelectedTab }: any) {
  return (
    <div>
      <h5 className="mt-3 mb-3">Add Last 6 Month Revenue Details</h5>
      <Form className="mt-2">
        <div
          className="col-12 d-flex justify-content-between gap-5 mb-2"
          style={{ width: "96%" }}
        >
          <div className="col-6">
            <div>Month</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder="Enter your Month"
              className="shadow-none form-control modal-input"
            />
          </div>
          <div className="col-6">
            <div>Amount</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder="Enter your Amount"
              className="shadow-none form-control modal-input"
            />
          </div>
        </div>
        <div
          className="col-12 d-flex justify-content-between gap-5 mb-2"
          style={{ width: "96%" }}
        >
          <div className="col-6">
            <div>Month</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder="Enter your Month"
              className="shadow-none form-control modal-input"
            />
          </div>
          <div className="col-6">
            <div>Amount</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder="Enter your Amount"
              className="shadow-none form-control modal-input"
            />
          </div>
        </div>
        <div
          className="col-12 d-flex justify-content-between gap-5 mb-2"
          style={{ width: "96%" }}
        >
          <div className="col-6">
            <div>Month</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder="Enter your Month"
              className="shadow-none form-control modal-input"
            />
          </div>
          <div className="col-6">
            <div>Amount</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder="Enter your Amount"
              className="shadow-none form-control modal-input"
            />
          </div>
        </div>
        <div
          className="col-12 d-flex justify-content-between gap-5 mb-2"
          style={{ width: "96%" }}
        >
          <div className="col-6">
            <div>Month</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder="Enter your Month"
              className="shadow-none form-control modal-input"
            />
          </div>
          <div className="col-6">
            <div>Amount</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder="Enter your Amount"
              className="shadow-none form-control modal-input"
            />
          </div>
        </div>
        <div
          className="col-12 d-flex justify-content-between gap-5 mb-2"
          style={{ width: "96%" }}
        >
          <div className="col-6">
            <div>Month</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder="Enter your Month"
              className="shadow-none form-control modal-input"
            />
          </div>
          <div className="col-6">
            <div>Amount</div>
            <Input
              type="text"
              style={{ height: "44px", border: "transparent" }}
              placeholder="Enter your Amount"
              className="shadow-none form-control modal-input"
            />
          </div>
        </div>
        <div className="col-12 mb-2">
          <div>Month</div>
          <Input
            type="text"
            style={{ height: "44px", border: "transparent" }}
            placeholder="Enter your Month"
            className="shadow-none form-control modal-input"
          />
        </div>
        <div className="col-12 d-flex justify-content-end gap-2 mt-3">
          <button className="theme-btn">cancel</button>

          <button className="theme-btn">approve</button>
        </div>
      </Form>
    </div>
  );
}

export default RevenueDetails;
