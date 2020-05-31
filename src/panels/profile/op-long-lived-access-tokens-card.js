import "@material/mwc-button";

import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";
import { EventsMixin } from "../../mixins/events-mixin";
import LocalizeMixin from "../../mixins/localize-mixin";
import { formatDateTime } from "../../common/datetime/format_date_time";
import "../../components/op-card";

import "../../resources/op-style";

import "./op-settings-row";
import { showAlertDialog } from "../../dialogs/generic/show-dialog-box";

/*
 * @appliesMixin EventsMixin
 * @appliesMixin LocalizeMixin
 */
class OpLongLivedTokens extends LocalizeMixin(EventsMixin(PolymerElement)) {
  static get template() {
    return html`
      <style include="op-style">
        .card-content {
          margin: -1em 0;
        }
        a {
          color: var(--primary-color);
        }
        paper-icon-button {
          color: var(--primary-text-color);
        }
      </style>
      <op-card
        header="[[localize('ui.panel.profile.long_lived_access_tokens.header')]]"
      >
        <div class="card-content">
          <p>
            [[localize('ui.panel.profile.long_lived_access_tokens.description')]]
            <a
              href="https://developers.open-peer-power.io/docs/en/auth_api.html#making-authenticated-requests"
              target="_blank"
            >
              [[localize('ui.panel.profile.long_lived_access_tokens.learn_auth_requests')]]
            </a>
          </p>
          <template is="dom-if" if="[[!_tokens.length]]">
            <p>
              [[localize('ui.panel.profile.long_lived_access_tokens.empty_state')]]
            </p>
          </template>
        </div>
        <template is="dom-repeat" items="[[_tokens]]">
          <op-settings-row two-line>
            <span slot="heading">[[item.client_name]]</span>
            <div slot="description">[[_formatCreatedAt(item.created_at)]]</div>
            <paper-icon-button
              icon="opp:delete"
              on-click="_handleDelete"
            ></paper-icon-button>
          </op-settings-row>
        </template>
        <div class="card-actions">
          <mwc-button on-click="_handleCreate">
            [[localize('ui.panel.profile.long_lived_access_tokens.create')]]
          </mwc-button>
        </div>
      </op-card>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      refreshTokens: Array,
      _tokens: {
        type: Array,
        computed: "_computeTokens(refreshTokens)",
      },
    };
  }

  _computeTokens(refreshTokens) {
    return refreshTokens
      .filter((tkn) => tkn.type === "long_lived_access_token")
      .reverse();
  }

  _formatTitle(name) {
    return this.localize(
      "ui.panel.profile.long_lived_access_tokens.token_title",
      "name",
      name
    );
  }

  _formatCreatedAt(created) {
    return this.localize(
      "ui.panel.profile.long_lived_access_tokens.created_at",
      "date",
      formatDateTime(new Date(created), this.opp.language)
    );
  }

  async _handleCreate() {
    const name = prompt(
      this.localize("ui.panel.profile.long_lived_access_tokens.prompt_name")
    );
    if (!name) return;
    try {
      const token = await this.opp.callWS({
        type: "auth/long_lived_access_token",
        lifespan: 3650,
        client_name: name,
      });
      prompt(
        this.localize(
          "ui.panel.profile.long_lived_access_tokens.prompt_copy_token"
        ),
        token
      );
      this.fire("opp-refresh-tokens");
    } catch (err) {
      // eslint-disable-next-line
      console.error(err);
      showAlertDialog(this, {
        text: this.localize(
          "ui.panel.profile.long_lived_access_tokens.create_failed"
        ),
      });
    }
  }

  async _handleDelete(ev) {
    if (
      !confirm(
        this.localize(
          "ui.panel.profile.long_lived_access_tokens.confirm_delete",
          "name",
          ev.model.item.client_name
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
      showAlertDialog(this, {
        text: this.localize(
          "ui.panel.profile.long_lived_access_tokens.delete_failed"
        ),
      });
    }
  }
}

customElements.define("op-long-lived-access-tokens-card", OpLongLivedTokens);
