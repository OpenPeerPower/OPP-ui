import { OpenPeerPower, Constructor } from "../../types";
import {
  DevconCardConfig,
  DevconConfig,
  DevconBadgeConfig,
} from "../../data/devcon";
import { DevconHeaderFooterConfig } from "./header-footer/types";

declare global {
  // tslint:disable-next-line
  interface OPPDomEvents {
    "ll-rebuild": {};
    "ll-badge-rebuild": {};
  }
}

export interface Devcon {
  config: DevconConfig;
  editMode: boolean;
  mode: "generated" | "yaml" | "storage";
  language: string;
  enableFullEditMode: () => void;
  setEditMode: (editMode: boolean) => void;
  saveConfig: (newConfig: DevconConfig) => Promise<void>;
  deleteConfig: () => Promise<void>;
}

export interface DevconBadge extends HTMLElement {
  opp?: OpenPeerPower;
  setConfig(config: DevconBadgeConfig): void;
}

export interface DevconCard extends HTMLElement {
  opp?: OpenPeerPower;
  isPanel?: boolean;
  getCardSize(): number;
  setConfig(config: DevconCardConfig): void;
}

export interface DevconCardConstructor extends Constructor<DevconCard> {
  getStubConfig?: (opp: OpenPeerPower) => DevconCardConfig;
  getConfigElement?: () => DevconCardEditor;
}

export interface DevconHeaderFooter extends HTMLElement {
  opp?: OpenPeerPower;
  setConfig(config: DevconHeaderFooterConfig): void;
}

export interface DevconCardEditor extends HTMLElement {
  opp?: OpenPeerPower;
  setConfig(config: DevconCardConfig): void;
}
