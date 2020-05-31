import "@polymer/app-route/app-route";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "./op-script-editor";
import "./op-script-picker";

import { computeStateName } from "../../../common/entity/compute_state_name";
import { computeStateDomain } from "../../../common/entity/compute_state_domain";

class OpConfigScript extends PolymerElement {
  static get template() {
    return html`
      <style>
        op-script-picker,
        op-script-editor {
          height: 100%;
        }
      </style>
      <app-route
        route="[[route]]"
        pattern="/edit/:script"
        data="{{_routeData}}"
        active="{{_edittingScript}}"
      ></app-route>
      <app-route
        route="[[route]]"
        pattern="/new"
        active="{{_creatingNew}}"
      ></app-route>

      <template is="dom-if" if="[[!showEditor]]">
        <op-script-picker
          opp="[[opp]]"
          scripts="[[scripts]]"
          is-wide="[[isWide]]"
          narrow="[[narrow]]"
          route="[[route]]"
        ></op-script-picker>
      </template>

      <template is="dom-if" if="[[showEditor]]" restamp="">
        <op-script-editor
          opp="[[opp]]"
          script="[[script]]"
          is-wide="[[isWide]]"
          narrow="[[narrow]]"
          route="[[route]]"
          creating-new="[[_creatingNew]]"
        ></op-script-editor>
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
      _edittingScript: Boolean,

      scripts: {
        type: Array,
        computed: "computeScripts(opp)",
      },

      script: {
        type: Object,
        computed: "computeScript(scripts, _edittingScript, _routeData)",
      },

      showEditor: {
        type: Boolean,
        computed: "computeShowEditor(_edittingScript, _creatingNew)",
      },
    };
  }

  computeScript(scripts, edittingAddon, routeData) {
    if (!scripts || !edittingAddon) {
      return null;
    }
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].entity_id === routeData.script) {
        return scripts[i];
      }
    }
    return null;
  }

  computeScripts(opp) {
    var scripts = [];

    Object.keys(opp.states).forEach(function(key) {
      var entity = opp.states[key];

      if (computeStateDomain(entity) === "script") {
        scripts.push(entity);
      }
    });

    return scripts.sort(function entitySortBy(entityA, entityB) {
      var nameA = computeStateName(entityA);
      var nameB = computeStateName(entityB);

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }

  computeShowEditor(_edittingScript, _creatingNew) {
    return _creatingNew || _edittingScript;
  }
}

customElements.define("op-config-script", OpConfigScript);
