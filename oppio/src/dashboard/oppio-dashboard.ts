import {
  LitElement,
  TemplateResult,
  html,
  CSSResult,
  css,
  property,
  customElement,
} from "lit-element";
import "./oppio-addons";
import "./oppio-update";
import { haStyle } from "../../../src/resources/styles";
import { OpenPeerPower } from "../../../src/types";
import { OppioOppOSInfo } from "../../../src/data/oppio/host";
import {
  OppioSupervisorInfo,
  OppioOpenPeerPowerInfo,
} from "../../../src/data/oppio/supervisor";

@customElement("oppio-dashboard")
class OppioDashboard extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public supervisorInfo!: OppioSupervisorInfo;
  @property() public oppInfo!: OppioOpenPeerPowerInfo;
  @property() public oppOsInfo!: OppioOppOSInfo;

  protected render(): TemplateResult {
    return html`
      <div class="content">
        <oppio-update
          .opp=${this.opp}
          .oppInfo=${this.oppInfo}
          .supervisorInfo=${this.supervisorInfo}
          .oppOsInfo=${this.oppOsInfo}
        ></oppio-update>
        <oppio-addons
          .opp=${this.opp}
          .addons=${this.supervisorInfo.addons}
        ></oppio-addons>
      </div>
    `;
  }

  static get styles(): CSSResult[] {
    return [
      haStyle,
      css`
        .content {
          margin: 0 auto;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "oppio-dashboard": OppioDashboard;
  }
}
