import Axios, { type AxiosInstance } from "axios";
import { attachAcceptLanguage } from "./acceptLanguage";
import { store } from "../redux/store";
import { setToken } from "../redux/apis/apisSlice";

/**
 * LEX — the agentic decisioning layer. Five services, one client factory.
 *
 * | Service                | Port | Screens                                  |
 * |------------------------|------|------------------------------------------|
 * | lex-config-service     | 8201 | levels, processes, delegation, SLA config |
 * | lex-case-service       | 8203 | SLA operations board                      |
 * | lex-document-service   | 8204 | verification sequence, analyses           |
 * | lex-knowledge-service  | 8205 | policy library, employers, governance     |
 * | lex-bi-service         | 8206 | gallery, reports, builder, schedules      |
 *
 * Every LEX call carries `Authorization: Bearer <jwt>` and `Accept-Language`.
 * The token needs two claims: `tenant_id` (the company — a missing claim is a
 * 401, because a fallback would let one company's configuration leak into
 * another's) and a UUID `sub` (recorded as the publisher on every published
 * version, so a token without one cannot publish).
 *
 * **The tenant is never sent by this client.** A UI that sends a tenant id is a
 * UI that will eventually send the wrong one.
 *
 * Paths are the documented ones (`/api/v1/lex/...`); only the origin differs
 * per service, so each api module keeps the URLs the reference prints. Two
 * environment shapes are supported per service, because talking to a gateway
 * and talking to the services directly are both real setups:
 *
 *   VITE_LEX_CONFIG_URL   — a full origin, e.g. http://localhost:8201. Wins.
 *   VITE_LEX_CONFIG_MOUNT — a path under VITE_API_BASE_URL, e.g. /lex-config-service.
 *
 * (…and the same pair for DOCUMENT, CASE, KNOWLEDGE and BI.) Set a MOUNT to an
 * empty string to call the gateway root directly.
 *
 * No toast is raised here. Every LEX screen renders failures through
 * `lexErrorMessage`, which switches on the envelope's `code` — a generic toast
 * from the interceptor would win the stack and hide the 422 message that
 * actually explains the rule, and those messages are the main way users learn
 * the system.
 */

const env = (key: string): string | undefined =>
  import.meta.env[key as keyof ImportMetaEnv] as string | undefined;

const baseUrlFor = (service: string, fallbackMount: string): string => {
  const direct = env(`VITE_LEX_${service}_URL`);
  if (direct) return direct;
  const mount = env(`VITE_LEX_${service}_MOUNT`);
  return `${import.meta.env.VITE_API_BASE_URL}${mount === undefined ? fallbackMount : mount}`;
};

const createLexClient = (service: string, fallbackMount: string): AxiosInstance => {
  const instance = Axios.create({ baseURL: baseUrlFor(service, fallbackMount) });

  instance.interceptors.request.use((reqConfig) => {
    const config = { ...reqConfig };
    const token = store.getState().block.token;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // 401 means the token is gone or invalid. Re-authenticate; never retry.
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        store.dispatch(setToken({ token: "" }));
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  attachAcceptLanguage(instance);
  return instance;
};

export const lexConfigApi = createLexClient("CONFIG", "/lex-config-service");
export const lexDocumentApi = createLexClient("DOCUMENT", "/lex-document-service");
export const lexCaseApi = createLexClient("CASE", "/lex-case-service");
export const lexKnowledgeApi = createLexClient("KNOWLEDGE", "/lex-knowledge-service");
export const lexBiApi = createLexClient("BI", "/lex-bi-service");
