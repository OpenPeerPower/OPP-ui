import { OpenPeerPower } from "../types";
import { createCollection } from "../open-peer-power-js-websocket/lib";
import { debounce } from "../common/util/debounce";

export interface DataEntryFlowProgressedEvent {
  type: "data_entry_flow_progressed";
  data: {
    handler: string;
    flow_id: string;
    refresh: boolean;
  };
}

export interface ConfigEntry {
  entry_id: string;
  domain: string;
  title: string;
  source: string;
  state: string;
  connection_class: string;
  supports_options: boolean;
}

export interface FieldSchema {
  name: string;
  default?: any;
  optional: boolean;
}

export interface ConfigFlowProgress {
  flow_id: string;
  handler: string;
  context: {
    title_placeholders: { [key: string]: string };
    [key: string]: any;
  };
}

export interface ConfigFlowStepForm {
  type: "form";
  flow_id: string;
  handler: string;
  step_id: string;
  data_schema: FieldSchema[];
  errors: { [key: string]: string };
  description_placeholders: { [key: string]: string };
}

export interface ConfigFlowStepExternal {
  type: "external";
  flow_id: string;
  handler: string;
  step_id: string;
  url: string;
  description_placeholders: { [key: string]: string };
}

export interface ConfigFlowStepCreateEntry {
  type: "create_entry";
  version: number;
  flow_id: string;
  handler: string;
  title: string;
  // Config entry ID
  result: string;
  description: string;
  description_placeholders: { [key: string]: string };
}

export interface ConfigFlowStepAbort {
  type: "abort";
  flow_id: string;
  handler: string;
  reason: string;
  description_placeholders: { [key: string]: string };
}

export type ConfigFlowStep =
  | ConfigFlowStepForm
  | ConfigFlowStepExternal
  | ConfigFlowStepCreateEntry
  | ConfigFlowStepAbort;

export const createConfigFlow = (opp: OpenPeerPower, handler: string) =>
  opp.callApi<ConfigFlowStep>("POST", "config/config_entries/flow", {
    handler,
  });

export const fetchConfigFlow = (opp: OpenPeerPower, flowId: string) =>
  opp.callApi<ConfigFlowStep>("GET", `config/config_entries/flow/${flowId}`);

export const handleConfigFlowStep = (
  opp: OpenPeerPower,
  flowId: string,
  data: { [key: string]: any }
) =>
  opp.callApi<ConfigFlowStep>(
    "POST",
    `config/config_entries/flow/${flowId}`,
    data
  );

export const deleteConfigFlow = (opp: OpenPeerPower, flowId: string) =>
  opp.callApi("DELETE", `config/config_entries/flow/${flowId}`);

export const getConfigFlowsInProgress = (opp: OpenPeerPower) =>
  opp.callApi<ConfigFlowProgress[]>("GET", "config/config_entries/flow");

export const getConfigFlowHandlers = (opp: OpenPeerPower) =>
  opp.callApi<string[]>("GET", "config/config_entries/flow_handlers");

const fetchConfigFlowInProgress = (conn) =>
  conn.sendMessagePromise({
    type: "config/entity_registry/list",
  });

const subscribeConfigFlowInProgressUpdates = (conn, store) =>
  debounce(
    conn.subscribeEvents(
      () =>
        fetchConfigFlowInProgress(conn).then((flows) =>
          store.setState(flows, true)
        ),
      500,
      true
    ),
    "config_entry_discovered"
  );

export const subscribeConfigFlowInProgress = (
  opp: OpenPeerPower,
  onChange: (flows: ConfigFlowProgress[]) => void
) =>
  createCollection<ConfigFlowProgress[]>(
    "_configFlowProgress",
    fetchConfigFlowInProgress,
    subscribeConfigFlowInProgressUpdates,
    opp.connection,
    onChange
  );

export const getConfigEntries = (opp: OpenPeerPower) =>
  opp.callApi<ConfigEntry[]>("GET", "config/config_entries/entry");

export const localizeConfigFlowTitle = (
  flow: ConfigFlowProgress
) => {
  const placeholders = flow.context.title_placeholders || {};
  const placeholderKeys = Object.keys(placeholders);
  if (placeholderKeys.length === 0) {
    return `${flow.handler} config title`;
  }
  const args: string[] = [];
  placeholderKeys.forEach((key) => {
    args.push(key);
    args.push(placeholders[key]);
  });
  return `component ${flow.handler} flow_title`;
};
