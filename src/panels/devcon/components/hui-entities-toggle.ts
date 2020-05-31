import {
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
  customElement,
  property,
  css,
  CSSResult,
} from "lit-element";

import "../../../components/op-switch";

// tslint:disable-next-line: no-duplicate-imports
import { OpSwitch } from "../../../components/op-switch";
import { DOMAINS_TOGGLE } from "../../../common/const";
import { turnOnOffEntities } from "../common/entity/turn-on-off-entities";
import { OpenPeerPower } from "../../../types";
import { forwardHaptic } from "../../../data/haptics";

@customElement("hui-entities-toggle")
class HuiEntitiesToggle extends LitElement {
  @property() public entities?: string[];

  @property() protected opp?: OpenPeerPower;

  @property() private _toggleEntities?: string[];

  public updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has("entities")) {
      this._toggleEntities = this.entities!.filter(
        (entityId) =>
          entityId in this.opp!.states &&
          DOMAINS_TOGGLE.has(entityId.split(".", 1)[0])
      );
    }
  }

  protected render(): TemplateResult {
    if (!this._toggleEntities) {
      return html``;
    }

    return html`
      <op-switch
        aria-label=${this.opp!.localize("ui.panel.devcon.card.entities.toggle")}
        .checked="${this._toggleEntities!.some((entityId) => {
          const stateObj = this.opp!.states[entityId];
          return stateObj && stateObj.state === "on";
        })}"
        @change="${this._callService}"
      ></op-switch>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        width: 38px;
        display: block;
      }
      op-switch {
        padding: 13px 5px;
        margin: -4px -5px;
      }
    `;
  }

  private _callService(ev: MouseEvent): void {
    forwardHaptic("light");
    const turnOn = (ev.target as OpSwitch).checked;
    turnOnOffEntities(this.opp!, this._toggleEntities!, turnOn!);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-entities-toggle": HuiEntitiesToggle;
  }
}
