import { Checkbox } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

function PartnerDisclaimerInfo({ setSelectedTab }: any) {
  const { t } = useTranslation("partner");
  return (
    <>
      <div className="col-12 d-flex">
        <div className="disclaimer-sec mb-3">
          <Checkbox checked className="mb-3" style={{ fontWeight: 400 }}>
            {t("disclaimer.agree")}
          </Checkbox>
          <div className="col-12 d-flex gap-3">
            <div className="col-6">
              <h4 style={{ color: "red" }} className="mb-4">
                English
              </h4>
              <p>
                This Privacy Notice is not intended to, nor does it, create any
                contractual rights whatsoever or any other legal rights, nor
                does it create any obligations on us in respect of any other
                party or on behalf of any party. When you log in to third
                parties’ websites, you will not be subject or under this Privacy
                Notice. Moreover, we are not responsible for their websites’
                content, and we do not represent third parties. Therefore, we
                recommend you review the privacy and security policy of each
                link you log in to
              </p>
            </div>
            <div className="col-6">
              <h4
                style={{ color: "red" }}
                className="justify-content-end px-3 d-flex mb-4"
              >
                العربية
              </h4>
              لا يهدف إشعار الخصوصية هذا إلى إنشاء أي حقوق تعاقدية أو أي حقوق
              قانونية أخرى، ولا ينشئ أي التزامات علينا فيما يتعلق بأي طرف آخر أو
              نيابة عن أي طرف. عند تسجيل الدخول إلى مواقع ويب تابعة لأطراف
              ثالثة، لن تخضع أو تخضع لإشعار الخصوصية هذا. علاوة على ذلك، لسنا
              مسؤولين عن محتوى مواقع الويب الخاصة بهم، ولا نمثل أطرافًا ثالثة.
              لذلك، نوصيك بمراجعة سياسة الخصوصية والأمان لكل رابط تسجل الدخول
              إليه.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PartnerDisclaimerInfo;
