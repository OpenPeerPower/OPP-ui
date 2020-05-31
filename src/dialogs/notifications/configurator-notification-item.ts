import {
  html,
  LitElement,
  TemplateResult,
  property,
  customElement,
} from "lit-element";
import "@material/mwc-button";

import "./notification-item-template";

import { OpenPeerPower } from "../../types";
import { fireEvent } from "../../common/dom/fire_event";
import { PersitentNotificationEntity } from "../../data/persistent_notification";

@customElement("configurator-notification-item")
export class HuiConfiguratorNotificationItem extends LitElement {
  @property() public opp?: OpenPeerPower;

  @property() public notification?: PersitentNotificationEntity;

  protected render(): TemplateResult {
    if (!this.opp || !this.notification) {
      return html``;
    }

    return html`
      <notification-item-template>
        <span slot="header">${this.opp.localize("domain.configurator")}</span>

        <div>
          ${this.opp.localize(
            "ui.notification_drawer.click_to_configure",
            "entity",
            this.notification.attributes.friendly_name
          )}
        </div>

        <mwc-button slot="actions" @click="${this._handleClick}"
          >${this.opp.localize(
            `state.configurator.${this.notification.state}`
          )}</mwc-button
        >
      </notification-item-template>
    `;
  }

  private _handleClick(): void {
    fireEvent(this, "opp-more-info", {
      entityId: this.notification!.entity_id,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "configurator-notification-item": HuiConfiguratorNotificationItem;
  }
}
