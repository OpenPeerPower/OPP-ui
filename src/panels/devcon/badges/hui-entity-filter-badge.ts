import { createBadgeElement } from "../create-element/create-badge-element";
import { processConfigEntities } from "../common/process-config-entities";
import { DevconBadge } from "../types";
import { EntityFilterEntityConfig } from "../entity-rows/types";
import { OpenPeerPower } from "../../../types";
import { EntityFilterBadgeConfig } from "./types";
import { evaluateFilter } from "../common/evaluate-filter";

class EntityFilterBadge extends HTMLElement implements DevconBadge {
  private _elements?: DevconBadge[];
  private _config?: EntityFilterBadgeConfig;
  private _configEntities?: EntityFilterEntityConfig[];
  private _opp?: OpenPeerPower;
  private _oldEntities?: EntityFilterEntityConfig[];

  public setConfig(config: EntityFilterBadgeConfig): void {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error("entities must be specified.");
    }

    if (
      !(config.state_filter && Array.isArray(config.state_filter)) &&
      !config.entities.every(
        (entity) =>
          typeof entity === "object" &&
          entity.state_filter &&
          Array.isArray(entity.state_filter)
      )
    ) {
      throw new Error("Incorrect filter config.");
    }

    this._config = config;
    this._configEntities = undefined;

    if (this.lastChild) {
      this.removeChild(this.lastChild);
      this._elements = undefined;
    }
  }

  set opp(opp: OpenPeerPower) {
    if (!opp || !this._config) {
      return;
    }

    if (this._elements) {
      for (const element of this._elements) {
        element.opp = opp;
      }
    }

    if (!this.haveEntitiesChanged(opp)) {
      this._opp = opp;
      return;
    }

    this._opp = opp;

    if (!this._configEntities) {
      this._configEntities = processConfigEntities(this._config.entities);
    }

    const entitiesList = this._configEntities.filter((entityConf) => {
      const stateObj = opp.states[entityConf.entity];

      if (!stateObj) {
        return false;
      }

      if (entityConf.state_filter) {
        for (const filter of entityConf.state_filter) {
          if (evaluateFilter(stateObj, filter)) {
            return true;
          }
        }
      } else {
        for (const filter of this._config!.state_filter) {
          if (evaluateFilter(stateObj, filter)) {
            return true;
          }
        }
      }

      return false;
    });

    if (entitiesList.length === 0) {
      this.style.display = "none";
      return;
    }

    const isSame =
      this._oldEntities &&
      entitiesList.length === this._oldEntities.length &&
      entitiesList.every((entity, idx) => entity === this._oldEntities![idx]);

    if (!isSame) {
      this._elements = [];
      for (const badgeConfig of entitiesList) {
        const element = createBadgeElement(badgeConfig);
        element.opp = opp;
        this._elements.push(element);
      }
      this._oldEntities = entitiesList;
    }

    if (!this._elements) {
      return;
    }

    while (this.lastChild) {
      this.removeChild(this.lastChild);
    }

    for (const element of this._elements) {
      this.appendChild(element);
    }

    this.style.display = "inline";
  }

  private haveEntitiesChanged(opp: OpenPeerPower): boolean {
    if (!this._opp) {
      return true;
    }

    if (!this._configEntities || this._opp.localize !== opp.localize) {
      return true;
    }

    for (const config of this._configEntities) {
      if (this._opp.states[config.entity] !== opp.states[config.entity]) {
        return true;
      }
    }

    return false;
  }
}
customElements.define("hui-entity-filter-badge", EntityFilterBadge);
