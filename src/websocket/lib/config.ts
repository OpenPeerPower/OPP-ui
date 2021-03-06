import { getCollection } from "./collection";
import { OppConfig, UnsubscribeFunc } from "./types";
import { Connection } from "./connection";
import { Store } from "./store";
import { getConfig } from "./commands";

type ComponentLoadedEvent = {
  data: {
    component: string;
  };
};

function processComponentLoaded(
  state: OppConfig,
  event: ComponentLoadedEvent
): Partial<OppConfig> | null {
  if (state === undefined) return null;

  return {
    components: state.components.concat(event.data.component),
  };
}

const fetchConfig = (conn: Connection) => getConfig(conn);
const subscribeUpdates = (conn: Connection, store: Store<OppConfig>) =>
  Promise.all([
    conn.subscribeEvents(
      store.action(processComponentLoaded),
      "component_loaded"
    ),
    conn.subscribeEvents(
      () => fetchConfig(conn).then((config) => store.setState(config, true)),
      "core_config_updated"
    ),
  ]).then((unsubs) => () => unsubs.forEach((unsub) => unsub()));

const configColl = (conn: Connection) =>
  getCollection(conn, "_cnf", fetchConfig, subscribeUpdates);

export const subscribeConfig = (
  conn: Connection,
  onChange: (state: OppConfig) => void
): UnsubscribeFunc => configColl(conn).subscribe(onChange);
