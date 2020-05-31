import { OpenPeerPower } from "../types";

export const setValue = (opp: OpenPeerPower, entity: string, value: string) =>
  opp.callService(entity.split(".", 1)[0], "set_value", {
    value,
    entity_id: entity,
  });
