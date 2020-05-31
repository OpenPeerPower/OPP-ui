import "@polymer/iron-flex-layout/iron-flex-layout-classes";
import "@polymer/paper-tooltip/paper-tooltip";
import "@material/mwc-button";
import "@polymer/iron-icon/iron-icon";
import "@polymer/paper-listbox/paper-listbox";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-item/paper-item-body";

import { OppEntity } from "../../../websocket/lib";

import "../../../components/op-card";
import "../../../components/op-icon-next";
import "../../../components/op-fab";
import "../../../components/entity/op-state-icon";
import "../../../layouts/opp-tabs-subpage";
import "../../../resources/op-style";
import "../../../components/op-icon";

import { computeRTL } from "../../../common/util/compute_rtl";
import "../op-config-section";

import { computeStateName } from "../../../common/entity/compute_state_name";
import {
  loadConfigFlowDialog,
  showConfigFlowDialog,
} from "../../../dialogs/config-flow/show-dialog-config-flow";
import {
  localizeConfigFlowTitle,
  ignoreConfigFlow,
  DISCOVERY_SOURCES,
} from "../../../data/config_flow";
import {
  LitElement,
  TemplateResult,
  html,
  property,
  customElement,
  css,
  CSSResult,
} from "lit-element";
import { OpenPeerPower, Route } from "../../../types";
import { ConfigEntry, deleteConfigEntry } from "../../../data/config_entries";
import { fireEvent } from "../../../common/dom/fire_event";
import { EntityRegistryEntry } from "../../../data/entity_registry";
import { DataEntryFlowProgress } from "../../../data/data_entry_flow";
import { showConfirmationDialog } from "../../../dialogs/generic/show-dialog-box";
import { configSections } from "../op-panel-config";

