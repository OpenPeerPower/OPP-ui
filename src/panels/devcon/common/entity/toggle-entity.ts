import { STATES_OFF } from "../../../../common/const";
import { turnOnOffEntity } from "./turn-on-off-entity";
import { OpenPeerPower, ServiceCallResponse } from "../../../../types";
export const toggleEntity = (
  opp: OpenPeerPower,
  entityId: string
): Promise<ServiceCallResponse> => {
  const turnOn = STATES_OFF.includes(opp.states[entityId].state);
  return turnOnOffEntity(opp, entityId, turnOn);
};
