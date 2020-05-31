import { createCollection, Connection } from "../websocket/lib";
import { OpenPeerPower } from "../types";
import { compare } from "../common/string/compare";
import { debounce } from "../common/util/debounce";

export interface AreaRegistryEntry {
  area_id: string;
  name: string;
}

export interface AreaRegistryEntryMutableParams {
  name: string;
}

export const createAreaRegistryEntry = (
  opp: OpenPeerPower,
  values: AreaRegistryEntryMutableParams
) =>
  opp.callWS<AreaRegistryEntry>({
    type: "config/area_registry/create",
    ...values,
  });

export const updateAreaRegistryEntry = (
  opp: OpenPeerPower,
  areaId: string,
  updates: Partial<AreaRegistryEntryMutableParams>
) =>
  opp.callWS<AreaRegistryEntry>({
    type: "config/area_registry/update",
    area_id: areaId,
    ...updates,
  });

export const deleteAreaRegistryEntry = (opp: OpenPeerPower, areaId: string) =>
  opp.callWS({
    type: "config/area_registry/delete",
    area_id: areaId,
  });

const fetchAreaRegistry = (conn) =>
  conn
    .sendMessagePromise({
      type: "config/area_registry/list",
    })
    .then((areas) => areas.sort((ent1, ent2) => compare(ent1.name, ent2.name)));

const subscribeAreaRegistryUpdates = (conn, store) =>
  conn.subscribeEvents(
    debounce(
      () =>
        fetchAreaRegistry(conn).then((areas) => store.setState(areas, true)),
      500,
      true
    ),
    "area_registry_updated"
  );

export const subscribeAreaRegistry = (
  conn: Connection,
  onChange: (areas: AreaRegistryEntry[]) => void
) =>
  createCollection<AreaRegistryEntry[]>(
    "_areaRegistry",
    fetchAreaRegistry,
    subscribeAreaRegistryUpdates,
    conn,
    onChange
  );
