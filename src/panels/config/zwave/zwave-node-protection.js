import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-input/paper-input";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../../../components/buttons/op-call-api-button";
import "../../../components/op-card";

class ZwaveNodeProtection extends PolymerElement {
  static get template() {
    return html`
    <style include="iron-flex op-style">
      .card-actions.warning op-call-api-button {
        color: var(--google-red-500);
      }
      .content {
        margin-top: 24px;
      }

      op-card {
        margin: 0 auto;
        max-width: 600px;
      }

      .device-picker {
        @apply --layout-horizontal;
        @apply --layout-center-center;
        padding: 0 24px 24px 24px;
        }

    </style>
      <div class="content">
        <op-card header="Node protection">
          <div class="device-picker">
          <paper-dropdown-menu label="Protection" dynamic-align class="flex" placeholder="{{_loadedProtectionValue}}">
            <paper-listbox slot="dropdown-content" selected="{{_selectedProtectionParameter}}">
              <template is="dom-repeat" items="[[_protectionOptions]]" as="state">
                <paper-item>[[state]]</paper-item>
              </template>
            </paper-listbox>
          </paper-dropdown-menu>
          </div>
          <div class="card-actions">
            <op-call-api-button
              opp="[[opp]]"
              path="[[_nodePath]]"
              data="[[_protectionData]]">
              Set Protection
            </op-call-service-button>
          </div>
        </op-card>
      </div>
`;
  }

  static get properties() {
    return {
      opp: Object,

      nodes: Array,

      selectedNode: {
        type: Number,
        value: -1,
      },

      protectionNode: {
        type: Boolean,
        value: false,
      },

      _protectionValueID: {
        type: Number,
        value: -1,
      },

      _selectedProtectionParameter: {
        type: Number,
        value: -1,
        observer: "_computeProtectionData",
      },

      _protectionOptions: Array,

      _protection: {
        type: Array,
        value: () => [],
      },

      _loadedProtectionValue: {
        type: String,
        value: "",
      },

      _protectionData: {
        type: Object,
        value: {},
      },

      _nodePath: String,
    };
  }

  static get observers() {
    return ["_nodesChanged(nodes, selectedNode)"];
  }

  ready() {
    super.ready();
    this.addEventListener("opp-api-called", (ev) => this.apiCalled(ev));
  }

  apiCalled(ev) {
    if (ev.detail.success) {
      setTimeout(() => {
        this._refreshProtection(this.selectedNode);
      }, 5000);
    }
  }

  _nodesChanged() {
    if (!this.nodes) return;
    if (this.protection) {
      if (this.protection.length === 0) {
        return;
      }
      this.setProperties({
        protectionNode: true,
        _protectionOptions: this.protection[0].value,
        _loadedProtectionValue: this.protection[1].value,
        _protectionValueID: this.protection[2].value,
      });
    }
  }

  async _refreshProtection(selectedNode) {
    const protectionValues = [];
    const protections = await this.opp.callApi(
      "GET",
      `zwave/protection/${this.nodes[selectedNode].attributes.node_id}`
    );
    Object.keys(protections).forEach((key) => {
      protectionValues.push({
        key,
        value: protections[key],
      });
    });
    this.setProperties({
      _protection: protectionValues,
      _selectedProtectionParameter: -1,
      _loadedProtectionValue: this.protection[1].value,
    });
  }

  _computeProtectionData(selectedProtectionParameter) {
    if (this.selectedNode === -1 || selectedProtectionParameter === -1) return;
    this._protectionData = {
      selection: this._protectionOptions[selectedProtectionParameter],
      value_id: this._protectionValueID,
    };
    this._nodePath = `zwave/protection/${
      this.nodes[this.selectedNode].attributes.node_id
    }`;
  }
}

customElements.define("zwave-node-protection", ZwaveNodeProtection);
