import {
  property,
  LitElement,
  TemplateResult,
  html,
  customElement,
  CSSResult,
  css,
} from "lit-element";
import { OppEntity } from "../../../websocket/lib";

import "../../../components/op-relative-time";

import { formatTime } from "../../../common/datetime/format_time";
import { OpenPeerPower } from "../../../types";

@customElement("more-info-sun")
class MoreInfoSun extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public stateObj?: OppEntity;

  protected render(): TemplateResult {
    if (!this.opp || !this.stateObj) {
      return html``;
    }

    const risingDate = new Date(this.stateObj.attributes.next_rising);
    const settingDate = new Date(this.stateObj.attributes.next_setting);
    const order = risingDate > settingDate ? ["set", "ris"] : ["ris", "set"];

    return html`
      ${order.map((item) => {
        return html`
          <div class="row">
            <div class="key">
              <span
                >${item === "ris"
                  ? this.opp.localize("ui.dialogs.more_info_control.sun.rising")
                  : this.opp.localize(
                      "ui.dialogs.more_info_control.sun.setting"
                    )}</span
              >
              <op-relative-time
                .opp=${this.opp}
                .datetimeObj=${item === "ris" ? risingDate : settingDate}
              ></op-relative-time>
            </div>
            <div class="value">
              ${formatTime(
                item === "ris" ? risingDate : settingDate,
                this.opp.language
              )}
            </div>
          </div>
        `;
      })}
      <div class="row">
        <div class="key">
          ${this.opp.localize("ui.dialogs.more_info_control.sun.elevation")}
        </div>
        <div class="value">${this.stateObj.attributes.elevation}</div>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .row {
        margin: 0 8px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-sun": MoreInfoSun;
  }
}
