import "@polymer/iron-flex-layout/iron-flex-layout-classes";
import "@polymer/iron-label/iron-label";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import { isComponentLoaded } from "../../common/config/is_component_loaded";
import { pushSupported } from "../../components/op-push-notifications-toggle";

import LocalizeMixin from "../../mixins/localize-mixin";

import "./op-settings-row";

/*
 * @appliesMixin LocalizeMixin
 */
class OpPushNotificationsRow extends LocalizeMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        a {
          color: var(--primary-color);
        }
      </style>
      <op-settings-row narrow="[[narrow]]">
        <span slot="heading"
          >[[localize('ui.panel.profile.push_notifications.header')]]</span
        >
        <span slot="description">
          [[_description(_platformLoaded, _pushSupported)]]
          <a
            href="https://www.open-peer-power.io/integrations/html5"
            target="_blank"
            >[[localize('ui.panel.profile.push_notifications.link_promo')]]</a
          >
        </span>
        <op-push-notifications-toggle
          opp="[[opp]]"
          disabled="[[_error]]"
        ></op-push-notifications-toggle>
      </op-settings-row>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      narrow: Boolean,
      _platformLoaded: {
        type: Boolean,
        computed: "_compPlatformLoaded(opp)",
      },
      _pushSupported: {
        type: Boolean,
        value: pushSupported,
      },
      _error: {
        type: Boolean,
        computed: "_compError(_platformLoaded, _pushSupported)",
      },
    };
  }

  _compPlatformLoaded(opp) {
    return isComponentLoaded(opp, "notify.html5");
  }

  _compError(platformLoaded, pushSupported_) {
    return !platformLoaded || !pushSupported_;
  }

  _description(platformLoaded, pushSupported_) {
    let key;
    if (!pushSupported_) {
      key = "error_use_https";
    } else if (!platformLoaded) {
      key = "error_load_platform";
    } else {
      key = "description";
    }
    return this.localize(`ui.panel.profile.push_notifications.${key}`);
  }
}

customElements.define("op-push-notifications-row", OpPushNotificationsRow);
