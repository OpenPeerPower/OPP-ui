import {
  LitElement,
  html,
  CSSResult,
  css,
  TemplateResult,
  property,
  query,
  customElement,
} from "lit-element";

import { OpenPeerPower } from "../../../types";
import { opStyle } from "../../../resources/styles";

import "../logs/system-log-card";
import "../logs/error-log-card";
// tslint:disable-next-line
import { SystemLogCard } from "../logs/system-log-card";

@customElement("developer-tools-logs")
export class OpPanelDevLogs extends LitElement {
  @property() public opp!: OpenPeerPower;

  @query("system-log-card") private systemLog?: SystemLogCard;

  public connectedCallback() {
    super.connectedCallback();
    if (this.systemLog && this.systemLog.loaded) {
      this.systemLog.fetchData();
    }
  }

  protected render(): TemplateResult {
    return html`
      <div class="content">
        <system-log-card .opp=${this.opp}></system-log-card>
        <error-log-card .opp=${this.opp}></error-log-card>
      </div>
    `;
  }

  static get styles(): CSSResult[] {
    return [
      opStyle,
      css`
        :host {
          -ms-user-select: initial;
          -webkit-user-select: initial;
          -moz-user-select: initial;
        }

        .content {
          direction: ltr;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "developer-tools-logs": OpPanelDevLogs;
  }
}
