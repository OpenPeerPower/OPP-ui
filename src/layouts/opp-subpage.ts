import {
  LitElement,
  property,
  TemplateResult,
  html,
  customElement,
  css,
  CSSResult,
} from "lit-element";
import "../components/op-menu-button";
import "../components/op-paper-icon-button-arrow-prev";
import { classMap } from "lit-html/directives/class-map";

@customElement("opp-subpage")
class OppSubpage extends LitElement {
  @property()
  public header?: string;
  @property({ type: Boolean })
  public showBackButton = true;
  @property({ type: Boolean })
  public oppio = false;

  protected render(): TemplateResult {
    return html`
      <div class="toolbar">
        <op-paper-icon-button-arrow-prev
          aria-label="Back"
          .oppio=${this.oppio}
          @click=${this._backTapped}
          class=${classMap({ hidden: !this.showBackButton })}
        ></op-paper-icon-button-arrow-prev>

        <div main-title>${this.header}</div>
        <slot name="toolbar-icon"></slot>
      </div>
      <div class="content"><slot></slot></div>
    `;
  }

  private _backTapped(): void {
    history.back();
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        height: 100%;
        background-color: var(--primary-background-color);
      }

      .toolbar {
        display: flex;
        align-items: center;
        font-size: 20px;
        height: 65px;
        padding: 0 16px;
        pointer-events: none;
        background-color: var(--app-header-background-color);
        font-weight: 400;
        color: var(--app-header-text-color, white);
        border-bottom: var(--app-header-border-bottom, none);
        box-sizing: border-box;
      }

      op-menu-button,
      op-paper-icon-button-arrow-prev,
      ::slotted([slot="toolbar-icon"]) {
        pointer-events: auto;
      }

      op-paper-icon-button-arrow-prev.hidden {
        visibility: hidden;
      }

      [main-title] {
        margin: 0 0 0 24px;
        line-height: 20px;
        flex-grow: 1;
      }

      .content {
        position: relative;
        width: 100%;
        height: calc(100% - 65px);
        overflow-y: auto;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "opp-subpage": OppSubpage;
  }
}
