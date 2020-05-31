import {
  html,
  LitElement,
  TemplateResult,
  property,
  customElement,
  css,
  CSSResult,
} from "lit-element";
import "@material/mwc-button";
import "@polymer/paper-tooltip/paper-tooltip";

import "../../components/op-relative-time";
import "../../components/op-markdown";
import "./notification-item-template";

import { OpenPeerPower } from "../../types";
import { PersistentNotification } from "../../data/persistent_notification";

@customElement("persistent-notification-item")
export class HuiPersistentNotificationItem extends LitElement {
  @property() public opp?: OpenPeerPower;

  @property() public notification?: PersistentNotification;

  protected render(): TemplateResult {
    if (!this.opp || !this.notification) {
      return html``;
    }

    return html`
      <notification-item-template>
        <span slot="header">
          ${this.notification.title || this.notification.notification_id}
        </span>

        <op-markdown content="${this.notification.message}"></op-markdown>

        <div class="time">
          <span>
            <op-relative-time
              .opp="${this.opp}"
              .datetime="${this.notification.created_at}"
            ></op-relative-time>
            <paper-tooltip
              >${this._computeTooltip(
                this.opp,
                this.notification
              )}</paper-tooltip
            >
          </span>
        </div>

        <mwc-button slot="actions" @click="${this._handleDismiss}"
          >${this.opp.localize(
            "ui.card.persistent_notification.dismiss"
          )}</mwc-button
        >
      </notification-item-template>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .time {
        display: flex;
        justify-content: flex-end;
        margin-top: 6px;
      }
      op-relative-time {
        color: var(--secondary-text-color);
      }
      a {
        color: var(--primary-color);
      }
      op-markdown {
        overflow-wrap: break-word;
      }
    `;
  }

  private _handleDismiss(): void {
    this.opp!.callService("persistent_notification", "dismiss", {
      notification_id: this.notification!.notification_id,
    });
  }

  private _computeTooltip(
    opp: OpenPeerPower,
    notification: PersistentNotification
  ): string | undefined {
    if (!opp || !notification) {
      return undefined;
    }

    const d = new Date(notification.created_at!);
    return d.toLocaleDateString(opp.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      minute: "numeric",
      hour: "numeric",
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "persistent-notification-item": HuiPersistentNotificationItem;
  }
}
