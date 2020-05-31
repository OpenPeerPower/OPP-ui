import { OpenPeerPower } from "../../types";
import { OppioResponse, oppioApiResultExtractor } from "./common";

export interface OppioSnapshot {
  slug: string;
  date: string;
  name: string;
  type: "full" | "partial";
  protected: boolean;
}

export interface OppioSnapshotDetail extends OppioSnapshot {
  size: number;
  openpeerpower: string;
  addons: Array<{
    slug: "ADDON_SLUG";
    name: "NAME";
    version: "INSTALLED_VERSION";
    size: "SIZE_IN_MB";
  }>;
  repositories: string[];
  folders: string[];
}

export interface OppioFullSnapshotCreateParams {
  name: string;
  password?: string;
}
export interface OppioPartialSnapshotCreateParams {
  name: string;
  folders: string[];
  addons: string[];
  password?: string;
}

export const fetchOppioSnapshots = async (opp: OpenPeerPower) => {
  return oppioApiResultExtractor(
    await opp.callApi<OppioResponse<{ snapshots: OppioSnapshot[] }>>(
      "GET",
      "oppio/snapshots"
    )
  ).snapshots;
};

export const fetchOppioSnapshotInfo = async (
  opp: OpenPeerPower,
  snapshot: string
) => {
  return oppioApiResultExtractor(
    await opp.callApi<OppioResponse<OppioSnapshotDetail>>(
      "GET",
      `oppio/snapshots/${snapshot}/info`
    )
  );
};

export const reloadOppioSnapshots = async (opp: OpenPeerPower) => {
  await opp.callApi<OppioResponse<void>>("POST", `oppio/snapshots/reload`);
};

export const createOppioFullSnapshot = async (
  opp: OpenPeerPower,
  data: OppioFullSnapshotCreateParams
) => {
  await opp.callApi<OppioResponse<void>>(
    "POST",
    `oppio/snapshots/new/full`,
    data
  );
};

export const createOppioPartialSnapshot = async (
  opp: OpenPeerPower,
  data: OppioFullSnapshotCreateParams
) => {
  await opp.callApi<OppioResponse<void>>(
    "POST",
    `oppio/snapshots/new/partial`,
    data
  );
};
