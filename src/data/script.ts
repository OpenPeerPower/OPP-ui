import { OpenPeerPower } from "../types";
import { computeObjectId } from "../common/entity/compute_object_id";
import { Condition } from "./automation";
import { OppEntityBase, OppEntityAttributeBase } from "../websocket/lib";
import { navigate } from "../common/navigate";

export interface ScriptEntity extends OppEntityBase {
  attributes: OppEntityAttributeBase & {
    last_triggered: string;
  };
}

export interface ScriptConfig {
  alias: string;
  sequence: Action[];
}

export interface EventAction {
  event: string;
  event_data?: { [key: string]: any };
  event_data_template?: { [key: string]: any };
}

export interface ServiceAction {
  service: string;
  entity_id?: string;
  data?: { [key: string]: any };
}

export interface DeviceAction {
  device_id: string;
  domain: string;
  entity_id: string;
}

export interface DelayAction {
  delay: number;
}

export interface SceneAction {
  scene: string;
}

export interface WaitAction {
  wait_template: string;
  timeout?: number;
}

export type Action =
  | EventAction
  | DeviceAction
  | ServiceAction
  | Condition
  | DelayAction
  | SceneAction
  | WaitAction;

export const triggerScript = (
  opp: OpenPeerPower,
  entityId: string,
  variables?: {}
) => opp.callService("script", computeObjectId(entityId), variables);

export const deleteScript = (opp: OpenPeerPower, objectId: string) =>
  opp.callApi("DELETE", `config/script/config/${objectId}`);

let inititialScriptEditorData: Partial<ScriptConfig> | undefined;

export const showScriptEditor = (
  el: HTMLElement,
  data?: Partial<ScriptConfig>
) => {
  inititialScriptEditorData = data;
  navigate(el, "/config/script/new");
};

export const getScriptEditorInitData = () => {
  const data = inititialScriptEditorData;
  inititialScriptEditorData = undefined;
  return data;
};
