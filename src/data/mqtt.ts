import { OpenPeerPower } from "../types";

export interface MQTTMessage {
  topic: string;
  payload: string;
  qos: number;
  retain: number;
}

export const subscribeMQTTTopic = (
  opp: OpenPeerPower,
  topic: string,
  callback: (message: MQTTMessage) => void
) => {
  return opp.connection.subscribeMessage<MQTTMessage>(callback, {
    type: "mqtt/subscribe",
    topic,
  });
};
