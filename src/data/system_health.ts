import { OpenPeerPower } from "../types";

export interface OpenPeerPowerSystemHealthInfo {
  version: string;
  dev: boolean;
  oppio: boolean;
  virtualenv: string;
  python_version: string;
  docker: boolean;
  arch: string;
  timezone: string;
  os_name: string;
}

export interface SystemHealthInfo {
  [domain: string]: { [key: string]: string | number | boolean };
}

export const fetchSystemHealthInfo = (
  opp: OpenPeerPower
): Promise<SystemHealthInfo> =>
  opp.callWS({
    type: "system_health/info",
  });
