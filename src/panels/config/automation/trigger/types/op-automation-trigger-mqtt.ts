import "@polymer/paper-input/paper-input";
import { LitElement, customElement, property, html } from "lit-element";
import { OpenPeerPower } from "../../../../../types";
import {
  handleChangeEvent,
  TriggerElement,
} from "../op-automation-trigger-row";
import { MqttTrigger } from "../../../../../data/automation";

@customElement("op-automation-trigger-mqtt")
export class OpMQTTTrigger extends LitElement implements TriggerElement {
  @property() public opp!: OpenPeerPower;
  @property() public trigger!: MqttTrigger;

  public static get defaultConfig() {
    return { topic: "" };
  }

  protected render() {
    const { topic, payload } = this.trigger;
    return html`
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.mqtt.topic"
        )}
        name="topic"
        .value=${topic}
        @value-changed=${this._valueChanged}
      ></paper-input>
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.mqtt.payload"
        )}
        name="payload"
        .value=${payload}
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
    "op-automation-trigger-mqtt": OpMQTTTrigger;
  }
}
