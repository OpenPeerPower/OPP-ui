import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../../../src/state-summary/state-card-content";
import "../../../src/dialogs/more-info/controls/more-info-content";
import "../../../src/components/op-card";

class DemoMoreInfo extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: flex;
          align-items: start;
        }

        op-card {
          width: 333px;
        }

        state-card-content {
          display: block;
          padding: 16px;
        }

        more-info-content {
          padding: 0 16px;
        }

        pre {
          width: 400px;
          margin: 16px;
          overflow: auto;
        }

        @media only screen and (max-width: 800px) {
          :host {
            flex-direction: column;
          }
          pre {
            margin-left: 0;
          }
        }
      </style>
      <op-card>
        <state-card-content
          state-obj="[[_stateObj]]"
          opp="[[opp]]"
          in-dialog
        ></state-card-content>

        <more-info-content
          opp="[[opp]]"
          state-obj="[[_stateObj]]"
        ></more-info-content>
      </op-card>
      <template is="dom-if" if="[[showConfig]]">
        <pre>[[_jsonEntity(_stateObj)]]</pre>
      </template>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      entityId: String,
      showConfig: Boolean,
      _stateObj: {
        type: Object,
        computed: "_getState(entityId, opp.states)",
      },
    };
  }

  _getState(entityId, states) {
    return states[entityId];
  }

  _jsonEntity(stateObj) {
    // We are caching some things on stateObj
    // (it sucks, we will remove in the future)
    const tmp = {};
    Object.keys(stateObj).forEach((key) => {
      if (key[0] !== "_") {
        tmp[key] = stateObj[key];
      }
    });
    return JSON.stringify(tmp, null, 2);
  }
}

customElements.define("demo-more-info", DemoMoreInfo);
