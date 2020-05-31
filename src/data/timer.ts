import { OppEntityBase, OppEntityAttributeBase } from "../websocket/lib";

export type TimerEntity = OppEntityBase & {
  attributes: OppEntityAttributeBase & {
    duration: string;
    remaining: string;
  };
};
