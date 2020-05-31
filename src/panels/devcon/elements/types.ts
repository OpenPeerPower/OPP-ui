import { OpenPeerPower } from "../../../types";
import { Condition } from "../common/validate-condition";
import { ActionConfig } from "../../../data/devcon";

export interface DevconElementConfig {
  type: string;
  style: object;
}

export interface DevconElement extends HTMLElement {
  opp?: OpenPeerPower;
  setConfig(config: DevconElementConfig): void;
}

export interface ConditionalElementConfig extends DevconElementConfig {
  conditions: Condition[];
  elements: DevconElementConfig[];
}

export interface IconElementConfig extends DevconElementConfig {
  entity?: string;
  name?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  icon: string;
}

export interface ImageElementConfig extends DevconElementConfig {
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  image?: string;
  state_image?: string;
  camera_image?: string;
  filter?: string;
  state_filter?: string;
  aspect_ratio?: string;
}

export interface ServiceButtonElementConfig extends DevconElementConfig {
  title?: string;
  service?: string;
  service_data?: object;
}

export interface StateBadgeElementConfig extends DevconElementConfig {
  entity: string;
  title?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface StateIconElementConfig extends DevconElementConfig {
  entity: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  icon?: string;
  state_color?: boolean;
}

export interface StateLabelElementConfig extends DevconElementConfig {
  entity: string;
  prefix?: string;
  suffix?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}
