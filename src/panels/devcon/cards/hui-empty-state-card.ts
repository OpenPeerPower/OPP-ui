import {
  html,
  LitElement,
  TemplateResult,
  CSSResult,
  css,
  customElement,
  property,
} from "lit-element";

import "../../../components/op-card";

import { DevconCard } from "../types";
import { OpenPeerPower } from "../../../types";
import { EmptyStateCardConfig } from "./types";

@customElement("hui-empty-state-card")
export class HuiEmptyStateCard extends LitElement implements DevconCard {
  @property() public opp?: OpenPeerPower;

  public getCardSize(): number {
    return 2;
  }

  public setConfig(_config: EmptyStateCardConfig): void {
    // tslint:disable-next-line
  }

  protected render(): TemplateResult {
    if (!this.opp) {
      return html``;
    }

    return html`
      <op-card
        .header="${this.opp.localize(
          "ui.panel.devcon.cards.empty_state.title"
        )}"
      >
        <div class="card-content">
          ${this.opp.localize("ui.panel.devcon.cards.empty_state.no_devices")}
        </div>
        <div class="card-actions">
          <a href="/config/integrations">
            <mwc-button>
              ${this.opp.localize(
                "ui.panel.devcon.cards.empty_state.go_to_integrations_page"
              )}
            </mwc-button>
          </a>
        </div>
      </header-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .content {
        margin-top: -1em;
        padding: 16px;
      }

      .card-actions a {
        text-decoration: none;
      }

      mwc-button {
        margin-left: -8px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-empty-state-card": HuiEmptyStateCard;
  }
}
