import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  css,
  CSSResult,
  property,
} from "lit-element";
import "@material/mwc-button";

import "../../../components/op-card";

import { DevconCard } from "../types";
import { OpenPeerPower } from "../../../types";

@customElement("hui-safe-mode-card")
export class HuiSafeModeCard extends LitElement implements DevconCard {
  @property() public opp?: OpenPeerPower;

  public getCardSize(): number {
    return 3;
  }

  public setConfig(_config: any): void {
    // No config necessary.
  }

  protected render(): TemplateResult {
    return html`
      <op-card
        .header=${this.opp!.localize("ui.panel.devcon.cards.safe-mode.header")}
      >
        <div class="card-content">
          ${this.opp!.localize("ui.panel.devcon.cards.safe-mode.description")}
        </div>
        <div class="card-actions">
          <a href="/developer-tools/logs">
            <mwc-button>
              ${this.opp!.localize(
                "ui.panel.devcon.cards.safe-mode.show_errors"
              )}
            </mwc-button>
          </a>
        </div>
      </op-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      op-card {
        --op-card-header-color: var(--primary-color);
      }
      .card-actions a {
        text-decoration: none;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-safe-mode-card": HuiSafeModeCard;
  }
}
