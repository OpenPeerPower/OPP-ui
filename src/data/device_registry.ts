import { OpenPeerPower } from "../types";
import { createCollection, Connection } from "../open-peer-power-js-websocket/lib";
import { debounce } from "../common/util/debounce";
import { EntityRegistryEntry } from "./entity_registry";
import computeStateName from "../common/entity/compute_state_name";

export interface DeviceRegistryEntry {
  id: string;
  config_entries: string[];
  connections: Array<[string, string]>;
  manufacturer: string;
  model?: string;
  name?: string;
  sw_version?: string;
  via_device_id?: string;
  area_id?: string;
  name_by_user?: string;
}

export interface DeviceRegistryEntryMutableParams {
  area_id?: string | null;
  name_by_user?: string | null;
}

export const computeDeviceName = (
  device: DeviceRegistryEntry,
  opp: OpenPeerPower,
  entities?: EntityRegistryEntry[] | string[]
) => {
  return (
    device.name_by_user ||
    device.name ||
    (entities && fallbackDeviceName(opp, entities)) ||
    opp.localize("ui.panel.config.devices.unnamed_device")
  );
};

export const fallbackDeviceName = (
  opp: OpenPeerPower,
  entities: EntityRegistryEntry[] | string[]
) => {
  for (const entity of entities || []) {
    const entityId = typeof entity === "string" ? entity : entity.entity_id;
    const stateObj = opp.states[entityId];
    if (stateObj) {
      return computeStateName(stateObj);
    }
  }
  return undefined;
};

export const updateDeviceRegistryEntry = (
  opp: OpenPeerPower,
  deviceId: string,
  updates: Partial<DeviceRegistryEntryMutableParams>
) =>
  opp.callWS<DeviceRegistryEntry>({
    type: "config/device_registry/update",
    device_id: deviceId,
    ...updates,
  });

const fetchDeviceRegistry = (conn) =>
  conn.sendMessagePromise({
    type: "config/device_registry/list",
  });

const subscribeDeviceRegistryUpdates = (conn, store) =>
  conn.subscribeEvents(
    debounce(
      () =>
        fetchDeviceRegistry(conn).then((devices) =>
          store.setState(devices, true)
        ),
      500,
      true
    ),
    "device_registry_updated"
  );

export const subscribeDeviceRegistry = (
  conn: Connection,
  onChange: (devices: DeviceRegistryEntry[]) => void
) =>
  createCollection<DeviceRegistryEntry[]>(
    "_dr",
    fetchDeviceRegistry,
    subscribeDeviceRegistryUpdates,
    conn,
    onChange
  );
