import { Input } from "antd";
import React from "react";

function ErrorCodeSetting({ errorCodesData, }: any) {
  const arabicdata = [
    {
      label: "خطا بالكود 1 (عربي) ",
      value: errorCodesData[0]?.text_ar || "-",
    },
    {
      label: "خطا بالكود 1 (عربي) ",
      value: errorCodesData[1]?.text_ar || "-",
    },
    {
      label: "خطا بالكود 1 (عربي) ",
      value: errorCodesData[2]?.text_ar || "-",
    },
  ];
  
  const data = [
    {
      label: "Error Code 1 (English)",
      value: errorCodesData[0]?.text_en || "-",
    },
    {
      label: "Error Code 2 (English) ",
      value: errorCodesData[1]?.text_en || "-",
    },
    {
      label: "Error Code 3 (English) ",
      value: errorCodesData[2]?.text_en || "-",
    },
  ];
  return (
    <>
      <div className="my-box p-3">
        <div className="row">
          <div className="col-6">
            {data.map((item) => (
              <>
                <div className="mt-2">{item.label}</div>
                <Input className="mt-2 form-control" value={item.value} />
              </>
            ))}
          </div>
          <div className="col-6" dir="rtl">
            {arabicdata.map((item) => (
              <>
                <div className="mt-2">{item.label}</div>
                <Input className="mt-2 form-control" value={item.value} />
              </>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ErrorCodeSetting;
