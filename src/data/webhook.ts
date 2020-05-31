import { OpenPeerPower } from "../types";

export interface Webhook {
  webhook_id: string;
  domain: string;
  name: string;
}

export const fetchWebhooks = (opp: OpenPeerPower): Promise<Webhook[]> =>
  opp.callWS({
    type: "webhook/list",
  });
