import {
  LitElement,
  html,
  TemplateResult,
  CSSResult,
  css,
  property,
  customElement,
} from "lit-element";
import { OppEntity } from "../../../websocket/lib";
import "@material/mwc-button";

import "../../../components/op-relative-time";

import { OpenPeerPower } from "../../../types";
import { triggerAutomation } from "../../../data/automation";

@customElement("more-info-automation")
class MoreInfoAutomation extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public stateObj?: OppEntity;

  protected render(): TemplateResult {
    if (!this.opp || !this.stateObj) {
      return html``;
    }

    return html`
      <div class="flex">
        <div>${this.opp.localize("ui.card.automation.last_triggered")}:</div>
        <op-relative-time
          .opp=${this.opp}
          .datetime=${this.stateObj.attributes.last_triggered}
        ></op-relative-time>
      </div>

      <div class="actions">
        <mwc-button @click=${this.handleAction}>
          ${this.opp.localize("ui.card.automation.trigger")}
        </mwc-button>
      </div>
    `;
  }

  private handleAction() {
    triggerAutomation(this.opp, this.stateObj!.entity_id);
  }

  static get styles(): CSSResult {
    return css`
      .flex {
        display: flex;
        justify-content: space-between;
      }
      .actions {
        margin: 36px 0 8px 0;
        text-align: right;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-automation": MoreInfoAutomation;
  }
}
