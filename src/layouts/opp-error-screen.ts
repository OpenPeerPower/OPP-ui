import {
  LitElement,
  CSSResultArray,
  css,
  TemplateResult,
  html,
  property,
  customElement,
} from "lit-element";
import "@material/mwc-button";
import "./opp-subpage";

@customElement("opp-error-screen")
class OppErrorScreen extends LitElement {
  @property()
  public error?: string;

  protected render(): TemplateResult {
    return html`
      <opp-subpage>
        <div class="content">
          <h3>${this.error}</h3>
          <slot>
            <mwc-button @click=${this._backTapped}>go back</mwc-button>
          </slot>
        </div>
      </opp-subpage>
    `;
  }

  private _backTapped(): void {
    history.back();
  }

  static get styles(): CSSResultArray {
    return [
      css`
        .content {
          height: calc(100% - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "opp-error-screen": OppErrorScreen;
  }
}
