import {
  LitElement,
  TemplateResult,
  html,
  property,
  customElement,
} from "lit-element";

import "./op-settings-row";
import "../../components/op-switch";

import { OpenPeerPower } from "../../types";
import { fireEvent } from "../../common/dom/fire_event";
// tslint:disable-next-line: no-duplicate-imports
import { OpSwitch } from "../../components/op-switch";
import { forwardHaptic } from "../../data/haptics";

@customElement("op-set-vibrate-row")
class OpSetVibrateRow extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public narrow!: boolean;

  protected render(): TemplateResult {
    return html`
      <op-settings-row .narrow=${this.narrow}>
        <span slot="heading">
          ${this.opp.localize("ui.panel.profile.vibrate.header")}
        </span>
        <span slot="description">
          ${this.opp.localize("ui.panel.profile.vibrate.description")}
        </span>
        <op-switch
          .checked=${this.opp.vibrate}
          @change=${this._checkedChanged}
        ></op-switch>
      </op-settings-row>
    `;
  }

  private async _checkedChanged(ev: Event) {
    const vibrate = (ev.target as OpSwitch).checked;
    if (vibrate === this.opp.vibrate) {
      return;
    }
    fireEvent(this, "opp-vibrate", {
      vibrate,
    });
    forwardHaptic("light");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-set-vibrate-row": OpSetVibrateRow;
  }
}
