import {
  LitElement,
  html,
  CSSResult,
  css,
  TemplateResult,
  property,
} from "lit-element";
import "@polymer/paper-spinner/paper-spinner";
import "../../../components/op-card";

import { OpenPeerPower } from "../../../types";
import {
  SystemHealthInfo,
  fetchSystemHealthInfo,
} from "../../../data/system_health";

const sortKeys = (a: string, b: string) => {
  if (a === "openpeerpower") {
    return -1;
  }
  if (b === "openpeerpower") {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  if (b < a) {
    return 1;
  }
  return 0;
};

class SystemHealthCard extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() private _info?: SystemHealthInfo;

  protected render(): TemplateResult {
    if (!this.opp) {
      return html``;
    }
    const sections: TemplateResult[] = [];

    if (!this._info) {
      sections.push(
        html`
          <div class="loading-container">
            <paper-spinner active></paper-spinner>
          </div>
        `
      );
    } else {
      const domains = Object.keys(this._info).sort(sortKeys);
      for (const domain of domains) {
        const keys: TemplateResult[] = [];

        for (const key of Object.keys(this._info[domain]).sort()) {
          keys.push(html`
            <tr>
              <td>${key}</td>
              <td>${this._info[domain][key]}</td>
            </tr>
          `);
        }
        if (domain !== "openpeerpower") {
          sections.push(
            html`
              <h3>${this.opp.localize(`domain.${domain}`) || domain}</h3>
            `
          );
        }
        sections.push(html`
          <table>
            ${keys}
          </table>
        `);
      }
    }

    return html`
      <op-card .header=${this.opp.localize("domain.system_health")}>
        <div class="card-content">${sections}</div>
      </op-card>
    `;
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this._fetchInfo();
  }

  private async _fetchInfo() {
    try {
      if (!this.opp!.config.components.includes("system_health")) {
        throw new Error();
      }
      this._info = await fetchSystemHealthInfo(this.opp!);
    } catch (err) {
      this._info = {
        system_health: {
          error: this.opp.localize(
            "ui.panel.developer-tools.tabs.info.system_health_error"
          ),
        },
      };
    }
  }

  static get styles(): CSSResult {
    return css`
      table {
        width: 100%;
      }

      td:first-child {
        width: 33%;
      }

      .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
  }
}

customElements.define("system-health-card", SystemHealthCard);
