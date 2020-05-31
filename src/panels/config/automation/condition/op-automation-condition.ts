import {
  LitElement,
  customElement,
  html,
  property,
  CSSResult,
  css,
} from "lit-element";
import "@material/mwc-button";
import "../../../../components/op-card";

import { OpDeviceCondition } from "./types/op-automation-condition-device";

import { fireEvent } from "../../../../common/dom/fire_event";
import { OpenPeerPower } from "../../../../types";

import "./op-automation-condition-row";
import { Condition } from "../../../../data/automation";

@customElement("op-automation-condition")
export default class OpAutomationCondition extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public conditions!: Condition[];

  protected render() {
    return html`
      ${this.conditions.map(
        (cond, idx) => html`
          <op-automation-condition-row
            .index=${idx}
            .condition=${cond}
            @value-changed=${this._conditionChanged}
            .opp=${this.opp}
          ></op-automation-condition-row>
        `
      )}
      <op-card>
        <div class="card-actions add-card">
          <mwc-button @click=${this._addCondition}>
            ${this.opp.localize(
              "ui.panel.config.automation.editor.conditions.add"
            )}
          </mwc-button>
        </div>
      </op-card>
    `;
  }

  private _addCondition() {
    const conditions = this.conditions.concat({
      condition: "device",
      ...OpDeviceCondition.defaultConfig,
    });

    fireEvent(this, "value-changed", { value: conditions });
  }

  private _conditionChanged(ev: CustomEvent) {
    ev.stopPropagation();
    const conditions = [...this.conditions];
    const newValue = ev.detail.value;
    const index = (ev.target as any).index;

    if (newValue === null) {
      conditions.splice(index, 1);
    } else {
      conditions[index] = newValue;
    }

    fireEvent(this, "value-changed", { value: conditions });
  }

  static get styles(): CSSResult {
    return css`
      op-automation-condition-row,
      op-card {
        display: block;
        margin-top: 16px;
      }
      .add-card mwc-button {
        display: block;
        text-align: center;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-condition": OpAutomationCondition;
  }
}
