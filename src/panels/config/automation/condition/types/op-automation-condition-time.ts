import "@polymer/paper-input/paper-input";
import { LitElement, html, property, customElement } from "lit-element";
import { OpenPeerPower } from "../../../../../types";
import {
  handleChangeEvent,
  ConditionElement,
} from "../op-automation-condition-row";
import { TimeCondition } from "../../../../../data/automation";

@customElement("op-automation-condition-time")
export class OpTimeCondition extends LitElement implements ConditionElement {
  @property() public opp!: OpenPeerPower;
  @property() public condition!: TimeCondition;

  public static get defaultConfig() {
    return {};
  }

  protected render() {
    const { after, before } = this.condition;
    return html`
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.conditions.type.time.after"
        )}
        name="after"
        .value=${after}
        @value-changed=${this._valueChanged}
      ></paper-input>
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.conditions.type.time.before"
        )}
        name="before"
        .value=${before}
        @value-changed=${this._valueChanged}
      ></paper-input>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    handleChangeEvent(this, ev);
  }
}
