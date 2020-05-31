import { DevconCardConfig, ActionConfig } from "../../../data/devcon";
import { Condition } from "../common/validate-condition";
import { EntityConfig, EntityFilterEntityConfig } from "../entity-rows/types";
import { DevconElementConfig } from "../elements/types";
import { HuiImage } from "../components/hui-image";
import { DevconHeaderFooterConfig } from "../header-footer/types";

export interface AlarmPanelCardConfig extends DevconCardConfig {
  entity: string;
  name?: string;
  states?: string[];
  theme?: string;
}

export interface ConditionalCardConfig extends DevconCardConfig {
  card: DevconCardConfig;
  conditions: Condition[];
}

export interface EmptyStateCardConfig extends DevconCardConfig {
  content: string;
  title?: string;
}

export interface EntitiesCardEntityConfig extends EntityConfig {
  type?: string;
  secondary_info?: "entity-id" | "last-changed";
  action_name?: string;
  service?: string;
  service_data?: object;
  url?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  state_color?: boolean;
}

export interface EntitiesCardConfig extends DevconCardConfig {
  type: "entities";
  show_header_toggle?: boolean;
  title?: string;
  entities: EntitiesCardEntityConfig[];
  theme?: string;
  icon?: string;
  header?: DevconHeaderFooterConfig;
  footer?: DevconHeaderFooterConfig;
  state_color?: boolean;
}

export interface ButtonCardConfig extends DevconCardConfig {
  entity?: string;
  name?: string;
  show_name?: boolean;
  icon?: string;
  show_icon?: boolean;
  theme?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  state_color?: boolean;
}

export interface EntityFilterCardConfig extends DevconCardConfig {
  type: "entity-filter";
  entities: Array<EntityFilterEntityConfig | string>;
  state_filter: Array<{ key: string } | string>;
  card: Partial<DevconCardConfig>;
  show_empty?: boolean;
}

export interface ErrorCardConfig extends DevconCardConfig {
  error: string;
  origConfig: DevconCardConfig;
}

export interface SeverityConfig {
  green?: number;
  yellow?: number;
  red?: number;
}

export interface GaugeCardConfig extends DevconCardConfig {
  entity: string;
  name?: string;
  unit?: string;
  min?: number;
  max?: number;
  severity?: SeverityConfig;
  theme?: string;
}

export interface ConfigEntity extends EntityConfig {
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface PictureGlanceEntityConfig extends ConfigEntity {
  show_state?: boolean;
}

export interface GlanceConfigEntity extends ConfigEntity {
  show_last_changed?: boolean;
  image?: string;
  show_state?: boolean;
  state_color?: boolean;
}

export interface GlanceCardConfig extends DevconCardConfig {
  show_name?: boolean;
  show_state?: boolean;
  show_icon?: boolean;
  title?: string;
  theme?: string;
  entities: ConfigEntity[];
  columns?: number;
  state_color?: boolean;
}

export interface IframeCardConfig extends DevconCardConfig {
  aspect_ratio?: string;
  title?: string;
  url: string;
}

export interface LightCardConfig extends DevconCardConfig {
  entity: string;
  name?: string;
  theme?: string;
  icon?: string;
}

export interface MapCardConfig extends DevconCardConfig {
  type: "map";
  title: string;
  aspect_ratio: string;
  default_zoom?: number;
  entities?: Array<EntityConfig | string>;
  geo_location_sources?: string[];
  dark_mode?: boolean;
}

export interface MarkdownCardConfig extends DevconCardConfig {
  type: "markdown";
  content: string;
  title?: string;
  card_size?: number;
  entity_ids?: string | string[];
  theme?: string;
}

export interface MediaControlCardConfig extends DevconCardConfig {
  entity: string;
}

export interface HistoryGraphCardConfig extends DevconCardConfig {
  entities: Array<EntityConfig | string>;
  hours_to_show?: number;
  refresh_interval?: number;
  title?: string;
}

export interface PictureCardConfig extends DevconCardConfig {
  image?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  theme?: string;
}

export interface PictureElementsCardConfig extends DevconCardConfig {
  title?: string;
  image?: string;
  camera_image?: string;
  camera_view?: HuiImage["cameraView"];
  state_image?: {};
  state_filter: string[];
  aspect_ratio?: string;
  entity?: string;
  elements: DevconElementConfig[];
  theme?: string;
}

export interface PictureEntityCardConfig extends DevconCardConfig {
  entity: string;
  name?: string;
  image?: string;
  camera_image?: string;
  camera_view?: HuiImage["cameraView"];
  state_image?: {};
  state_filter?: string[];
  aspect_ratio?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  show_name?: boolean;
  show_state?: boolean;
  theme?: string;
}

export interface PictureGlanceCardConfig extends DevconCardConfig {
  entities: PictureGlanceEntityConfig[];
  title?: string;
  image?: string;
  camera_image?: string;
  camera_view?: HuiImage["cameraView"];
  state_image?: {};
  state_filter: string[];
  aspect_ratio?: string;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  show_state?: boolean;
  theme?: string;
}

export interface PlantAttributeTarget extends EventTarget {
  value?: string;
}

export interface PlantStatusCardConfig extends DevconCardConfig {
  name?: string;
  entity: string;
  theme?: string;
}

export interface SensorCardConfig extends DevconCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  graph?: string;
  unit?: string;
  detail?: number;
  theme?: string;
  hours_to_show?: number;
}

export interface ShoppingListCardConfig extends DevconCardConfig {
  title?: string;
  theme?: string;
}

export interface StackCardConfig extends DevconCardConfig {
  cards: DevconCardConfig[];
}

export interface ThermostatCardConfig extends DevconCardConfig {
  entity: string;
  theme?: string;
  name?: string;
}

export interface WeatherForecastCardConfig extends DevconCardConfig {
  entity: string;
  name?: string;
}
