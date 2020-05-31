import { OppEntity } from "../../websocket/lib";
import { computeDomain } from "./compute_domain";

export const computeStateDomain = (stateObj: OppEntity) => {
  return computeDomain(stateObj.entity_id);
};
