import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/paper-spinner/paper-spinner-lite";
import {
  LitElement,
  TemplateResult,
  html,
  CSSResultArray,
  css,
  customElement,
  property,
} from "lit-element";
import "../components/op-menu-button";
import "../components/op-paper-icon-button-arrow-prev";
import { opStyle } from "../resources/styles";
import { OpenPeerPower } from "../types";

@customElement("opp-loading-screen")
class OppLoadingScreen extends LitElement {
  @property({ type: Boolean }) public rootnav? = false;
  @property() public opp?: OpenPeerPower;
  @property() public narrow?: boolean;

  protected render(): TemplateResult {
    return html`
      <app-toolbar>
        ${this.rootnav
          ? html`
              <op-menu-button
                .opp=${this.opp}
                .narrow=${this.narrow}
              ></op-menu-button>
            `
          : html`
              <op-paper-icon-button-arrow-prev
                @click=${this._handleBack}
              ></op-paper-icon-button-arrow-prev>
            `}
      </app-toolbar>
      <div class="content">
        <paper-spinner-lite active></paper-spinner-lite>
      </div>
    `;
  }

  private _handleBack() {
    history.back();
  }

  static get styles(): CSSResultArray {
    return [
      opStyle,
      css`
        :host {
          display: block;
          height: 100%;
          background-color: var(--primary-background-color);
        }
        .content {
          height: calc(100% - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "opp-loading-screen": OppLoadingScreen;
  }
}
