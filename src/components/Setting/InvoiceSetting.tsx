import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, message } from "antd";
import { GetCompanyData,GetVatNumberData, updateCompanyData, updateVatNumber } from "../../redux/apis/apisCrudLms";
import Loader from "../Loader/Loader";

const { Option } = Select;

function InvoiceSetting() {
  const [form] = Form.useForm();
  const [vatData,setVatData]= useState<any>([]);
  const [companyData,setCompanyData]= useState<any>([]);
  const [loader, setLoader] = useState(true);
useEffect(() => {
  getCompanydata();
  getVatdata();
}, [])
const getCompanydata= async () =>{
  //setLoader(true);
const res =await GetCompanyData();
 const data = res?.data?.data || [];
 setCompanyData(data)
if (data.length > 0) {
    form.setFieldsValue({
      CompanyName: data[0]?.companyName,
      Address: data[0]?.address,
      // type: "B2B", // default type
    });
  }
  setLoader(false);
}
const getVatdata= async () =>{
  //setLoader(true);
const res =await GetVatNumberData();
 const data = res?.data?.data || [];
 setVatData(data);
if (data.length > 0) {
    form.setFieldsValue({
      type: data[0]?.invoiceType,
      vatNumber: data[0]?.vatNumber,
      description:data[0]?.invoiceDiscription,
    });
  }
  setLoader(false);
}
  const onFinish = async (values: any) => {
    try {
      // Split values for each API
      const { CompanyName, Address, type, vatNumber, description } = values;

      // 1st API for company name and address
      const companyPayload = {
        companyId:companyData[0]?.id,
        companyName:CompanyName,
        address:Address,
      };

      // 2nd API for other fields
      const invoicePayload = {
        id:vatData[0]?.id,
        invoiceType:type,
        vatNumber,
        invoiceDiscription:description,
      };

      // Example: Replace with your API calls
      const companyResponse = await updateCompanyData(companyPayload);

      const invoiceResponse = await updateVatNumber(invoicePayload)

      if (!companyResponse?.data?.success || !invoiceResponse?.data?.success) {
        throw new Error("One of the APIs failed");
      }

      message.success("Invoice settings saved successfully!");
      // form.resetFields();
    } catch (error: any) {
      message.error(error.message || "Something went wrong!");
    }
  };

  return (
    <div className="p-4">
      {loader && <Loader />}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        // initialValues={{CompanyName:companyData[0]?.companyName, type: "B2B" }}
      >
        <div className="row">
          <div className="col-6">
            <Form.Item
              label="Company Name"
              name="CompanyName"
              rules={[{ required: true, message: "Please enter company name" }]}
            >
              <Input 
                style={{height:'40px'}}
               placeholder="Enter company name" />
            </Form.Item>
          </div>
          <div className="col-6">
            <Form.Item
              label="Address"
              name="Address"
              rules={[{ required: true, message: "Please enter address" }]}
            >
              <Input style={{height:'40px'}} placeholder="Enter address" />
            </Form.Item>
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: "Please select type" }]}
            >
              <Select>
                <Option value="B2C">B2C</Option>
                {/* <Option value="B2B">B2B</Option> */}
              </Select>
            </Form.Item>
          </div>
          <div className="col-6">
            {" "}
            <Form.Item
              label="VAT Number"
              name="vatNumber"
              rules={[{ required: true, message: "Please enter VAT number" }]}
            >
              <Input style={{height:'40px'}} placeholder="Enter VAT number" />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          label="Description"
          name="description"
        //   rules={[{ required: true, message: "Please enter description" }]}
        >
          <Input.TextArea rows={3} placeholder="Enter description" />
        </Form.Item>

        <Form.Item className="d-flex justify-content-end">
          <Button type="primary" htmlType="submit" className="application-btn">
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default InvoiceSetting;
