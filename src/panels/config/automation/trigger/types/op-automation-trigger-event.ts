import "@polymer/paper-input/paper-input";
import "../../../../../components/op-yaml-editor";

import { LitElement, property, customElement } from "lit-element";
import {
  TriggerElement,
  handleChangeEvent,
} from "../op-automation-trigger-row";
import { OpenPeerPower } from "../../../../../types";
import { html } from "lit-html";
import { EventTrigger } from "../../../../../data/automation";

@customElement("op-automation-trigger-event")
export class OpEventTrigger extends LitElement implements TriggerElement {
  @property() public opp!: OpenPeerPower;
  @property() public trigger!: EventTrigger;

  public static get defaultConfig() {
    return { event_type: "", event_data: {} };
  }

  public render() {
    const { event_type, event_data } = this.trigger;
    return html`
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.event.event_type"
        )}
        name="event_type"
        .value="${event_type}"
        @value-changed="${this._valueChanged}"
      ></paper-input>
      <op-yaml-editor
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.event.event_data"
        )}
        .name=${"event_data"}
        .defaultValue=${event_data}
        @value-changed=${this._valueChanged}
      ></op-yaml-editor>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!ev.detail.isValid) {
      return;
    }
    handleChangeEvent(this, ev);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-trigger-event": OpEventTrigger;
  }
}
