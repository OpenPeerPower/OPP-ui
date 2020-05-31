import { OppElement } from "../../../../src/state/opp-element";
import "./hc-devcon";
import { customElement, TemplateResult, html, property } from "lit-element";
import {
  MockOpenPeerPower,
  provideOpp,
} from "../../../../src/fake_data/provide_opp";
import { OpenPeerPower } from "../../../../src/types";
import { DevconConfig } from "../../../../src/data/devcon";
import { castDemoEntities } from "../demo/cast-demo-entities";
import { castDemoDevcon } from "../demo/cast-demo-devcon";
import { mockHistory } from "../../../../demo/src/stubs/history";

@customElement("hc-demo")
class HcDemo extends OppElement {
  @property() public devconPath!: string;
  @property() private _devconConfig?: DevconConfig;

  protected render(): TemplateResult {
    if (!this._devconConfig) {
      return html``;
    }
    return html`
      <hc-devcon
        .opp=${this.opp}
        .devconConfig=${this._devconConfig}
        .viewPath=${this.devconPath}
      ></hc-devcon>
    `;
  }
  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this._initialize();
  }

  private async _initialize() {
    const initial: Partial<MockOpenPeerPower> = {
      // Override updateOpp so that the correct opp lifecycle methods are called
      updateOpp: (oppUpdate: Partial<OpenPeerPower>) =>
        this._updateOpp(oppUpdate),
    };

    const opp = (this.opp = provideOpp(this, initial));

    mockHistory(opp);

    opp.addEntities(castDemoEntities());
    this._devconConfig = castDemoDevcon();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hc-demo": HcDemo;
  }
}
