import {
  getAuth,
  createConnection,
  subscribeConfig,
  subscribeEntities,
  subscribeServices,
  ERR_INVALID_AUTH,
  Auth,
  Connection,
} from "../open-peer-power-js-websocket/lib";

import { loadTokens, saveTokens } from "../common/auth/token_storage";
import { subscribePanels } from "../data/ws-panels";
import { subscribeThemes } from "../data/ws-themes";
import { subscribeUser } from "../data/ws-user";
import { OpenPeerPower } from "../types";
import { oppUrl } from "../data/auth";
import { fetchConfig, WindowWithLovelaceProm } from "../data/lovelace";

declare global {
  interface Window {
    oppConnection: Promise<{ auth: Auth; conn: Connection }>;
  }
}

const authProm = () =>
      getAuth({
        oppUrl,
        saveTokens,
        loadTokens: () => Promise.resolve(loadTokens()),
      });


const connProm = async (auth) => {
  try {
    const conn = await createConnection({ auth });

    // Clear url if we have been able to establish a connection
    if (location.search.includes("auth_callback=1")) {
      history.replaceState(null, "", location.pathname);
    }

    return { auth, conn };
  } catch (err) {
    if (err !== ERR_INVALID_AUTH) {
      throw err;
    }
    // We can get invalid auth if auth tokens were stored that are no longer valid
    // Clear stored tokens.
    saveTokens(null);
    auth = await authProm();
    const conn = await createConnection({ auth });
    return { auth, conn };
  }
};

debugger;
window.oppConnection = authProm().then(connProm);

// Start fetching some of the data that we will need.
window.oppConnection.then(({ conn }) => {
  const noop = () => {
    // do nothing
  };
  subscribeEntities(conn, noop);
  subscribeConfig(conn, noop);
  subscribeServices(conn, noop);
  subscribePanels(conn, noop);
  subscribeThemes(conn, noop);
  subscribeUser(conn, noop);

  if (location.pathname === "/" || location.pathname.startsWith("/lovelace/")) {
    (window as WindowWithLovelaceProm).llConfProm = fetchConfig(conn, false);
  }
});

window.addEventListener("error", (e) => {
});