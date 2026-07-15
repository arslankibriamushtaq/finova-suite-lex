import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import BlockCodeBase from "./BlockCodeBase";

const AntiFraud = () => {
  const { t } = useTranslation("walletBlocks");
  return <BlockCodeBase type="ANTI_FRAUD" title={t("blockCodes.title.antiFraud")} icon={ShieldAlert} />;
};

export default AntiFraud;
