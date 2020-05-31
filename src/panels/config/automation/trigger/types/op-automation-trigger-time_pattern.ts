import "@polymer/paper-input/paper-input";
import { LitElement, property, html, customElement } from "lit-element";
import {
  TriggerElement,
  handleChangeEvent,
} from "../op-automation-trigger-row";
import { OpenPeerPower } from "../../../../../types";
import { TimePatternTrigger } from "../../../../../data/automation";

@customElement("op-automation-trigger-time_pattern")
export class OpTimePatternTrigger extends LitElement implements TriggerElement {
  @property() public opp!: OpenPeerPower;
  @property() public trigger!: TimePatternTrigger;

  public static get defaultConfig() {
    return {};
  }

  protected render() {
    const { hours, minutes, seconds } = this.trigger;
    return html`
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.time_pattern.hours"
        )}
        name="hours"
        .value=${hours}
        @value-changed=${this._valueChanged}
      ></paper-input>
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.time_pattern.minutes"
        )}
        name="minutes"
        .value=${minutes}
        @value-changed=${this._valueChanged}
      ></paper-input>
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.time_pattern.seconds"
        )}
        name="seconds"
        .value=${seconds}
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
    "op-automation-trigger-time_pattern": OpTimePatternTrigger;
  }
}
