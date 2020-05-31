import { OpenPeerPower } from "../types";

export interface ZWaveNetworkStatus {
  state: number;
}

export interface ZWaveValue {
  key: number;
  value: {
    index: number;
    instance: number;
    label: string;
    poll_intensity: number;
  };
}

export interface ZWaveConfigItem {
  key: number;
  value: {
    data: any;
    data_items: any[];
    help: string;
    label: string;
    max: number;
    min: number;
    type: string;
  };
}

export interface ZWaveConfigServiceData {
  node_id: number;
  parameter: number;
  value: number | string;
}

export interface ZWaveNode {
  attributes: ZWaveAttributes;
}

export interface ZWaveAttributes {
  node_id: number;
  wake_up_interval?: number;
}

export const ZWAVE_NETWORK_STATE_STOPPED = 0;
export const ZWAVE_NETWORK_STATE_FAILED = 1;
export const ZWAVE_NETWORK_STATE_STARTED = 5;
export const ZWAVE_NETWORK_STATE_AWAKED = 7;
export const ZWAVE_NETWORK_STATE_READY = 10;

export const fetchNetworkStatus = (
  opp: OpenPeerPower
): Promise<ZWaveNetworkStatus> =>
  opp.callWS({
    type: "zwave/network_status",
  });

export const fetchValues = (opp: OpenPeerPower, nodeId: number) =>
  opp.callApi<ZWaveValue[]>("GET", `zwave/values/${nodeId}`);

export const fetchNodeConfig = (opp: OpenPeerPower, nodeId: number) =>
  opp.callApi<ZWaveConfigItem[]>("GET", `zwave/config/${nodeId}`);
