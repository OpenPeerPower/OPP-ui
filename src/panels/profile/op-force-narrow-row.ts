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

@customElement("op-force-narrow-row")
class OpForcedNarrowRow extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public narrow!: boolean;

  protected render(): TemplateResult {
    return html`
      <op-settings-row .narrow=${this.narrow}>
        <span slot="heading">
          ${this.opp.localize("ui.panel.profile.force_narrow.header")}
        </span>
        <span slot="description">
          ${this.opp.localize("ui.panel.profile.force_narrow.description")}
        </span>
        <op-switch
          .checked=${this.opp.dockedSidebar === "always_hidden"}
          @change=${this._checkedChanged}
        ></op-switch>
      </op-settings-row>
    `;
  }

  private async _checkedChanged(ev: Event) {
    const newValue = (ev.target as OpSwitch).checked;
    if (newValue === (this.opp.dockedSidebar === "always_hidden")) {
      return;
    }
    fireEvent(this, "opp-dock-sidebar", {
      dock: newValue ? "always_hidden" : "auto",
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-force-narrow-row": OpForcedNarrowRow;
  }
}
