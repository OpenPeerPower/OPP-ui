import "@polymer/iron-flex-layout/iron-flex-layout-classes";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../../../components/opp-relative-time";

import LocalizeMixin from "../../../../mixins/localize-mixin";
import formatTime from "../../../../common/datetime/format_time";

class MoreInfoSun extends LocalizeMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="iron-flex iron-flex-alignment"></style>

      <template
        is="dom-repeat"
        items="[[computeOrder(risingDate, settingDate)]]"
      >
        <div class="data-entry layout justified horizontal">
          <div class="key">
            <span>[[itemCaption(item)]]</span>
            <opp-relative-time
              opp="[[opp]]"
              datetime-obj="[[itemDate(item)]]"
            ></opp-relative-time>
          </div>
          <div class="value">[[itemValue(item)]]</div>
        </div>
      </template>
      <div class="data-entry layout justified horizontal">
        <div class="key">
          [[localize('ui.dialogs.more_info_control.sun.elevation')]]
        </div>
        <div class="value">[[stateObj.attributes.elevation]]</div>
      </div>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      stateObj: Object,
      risingDate: {
        type: Object,
        computed: "computeRising(stateObj)",
      },
      settingDate: {
        type: Object,
        computed: "computeSetting(stateObj)",
      },
    };
  }

  computeRising(stateObj) {
    return new Date(stateObj.attributes.next_rising);
  }

  computeSetting(stateObj) {
    return new Date(stateObj.attributes.next_setting);
  }

  computeOrder(risingDate, settingDate) {
    return risingDate > settingDate ? ["set", "ris"] : ["ris", "set"];
  }

  itemCaption(type) {
    if (type === "ris") {
      return "Rising";
    }
    return "Setting";
  }

  itemDate(type) {
    return type === "ris" ? this.risingDate : this.settingDate;
  }

  itemValue(type) {
    return formatTime(this.itemDate(type), "en");
  }
}

customElements.define("more-info-sun", MoreInfoSun);
