import { html, LitElement, TemplateResult, CSSResult, css } from "lit-element";

import { createCardElement } from "../create-element/create-card-element";
import { DevconCard } from "../types";
import { DevconCardConfig } from "../../../data/devcon";
import { OpenPeerPower } from "../../../types";
import { StackCardConfig } from "./types";

export abstract class HuiStackCard extends LitElement implements DevconCard {
  static get properties() {
    return {
      _config: {},
    };
  }

  set opp(opp: OpenPeerPower) {
    this._opp = opp;

    if (!this._cards) {
      return;
    }

    for (const element of this._cards) {
      element.opp = this._opp;
    }
  }
  protected _cards?: DevconCard[];
  private _config?: StackCardConfig;
  private _opp?: OpenPeerPower;

  public abstract getCardSize(): number;

  public setConfig(config: StackCardConfig): void {
    if (!config || !config.cards || !Array.isArray(config.cards)) {
      throw new Error("Card config incorrect");
    }
    this._config = config;
    this._cards = config.cards.map((card) => {
      const element = this._createCardElement(card) as DevconCard;
      return element;
    });
  }

  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    return html`
      ${this.renderStyle()}
      ${this._config.title
        ? html`
            <div class="card-header">${this._config.title}</div>
          `
        : ""}
      <div id="root">${this._cards}</div>
    `;
  }

  protected abstract renderStyle(): TemplateResult;

  static get styles(): CSSResult {
    return css`
      .card-header {
        color: var(--op-card-header-color, --primary-text-color);
        font-family: var(--op-card-header-font-family, inherit);
        font-size: var(--op-card-header-font-size, 24px);
        letter-spacing: -0.012em;
        line-height: 32px;
        display: block;
        padding: 24px 16px 16px;
      }
    `;
  }

  private _createCardElement(cardConfig: DevconCardConfig) {
    const element = createCardElement(cardConfig) as DevconCard;
    if (this._opp) {
      element.opp = this._opp;
    }
    element.addEventListener(
      "ll-rebuild",
      (ev) => {
        ev.stopPropagation();
        this._rebuildCard(element, cardConfig);
      },
      { once: true }
    );
    return element;
  }

  private _rebuildCard(
    cardElToReplace: DevconCard,
    config: DevconCardConfig
  ): void {
    const newCardEl = this._createCardElement(config);
    cardElToReplace.parentElement!.replaceChild(newCardEl, cardElToReplace);
    this._cards = this._cards!.map((curCardEl) =>
      curCardEl === cardElToReplace ? newCardEl : curCardEl
    );
  }
}
