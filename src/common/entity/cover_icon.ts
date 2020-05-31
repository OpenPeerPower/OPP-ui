/** Return an icon representing a cover state. */
import { OppEntity } from "../../websocket/lib";
import { domainIcon } from "./domain_icon";

export const coverIcon = (state: OppEntity): string => {
  const open = state.state !== "closed";
  switch (state.attributes.device_class) {
    case "garage":
      return open ? "opp:garage-open" : "opp:garage";
    case "door":
      return open ? "opp:door-open" : "opp:door-closed";
    case "shutter":
      return open ? "opp:window-shutter-open" : "opp:window-shutter";
    case "blind":
      return open ? "opp:blinds-open" : "opp:blinds";
    case "window":
      return open ? "opp:window-open" : "opp:window-closed";
    default:
      return domainIcon("cover", state.state);
  }
};
