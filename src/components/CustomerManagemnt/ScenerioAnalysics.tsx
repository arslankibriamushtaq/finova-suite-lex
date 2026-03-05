import { Customer_List_Header } from "../../components/Config/TableHeaders";
import TableView from "../../components/TableView/TableView";
import { DatePicker, Select } from "antd";
import DynamicHeaderStructure from "../../components/DynamicHeaderStructure";
import TableHeaderFilter from "../TableHeaderFilter";
import { Input } from "antd";
import TextArea from "antd/es/input/TextArea";

const data = [
  {
    Customer: "jhdbfs",
    ProductName: "kajbdsf",
    ApplicationNo: "2235",
    CrNumber: "1234",
    Email: "11@gmail.com",
    Phone: "123456",
    Date: "12.34.2044",
    ParentStatus: "---",
    Status: "active",
    Action: "--",
  },
];
const button = [
  { title: "Important Values" },
  { title: "Caluculate" },
  { title: "Post to Account" },
];
const buttonSub = [{ title: "Add" }];
const ScenarioAnalysis = () => {
  return (
    <>
      <div className="cs-table p-2">
        <DynamicHeaderStructure title={"Field Investigation"} button={button} />
        <div className="col-md-10 pt-3">
          <div className="col-md-12 d-flex align-items-center">
            <div className="col-md-4 d-flex">
              <input type="checkbox" />

              <div className="ps-2 simple-text">Link to Account</div>
            </div>
            <div className="col-md-8 d-flex">
              <div className="col-md-4 d-flex">
                {" "}
                <input type="radio" />
                <div className="ps-2 simple-text">Calculate Payment</div>
              </div>
              <div className="col-md-4 d-flex">
                {" "}
                <input type="radio" />
                <div className="ps-2 simple-text">Calculate Terms</div>
              </div>
              <div className="col-md-4 d-flex">
                {" "}
                <input type="radio" />
                <div className="ps-2 simple-text">Calculate Balloon</div>
              </div>
            </div>
          </div>
          <h2
            className="col-md-12 pt-5 d-flex align-items-center"
            style={{
              fontSize: "14px",
              color: "var(--foreground)",
              lineHeight: "14px",
              textDecoration: "underline",
            }}
          >
            {"Loan Details"}
          </h2>
          <div className="col-md-12 d-flex pt-3">
            <div className="col-md-3">
              <div className="simple-text">Account Number</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Title</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
          </div>
          <div className="col-md-12 d-flex pt-3">
            <div className="col-md-3">
              <div className="simple-text">Product Category</div>
              <div className="pt-1">
                <Select className="w-90">
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                </Select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Txn Date</div>
              <div className="pt-1">
                <DatePicker className="col-11" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Contract Date</div>
              <div className="pt-1">
                <Select className="w-90">
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                </Select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Principle Amount</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
          </div>
          <div className="col-md-12 d-flex pt-3">
            <div className="col-md-3">
              <div className="simple-text">Rate</div>
              <div className="pt-1">
                <Select className="w-90">
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                </Select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Term</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Current Payment Amount</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Final Payment Amount</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
          </div>
          <div className="col-md-12 d-flex pt-3">
            <div className="col-md-3">
              <div className="simple-text">Add Interest Amount</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Next Payment Date</div>
              <div className="pt-1">
                <DatePicker className="col-11" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Extra Principle Amount</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Financed Fee</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
          </div>
          <div className="col-md-12 d-flex pt-3">
            <div className="col-md-3">
              <div className="simple-text">Current Maturity Date</div>
              <div className="pt-1">
                <DatePicker className="col-11" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Balloon Method</div>
              <div className="pt-1">
                <Select className="w-90">
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                </Select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Balloon Amount</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Total interest Amount</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
          </div>
          <div className="col-md-12 d-flex pt-3">
            <div className="col-md-3">
              <div className="simple-text">Rempt Type</div>
              <div className="pt-1">
                <Select className="w-90">
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                </Select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Skip Months</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Balloon Max Terms</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Billing Cycle</div>
              <div className="pt-1">
                <Select className="w-90">
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                </Select>
              </div>
            </div>
          </div>
          <div className="col-md-12 d-flex pt-3">
            <div className="col-md-3">
              <div className="simple-text">Accrual Base Method</div>
              <div className="pt-1">
                <Select className="w-90">
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                </Select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Installment Method</div>
              <div className="pt-1">
                <Select className="w-90">
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                </Select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Billing Method</div>
              <div className="pt-1">
                <Select className="w-90">
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                </Select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Time Counting Method</div>
              <div className="pt-1">
                <Select className="w-90">
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                </Select>
              </div>
            </div>
          </div>
          <div className="col-md-12 d-flex pt-3">
            <div className="col-md-3">
              <div className="simple-text">Calendar Method</div>
              <div className="pt-1">
                <Select className="w-90">
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                  <option value="1">Test</option>
                </Select>
              </div>
            </div>
          </div>
          <h2
            className="col-md-12 pt-5 d-flex align-items-center"
            style={{
              fontSize: "14px",
              color: "var(--foreground)",
              lineHeight: "14px",
              textDecoration: "underline",
            }}
          >
            {"First Period"}
          </h2>
          <div className="col-md-12 d-flex pt-3">
            <div className="col-md-3">
              <div className="simple-text">Calendar Days</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="simple-text">Interest Amount</div>
              <div className="pt-1">
                <Input type="text" className="w-90" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ScenarioAnalysis;
