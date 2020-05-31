import { OpenPeerPower } from "../types";

export interface AuthProvider {
  name: string;
  id: string;
  type: string;
}

export interface Credential {
  type: string;
}

export interface SignedPath {
  path: string;
}

export const oppUrl = `${location.protocol}//${location.host}`;

export const getSignedPath = (
  opp: OpenPeerPower,
  path: string
): Promise<SignedPath> => opp.callWS({ type: "auth/sign_path", path });

export const fetchAuthProviders = () =>
  fetch("/auth/providers", {
    credentials: "same-origin",
  });
