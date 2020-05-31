import "@material/mwc-button";
import "@polymer/paper-card/paper-card";
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
  query,
} from "lit-element";
import { OpenPeerPower } from "../../../src/types";
import {
  OppioAddonDetails,
  fetchOppioAddonLogs,
} from "../../../src/data/oppio/addon";
import { ANSI_HTML_STYLE, parseTextToColoredPre } from "../ansi-to-html";
import { oppioStyle } from "../resources/oppio-style";
import { haStyle } from "../../../src/resources/styles";

@customElement("oppio-addon-logs")
class OppioAddonLogs extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public addon!: OppioAddonDetails;
  @property() private _error?: string;
  @query("#content") private _logContent!: any;

  public async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this._loadData();
  }

  protected render(): TemplateResult {
    return html`
      <paper-card heading="Log">
        ${this._error
          ? html`
              <div class="errors">${this._error}</div>
            `
          : ""}
        <div class="card-content" id="content"></div>
        <div class="card-actions">
          <mwc-button @click=${this._refresh}>Refresh</mwc-button>
        </div>
      </paper-card>
    `;
  }

  static get styles(): CSSResult[] {
    return [
      haStyle,
      oppioStyle,
      ANSI_HTML_STYLE,
      css`
        :host,
        paper-card {
          display: block;
        }
        pre {
          overflow-x: auto;
          white-space: pre-wrap;
          overflow-wrap: break-word;
        }
        .errors {
          color: var(--google-red-500);
          margin-bottom: 16px;
        }
      `,
    ];
  }

  private async _loadData(): Promise<void> {
    this._error = undefined;
    try {
      const content = await fetchOppioAddonLogs(this.opp, this.addon.slug);
      while (this._logContent.lastChild) {
        this._logContent.removeChild(this._logContent.lastChild as Node);
      }
      this._logContent.appendChild(parseTextToColoredPre(content));
    } catch (err) {
      this._error = `Failed to get addon logs, ${err.body?.message || err}`;
    }
  }

  private async _refresh(): Promise<void> {
    await this._loadData();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "oppio-addon-logs": OppioAddonLogs;
  }
}
