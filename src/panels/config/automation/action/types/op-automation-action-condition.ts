import "../../condition/op-automation-condition-editor";

import { LitElement, property, customElement, html } from "lit-element";
import { ActionElement } from "../op-automation-action-row";
import { OpenPeerPower } from "../../../../../types";
import { fireEvent } from "../../../../../common/dom/fire_event";
import { Condition } from "../../../../../data/automation";

@customElement("op-automation-action-condition")
export class OpConditionAction extends LitElement implements ActionElement {
  @property() public opp!: OpenPeerPower;
  @property() public action!: Condition;

  public static get defaultConfig() {
    return { condition: "state" };
  }

  public render() {
    return html`
      <op-automation-condition-editor
        .condition=${this.action}
        .opp=${this.opp}
        @value-changed=${this._conditionChanged}
      ></op-automation-condition-editor>
    `;
  }

  private _conditionChanged(ev: CustomEvent) {
    ev.stopPropagation();

    fireEvent(this, "value-changed", {
      value: ev.detail.value,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-action-condition": OpConditionAction;
  }
}
