import { OppEntity } from "../../websocket/lib";
import { canToggleState } from "./can_toggle_state";
import { computeStateDomain } from "./compute_state_domain";
import { DOMAINS_WITH_CARD } from "../const";
import { OpenPeerPower } from "../../types";

export const stateCardType = (opp: OpenPeerPower, stateObj: OppEntity) => {
  if (stateObj.state === "unavailable") {
    return "display";
  }

  const domain = computeStateDomain(stateObj);

  if (DOMAINS_WITH_CARD.includes(domain)) {
    return domain;
  }
  if (
    canToggleState(opp, stateObj) &&
    stateObj.attributes.control !== "hidden"
  ) {
    return "toggle";
  }
  return "display";
};
