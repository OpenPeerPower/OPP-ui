import { createCollection, Connection } from "../websocket/lib";
import { OpenPeerPower } from "../types";
import { computeStateName } from "../common/entity/compute_state_name";
import { debounce } from "../common/util/debounce";

export interface EntityRegistryEntry {
  entity_id: string;
  name: string;
  platform: string;
  config_entry_id?: string;
  device_id?: string;
  disabled_by: string | null;
}

export interface EntityRegistryEntryUpdateParams {
  name?: string | null;
  disabled_by?: string | null;
  new_entity_id?: string;
}

export const computeEntityRegistryName = (
  opp: OpenPeerPower,
  entry: EntityRegistryEntry
): string | null => {
  if (entry.name) {
    return entry.name;
  }
  const state = opp.states[entry.entity_id];
  return state ? computeStateName(state) : null;
};

export const updateEntityRegistryEntry = (
  opp: OpenPeerPower,
  entityId: string,
  updates: Partial<EntityRegistryEntryUpdateParams>
): Promise<EntityRegistryEntry> =>
  opp.callWS<EntityRegistryEntry>({
    type: "config/entity_registry/update",
    entity_id: entityId,
    ...updates,
  });

export const removeEntityRegistryEntry = (
  opp: OpenPeerPower,
  entityId: string
): Promise<void> =>
  opp.callWS({
    type: "config/entity_registry/remove",
    entity_id: entityId,
  });

const fetchEntityRegistry = (conn) =>
  conn.sendMessagePromise({
    type: "config/entity_registry/list",
  });

const subscribeEntityRegistryUpdates = (conn, store) =>
  conn.subscribeEvents(
    debounce(
      () =>
        fetchEntityRegistry(conn).then((entities) =>
          store.setState(entities, true)
        ),
      500,
      true
    ),
    "entity_registry_updated"
  );

export const subscribeEntityRegistry = (
  conn: Connection,
  onChange: (entities: EntityRegistryEntry[]) => void
) =>
  createCollection<EntityRegistryEntry[]>(
    "_entityRegistry",
    fetchEntityRegistry,
    subscribeEntityRegistryUpdates,
    conn,
    onChange
  );
