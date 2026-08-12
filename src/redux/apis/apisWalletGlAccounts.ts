import axios from "../../utils/axios";

/**
 * Which GL account each wallet rail posts to — ledger-service.
 *
 * These used to live only in wallet-service's environment, so changing one
 * meant a redeploy and nobody outside the deployment could see what they were.
 *
 * Two things about this screen that are not obvious:
 *
 * 1. A change applies from the NEXT transaction onward. Entries already posted
 *    stay on the old account; moving them is a reclassification entry, not an
 *    edit, and nothing here can do it.
 * 2. The server rejects header and inactive accounts, but does NOT check that
 *    the account type suits the rail — pointing a fee rail at a liability
 *    account posts cleanly and quietly produces wrong reports. That is why the
 *    picker shows each account's type and the confirm step repeats it.
 */

const BASE = "/ledger-service/api/v1/wallet-gl-accounts";

/** One rail's account. `settingKey` is the rail; it is not editable. */
export interface WalletGlAccountSetting {
  settingKey: string;
  accountCode: string;
  accountName?: string | null;
  accountType?: string | null;
  description?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

/** Permission `ledger.wallet-gl-accounts:read`. */
export const getWalletGlAccounts = () => axios.get(BASE);

/**
 * Permission `ledger.wallet-gl-accounts:write`.
 *
 * 422 `LEDGER.ACCOUNT.IS_HEADER` / `LEDGER.ACCOUNT.NOT_POSTABLE` come back here
 * when the chosen account cannot receive postings.
 */
export const updateWalletGlAccount = (settingKey: string, accountCode: string) =>
  axios.put(`${BASE}/${encodeURIComponent(settingKey)}`, { accountCode });
