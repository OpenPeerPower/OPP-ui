import { OpenPeerPower } from "../types";

export const setValue = (hass: OpenPeerPower, entity: string, value: string) =>
  hass.callService(entity.split(".", 1)[0], "set_value", {
    value,
    entity_id: entity,
  });
