import "@material/mwc-button";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../components/op-card";
import "../components/op-markdown";

import { computeStateName } from "../common/entity/compute_state_name";
import LocalizeMixin from "../mixins/localize-mixin";
import { computeObjectId } from "../common/entity/compute_object_id";

/*
 * @appliesMixin LocalizeMixin
 */
class OpPersistentNotificationCard extends LocalizeMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          @apply --paper-font-body1;
        }
        op-markdown {
          display: block;
          padding: 0 16px;
          -ms-user-select: initial;
          -webkit-user-select: initial;
          -moz-user-select: initial;
        }
        op-markdown p:first-child {
          margin-top: 0;
        }
        op-markdown p:last-child {
          margin-bottom: 0;
        }
        op-markdown a {
          color: var(--primary-color);
        }
        op-markdown img {
          max-width: 100%;
        }
        mwc-button {
          margin: 8px;
        }
      </style>

      <op-card header="[[computeTitle(stateObj)]]">
        <op-markdown content="[[stateObj.attributes.message]]"></op-markdown>
        <mwc-button on-click="dismissTap"
          >[[localize('ui.card.persistent_notification.dismiss')]]</mwc-button
        >
      </op-card>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      stateObj: Object,
    };
  }

  computeTitle(stateObj) {
    return stateObj.attributes.title || computeStateName(stateObj);
  }

  dismissTap(ev) {
    ev.preventDefault();
    this.opp.callService("persistent_notification", "dismiss", {
      notification_id: computeObjectId(this.stateObj.entity_id),
    });
  }
}
customElements.define(
  "op-persistent_notification-card",
  OpPersistentNotificationCard
);
