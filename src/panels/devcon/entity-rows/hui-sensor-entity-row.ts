import {
  html,
  LitElement,
  TemplateResult,
  property,
  CSSResult,
  css,
  customElement,
  PropertyValues,
} from "lit-element";

import "../components/hui-generic-entity-row";
import "../components/hui-timestamp-display";
import "../components/hui-warning";

import { OpenPeerPower } from "../../../types";
import { DevconRow, EntityConfig } from "./types";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import { computeStateDisplay } from "../../../common/entity/compute_state_display";

interface SensorEntityConfig extends EntityConfig {
  format?: "relative" | "date" | "time" | "datetime";
}

@customElement("hui-sensor-entity-row")
class HuiSensorEntityRow extends LitElement implements DevconRow {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: SensorEntityConfig;

  public setConfig(config: SensorEntityConfig): void {
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
        <div>
          ${stateObj.attributes.device_class === "timestamp" &&
          stateObj.state !== "unavailable" &&
          stateObj.state !== "unknown"
            ? html`
                <hui-timestamp-display
                  .opp="${this.opp}"
                  .ts="${new Date(stateObj.state)}"
                  .format="${this._config.format}"
                ></hui-timestamp-display>
              `
            : computeStateDisplay(
                this.opp!.localize,
                stateObj,
                this.opp.language
              )}
        </div>
      </hui-generic-entity-row>
    `;
  }

  static get styles(): CSSResult {
    return css`
      div {
        text-align: right;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-sensor-entity-row": HuiSensorEntityRow;
  }
}
