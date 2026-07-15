import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Input, Button, Select, message } from "antd";
import { GetCompanyData,GetVatNumberData, updateCompanyData, updateVatNumber } from "../../redux/apis/apisCrudLms";
import Loader from "../Loader/Loader";

const { Option } = Select;

function InvoiceSetting() {
  const { t } = useTranslation("settings");
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
        throw new Error(t("invoice.toast.apiFailed"));
      }

      message.success(t("invoice.toast.saved"));
      // form.resetFields();
    } catch (error: any) {
      message.error(error.message || t("invoice.toast.failed"));
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
              label={t("invoice.field.companyName")}
              name="CompanyName"
              rules={[{ required: true, message: t("invoice.val.companyName") }]}
            >
              <Input
                style={{height:'40px'}}
               placeholder={t("invoice.ph.companyName")} />
            </Form.Item>
          </div>
          <div className="col-6">
            <Form.Item
              label={t("invoice.field.address")}
              name="Address"
              rules={[{ required: true, message: t("invoice.val.address") }]}
            >
              <Input style={{height:'40px'}} placeholder={t("invoice.ph.address")} />
            </Form.Item>
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <Form.Item
              label={t("common:type")}
              name="type"
              rules={[{ required: true, message: t("invoice.val.type") }]}
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
              label={t("invoice.field.vatNumber")}
              name="vatNumber"
              rules={[{ required: true, message: t("invoice.val.vatNumber") }]}
            >
              <Input style={{height:'40px'}} placeholder={t("invoice.ph.vatNumber")} />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          label={t("common:description")}
          name="description"
        //   rules={[{ required: true, message: "Please enter description" }]}
        >
          <Input.TextArea rows={3} placeholder={t("invoice.ph.description")} />
        </Form.Item>

        <Form.Item className="d-flex justify-content-end">
          <Button type="primary" htmlType="submit" className="application-btn">
            {t("invoice.saveSettings")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default InvoiceSetting;
