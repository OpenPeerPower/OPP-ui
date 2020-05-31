import "@polymer/paper-input/paper-input";
import "../../../../../components/op-service-picker";
import "../../../../../components/entity/op-entity-picker";
import "../../../../../components/op-yaml-editor";

import {
  LitElement,
  property,
  customElement,
  PropertyValues,
  query,
} from "lit-element";
import { ActionElement, handleChangeEvent } from "../op-automation-action-row";
import { OpenPeerPower } from "../../../../../types";
import { html } from "lit-html";
import { EventAction } from "../../../../../data/script";
// tslint:disable-next-line
import { OpYamlEditor } from "../../../../../components/op-yaml-editor";

@customElement("op-automation-action-event")
export class OpEventAction extends LitElement implements ActionElement {
  @property() public opp!: OpenPeerPower;
  @property() public action!: EventAction;
  @query("op-yaml-editor") private _yamlEditor?: OpYamlEditor;
  private _actionData?: EventAction["event_data"];

  public static get defaultConfig(): EventAction {
    return { event: "", event_data: {} };
  }

  protected updated(changedProperties: PropertyValues) {
    if (!changedProperties.has("action")) {
      return;
    }
    if (this._actionData && this._actionData !== this.action.event_data) {
      if (this._yamlEditor) {
        this._yamlEditor.setValue(this.action.event_data);
      }
    }
    this._actionData = this.action.event_data;
  }

  protected render() {
    const { event, event_data } = this.action;

    return html`
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.actions.type.event.event"
        )}
        name="event"
        .value=${event}
        @value-changed=${this._valueChanged}
      ></paper-input>
      <op-yaml-editor
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.actions.type.event.service_data"
        )}
        .name=${"event_data"}
        .defaultValue=${event_data}
        @value-changed=${this._dataChanged}
      ></op-yaml-editor>
    `;
  }

  private _dataChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!ev.detail.isValid) {
      return;
    }
    this._actionData = ev.detail.value;
    handleChangeEvent(this, ev);
  }

  private _valueChanged(ev: CustomEvent): void {
    handleChangeEvent(this, ev);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-action-event": OpEventAction;
  }
}
