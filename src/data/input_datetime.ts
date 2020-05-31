import { OpenPeerPower } from "../types";

export const setInputDateTimeValue = (
  opp: OpenPeerPower,
  entityId: string,
  time: string | undefined = undefined,
  date: string | undefined = undefined
) => {
  const param = { entity_id: entityId, time, date };
  opp.callService(entityId.split(".", 1)[0], "set_datetime", param);
};
