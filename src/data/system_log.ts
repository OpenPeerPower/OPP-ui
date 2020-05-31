import { OpenPeerPower } from "../types";

export interface LoggedError {
  name: string;
  message: string;
  level: string;
  source: string;
  // unix timestamp in seconds
  timestamp: number;
  exception: string;
  count: number;
  // unix timestamp in seconds
  first_occured: number;
}

export const fetchSystemLog = (opp: OpenPeerPower) =>
  opp.callApi<LoggedError[]>("GET", "error/all");

export const getLoggedErrorIntegration = (item: LoggedError) =>
  item.name.startsWith("openpeerpower.components.")
    ? item.name.split(".")[2]
    : undefined;
