import { createCardElement } from "../create-element/create-card-element";
import { processConfigEntities } from "../common/process-config-entities";
import { DevconCard } from "../types";
import { DevconCardConfig } from "../../../data/devcon";
import { EntityFilterEntityConfig } from "../entity-rows/types";
import { OpenPeerPower } from "../../../types";
import { EntityFilterCardConfig } from "./types";
import { evaluateFilter } from "../common/evaluate-filter";

class EntityFilterCard extends HTMLElement implements DevconCard {
  public isPanel?: boolean;
  private _element?: DevconCard;
  private _config?: EntityFilterCardConfig;
  private _configEntities?: EntityFilterEntityConfig[];
  private _baseCardConfig?: DevconCardConfig;
  private _opp?: OpenPeerPower;
  private _oldEntities?: EntityFilterEntityConfig[];

  public getCardSize(): number {
    return this._element ? this._element.getCardSize() : 1;
  }

  public setConfig(config: EntityFilterCardConfig): void {
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
    this._baseCardConfig = {
      type: "entities",
      entities: [],
      ...this._config.card,
    };

    if (this.lastChild) {
      this.removeChild(this.lastChild);
      this._element = undefined;
    }
  }

  set opp(opp: OpenPeerPower) {
    if (!opp || !this._config) {
      return;
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

    if (entitiesList.length === 0 && this._config.show_empty === false) {
      this.style.display = "none";
      return;
    }

    const element = this._cardElement();

    if (!element) {
      return;
    }

    if (element.tagName !== "HUI-ERROR-CARD") {
      const isSame =
        this._oldEntities &&
        entitiesList.length === this._oldEntities.length &&
        entitiesList.every((entity, idx) => entity === this._oldEntities![idx]);

      if (!isSame) {
        this._oldEntities = entitiesList;
        element.setConfig({ ...this._baseCardConfig!, entities: entitiesList });
      }

      element.isPanel = this.isPanel;
      element.opp = opp;
    }

    // Attach element if it has never been attached.
    if (!this.lastChild) {
      this.appendChild(element);
    }

    this.style.display = "block";
  }

  private haveEntitiesChanged(opp: OpenPeerPower): boolean {
    if (!this._opp) {
      return true;
    }

    if (!this._configEntities) {
      return true;
    }

    for (const config of this._configEntities) {
      if (
        this._opp.states[config.entity] !== opp.states[config.entity] ||
        this._opp.localize !== opp.localize
      ) {
        return true;
      }
    }

    return false;
  }

  private _cardElement(): DevconCard | undefined {
    if (!this._element && this._config) {
      const element = createCardElement(this._baseCardConfig!);
      this._element = element;
    }

    return this._element;
  }
}
customElements.define("hui-entity-filter-card", EntityFilterCard);
