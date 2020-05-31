import "../badges/hui-state-label-badge";

import { DevconBadgeConfig } from "../../../data/devcon";
import { createDevconElement } from "./create-element-base";

// lazy load imports
import "../badges/hui-entity-filter-badge";

const ALWAYS_LOADED_TYPES = new Set([
  "error",
  "state-label",

  // lazy load types
  "entity-filter",
]);
const LAZY_LOAD_TYPES = {
  // "entity-filter": () => import("../badges/hui-entity-filter-badge"),
};

export const createBadgeElement = (config: DevconBadgeConfig) =>
  createDevconElement(
    "badge",
    config,
    ALWAYS_LOADED_TYPES,
    LAZY_LOAD_TYPES,
    undefined,
    "state-label"
  );
