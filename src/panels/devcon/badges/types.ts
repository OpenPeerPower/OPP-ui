import { DevconBadgeConfig, ActionConfig } from "../../../data/devcon";
import { EntityFilterEntityConfig } from "../entity-rows/types";

export interface EntityFilterBadgeConfig extends DevconBadgeConfig {
  type: "entity-filter";
  entities: Array<EntityFilterEntityConfig | string>;
  state_filter: Array<{ key: string } | string>;
}

export interface ErrorBadgeConfig extends DevconBadgeConfig {
  error: string;
}

export interface StateLabelBadgeConfig extends DevconBadgeConfig {
  entity: string;
  name?: string;
  icon?: string;
  image?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}
