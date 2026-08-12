import { useTranslation } from "react-i18next";
import { LEDGER_CURRENCIES } from "../../redux/apis/apisCrudLms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

/**
 * Currency picker for the ledger reports.
 *
 * Every report that totals anything is computed in exactly one currency — the
 * server refuses to sum across them — so each of those screens carries one of
 * these, and echoes the chosen currency next to its figures.
 */
const CurrencySelect = ({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (currency: string) => void;
  className?: string;
}) => {
  const { t } = useTranslation("reports");
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={`h-10 rounded-sm bg-white ${className}`}
        style={{ flex: "0 1 160px", minWidth: 140 }}
      >
        <SelectValue placeholder={t("filter.currency")} />
      </SelectTrigger>
      <SelectContent>
        {LEDGER_CURRENCIES.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CurrencySelect;
