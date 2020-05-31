import { OpenPeerPower } from "../types";
import { DataEntryFlowStep, DataEntryFlowProgress } from "./data_entry_flow";
import { debounce } from "../common/util/debounce";
import { getCollection, Connection } from "../websocket/lib";
import { LocalizeFunc } from "../common/translations/localize";

export const DISCOVERY_SOURCES = ["unignore", "homekit", "ssdp", "zeroconf"];

export const createConfigFlow = (opp: OpenPeerPower, handler: string) =>
  opp.callApi<DataEntryFlowStep>("POST", "config/config_entries/flow", {
    handler,
  });

export const fetchConfigFlow = (opp: OpenPeerPower, flowId: string) =>
  opp.callApi<DataEntryFlowStep>("GET", `config/config_entries/flow/${flowId}`);

export const handleConfigFlowStep = (
  opp: OpenPeerPower,
  flowId: string,
  data: { [key: string]: any }
) =>
  opp.callApi<DataEntryFlowStep>(
    "POST",
    `config/config_entries/flow/${flowId}`,
    data
  );

export const ignoreConfigFlow = (opp: OpenPeerPower, flowId: string) =>
  opp.callWS({ type: "config_entries/ignore_flow", flow_id: flowId });

export const deleteConfigFlow = (opp: OpenPeerPower, flowId: string) =>
  opp.callApi("DELETE", `config/config_entries/flow/${flowId}`);

export const getConfigFlowHandlers = (opp: OpenPeerPower) =>
  opp.callApi<string[]>("GET", "config/config_entries/flow_handlers");

const fetchConfigFlowInProgress = (conn) =>
  conn.sendMessagePromise({
    type: "config_entries/flow/progress",
  });

const subscribeConfigFlowInProgressUpdates = (conn, store) =>
  conn.subscribeEvents(
    debounce(
      () =>
        fetchConfigFlowInProgress(conn).then((flows) =>
          store.setState(flows, true)
        ),
      500,
      true
    ),
    "config_entry_discovered"
  );

export const getConfigFlowInProgressCollection = (conn: Connection) =>
  getCollection<DataEntryFlowProgress[]>(
    conn,
    "_configFlowProgress",
    fetchConfigFlowInProgress,
    subscribeConfigFlowInProgressUpdates
  );

export const subscribeConfigFlowInProgress = (
  opp: OpenPeerPower,
  onChange: (flows: DataEntryFlowProgress[]) => void
) => getConfigFlowInProgressCollection(opp.connection).subscribe(onChange);

export const localizeConfigFlowTitle = (
  localize: LocalizeFunc,
  flow: DataEntryFlowProgress
) => {
  const placeholders = flow.context.title_placeholders || {};
  const placeholderKeys = Object.keys(placeholders);
  if (placeholderKeys.length === 0) {
    return localize(`component.${flow.handler}.config.title`);
  }
  const args: string[] = [];
  placeholderKeys.forEach((key) => {
    args.push(key);
    args.push(placeholders[key]);
  });
  return localize(`component.${flow.handler}.config.flow_title`, ...args);
};
