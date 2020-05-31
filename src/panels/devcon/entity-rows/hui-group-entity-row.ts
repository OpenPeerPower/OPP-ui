import {
  html,
  LitElement,
  TemplateResult,
  property,
  customElement,
  PropertyValues,
} from "lit-element";

import "../components/hui-generic-entity-row";
import "../../../components/entity/op-entity-toggle";
import "../components/hui-warning";

import { computeStateDisplay } from "../../../common/entity/compute_state_display";
import { DOMAINS_TOGGLE } from "../../../common/const";
import { OpenPeerPower } from "../../../types";
import { DevconRow, EntityConfig } from "./types";
import { hasConfigOrEntityChanged } from "../common/has-changed";

@customElement("hui-group-entity-row")
class HuiGroupEntityRow extends LitElement implements DevconRow {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: EntityConfig;

  public setConfig(config: EntityConfig): void {
    if (!config) {
      throw new Error("Configuration error");
    }
    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected render(): TemplateResult {
    if (!this._config || !this.opp) {
      return html``;
    }

    const stateObj = this.opp.states[this._config.entity];

    if (!stateObj) {
      return html`
        <hui-warning
          >${this.opp.localize(
            "ui.panel.devcon.warning.entity_not_found",
            "entity",
            this._config.entity
          )}</hui-warning
        >
      `;
    }

    return html`
      <hui-generic-entity-row .opp="${this.opp}" .config="${this._config}">
        ${this._computeCanToggle(stateObj.attributes.entity_id)
          ? html`
              <op-entity-toggle
                .opp="${this.opp}"
                .stateObj="${stateObj}"
              ></op-entity-toggle>
            `
          : html`
              <div>
                ${computeStateDisplay(
                  this.opp!.localize,
                  stateObj,
                  this.opp.language
                )}
              </div>
            `}
      </hui-generic-entity-row>
    `;
  }

  private _computeCanToggle(entityIds): boolean {
    return entityIds.some((entityId) =>
      DOMAINS_TOGGLE.has(entityId.split(".", 1)[0])
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-group-entity-row": HuiGroupEntityRow;
  }
}
