import { OpenPeerPower } from "../types";
import { Connection, getCollection } from "../websocket/lib";
import { OPPDomEvent } from "../common/dom/fire_event";

export interface DevconConfig {
  title?: string;
  views: DevconViewConfig[];
  background?: string;
  resources?: Array<{ type: "css" | "js" | "module" | "html"; url: string }>;
}

export interface DevconViewConfig {
  index?: number;
  title?: string;
  badges?: Array<string | DevconBadgeConfig>;
  cards?: DevconCardConfig[];
  path?: string;
  icon?: string;
  theme?: string;
  panel?: boolean;
  background?: string;
  visible?: boolean | ShowViewConfig[];
}

export interface ShowViewConfig {
  user?: string;
}

export interface DevconBadgeConfig {
  type?: string;
  [key: string]: any;
}

export interface DevconCardConfig {
  index?: number;
  view_index?: number;
  type: string;
  [key: string]: any;
}

export interface ToggleActionConfig extends BaseActionConfig {
  action: "toggle";
}

export interface CallServiceActionConfig extends BaseActionConfig {
  action: "call-service";
  service: string;
  service_data?: {
    entity_id?: string | [string];
    [key: string]: any;
  };
}

export interface NavigateActionConfig extends BaseActionConfig {
  action: "navigate";
  navigation_path: string;
}

export interface UrlActionConfig extends BaseActionConfig {
  action: "url";
  url_path: string;
}

export interface MoreInfoActionConfig extends BaseActionConfig {
  action: "more-info";
}

export interface NoActionConfig extends BaseActionConfig {
  action: "none";
}

export interface CustomActionConfig extends BaseActionConfig {
  action: "fire-dom-event";
}

export interface BaseActionConfig {
  confirmation?: ConfirmationRestrictionConfig;
}

export interface ConfirmationRestrictionConfig {
  text?: string;
  exemptions?: RestrictionConfig[];
}

export interface RestrictionConfig {
  user: string;
}

export type ActionConfig =
  | ToggleActionConfig
  | CallServiceActionConfig
  | NavigateActionConfig
  | UrlActionConfig
  | MoreInfoActionConfig
  | NoActionConfig
  | CustomActionConfig;

export const fetchConfig = (
  conn: Connection,
  force: boolean
): Promise<DevconConfig> =>
  conn.sendMessagePromise({
    type: "devcon/config",
    force,
  });

export const saveConfig = (
  opp: OpenPeerPower,
  config: DevconConfig
): Promise<void> =>
  opp.callWS({
    type: "devcon/config/save",
    config,
  });

export const deleteConfig = (opp: OpenPeerPower): Promise<void> =>
  opp.callWS({
    type: "devcon/config/delete",
  });

export const subscribeDevconUpdates = (
  conn: Connection,
  onChange: () => void
) => conn.subscribeEvents(onChange, "devcon_updated");

export const getDevconCollection = (conn: Connection) =>
  getCollection(
    conn,
    "_devcon",
    (conn2) => fetchConfig(conn2, false),
    (_conn, store) =>
      subscribeDevconUpdates(conn, () =>
        fetchConfig(conn, false).then((config) => store.setState(config, true))
      )
  );

export interface WindowWithDevconProm extends Window {
  llConfProm?: Promise<DevconConfig>;
}

export interface ActionHandlerOptions {
  hasHold?: boolean;
  hasDoubleClick?: boolean;
}

export interface ActionHandlerDetail {
  action: string;
}

export type ActionHandlerEvent = OPPDomEvent<ActionHandlerDetail>;
