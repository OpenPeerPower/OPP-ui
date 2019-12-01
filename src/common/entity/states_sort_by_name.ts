/**
 * Sort function to help sort states by name
 *
 * Usage:
 *   const states = [state1, state2]
 *   states.sort(statesSortByName);
 */
import { OppEntity } from "../../types";
import computeStateName from "./compute_state_name";

export default function sortStatesByName(
  entityA: OppEntity,
  entityB: OppEntity
) {
  const nameA = computeStateName(entityA);
  const nameB = computeStateName(entityB);
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}
