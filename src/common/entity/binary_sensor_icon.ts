import { OppEntity } from "../../websocket/lib";

/** Return an icon representing a binary sensor state. */

export const binarySensorIcon = (state: OppEntity) => {
  const activated = state.state && state.state === "off";
  switch (state.attributes.device_class) {
    case "battery":
      return activated ? "opp:battery" : "opp:battery-outline";
    case "cold":
      return activated ? "opp:thermometer" : "opp:snowflake";
    case "connectivity":
      return activated ? "opp:server-network-off" : "opp:server-network";
    case "door":
      return activated ? "opp:door-closed" : "opp:door-open";
    case "garage_door":
      return activated ? "opp:garage" : "opp:garage-open";
    case "gas":
    case "power":
    case "problem":
    case "safety":
    case "smoke":
      return activated ? "opp:shield-check" : "opp:alert";
    case "heat":
      return activated ? "opp:thermometer" : "opp:fire";
    case "light":
      return activated ? "opp:brightness-5" : "opp:brightness-7";
    case "lock":
      return activated ? "opp:lock" : "opp:lock-open";
    case "moisture":
      return activated ? "opp:water-off" : "opp:water";
    case "motion":
      return activated ? "opp:walk" : "opp:run";
    case "occupancy":
      return activated ? "opp:home-outline" : "opp:home";
    case "opening":
      return activated ? "opp:square" : "opp:square-outline";
    case "plug":
      return activated ? "opp:power-plug-off" : "opp:power-plug";
    case "presence":
      return activated ? "opp:home-outline" : "opp:home";
    case "sound":
      return activated ? "opp:music-note-off" : "opp:music-note";
    case "vibration":
      return activated ? "opp:crop-portrait" : "opp:vibrate";
    case "window":
      return activated ? "opp:window-closed" : "opp:window-open";
    default:
      return activated ? "opp:radiobox-blank" : "opp:checkbox-marked-circle";
  }
};
