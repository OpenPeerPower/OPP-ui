// Nessages to be processed inside the Cast Receiver app

import { Auth } from "../websocket/lib";
import { CastManager } from "./cast_manager";

import { BaseCastMessage } from "./types";
import { CAST_DEV } from "./const";
import { CAST_DEV_OPP_URL } from "./dev_const";

export interface GetStatusMessage extends BaseCastMessage {
  type: "get_status";
}

export interface ConnectMessage extends BaseCastMessage {
  type: "connect";
  refreshToken: string;
  clientId: string | null;
  oppUrl: string;
}

export interface ShowDevconViewMessage extends BaseCastMessage {
  type: "show_devcon_view";
  viewPath: string | number | null;
}

export interface ShowDemoMessage extends BaseCastMessage {
  type: "show_demo";
}

export type OppMessage =
  | ShowDemoMessage
  | GetStatusMessage
  | ConnectMessage
  | ShowDevconViewMessage;

export const castSendAuth = (cast: CastManager, auth: Auth) =>
  cast.sendMessage({
    type: "connect",
    refreshToken: auth.data.refresh_token,
    clientId: auth.data.clientId,
    oppUrl: CAST_DEV ? CAST_DEV_OPP_URL : auth.data.oppUrl,
  });

export const castSendShowDevconView = (
  cast: CastManager,
  viewPath: ShowDevconViewMessage["viewPath"]
) =>
  cast.sendMessage({
    type: "show_devcon_view",
    viewPath,
  });

export const castSendShowDemo = (cast: CastManager) =>
  cast.sendMessage({
    type: "show_demo",
  });

export const ensureConnectedCastSession = (cast: CastManager, auth: Auth) => {
  if (cast.castConnectedToOurOpp) {
    return;
  }

  return new Promise((resolve) => {
    const unsub = cast.addEventListener("connection-changed", () => {
      if (cast.castConnectedToOurOpp) {
        unsub();
        resolve();
      }
    });

    castSendAuth(cast, auth);
  });
};
