import { OpenPeerPower } from "../types";

export const setInputSelectOption = (
  opp: OpenPeerPower,
  entity: string,
  option: string
) =>
  opp.callService("input_select", "select_option", {
    option,
    entity_id: entity,
  });
