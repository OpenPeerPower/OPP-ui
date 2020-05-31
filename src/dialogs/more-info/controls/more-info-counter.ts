import {
  LitElement,
  html,
  TemplateResult,
  CSSResult,
  css,
  property,
  customElement,
} from "lit-element";
import "@material/mwc-button";
import { OppEntity } from "../../../websocket/lib";

import { OpenPeerPower } from "../../../types";

@customElement("more-info-counter")
class MoreInfoCounter extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public stateObj?: OppEntity;

  protected render(): TemplateResult {
    if (!this.opp || !this.stateObj) {
      return html``;
    }

    return html`
      <div class="actions">
        <mwc-button
          .action="${"increment"}"
          @click="${this._handleActionClick}"
        >
          ${this.opp!.localize("ui.card.counter.actions.increment")}
        </mwc-button>
        <mwc-button
          .action="${"decrement"}"
          @click="${this._handleActionClick}"
        >
          ${this.opp!.localize("ui.card.counter.actions.decrement")}
        </mwc-button>
        <mwc-button .action="${"reset"}" @click="${this._handleActionClick}">
          ${this.opp!.localize("ui.card.counter.actions.reset")}
        </mwc-button>
      </div>
    `;
  }

  private _handleActionClick(e: MouseEvent): void {
    const action = (e.currentTarget as any).action;
    this.opp.callService("counter", action, {
      entity_id: this.stateObj!.entity_id,
    });
  }

  static get styles(): CSSResult {
    return css`
      .actions {
        margin: 0 8px;
        padding-top: 20px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-counter": MoreInfoCounter;
  }
}
