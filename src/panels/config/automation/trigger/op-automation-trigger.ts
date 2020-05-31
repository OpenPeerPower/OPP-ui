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

import { fireEvent } from "../../../../common/dom/fire_event";
import { OpenPeerPower } from "../../../../types";

import "./op-automation-trigger-row";
import { OpDeviceTrigger } from "./types/op-automation-trigger-device";
import { Trigger } from "../../../../data/automation";

@customElement("op-automation-trigger")
export default class OpAutomationTrigger extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public triggers!: Trigger[];

  protected render() {
    return html`
      ${this.triggers.map(
        (trg, idx) => html`
          <op-automation-trigger-row
            .index=${idx}
            .trigger=${trg}
            @value-changed=${this._triggerChanged}
            .opp=${this.opp}
          ></op-automation-trigger-row>
        `
      )}
      <op-card>
        <div class="card-actions add-card">
          <mwc-button @click=${this._addTrigger}>
            ${this.opp.localize(
              "ui.panel.config.automation.editor.triggers.add"
            )}
          </mwc-button>
        </div>
      </op-card>
    `;
  }

  private _addTrigger() {
    const triggers = this.triggers.concat({
      platform: "device",
      ...OpDeviceTrigger.defaultConfig,
    });

    fireEvent(this, "value-changed", { value: triggers });
  }

  private _triggerChanged(ev: CustomEvent) {
    ev.stopPropagation();
    const triggers = [...this.triggers];
    const newValue = ev.detail.value;
    const index = (ev.target as any).index;

    if (newValue === null) {
      triggers.splice(index, 1);
    } else {
      triggers[index] = newValue;
    }

    fireEvent(this, "value-changed", { value: triggers });
  }

  static get styles(): CSSResult {
    return css`
      op-automation-trigger-row,
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
    "op-automation-trigger": OpAutomationTrigger;
  }
}
