import { OppEntity } from "../../websocket/lib";
import { computeObjectId } from "./compute_object_id";

export const computeStateName = (stateObj: OppEntity): string => {
  return stateObj.attributes.friendly_name === undefined
    ? computeObjectId(stateObj.entity_id).replace(/_/g, " ")
    : stateObj.attributes.friendly_name || "";
};
