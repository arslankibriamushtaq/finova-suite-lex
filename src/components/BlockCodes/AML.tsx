import { Scale } from "lucide-react";
import { useTranslation } from "react-i18next";
import BlockCodeBase from "./BlockCodeBase";

const AML = () => {
  const { t } = useTranslation("walletBlocks");
  return <BlockCodeBase type="AML" title={t("blockCodes.title.aml")} icon={Scale} />;
};

export default AML;
