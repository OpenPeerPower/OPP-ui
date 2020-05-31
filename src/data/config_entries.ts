import { OpenPeerPower } from "../types";

export interface ConfigEntry {
  entry_id: string;
  domain: string;
  title: string;
  source: string;
  state: string;
  connection_class: string;
  supports_options: boolean;
}

export interface ConfigEntrySystemOptions {
  disable_new_entities: boolean;
}

export const getConfigEntries = (opp: OpenPeerPower) =>
  opp.callApi<ConfigEntry[]>("GET", "config/config_entries/entry");

export const deleteConfigEntry = (opp: OpenPeerPower, configEntryId: string) =>
  opp.callApi<{
    require_restart: boolean;
  }>("DELETE", `config/config_entries/entry/${configEntryId}`);

export const getConfigEntrySystemOptions = (
  opp: OpenPeerPower,
  configEntryId: string
) =>
  opp.callWS<ConfigEntrySystemOptions>({
    type: "config_entries/system_options/list",
    entry_id: configEntryId,
  });

export const updateConfigEntrySystemOptions = (
  opp: OpenPeerPower,
  configEntryId: string,
  params: Partial<ConfigEntrySystemOptions>
) =>
  opp.callWS({
    type: "config_entries/system_options/update",
    entry_id: configEntryId,
    ...params,
  });
