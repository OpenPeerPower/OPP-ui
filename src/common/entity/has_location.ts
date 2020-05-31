import { OppEntity } from "../../websocket/lib";

export const hasLocation = (stateObj: OppEntity) => {
  return (
    "latitude" in stateObj.attributes && "longitude" in stateObj.attributes
  );
};
