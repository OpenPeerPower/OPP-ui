import { OpenPeerPower } from "../../types";
import { OppioResponse, oppioApiResultExtractor } from "./common";

export type OppioHostInfo = any;

export interface OppioOppOSInfo {
  version: string;
  version_cli: string;
  version_latest: string;
  version_cli_latest: string;
  board: "ova" | "rpi";
}

export const fetchOppioHostInfo = async (opp: OpenPeerPower) => {
  const response = await opp.callApi<OppioResponse<OppioHostInfo>>(
    "GET",
    "oppio/host/info"
  );
  return oppioApiResultExtractor(response);
};

export const fetchOppioOppOsInfo = async (opp: OpenPeerPower) => {
  return oppioApiResultExtractor(
    await opp.callApi<OppioResponse<OppioOppOSInfo>>("GET", "oppio/oppos/info")
  );
};
