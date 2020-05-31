import "@polymer/paper-input/paper-input";
import "../../../../../components/op-textarea";

import "../../../../../components/entity/op-entity-picker";
import { LitElement, html, customElement, property } from "lit-element";
import { OpenPeerPower } from "../../../../../types";
import { fireEvent } from "../../../../../common/dom/fire_event";
import { handleChangeEvent } from "../op-automation-condition-row";
import { NumericStateCondition } from "../../../../../data/automation";

@customElement("op-automation-condition-numeric_state")
export default class OpNumericStateCondition extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public condition!: NumericStateCondition;

  public static get defaultConfig() {
    return {
      entity_id: "",
    };
  }

  public render() {
    const { value_template, entity_id, below, above } = this.condition;

    return html`
      <op-entity-picker
        .value="${entity_id}"
        @value-changed="${this._entityPicked}"
        .opp="${this.opp}"
        allow-custom-entity
      ></op-entity-picker>
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.conditions.type.numeric_state.above"
        )}
        name="above"
        .value=${above}
        @value-changed=${this._valueChanged}
      ></paper-input>
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.conditions.type.numeric_state.below"
        )}
        name="below"
        .value=${below}
        @value-changed=${this._valueChanged}
      ></paper-input>
      <op-textarea
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.conditions.type.numeric_state.value_template"
        )}
        name="value_template"
        .value=${value_template}
        @value-changed=${this._valueChanged}
        dir="ltr"
      ></op-textarea>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    handleChangeEvent(this, ev);
  }

  private _entityPicked(ev) {
    ev.stopPropagation();
    fireEvent(this, "value-changed", {
      value: { ...this.condition, entity_id: ev.detail.value },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-condition-numeric_state": OpNumericStateCondition;
  }
}
