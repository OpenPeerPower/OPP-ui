import { OpenPeerPower } from "../types";
import { OppConfig } from "../websocket/lib";

export interface ConfigUpdateValues {
  location_name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  unit_system: "metric" | "imperial";
  time_zone: string;
}

export const saveCoreConfig = (
  opp: OpenPeerPower,
  values: Partial<ConfigUpdateValues>
) =>
  opp.callWS<OppConfig>({
    type: "config/core/update",
    ...values,
  });

export const detectCoreConfig = (opp: OpenPeerPower) =>
  opp.callWS<Partial<ConfigUpdateValues>>({
    type: "config/core/detect",
  });
