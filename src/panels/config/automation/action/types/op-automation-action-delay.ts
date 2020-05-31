import "@polymer/paper-input/paper-input";
import "../../../../../components/op-service-picker";
import "../../../../../components/entity/op-entity-picker";

import { LitElement, property, customElement, html } from "lit-element";
import { ActionElement, handleChangeEvent } from "../op-automation-action-row";
import { OpenPeerPower } from "../../../../../types";
import { DelayAction } from "../../../../../data/script";

@customElement("op-automation-action-delay")
export class OpDelayAction extends LitElement implements ActionElement {
  @property() public opp!: OpenPeerPower;
  @property() public action!: DelayAction;

  public static get defaultConfig() {
    return { delay: "" };
  }

  public render() {
    const { delay } = this.action;

    return html`
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.actions.type.delay.delay"
        )}
        name="delay"
        .value=${delay}
        @value-changed=${this._valueChanged}
      ></paper-input>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    handleChangeEvent(this, ev);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-action-delay": OpDelayAction;
  }
}
