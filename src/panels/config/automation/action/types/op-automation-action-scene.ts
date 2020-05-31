import "../../../../../components/entity/op-entity-picker";

import { LitElement, property, customElement, html } from "lit-element";
import { ActionElement } from "../op-automation-action-row";
import { OpenPeerPower } from "../../../../../types";
import { PolymerChangedEvent } from "../../../../../polymer-types";
import { fireEvent } from "../../../../../common/dom/fire_event";
import { SceneAction } from "../../../../../data/script";

@customElement("op-automation-action-scene")
export class OpSceneAction extends LitElement implements ActionElement {
  @property() public opp!: OpenPeerPower;
  @property() public action!: SceneAction;

  public static get defaultConfig(): SceneAction {
    return { scene: "" };
  }

  protected render() {
    const { scene } = this.action;

    return html`
      <op-entity-picker
        .opp=${this.opp}
        .value=${scene}
        @value-changed=${this._entityPicked}
        .includeDomains=${["scene"]}
        allow-custom-entity
      ></op-entity-picker>
    `;
  }

  private _entityPicked(ev: PolymerChangedEvent<string>) {
    ev.stopPropagation();
    fireEvent(this, "value-changed", {
      value: { ...this.action, scene: ev.detail.value },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-action-scene": OpSceneAction;
  }
}
