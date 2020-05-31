import {
  html,
  LitElement,
  TemplateResult,
  property,
  css,
  CSSResult,
  customElement,
  PropertyValues,
} from "lit-element";

import "../../../components/op-climate-state";
import "../components/hui-generic-entity-row";
import "../components/hui-warning";

import { OpenPeerPower } from "../../../types";
import { DevconRow, EntityConfig } from "./types";
import { hasConfigOrEntityChanged } from "../common/has-changed";

@customElement("hui-climate-entity-row")
class HuiClimateEntityRow extends LitElement implements DevconRow {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: EntityConfig;

  public setConfig(config: EntityConfig): void {
    if (!config || !config.entity) {
      throw new Error("Invalid Configuration: 'entity' required");
    }

    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected render(): TemplateResult {
    if (!this.opp || !this._config) {
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
        <op-climate-state
          .opp="${this.opp}"
          .stateObj="${stateObj}"
        ></op-climate-state>
      </hui-generic-entity-row>
    `;
  }

  static get styles(): CSSResult {
    return css`
      op-climate-state {
        text-align: right;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-climate-entity-row": HuiClimateEntityRow;
  }
}
