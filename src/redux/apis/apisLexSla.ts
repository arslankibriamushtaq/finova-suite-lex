import { lexCaseApi } from "../../utils/axiosLexService";
import { clean, unwrap, unwrapList } from "./apisLexCore";

/**
 * lex-case-service (:8203), SLA board — `lex.sla`.
 *
 * **Read-only, deliberately.** Every target on this screen comes from the SLA
 * Configurator, and there is no endpoint here that writes one. Nothing in this
 * file is a POST.
 */

const SLA = "/api/v1/lex/sla";

export interface LexSlaSnapshot {
  inFlight: number;
  withinSla: number;
  nearBreach: number;
  criticalBreach: number;
  stoppedClock: number;
  /**
   * Cases whose product and sector have no published SLA policy. Its own tile,
   * never folded into `withinSla`: an untracked case is not a compliant one,
   * and combining them shows an unconfigured tenant a perfect compliance
   * figure — the one report a regulator should never be handed.
   */
  notTracked: number;
  averageMinutesInFlight?: number;
  byRoutingType?: Record<string, number>;
  byStage?: Record<string, number>;
}

export type LexBreachLevel = "NEAR_BREACH" | "CRITICAL_BREACH";

export interface LexBreachingCase {
  caseId: string;
  applicationId?: string;
  applicationNumber?: string;
  routingType?: string;
  assignedLevelCode?: string;
  stageCode?: string;
  slaStatus: LexBreachLevel | string;
  /**
   * Time on the clock, not time open: stopped-clock periods are excluded, so
   * the two numbers differ. A case parked on something outside the handler's
   * control does not accrue against their target.
   */
  elapsedMinutes?: number;
  targetMinutes?: number;
  drivingReasonCode?: string;
}

export const getSlaSnapshot = async (): Promise<LexSlaSnapshot> =>
  unwrap(await lexCaseApi.get(`${SLA}/snapshot`));

/** Worst first. `minimum` widens the list to include near-breach. */
export const getBreachingCases = async (
  minimum: LexBreachLevel = "NEAR_BREACH"
): Promise<LexBreachingCase[]> => {
  return unwrapList(await lexCaseApi.get(`${SLA}/breaching`, { params: clean({ minimum }) }));
};
