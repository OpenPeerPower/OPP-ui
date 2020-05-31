import { OpenPeerPower, PanelInfo } from "../../types";
import { OppioResponse, oppioApiResultExtractor } from "./common";

export type OppioOpenPeerPowerInfo = any;
export type OppioSupervisorInfo = any;

export type OppioPanelInfo = PanelInfo<
  | undefined
  | {
      ingress?: string;
    }
>;

export interface CreateSessionResponse {
  session: string;
}

export interface SupervisorOptions {
  channel: "beta" | "dev" | "stable";
}

export const fetchOppioOpenPeerPowerInfo = async (opp: OpenPeerPower) => {
  return oppioApiResultExtractor(
    await opp.callApi<OppioResponse<OppioOpenPeerPowerInfo>>(
      "GET",
      "oppio/openpeerpower/info"
    )
  );
};

export const fetchOppioSupervisorInfo = async (opp: OpenPeerPower) => {
  return oppioApiResultExtractor(
    await opp.callApi<OppioResponse<OppioSupervisorInfo>>(
      "GET",
      "oppio/supervisor/info"
    )
  );
};

export const fetchSupervisorLogs = async (opp: OpenPeerPower) => {
  return opp.callApi<string>("GET", "oppio/supervisor/logs");
};

export const createOppioSession = async (opp: OpenPeerPower) => {
  const response = await opp.callApi<OppioResponse<CreateSessionResponse>>(
    "POST",
    "oppio/ingress/session"
  );
  document.cookie = `ingress_session=${response.data.session};path=/api/oppio_ingress/`;
};

export const setSupervisorOption = async (
  opp: OpenPeerPower,
  data: SupervisorOptions
) => {
  await opp.callApi<OppioResponse<void>>(
    "POST",
    "oppio/supervisor/options",
    data
  );
};
