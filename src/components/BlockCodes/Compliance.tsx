import { ClipboardCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import BlockCodeBase from "./BlockCodeBase";

const Compliance = () => {
  const { t } = useTranslation("walletBlocks");
  return <BlockCodeBase type="COMPLIANCE" title={t("blockCodes.title.compliance")} icon={ClipboardCheck} />;
};

export default Compliance;
