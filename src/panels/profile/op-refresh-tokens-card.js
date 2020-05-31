import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-tooltip/paper-tooltip";

import "../../components/op-card";

import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";
import { EventsMixin } from "../../mixins/events-mixin";
import LocalizeMixin from "../../mixins/localize-mixin";
import { formatDateTime } from "../../common/datetime/format_date_time";

import "./op-settings-row";

/*
 * @appliesMixin EventsMixin
 * @appliesMixin LocalizeMixin
 */
class OpRefreshTokens extends LocalizeMixin(EventsMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        paper-icon-button {
          color: var(--primary-text-color);
        }
        paper-icon-button[disabled] {
          color: var(--disabled-text-color);
        }
      </style>
      <op-card header="[[localize('ui.panel.profile.refresh_tokens.header')]]">
        <div class="card-content">
          [[localize('ui.panel.profile.refresh_tokens.description')]]
        </div>
        <template is="dom-repeat" items="[[_computeTokens(refreshTokens)]]">
          <op-settings-row three-line>
            <span slot="heading">[[_formatTitle(item.client_id)]]</span>
            <div slot="description">[[_formatCreatedAt(item.created_at)]]</div>
            <div slot="description">[[_formatLastUsed(item)]]</div>
            <div>
              <template is="dom-if" if="[[item.is_current]]">
                <paper-tooltip position="left"
                  >[[localize('ui.panel.profile.refresh_tokens.current_token_tooltip')]]</paper-tooltip
                >
              </template>
              <paper-icon-button
                icon="opp:delete"
                on-click="_handleDelete"
                disabled="[[item.is_current]]"
              ></paper-icon-button>
            </div>
          </op-settings-row>
        </template>
      </op-card>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      refreshTokens: Array,
    };
  }

  _computeTokens(refreshTokens) {
    return refreshTokens.filter((tkn) => tkn.type === "normal").reverse();
  }

  _formatTitle(clientId) {
    return this.localize(
      "ui.panel.profile.refresh_tokens.token_title",
      "clientId",
      clientId
    );
  }

  _formatCreatedAt(created) {
    return this.localize(
      "ui.panel.profile.refresh_tokens.created_at",
      "date",
      formatDateTime(new Date(created), this.opp.language)
    );
  }

  _formatLastUsed(item) {
    return item.last_used_at
      ? this.localize(
          "ui.panel.profile.refresh_tokens.last_used",
          "date",
          formatDateTime(new Date(item.last_used_at), this.opp.language),
          "location",
          item.last_used_ip
        )
      : this.localize("ui.panel.profile.refresh_tokens.not_used");
  }

  async _handleDelete(ev) {
    if (
      !confirm(
        this.localize(
          "ui.panel.profile.refresh_tokens.confirm_delete",
          "name",
          ev.model.item.client_id
        )
      )
    ) {
      return;
    }
    try {
      await this.opp.callWS({
        type: "auth/delete_refresh_token",
        refresh_token_id: ev.model.item.id,
      });
      this.fire("opp-refresh-tokens");
    } catch (err) {
      // eslint-disable-next-line
      console.error(err);
      alert(this.localize("ui.panel.profile.refresh_tokens.delete_failed"));
    }
  }
}

customElements.define("op-refresh-tokens-card", OpRefreshTokens);
