import { OpenPeerPower } from "../../../types";
import { PropertyValues } from "lit-element";

// Check if config or Entity changed
export function hasConfigOrEntityChanged(
  element: any,
  changedProps: PropertyValues
): boolean {
  if (changedProps.has("_config")) {
    return true;
  }

  const oldOpp = changedProps.get("opp") as OpenPeerPower | undefined;
  if (!oldOpp) {
    return true;
  }

  if (
    oldOpp.themes !== element.opp!.themes ||
    oldOpp.language !== element.opp!.language
  ) {
    return true;
  }

  return (
    oldOpp.states[element._config!.entity] !==
      element.opp!.states[element._config!.entity] ||
    oldOpp.localize !== element.opp.localize
  );
}
