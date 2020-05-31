import { OppEntity } from "../../websocket/lib";

export const supportsFeature = (
  stateObj: OppEntity,
  feature: number
): boolean => {
  // tslint:disable-next-line:no-bitwise
  return (stateObj.attributes.supported_features! & feature) !== 0;
};
