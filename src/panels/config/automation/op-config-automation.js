import "@polymer/app-route/app-route";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "./op-automation-editor";
import "./op-automation-picker";

import { computeStateDomain } from "../../../common/entity/compute_state_domain";

class OpConfigAutomation extends PolymerElement {
  static get template() {
    return html`
      <style>
        op-automation-picker,
        op-automation-editor {
          height: 100%;
        }
      </style>
      <app-route
        route="[[route]]"
        pattern="/edit/:automation"
        data="{{_routeData}}"
        active="{{_edittingAutomation}}"
      ></app-route>
      <app-route
        route="[[route]]"
        pattern="/new"
        active="{{_creatingNew}}"
      ></app-route>

      <template is="dom-if" if="[[!showEditor]]">
        <op-automation-picker
          opp="[[opp]]"
          automations="[[automations]]"
          is-wide="[[isWide]]"
          narrow="[[narrow]]"
          route="[[route]]"
        ></op-automation-picker>
      </template>

      <template is="dom-if" if="[[showEditor]]" restamp="">
        <op-automation-editor
          opp="[[opp]]"
          automation="[[automation]]"
          is-wide="[[isWide]]"
          narrow="[[narrow]]"
          route="[[route]]"
          creating-new="[[_creatingNew]]"
        ></op-automation-editor>
      </template>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      route: Object,
      isWide: Boolean,
      narrow: Boolean,
      _routeData: Object,
      _routeMatches: Boolean,
      _creatingNew: Boolean,
      _edittingAutomation: Boolean,

      automations: {
        type: Array,
        computed: "computeAutomations(opp)",
      },

      automation: {
        type: Object,
        computed:
          "computeAutomation(automations, _edittingAutomation, _routeData)",
      },

      showEditor: {
        type: Boolean,
        computed: "computeShowEditor(_edittingAutomation, _creatingNew)",
      },
    };
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.route = { path: "", prefix: "" };
  }

  computeAutomation(automations, edittingAddon, routeData) {
    if (!automations || !edittingAddon) {
      return null;
    }
    for (var i = 0; i < automations.length; i++) {
      if (automations[i].attributes.id === routeData.automation) {
        return automations[i];
      }
    }
    return null;
  }

  computeAutomations(opp) {
    var automations = [];

    Object.keys(opp.states).forEach(function(key) {
      var entity = opp.states[key];

      if (computeStateDomain(entity) === "automation") {
        automations.push(entity);
      }
    });

    return automations.sort(function entitySortBy(entityA, entityB) {
      var nameA = (entityA.attributes.alias || entityA.entity_id).toLowerCase();
      var nameB = (entityB.attributes.alias || entityB.entity_id).toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }

  computeShowEditor(_edittingAutomation, _creatingNew) {
    return _creatingNew || _edittingAutomation;
  }
}

customElements.define("op-config-automation", OpConfigAutomation);
