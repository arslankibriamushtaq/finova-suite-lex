import { Ban } from "lucide-react";
import { useTranslation } from "react-i18next";
import BlockCodeBase from "./BlockCodeBase";

const AllBlockCodes = () => {
  const { t } = useTranslation("walletBlocks");
  return <BlockCodeBase type="" title={t("blockCodes.title.all")} icon={Ban} />;
};

export default AllBlockCodes;
