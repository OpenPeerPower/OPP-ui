import { OppEntity } from "../../websocket/lib";
import durationToSeconds from "../datetime/duration_to_seconds";

export const timerTimeRemaining = (stateObj: OppEntity) => {
  let timeRemaining = durationToSeconds(stateObj.attributes.remaining);

  if (stateObj.state === "active") {
    const now = new Date().getTime();
    const madeActive = new Date(stateObj.last_changed).getTime();
    timeRemaining = Math.max(timeRemaining - (now - madeActive) / 1000, 0);
  }

  return timeRemaining;
};
