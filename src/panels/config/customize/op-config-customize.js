import "@polymer/paper-icon-button/paper-icon-button";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../../../layouts/opp-tabs-subpage";
import "../../../resources/op-style";
import "../../../components/op-paper-icon-button-arrow-prev";

import "../op-config-section";
import "../op-entity-config";
import "./op-form-customize";

import { computeStateName } from "../../../common/entity/compute_state_name";
import { computeStateDomain } from "../../../common/entity/compute_state_domain";
import { sortStatesByName } from "../../../common/entity/states_sort_by_name";
import LocalizeMixin from "../../../mixins/localize-mixin";

import { configSections } from "../op-panel-config";

/*
 * @appliesMixin LocalizeMixin
 */
class OpConfigCustomize extends LocalizeMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="op-style">
        op-paper-icon-button-arrow-prev[hide] {
          visibility: hidden;
        }
      </style>

      <opp-tabs-subpage
        opp="[[opp]]"
        narrow="[[narrow]]"
        route="[[route]]"
        back-path="/config"
        tabs="[[_computeTabs()]]"
        show-advanced="[[showAdvanced]]"
      >
        <div class$="[[computeClasses(isWide)]]">
          <op-config-section is-wide="[[isWide]]">
            <span slot="header">
              [[localize('ui.panel.config.customize.picker.header')]]
            </span>
            <span slot="introduction">
              [[localize('ui.panel.config.customize.picker.introduction')]]
            </span>
            <op-entity-config
              opp="[[opp]]"
              label="Entity"
              entities="[[entities]]"
              config="[[entityConfig]]"
            >
            </op-entity-config>
          </op-config-section>
        </div>
      </opp-tabs-subpage>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      isWide: Boolean,
      narrow: Boolean,
      route: Object,
      showAdvanced: Boolean,
      entities: {
        type: Array,
        computed: "computeEntities(opp)",
      },

      entityConfig: {
        type: Object,
        value: {
          component: "op-form-customize",
          computeSelectCaption: (stateObj) =>
            computeStateName(stateObj) +
            " (" +
            computeStateDomain(stateObj) +
            ")",
        },
      },
    };
  }

  computeClasses(isWide) {
    return isWide ? "content" : "content narrow";
  }

  _backTapped() {
    history.back();
  }

  _computeTabs() {
    return configSections.general;
  }

  computeEntities(opp) {
    return Object.keys(opp.states)
      .map((key) => opp.states[key])
      .sort(sortStatesByName);
  }
}
customElements.define("op-config-customize", OpConfigCustomize);
