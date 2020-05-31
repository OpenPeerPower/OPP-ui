import {
  LitElement,
  html,
  TemplateResult,
  CSSResult,
  css,
  property,
  customElement,
} from "lit-element";
import { OppEntity } from "../../../websocket/lib";
import "@material/mwc-button";

import "../../../components/map/op-map";

import { OpenPeerPower } from "../../../types";
import { showZoneEditor } from "../../../data/zone";
import { fireEvent } from "../../../common/dom/fire_event";

@customElement("more-info-person")
class MoreInfoPerson extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public stateObj?: OppEntity;

  protected render(): TemplateResult {
    if (!this.opp || !this.stateObj) {
      return html``;
    }

    return html`
      <op-attributes
        .stateObj=${this.stateObj}
        extraFilters="id,user_id,editable"
      ></op-attributes>
      ${this.stateObj.attributes.latitude && this.stateObj.attributes.longitude
        ? html`
            <op-map
              .opp=${this.opp}
              .entities=${[this.stateObj.entity_id]}
            ></op-map>
          `
        : ""}
      ${this.opp.user?.is_admin &&
      this.stateObj.state === "not_home" &&
      this.stateObj.attributes.latitude &&
      this.stateObj.attributes.longitude
        ? html`
            <div class="actions">
              <mwc-button @click=${this._handleAction}>
                ${this.opp.localize(
                  "ui.dialogs.more_info_control.person.create_zone"
                )}
              </mwc-button>
            </div>
          `
        : ""}
    `;
  }

  private _handleAction() {
    showZoneEditor(this, {
      latitude: this.stateObj!.attributes.latitude,
      longitude: this.stateObj!.attributes.longitude,
    });
    fireEvent(this, "opp-more-info", { entityId: null });
  }

  static get styles(): CSSResult {
    return css`
      .flex {
        display: flex;
        justify-content: space-between;
      }
      .actions {
        margin: 36px 0 8px 0;
        text-align: right;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-person": MoreInfoPerson;
  }
}
