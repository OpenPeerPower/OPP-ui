import "@material/mwc-button";
import "@polymer/paper-input/paper-input";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../../../components/op-card";
import "../../../components/buttons/op-call-service-button";
import "../../../resources/op-style";

import "../op-config-section";

import { isComponentLoaded } from "../../../common/config/is_component_loaded";
import LocalizeMixin from "../../../mixins/localize-mixin";

/*
 * @appliesMixin LocalizeMixin
 */
class OpConfigSectionServerControl extends LocalizeMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="iron-flex op-style">
        .validate-container {
          @apply --layout-vertical;
          @apply --layout-center-center;
          height: 140px;
        }

        .validate-result {
          color: var(--google-green-500);
          font-weight: 500;
          margin-bottom: 1em;
        }

        .config-invalid {
          margin: 1em 0;
        }

        .config-invalid .text {
          color: var(--google-red-500);
          font-weight: 500;
        }

        .config-invalid mwc-button {
          float: right;
        }

        .validate-log {
          white-space: pre-wrap;
          direction: ltr;
        }
      </style>
      <op-config-section is-wide="[[isWide]]">
        <span slot="header"
          >[[localize('ui.panel.config.server_control.caption')]]</span
        >
        <span slot="introduction"
          >[[localize('ui.panel.config.server_control.description')]]</span
        >

        <template is="dom-if" if="[[showAdvanced]]">
          <op-card
            header="[[localize('ui.panel.config.server_control.section.validation.heading')]]"
          >
            <div class="card-content">
              [[localize('ui.panel.config.server_control.section.validation.introduction')]]
              <template is="dom-if" if="[[!validateLog]]">
                <div class="validate-container">
                  <template is="dom-if" if="[[!validating]]">
                    <template is="dom-if" if="[[isValid]]">
                      <div class="validate-result" id="result">
                        [[localize('ui.panel.config.server_control.section.validation.valid')]]
                      </div>
                    </template>
                    <mwc-button raised="" on-click="validateConfig">
                      [[localize('ui.panel.config.server_control.section.validation.check_config')]]
                    </mwc-button>
                  </template>
                  <template is="dom-if" if="[[validating]]">
                    <paper-spinner active=""></paper-spinner>
                  </template>
                </div>
              </template>
              <template is="dom-if" if="[[validateLog]]">
                <div class="config-invalid">
                  <span class="text">
                    [[localize('ui.panel.config.server_control.section.validation.invalid')]]
                  </span>
                  <mwc-button raised="" on-click="validateConfig">
                    [[localize('ui.panel.config.server_control.section.validation.check_config')]]
                  </mwc-button>
                </div>
                <div id="configLog" class="validate-log">[[validateLog]]</div>
              </template>
            </div>
          </op-card>

          <op-card
            header="[[localize('ui.panel.config.server_control.section.reloading.heading')]]"
          >
            <div class="card-content">
              [[localize('ui.panel.config.server_control.section.reloading.introduction')]]
            </div>
            <div class="card-actions">
              <op-call-service-button
                opp="[[opp]]"
                domain="openpeerpower"
                service="reload_core_config"
                >[[localize('ui.panel.config.server_control.section.reloading.core')]]
              </op-call-service-button>
            </div>
            <template is="dom-if" if="[[groupLoaded(opp)]]">
              <div class="card-actions">
                <op-call-service-button
                  opp="[[opp]]"
                  domain="group"
                  service="reload"
                  >[[localize('ui.panel.config.server_control.section.reloading.group')]]
                </op-call-service-button>
              </div>
            </template>
            <template is="dom-if" if="[[automationLoaded(opp)]]">
              <div class="card-actions">
                <op-call-service-button
                  opp="[[opp]]"
                  domain="automation"
                  service="reload"
                  >[[localize('ui.panel.config.server_control.section.reloading.automation')]]
                </op-call-service-button>
              </div>
            </template>
            <template is="dom-if" if="[[scriptLoaded(opp)]]">
              <div class="card-actions">
                <op-call-service-button
                  opp="[[opp]]"
                  domain="script"
                  service="reload"
                  >[[localize('ui.panel.config.server_control.section.reloading.script')]]
                </op-call-service-button>
              </div>
            </template>
            <template is="dom-if" if="[[sceneLoaded(opp)]]">
              <div class="card-actions">
                <op-call-service-button
                  opp="[[opp]]"
                  domain="scene"
                  service="reload"
                  >[[localize('ui.panel.config.server_control.section.reloading.scene')]]
                </op-call-service-button>
              </div>
            </template>
            <template is="dom-if" if="[[personLoaded(opp)]]">
              <div class="card-actions">
                <op-call-service-button
                  opp="[[opp]]"
                  domain="person"
                  service="reload"
                  >[[localize('ui.panel.config.server_control.section.reloading.person')]]
                </op-call-service-button>
              </div>
            </template>
            <div class="card-actions">
              <op-call-service-button
                opp="[[opp]]"
                domain="zone"
                service="reload"
                >[[localize('ui.panel.config.server_control.section.reloading.zone')]]
              </op-call-service-button>
            </div>
          </op-card>
        </template>
        <op-card
          header="[[localize('ui.panel.config.server_control.section.server_management.heading')]]"
        >
          <div class="card-content">
            [[localize('ui.panel.config.server_control.section.server_management.introduction')]]
          </div>
          <div class="card-actions warning">
            <op-call-service-button
              class="warning"
              opp="[[opp]]"
              domain="openpeerpower"
              service="restart"
              confirmation="[[localize('ui.panel.config.server_control.section.server_management.confirm_restart')]]"
              >[[localize('ui.panel.config.server_control.section.server_management.restart')]]
            </op-call-service-button>
            <op-call-service-button
              class="warning"
              opp="[[opp]]"
              domain="openpeerpower"
              service="stop"
              confirmation="[[localize('ui.panel.config.server_control.section.server_management.confirm_stop')]]"
              >[[localize('ui.panel.config.server_control.section.server_management.stop')]]
            </op-call-service-button>
          </div>
        </op-card>
      </op-config-section>
    `;
  }

  static get properties() {
    return {
      opp: {
        type: Object,
      },

      isWide: {
        type: Boolean,
        value: false,
      },

      validating: {
        type: Boolean,
        value: false,
      },

      isValid: {
        type: Boolean,
        value: null,
      },

      validateLog: {
        type: String,
        value: "",
      },

      showAdvanced: Boolean,
    };
  }

  groupLoaded(opp) {
    return isComponentLoaded(opp, "group");
  }

  automationLoaded(opp) {
    return isComponentLoaded(opp, "automation");
  }

  scriptLoaded(opp) {
    return isComponentLoaded(opp, "script");
  }

  sceneLoaded(opp) {
    return isComponentLoaded(opp, "scene");
  }

  personLoaded(opp) {
    return isComponentLoaded(opp, "person");
  }

  validateConfig() {
    this.validating = true;
    this.validateLog = "";
    this.isValid = null;

    this.opp.callApi("POST", "config/core/check_config").then((result) => {
      this.validating = false;
      this.isValid = result.result === "valid";

      if (!this.isValid) {
        this.validateLog = result.errors;
      }
    });
  }
}

customElements.define(
  "op-config-section-server-control",
  OpConfigSectionServerControl
);
