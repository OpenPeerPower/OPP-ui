import {
  LitElement,
  TemplateResult,
  html,
  CSSResultArray,
  css,
  property,
  customElement,
} from "lit-element";
import { ifDefined } from "lit-html/directives/if-defined";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-item/paper-item-body";
import "@polymer/paper-tooltip/paper-tooltip";
import "../../../layouts/opp-tabs-subpage";

import "../../../components/op-card";
import "../../../components/op-fab";
import "../../../components/entity/op-entity-toggle";

import "../op-config-section";

import { computeStateName } from "../../../common/entity/compute_state_name";
import { computeRTL } from "../../../common/util/compute_rtl";
import { opStyle } from "../../../resources/styles";
import { OpenPeerPower, Route } from "../../../types";
import {
  AutomationEntity,
  showAutomationEditor,
  AutomationConfig,
} from "../../../data/automation";
import { formatDateTime } from "../../../common/datetime/format_date_time";
import { fireEvent } from "../../../common/dom/fire_event";
import { showThingtalkDialog } from "./show-dialog-thingtalk";
import { isComponentLoaded } from "../../../common/config/is_component_loaded";
import { configSections } from "../op-panel-config";

@customElement("op-automation-picker")
class OpAutomationPicker extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public isWide!: boolean;
  @property() public narrow!: boolean;
  @property() public route!: Route;
  @property() public automations!: AutomationEntity[];

  protected render(): TemplateResult {
    return html`
      <opp-tabs-subpage
        .opp=${this.opp}
        .narrow=${this.narrow}
        back-path="/config"
        .route=${this.route}
        .tabs=${configSections.automation}
      >
        <op-config-section .isWide=${this.isWide}>
          <div slot="header">
            ${this.opp.localize("ui.panel.config.automation.picker.header")}
          </div>
          <div slot="introduction">
            ${this.opp.localize(
              "ui.panel.config.automation.picker.introduction"
            )}
            <p>
              <a
                href="https://open-peer-power.io/docs/automation/editor/"
                target="_blank"
              >
                ${this.opp.localize(
                  "ui.panel.config.automation.picker.learn_more"
                )}
              </a>
            </p>
          </div>

          <op-card
            .heading=${this.opp.localize(
              "ui.panel.config.automation.picker.pick_automation"
            )}
          >
            ${this.automations.length === 0
              ? html`
                  <div class="card-content">
                    <p>
                      ${this.opp.localize(
                        "ui.panel.config.automation.picker.no_automations"
                      )}
                    </p>
                  </div>
                `
              : this.automations.map(
                  (automation) => html`

                      <div class='automation'>
                        <op-entity-toggle
                          .opp=${this.opp}
                          .stateObj=${automation}
                        ></op-entity-toggle>

                        <paper-item-body two-line>
                          <div>${computeStateName(automation)}</div>
                          <div secondary>
                            ${this.opp.localize(
                              "ui.card.automation.last_triggered"
                            )}: ${
                    automation.attributes.last_triggered
                      ? formatDateTime(
                          new Date(automation.attributes.last_triggered),
                          this.opp.language
                        )
                      : this.opp.localize("ui.components.relative_time.never")
                  }
                          </div>
                        </paper-item-body>
                        <div class='actions'>
                          <paper-icon-button
                            .automation=${automation}
                            @click=${this._showInfo}
                            icon="opp:information-outline"
                            title="${this.opp.localize(
                              "ui.panel.config.automation.picker.show_info_automation"
                            )}"
                          ></paper-icon-button>
                          <a
                            href=${ifDefined(
                              automation.attributes.id
                                ? `/config/automation/edit/${automation.attributes.id}`
                                : undefined
                            )}
                          >
                            <paper-icon-button
                              title="${this.opp.localize(
                                "ui.panel.config.automation.picker.edit_automation"
                              )}"
                              icon="opp:pencil"
                              .disabled=${!automation.attributes.id}
                            ></paper-icon-button>
                            ${
                              !automation.attributes.id
                                ? html`
                                    <paper-tooltip position="left">
                                      ${this.opp.localize(
                                        "ui.panel.config.automation.picker.only_editable"
                                      )}
                                    </paper-tooltip>
                                  `
                                : ""
                            }
                          </a>
                        </div>
                      </div>
                    </a>
                  `
                )}
          </op-card>
        </op-config-section>
        <div>
          <op-fab
            slot="fab"
            ?is-wide=${this.isWide}
            ?narrow=${this.narrow}
            icon="opp:plus"
            title=${this.opp.localize(
              "ui.panel.config.automation.picker.add_automation"
            )}
            ?rtl=${computeRTL(this.opp)}
            @click=${this._createNew}
          ></op-fab>
        </div>
      </opp-tabs-subpage>
    `;
  }

  private _showInfo(ev) {
    const entityId = ev.currentTarget.automation.entity_id;
    fireEvent(this, "opp-more-info", { entityId });
  }

  private _createNew() {
    if (!isComponentLoaded(this.opp, "cloud")) {
      showAutomationEditor(this);
      return;
    }
    showThingtalkDialog(this, {
      callback: (config: Partial<AutomationConfig> | undefined) =>
        showAutomationEditor(this, config),
    });
  }

  static get styles(): CSSResultArray {
    return [
      opStyle,
      css`
        :host {
          display: block;
        }

        op-card {
          margin-bottom: 56px;
        }

        .automation {
          display: flex;
          flex-direction: horizontal;
          align-items: center;
          padding: 0 8px 0 16px;
        }

        .automation a[href] {
          color: var(--primary-text-color);
        }

        op-entity-toggle {
          margin-right: 16px;
        }

        .actions {
          display: flex;
        }

        op-fab {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 1;
          cursor: pointer;
        }

        op-fab[is-wide] {
          bottom: 24px;
          right: 24px;
        }
        op-fab[narrow] {
          bottom: 84px;
        }
        op-fab[rtl] {
          right: auto;
          left: 16px;
        }

        op-fab[rtl][is-wide] {
          bottom: 24px;
          right: auto;
          left: 24px;
        }

        a {
          color: var(--primary-color);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-picker": OpAutomationPicker;
  }
}
