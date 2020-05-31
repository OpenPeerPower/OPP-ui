import "@polymer/paper-menu-button/paper-menu-button";
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from "lit-element";

import { oppioStyle } from "../resources/oppio-style";
import { haStyle } from "../../../src/resources/styles";
import { OppioHostInfo, OppioOppOSInfo } from "../../../src/data/oppio/host";
import { OppioSupervisorInfo } from "../../../src/data/oppio/supervisor";
import { OpenPeerPower } from "../../../src/types";

import "./oppio-host-info";
import "./oppio-supervisor-info";
import "./oppio-supervisor-log";

@customElement("oppio-system")
class OppioSystem extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public supervisorInfo!: OppioSupervisorInfo;
  @property() public hostInfo!: OppioHostInfo;
  @property() public oppOsInfo!: OppioOppOSInfo;

  public render(): TemplateResult | void {
    return html`
      <div class="content">
        <h1>Information</h1>
        <div class="card-group">
          <oppio-supervisor-info
            .opp=${this.opp}
            .supervisorInfo=${this.supervisorInfo}
          ></oppio-supervisor-info>
          <oppio-host-info
            .opp=${this.opp}
            .hostInfo=${this.hostInfo}
            .oppOsInfo=${this.oppOsInfo}
          ></oppio-host-info>
        </div>
        <h1>System log</h1>
        <oppio-supervisor-log .opp=${this.opp}></oppio-supervisor-log>
      </div>
    `;
  }

  static get styles(): CSSResult[] {
    return [
      haStyle,
      oppioStyle,
      css`
        .content {
          margin: 8px;
          color: var(--primary-text-color);
        }
        .title {
          margin-top: 24px;
          color: var(--primary-text-color);
          font-size: 2em;
          padding-left: 8px;
          margin-bottom: 8px;
        }
        oppio-supervisor-log {
          width: 100%;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "oppio-system": OppioSystem;
  }
}
