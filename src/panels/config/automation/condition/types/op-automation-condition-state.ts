import "@polymer/paper-input/paper-input";
import { customElement, html, LitElement, property } from "lit-element";
import { fireEvent } from "../../../../../common/dom/fire_event";
import "../../../../../components/entity/op-entity-picker";
import { OpenPeerPower } from "../../../../../types";
import {
  handleChangeEvent,
  ConditionElement,
} from "../op-automation-condition-row";
import { PolymerChangedEvent } from "../../../../../polymer-types";
import { StateCondition } from "../../../../../data/automation";

@customElement("op-automation-condition-state")
export class OpStateCondition extends LitElement implements ConditionElement {
  @property() public opp!: OpenPeerPower;
  @property() public condition!: StateCondition;

  public static get defaultConfig() {
    return { entity_id: "", state: "" };
  }

  protected render() {
    const { entity_id, state } = this.condition;

    return html`
      <op-entity-picker
        .value=${entity_id}
        @value-changed=${this._entityPicked}
        .opp=${this.opp}
        allow-custom-entity
      ></op-entity-picker>
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.conditions.type.state.state"
        )}
        .name=${"state"}
        .value=${state}
        @value-changed=${this._valueChanged}
      ></paper-input>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    handleChangeEvent(this, ev);
  }

  private _entityPicked(ev: PolymerChangedEvent<string>) {
    ev.stopPropagation();
    fireEvent(this, "value-changed", {
      value: { ...this.condition, entity_id: ev.detail.value },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-condition-state": OpStateCondition;
  }
}
