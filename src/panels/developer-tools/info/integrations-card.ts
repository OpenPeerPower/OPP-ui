import {
  LitElement,
  property,
  TemplateResult,
  html,
  customElement,
  CSSResult,
  css,
} from "lit-element";
import { OpenPeerPower } from "../../../types";
import memoizeOne from "memoize-one";
import {
  integrationDocsUrl,
  integrationIssuesUrl,
} from "../../../data/integration";

@customElement("integrations-card")
class IntegrationsCard extends LitElement {
  @property() public opp!: OpenPeerPower;

  private _sortedIntegrations = memoizeOne((components: string[]) => {
    return components.filter((comp) => !comp.includes(".")).sort();
  });

  protected render(): TemplateResult {
    return html`
      <op-card header="Integrations">
        <table class="card-content">
          <tbody>
            ${this._sortedIntegrations(this.opp!.config.components).map(
              (domain) => html`
                <tr>
                  <td>${domain}</td>
                  <td>
                    <a href=${integrationDocsUrl(domain)} target="_blank">
                      Documentation
                    </a>
                  </td>
                  <td>
                    <a href=${integrationIssuesUrl(domain)} target="_blank">
                      Issues
                    </a>
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </op-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      td {
        line-height: 2em;
        padding: 0 8px;
      }
      td:first-child {
        padding-left: 0;
      }
      a {
        color: var(--primary-color);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "integrations-card": IntegrationsCard;
  }
}
