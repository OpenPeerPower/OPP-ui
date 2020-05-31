import "@polymer/paper-input/paper-input";
import { LitElement, html, property, customElement } from "lit-element";
import { OpenPeerPower } from "../../../../../types";
import {
  handleChangeEvent,
  TriggerElement,
} from "../op-automation-trigger-row";
import { TimeTrigger } from "../../../../../data/automation";

@customElement("op-automation-trigger-time")
export class OpTimeTrigger extends LitElement implements TriggerElement {
  @property() public opp!: OpenPeerPower;
  @property() public trigger!: TimeTrigger;

  public static get defaultConfig() {
    return { at: "" };
  }

  protected render() {
    const { at } = this.trigger;
    return html`
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.time.at"
        )}
        name="at"
        .value=${at}
        @value-changed=${this._valueChanged}
      ></paper-input>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    handleChangeEvent(this, ev);
  }
}
