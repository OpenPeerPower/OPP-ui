import "@polymer/paper-input/paper-input";

import { LitElement, property, customElement } from "lit-element";
import { ActionElement, handleChangeEvent } from "../op-automation-action-row";
import { OpenPeerPower } from "../../../../../types";
import { html } from "lit-html";
import { WaitAction } from "../../../../../data/script";

@customElement("op-automation-action-wait_template")
export class OpWaitAction extends LitElement implements ActionElement {
  @property() public opp!: OpenPeerPower;
  @property() public action!: WaitAction;

  public static get defaultConfig() {
    return { wait_template: "", timeout: "" };
  }

  protected render() {
    const { wait_template, timeout } = this.action;

    return html`
      <op-textarea
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.actions.type.wait_template.wait_template"
        )}
        name="wait_template"
        .value=${wait_template}
        @value-changed=${this._valueChanged}
        dir="ltr"
      ></op-textarea>
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.actions.type.wait_template.timeout"
        )}
        .name=${"timeout"}
        .value=${timeout}
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
    "op-automation-action-wait_template": OpWaitAction;
  }
}
