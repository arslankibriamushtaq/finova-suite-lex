import { Gavel } from "lucide-react";
import { useTranslation } from "react-i18next";
import BlockCodeBase from "./BlockCodeBase";

const Sanction = () => {
  const { t } = useTranslation("walletBlocks");
  return <BlockCodeBase type="SANCTION" title={t("blockCodes.title.sanction")} icon={Gavel} />;
};

export default Sanction;
