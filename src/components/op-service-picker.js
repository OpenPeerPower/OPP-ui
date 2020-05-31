import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "./op-combo-box";

import LocalizeMixin from "../mixins/localize-mixin";

/*
 * @appliesMixin LocalizeMixin
 */
class OpServicePicker extends LocalizeMixin(PolymerElement) {
  static get template() {
    return html`
      <op-combo-box
        label="[[localize('ui.components.service-picker.service')]]"
        items="[[_services]]"
        value="{{value}}"
        allow-custom-value=""
      ></op-combo-box>
    `;
  }

  static get properties() {
    return {
      opp: {
        type: Object,
        observer: "_oppChanged",
      },
      _services: Array,
      value: {
        type: String,
        notify: true,
      },
    };
  }

  _oppChanged(opp, oldOpp) {
    if (!opp) {
      this._services = [];
      return;
    }
    if (oldOpp && opp.services === oldOpp.services) {
      return;
    }
    const result = [];

    Object.keys(opp.services)
      .sort()
      .forEach((domain) => {
        const services = Object.keys(opp.services[domain]).sort();

        for (let i = 0; i < services.length; i++) {
          result.push(`${domain}.${services[i]}`);
        }
      });

    this._services = result;
  }
}

customElements.define("op-service-picker", OpServicePicker);