@customElement("op-config-entries-dashboard")
export class OpConfigManagerDashboard extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public showAdvanced!: boolean;
  @property() public isWide!: boolean;
  @property() public narrow!: boolean;
  @property() public route!: Route;

  @property() private configEntries!: ConfigEntry[];

  /**
   * Entity Registry entries.
   */
  @property() private entityRegistryEntries!: EntityRegistryEntry[];

  /**
   * Current flows that are in progress and have not been started by a user.
   * For example, can be discovered devices that require more config.
   */
  @property() private configEntriesInProgress!: DataEntryFlowProgress[];
  @property() private _showIgnored = false;

  public connectedCallback() {
    super.connectedCallback();
    loadConfigFlowDialog();
  }

  protected render(): TemplateResult {
    return html`
      <opp-tabs-subpage
        .opp=${this.opp}
        .narrow=${this.narrow}
        back-path="/config"
        .route=${this.route}
        .tabs=${configSections.integrations}
      >
        <paper-menu-button
          close-on-activate
          no-animations
          horizontal-align="right"
          horizontal-offset="-5"
          slot="toolbar-icon"
        >
          <paper-icon-button
            icon="opp:dots-vertical"
            slot="dropdown-trigger"
            alt="menu"
          ></paper-icon-button>
          <paper-listbox
            slot="dropdown-content"
            role="listbox"
            selected="{{selectedItem}}"
          >
            <paper-item @tap=${this._toggleShowIgnored}>
              ${this.opp.localize(
                this._showIgnored
                  ? "ui.panel.config.integrations.ignore.hide_ignored"
                  : "ui.panel.config.integrations.ignore.show_ignored"
              )}
            </paper-item>
          </paper-listbox>
        </paper-menu-button>

        ${this._showIgnored
          ? html`
              <op-config-section>
                <span slot="header"
                  >${this.opp.localize(
                    "ui.panel.config.integrations.ignore.ignored"
                  )}</span
                >
                <op-card>
                  ${this.configEntries
                    .filter((item) => item.source === "ignore")
                    .map(
                      (item: ConfigEntry) => html`
                        <paper-item>
                          <paper-item-body>
                            ${this.opp.localize(
                              `component.${item.domain}.config.title`
                            )}
                          </paper-item-body>
                          <paper-icon-button
                            @click=${this._removeIgnoredIntegration}
                            .entry=${item}
                            icon="opp:delete"
                            aria-label=${this.opp.localize(
                              "ui.panel.config.integrations.details"
                            )}
                          ></paper-icon-button>
                        </paper-item>
                      `
                    )}
                </op-card>
              </op-config-section>
            `
          : ""}
        ${this.configEntriesInProgress.length
          ? html`
              <op-config-section>
                <span slot="header"
                  >${this.opp.localize(
                    "ui.panel.config.integrations.discovered"
                  )}</span
                >
                <op-card>
                  ${this.configEntriesInProgress.map(
                    (flow) => html`
                      <div class="config-entry-row">
                        <paper-item-body>
                          ${localizeConfigFlowTitle(this.opp.localize, flow)}
                        </paper-item-body>
                        ${DISCOVERY_SOURCES.includes(flow.context.source) &&
                        flow.context.unique_id
                          ? html`
                              <mwc-button
                                @click=${this._ignoreFlow}
                                .flow=${flow}
                              >
                                ${this.opp.localize(
                                  "ui.panel.config.integrations.ignore.ignore"
                                )}
                              </mwc-button>
                            `
                          : ""}
                        <mwc-button
                          @click=${this._continueFlow}
                          .flowId=${flow.flow_id}
                          >${this.opp.localize(
                            "ui.panel.config.integrations.configure"
                          )}</mwc-button
                        >
                      </div>
                    `
                  )}
                </op-card>
              </op-config-section>
            `
          : ""}

        <op-config-section class="configured">
          <span slot="header">
            ${this.opp.localize("ui.panel.config.integrations.configured")}
          </span>
          <op-card>
            ${this.entityRegistryEntries.length
              ? this.configEntries.map((item: any, idx) =>
                  item.source === "ignore"
                    ? ""
                    : html`
                        <a
                          href="/config/integrations/config_entry/${item.entry_id}"
                        >
                          <paper-item data-index=${idx}>
                            <paper-item-body two-line>
                              <div>
                                ${this.opp.localize(
                                  `component.${item.domain}.config.title`
                                )}:
                                ${item.title}
                              </div>
                              <div secondary>
                                ${this._getEntities(item).map(
                                  (entity) => html`
                                    <span>
                                      <op-state-icon
                                        .stateObj=${entity}
                                      ></op-state-icon>
                                      <paper-tooltip position="bottom"
                                        >${computeStateName(
                                          entity
                                        )}</paper-tooltip
                                      >
                                    </span>
                                  `
                                )}
                              </div>
                            </paper-item-body>
                            <op-icon-next
                              aria-label=${this.opp.localize(
                                "ui.panel.config.integrations.details"
                              )}
                            ></op-icon-next>
                          </paper-item>
                        </a>
                      `
                )
              : html`
                  <div class="config-entry-row">
                    <paper-item-body two-line>
                      <div>
                        ${this.opp.localize(
                          "ui.panel.config.integrations.none"
                        )}
                      </div>
                    </paper-item-body>
                  </div>
                `}
          </op-card>
        </op-config-section>

        <op-fab
          icon="opp:plus"
          aria-label=${this.opp.localize("ui.panel.config.integrations.new")}
          title=${this.opp.localize("ui.panel.config.integrations.new")}
          @click=${this._createFlow}
          ?rtl=${computeRTL(this.opp!)}
          ?narrow=${this.narrow}
        ></op-fab>
      </opp-tabs-subpage>
    `;
  }

  private _createFlow() {
    showConfigFlowDialog(this, {
      dialogClosedCallback: () => fireEvent(this, "opp-reload-entries"),
      showAdvanced: this.showAdvanced,
    });
  }

  private _continueFlow(ev: Event) {
    showConfigFlowDialog(this, {
      continueFlowId: (ev.target! as any).flowId,
      dialogClosedCallback: () => fireEvent(this, "opp-reload-entries"),
    });
  }

  private _ignoreFlow(ev: Event) {
    const flow = (ev.target! as any).flow;
    showConfirmationDialog(this, {
      title: this.opp!.localize(
        "ui.panel.config.integrations.ignore.confirm_ignore_title",
        "name",
        localizeConfigFlowTitle(this.opp.localize, flow)
      ),
      text: this.opp!.localize(
        "ui.panel.config.integrations.ignore.confirm_ignore"
      ),
      confirmText: this.opp!.localize(
        "ui.panel.config.integrations.ignore.ignore"
      ),
      confirm: () => {
        ignoreConfigFlow(this.opp, flow.flow_id);
        fireEvent(this, "opp-reload-entries");
      },
    });
  }

  private _toggleShowIgnored() {
    this._showIgnored = !this._showIgnored;
  }

  private async _removeIgnoredIntegration(ev: Event) {
    const entry = (ev.target! as any).entry;
    showConfirmationDialog(this, {
      title: this.opp!.localize(
        "ui.panel.config.integrations.ignore.confirm_delete_ignore_title",
        "name",
        this.opp.localize(`component.${entry.domain}.config.title`)
      ),
      text: this.opp!.localize(
        "ui.panel.config.integrations.ignore.confirm_delete_ignore"
      ),
      confirmText: this.opp!.localize(
        "ui.panel.config.integrations.ignore.stop_ignore"
      ),
      confirm: async () => {
        const result = await deleteConfigEntry(this.opp, entry.entry_id);
        if (result.require_restart) {
          alert(
            this.opp.localize(
              "ui.panel.config.integrations.config_entry.restart_confirm"
            )
          );
        }
        fireEvent(this, "opp-reload-entries");
      },
    });
  }

  private _getEntities(configEntry: ConfigEntry): OppEntity[] {
    if (!this.entityRegistryEntries) {
      return [];
    }
    const states: OppEntity[] = [];
    this.entityRegistryEntries.forEach((entity) => {
      if (
        entity.config_entry_id === configEntry.entry_id &&
        entity.entity_id in this.opp.states
      ) {
        states.push(this.opp.states[entity.entity_id]);
      }
    });
    return states;
  }

  static get styles(): CSSResult {
    return css`
      op-card {
        overflow: hidden;
      }
      mwc-button {
        align-self: center;
      }
      .config-entry-row {
        display: flex;
        padding: 0 16px;
      }
      op-icon {
        cursor: pointer;
        margin: 8px;
      }
      .configured a {
        color: var(--primary-text-color);
        text-decoration: none;
      }
      op-fab {
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 1;
      }
      op-fab[narrow] {
        bottom: 84px;
      }
      op-fab[rtl] {
        right: auto;
        left: 16px;
      }
      .overflow {
        width: 56px;
      }
    `;
  }
}
