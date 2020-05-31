import {
  LitElement,
  html,
  TemplateResult,
  property,
  customElement,
} from "lit-element";
import { OppEntity } from "../../../websocket/lib";

import { OpenPeerPower } from "../../../types";

import "../../../components/op-relative-time";

@customElement("more-info-script")
class MoreInfoScript extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public stateObj?: OppEntity;

  protected render(): TemplateResult {
    if (!this.opp || !this.stateObj) {
      return html``;
    }

    return html`
      <div>
        ${this.opp.localize(
          "ui.dialogs.more_info_control.script.last_triggered"
        )}:
        ${this.stateObj.attributes.last_triggered
          ? html`
              <op-relative-time
                .opp=${this.opp}
                .datetime=${this.stateObj.attributes.last_triggered}
              ></op-relative-time>
            `
          : this.opp.localize("ui.components.relative_time.never")}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-script": MoreInfoScript;
  }
}
