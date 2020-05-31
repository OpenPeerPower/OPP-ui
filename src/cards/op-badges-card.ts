import { TemplateResult, html } from "lit-html";
import { customElement, LitElement, property } from "lit-element";
import { OppEntity } from "../websocket/lib";

import "../components/entity/op-state-label-badge";

import { OpenPeerPower } from "../types";
import { fireEvent } from "../common/dom/fire_event";

@customElement("op-badges-card")
class OpBadgesCard extends LitElement {
  @property() public opp?: OpenPeerPower;
  @property() public states?: OppEntity[];

  protected render(): TemplateResult {
    if (!this.opp || !this.states) {
      return html``;
    }

    return html`
      ${this.states.map(
        (state) => html`
          <op-state-label-badge
            .opp=${this.opp}
            .state=${state}
            @click=${this._handleClick}
          ></op-state-label-badge>
        `
      )}
    `;
  }

  private _handleClick(ev: Event) {
    const entityId = ((ev.target as any).state as OppEntity).entity_id;
    fireEvent(this, "opp-more-info", {
      entityId,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-badges-card": OpBadgesCard;
  }
}
