import { OppEntity } from "../../../websocket/lib";

export const evaluateFilter = (stateObj: OppEntity, filter: any): boolean => {
  const operator = filter.operator || "==";
  const value = filter.value || filter;
  const state = filter.attribute
    ? stateObj.attributes[filter.attribute]
    : stateObj.state;

  switch (operator) {
    case "==":
      return state === value;
    case "<=":
      return state <= value;
    case "<":
      return state < value;
    case ">=":
      return state >= value;
    case ">":
      return state > value;
    case "!=":
      return state !== value;
    case "regex": {
      return state.match(value);
    }
    default:
      return false;
  }
};
