import { OpenPeerPower } from "../../types";
import { OppioResponse, oppioApiResultExtractor } from "./common";

export interface OppioAddonInfo {
  name: string;
  slug: string;
  description: string;
  repository: "core" | "local" | string;
  version: string;
  state: "none" | "started" | "stopped";
  installed: string | undefined;
  detached: boolean;
  available: boolean;
  build: boolean;
  url: string | null;
  icon: boolean;
  logo: boolean;
}

export interface OppioAddonDetails extends OppioAddonInfo {
  name: string;
  slug: string;
  description: string;
  long_description: null | string;
  auto_update: boolean;
  url: null | string;
  detached: boolean;
  available: boolean;
  arch: "armhf" | "aarch64" | "i386" | "amd64";
  machine: any;
  openpeerpower: string;
  last_version: string;
  boot: "auto" | "manual";
  build: boolean;
  options: object;
  network: null | object;
  network_description: null | object;
  host_network: boolean;
  host_pid: boolean;
  host_ipc: boolean;
  host_dbus: boolean;
  privileged: any;
  apparmor: "disable" | "default" | "profile";
  devices: string[];
  auto_uart: boolean;
  icon: boolean;
  logo: boolean;
  changelog: boolean;
  oppio_api: boolean;
  oppio_role: "default" | "openpeerpower" | "manager" | "admin";
  openpeerpower_api: boolean;
  auth_api: boolean;
  full_access: boolean;
  protected: boolean;
  rating: "1-6";
  stdin: boolean;
  webui: null | string;
  gpio: boolean;
  kernel_modules: boolean;
  devicetree: boolean;
  docker_api: boolean;
  audio: boolean;
  audio_input: null | string;
  audio_output: null | string;
  services_role: string[];
  discovery: string[];
  ip_address: string;
  ingress: boolean;
  ingress_panel: boolean;
  ingress_entry: null | string;
  ingress_url: null | string;
}

export interface OppioAddonsInfo {
  addons: OppioAddonInfo[];
  repositories: OppioAddonRepository[];
}

export interface OppioAddonSetSecurityParams {
  protected?: boolean;
}

export interface OppioAddonRepository {
  slug: string;
  name: string;
  source: string;
  url: string;
  maintainer: string;
}

export interface OppioAddonSetOptionParams {
  audio_input?: string | null;
  audio_output?: string | null;
  options?: object | null;
  boot?: "auto" | "manual";
  auto_update?: boolean;
  ingress_panel?: boolean;
  network?: object | null;
}

export const reloadOppioAddons = async (opp: OpenPeerPower) => {
  await opp.callApi<OppioResponse<void>>("POST", `oppio/addons/reload`);
};

export const fetchOppioAddonsInfo = async (opp: OpenPeerPower) => {
  return oppioApiResultExtractor(
    await opp.callApi<OppioResponse<OppioAddonsInfo>>("GET", `oppio/addons`)
  );
};

export const fetchOppioAddonInfo = async (opp: OpenPeerPower, slug: string) => {
  return oppioApiResultExtractor(
    await opp.callApi<OppioResponse<OppioAddonDetails>>(
      "GET",
      `oppio/addons/${slug}/info`
    )
  );
};

export const fetchOppioAddonChangelog = async (
  opp: OpenPeerPower,
  slug: string
) => {
  return opp.callApi<string>("GET", `oppio/addons/${slug}/changelog`);
};

export const fetchOppioAddonLogs = async (opp: OpenPeerPower, slug: string) => {
  return opp.callApi<string>("GET", `oppio/addons/${slug}/logs`);
};

export const setOppioAddonOption = async (
  opp: OpenPeerPower,
  slug: string,
  data: OppioAddonSetOptionParams
) => {
  await opp.callApi<OppioResponse<void>>(
    "POST",
    `oppio/addons/${slug}/options`,
    data
  );
};

export const setOppioAddonSecurity = async (
  opp: OpenPeerPower,
  slug: string,
  data: OppioAddonSetSecurityParams
) => {
  await opp.callApi<OppioResponse<void>>(
    "POST",
    `oppio/addons/${slug}/security`,
    data
  );
};

export const installOppioAddon = async (opp: OpenPeerPower, slug: string) => {
  return opp.callApi<OppioResponse<void>>(
    "POST",
    `oppio/addons/${slug}/install`
  );
};

export const uninstallOppioAddon = async (opp: OpenPeerPower, slug: string) => {
  await opp.callApi<OppioResponse<void>>(
    "POST",
    `oppio/addons/${slug}/uninstall`
  );
};
