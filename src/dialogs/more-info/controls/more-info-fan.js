import "@polymer/iron-flex-layout/iron-flex-layout-classes";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../../../components/op-attributes";
import "../../../components/op-paper-dropdown-menu";
import "../../../components/op-switch";

import { EventsMixin } from "../../../mixins/events-mixin";
import { attributeClassNames } from "../../../common/entity/attribute_class_names";

import LocalizeMixin from "../../../mixins/localize-mixin";

/*
 * @appliesMixin EventsMixin
 */
class MoreInfoFan extends LocalizeMixin(EventsMixin(PolymerElement)) {
  static get template() {
    return html`
      <style include="iron-flex"></style>
      <style>
        .container-speed_list,
        .container-direction,
        .container-oscillating {
          display: none;
        }

        .has-speed_list .container-speed_list,
        .has-direction .container-direction,
        .has-oscillating .container-oscillating {
          display: block;
        }

        op-paper-dropdown-menu {
          width: 100%;
        }

        paper-item {
          cursor: pointer;
        }
      </style>

      <div class$="[[computeClassNames(stateObj)]]">
        <div class="container-speed_list">
          <op-paper-dropdown-menu
            label-float=""
            dynamic-align=""
            label="[[localize('ui.card.fan.speed')]]"
          >
            <paper-listbox
              slot="dropdown-content"
              selected="[[stateObj.attributes.speed]]"
              on-selected-changed="speedChanged"
              attr-for-selected="item-name"
            >
              <template
                is="dom-repeat"
                items="[[stateObj.attributes.speed_list]]"
              >
                <paper-item item-name$="[[item]]">[[item]]</paper-item>
              </template>
            </paper-listbox>
          </op-paper-dropdown-menu>
        </div>

        <div class="container-oscillating">
          <div class="center horizontal layout single-row">
            <div class="flex">[[localize('ui.card.fan.oscillate')]]</div>
            <op-switch
              checked="[[oscillationToggleChecked]]"
              on-change="oscillationToggleChanged"
            >
            </op-switch>
          </div>
        </div>

        <div class="container-direction">
          <div class="direction">
            <div>[[localize('ui.card.fan.direction')]]</div>
            <paper-icon-button
              icon="opp:rotate-left"
              on-click="onDirectionReverse"
              title="[[localize('ui.card.fan.reverse')]]"
              disabled="[[computeIsRotatingReverse(stateObj)]]"
            ></paper-icon-button>
            <paper-icon-button
              icon="opp:rotate-right"
              on-click="onDirectionForward"
              title="[[localize('ui.card.fan.forward')]]"
              disabled="[[computeIsRotatingForward(stateObj)]]"
            ></paper-icon-button>
          </div>
        </div>
      </div>

      <op-attributes
        state-obj="[[stateObj]]"
        extra-filters="speed,speed_list,oscillating,direction"
      ></op-attributes>
    `;
  }

  static get properties() {
    return {
      opp: {
        type: Object,
      },

      stateObj: {
        type: Object,
        observer: "stateObjChanged",
      },

      oscillationToggleChecked: {
        type: Boolean,
      },
    };
  }

  stateObjChanged(newVal, oldVal) {
    if (newVal) {
      this.setProperties({
        oscillationToggleChecked: newVal.attributes.oscillating,
      });
    }

    if (oldVal) {
      setTimeout(() => {
        this.fire("iron-resize");
      }, 500);
    }
  }

  computeClassNames(stateObj) {
    return (
      "more-info-fan " +
      attributeClassNames(stateObj, ["oscillating", "speed_list", "direction"])
    );
  }

  speedChanged(ev) {
    var oldVal = this.stateObj.attributes.speed;
    var newVal = ev.detail.value;

    if (!newVal || oldVal === newVal) return;

    this.opp.callService("fan", "turn_on", {
      entity_id: this.stateObj.entity_id,
      speed: newVal,
    });
  }

  oscillationToggleChanged(ev) {
    var oldVal = this.stateObj.attributes.oscillating;
    var newVal = ev.target.checked;

    if (oldVal === newVal) return;

    this.opp.callService("fan", "oscillate", {
      entity_id: this.stateObj.entity_id,
      oscillating: newVal,
    });
  }

  onDirectionReverse() {
    this.opp.callService("fan", "set_direction", {
      entity_id: this.stateObj.entity_id,
      direction: "reverse",
    });
  }

  onDirectionForward() {
    this.opp.callService("fan", "set_direction", {
      entity_id: this.stateObj.entity_id,
      direction: "forward",
    });
  }

  computeIsRotatingReverse(stateObj) {
    return stateObj.attributes.direction === "reverse";
  }

  computeIsRotatingForward(stateObj) {
    return stateObj.attributes.direction === "forward";
  }
}

customElements.define("more-info-fan", MoreInfoFan);
