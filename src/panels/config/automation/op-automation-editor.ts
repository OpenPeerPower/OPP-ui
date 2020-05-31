import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/paper-icon-button/paper-icon-button";
import {
  css,
  CSSResult,
  html,
  LitElement,
  property,
  PropertyValues,
  TemplateResult,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { navigate } from "../../../common/navigate";
import { computeRTL } from "../../../common/util/compute_rtl";
import "../../../components/op-fab";
import "../../../components/op-paper-icon-button-arrow-prev";
import {
  AutomationConfig,
  AutomationEntity,
  Condition,
  deleteAutomation,
  getAutomationEditorInitData,
  Trigger,
  triggerAutomation,
} from "../../../data/automation";
import { Action } from "../../../data/script";
import {
  showAlertDialog,
  showConfirmationDialog,
} from "../../../dialogs/generic/show-dialog-box";
import "../../../layouts/op-app-layout";
import { opStyle } from "../../../resources/styles";
import { OpenPeerPower, Route } from "../../../types";
import "./action/op-automation-action";
import "./condition/op-automation-condition";
import "./trigger/op-automation-trigger";
import "../../../layouts/opp-tabs-subpage";
import { configSections } from "../op-panel-config";
import { OpDeviceAction } from "./action/types/op-automation-action-device_id";
import { OpDeviceTrigger } from "./trigger/types/op-automation-trigger-device";

export class OpAutomationEditor extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public automation!: AutomationEntity;
  @property() public isWide?: boolean;
  @property() public narrow!: boolean;
  @property() public route!: Route;
  @property() public creatingNew?: boolean;
  @property() private _config?: AutomationConfig;
  @property() private _dirty?: boolean;
  @property() private _errors?: string;

  protected render(): TemplateResult {
    return html`
      <opp-tabs-subpage
        .opp=${this.opp}
        .narrow=${this.narrow}
        .route=${this.route}
        .backCallback=${() => this._backTapped()}
        .tabs=${configSections.automation}
      >
        ${this.creatingNew
          ? ""
          : html`
              <paper-icon-button
                slot="toolbar-icon"
                title="${this.opp.localize(
                  "ui.panel.config.automation.picker.delete_automation"
                )}"
                icon="opp:delete"
                @click=${this._deleteConfirm}
              ></paper-icon-button>
            `}
        ${this._errors
          ? html`
              <div class="errors">${this._errors}</div>
            `
          : ""}
        ${this._config
          ? html`
              ${this.narrow
                ? html`
                    <span slot="header">${this._config?.alias}</span>
                  `
                : ""}
              <op-config-section .isWide=${this.isWide}>
                ${!this.narrow
                  ? html`
                      <span slot="header">${this._config.alias}</span>
                    `
                  : ""}
                <span slot="introduction">
                  ${this.opp.localize(
                    "ui.panel.config.automation.editor.introduction"
                  )}
                </span>
                <op-card>
                  <div class="card-content">
                    <paper-input
                      .label=${this.opp.localize(
                        "ui.panel.config.automation.editor.alias"
                      )}
                      name="alias"
                      .value=${this._config.alias}
                      @value-changed=${this._valueChanged}
                    >
                    </paper-input>
                    <op-textarea
                      .label=${this.opp.localize(
                        "ui.panel.config.automation.editor.description.label"
                      )}
                      .placeholder=${this.opp.localize(
                        "ui.panel.config.automation.editor.description.placeholder"
                      )}
                      name="description"
                      .value=${this._config.description}
                      @value-changed=${this._valueChanged}
                    ></op-textarea>
                  </div>
                  ${this.creatingNew
                    ? ""
                    : html`
                        <div
                          class="card-actions layout horizontal justified center"
                        >
                          <div class="layout horizontal center">
                            <op-entity-toggle
                              .opp=${this.opp}
                              .stateObj=${this.automation}
                            ></op-entity-toggle>
                            ${this.opp.localize(
                              "ui.panel.config.automation.editor.enable_disable"
                            )}
                          </div>
                          <mwc-button @click=${this._excuteAutomation}>
                            ${this.opp.localize("ui.card.automation.trigger")}
                          </mwc-button>
                        </div>
                      `}
                </op-card>
              </op-config-section>

              <op-config-section .isWide=${this.isWide}>
                <span slot="header">
                  ${this.opp.localize(
                    "ui.panel.config.automation.editor.triggers.header"
                  )}
                </span>
                <span slot="introduction">
                  <p>
                    ${this.opp.localize(
                      "ui.panel.config.automation.editor.triggers.introduction"
                    )}
                  </p>
                  <a
                    href="https://open-peer-power.io/docs/automation/trigger/"
                    target="_blank"
                  >
                    ${this.opp.localize(
                      "ui.panel.config.automation.editor.triggers.learn_more"
                    )}
                  </a>
                </span>
                <op-automation-trigger
                  .triggers=${this._config.trigger}
                  @value-changed=${this._triggerChanged}
                  .opp=${this.opp}
                ></op-automation-trigger>
              </op-config-section>

              <op-config-section .isWide=${this.isWide}>
                <span slot="header">
                  ${this.opp.localize(
                    "ui.panel.config.automation.editor.conditions.header"
                  )}
                </span>
                <span slot="introduction">
                  <p>
                    ${this.opp.localize(
                      "ui.panel.config.automation.editor.conditions.introduction"
                    )}
                  </p>
                  <a
                    href="https://open-peer-power.io/docs/scripts/conditions/"
                    target="_blank"
                  >
                    ${this.opp.localize(
                      "ui.panel.config.automation.editor.conditions.learn_more"
                    )}
                  </a>
                </span>
                <op-automation-condition
                  .conditions=${this._config.condition || []}
                  @value-changed=${this._conditionChanged}
                  .opp=${this.opp}
                ></op-automation-condition>
              </op-config-section>

              <op-config-section .isWide=${this.isWide}>
                <span slot="header">
                  ${this.opp.localize(
                    "ui.panel.config.automation.editor.actions.header"
                  )}
                </span>
                <span slot="introduction">
                  <p>
                    ${this.opp.localize(
                      "ui.panel.config.automation.editor.actions.introduction"
                    )}
                  </p>
                  <a
                    href="https://open-peer-power.io/docs/automation/action/"
                    target="_blank"
                  >
                    ${this.opp.localize(
                      "ui.panel.config.automation.editor.actions.learn_more"
                    )}
                  </a>
                </span>
                <op-automation-action
                  .actions=${this._config.action}
                  @value-changed=${this._actionChanged}
                  .opp=${this.opp}
                ></op-automation-action>
              </op-config-section>
            `
          : ""}
        <op-fab
          ?is-wide="${this.isWide}"
          ?narrow="${this.narrow}"
          ?dirty="${this._dirty}"
          icon="opp:content-save"
          .title="${this.opp.localize(
            "ui.panel.config.automation.editor.save"
          )}"
          @click=${this._saveAutomation}
          class="${classMap({
            rtl: computeRTL(this.opp),
          })}"
        ></op-fab>
      </opp-tabs-subpage>
    `;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    const oldAutomation = changedProps.get("automation") as AutomationEntity;
    if (
      changedProps.has("automation") &&
      this.automation &&
      this.opp &&
      // Only refresh config if we picked a new automation. If same ID, don't fetch it.
      (!oldAutomation ||
        oldAutomation.attributes.id !== this.automation.attributes.id)
    ) {
      this.opp
        .callApi<AutomationConfig>(
          "GET",
          `config/automation/config/${this.automation.attributes.id}`
        )
        .then(
          (config) => {
            // Normalize data: ensure trigger, action and condition are lists
            // Happens when people copy paste their automations into the config
            for (const key of ["trigger", "condition", "action"]) {
              const value = config[key];
              if (value && !Array.isArray(value)) {
                config[key] = [value];
              }
            }
            this._dirty = false;
            this._config = config;
          },
          (resp) => {
            showAlertDialog(this, {
              text:
                resp.status_code === 404
                  ? this.opp.localize(
                      "ui.panel.config.automation.editor.load_error_not_editable"
                    )
                  : this.opp.localize(
                      "ui.panel.config.automation.editor.load_error_unknown",
                      "err_no",
                      resp.status_code
                    ),
            });
            history.back();
          }
        );
    }

    if (changedProps.has("creatingNew") && this.creatingNew && this.opp) {
      const initData = getAutomationEditorInitData();
      this._dirty = initData ? true : false;
      this._config = {
        alias: this.opp.localize(
          "ui.panel.config.automation.editor.default_name"
        ),
        description: "",
        trigger: [{ platform: "device", ...OpDeviceTrigger.defaultConfig }],
        condition: [],
        action: [{ ...OpDeviceAction.defaultConfig }],
        ...initData,
      };
    }
  }

  private _valueChanged(ev: CustomEvent) {
    ev.stopPropagation();
    const name = (ev.target as any)?.name;
    if (!name) {
      return;
    }
    const newVal = ev.detail.value;

    if ((this._config![name] || "") === newVal) {
      return;
    }
    this._config = { ...this._config!, [name]: newVal };
    this._dirty = true;
  }

  private _triggerChanged(ev: CustomEvent): void {
    this._config = { ...this._config!, trigger: ev.detail.value as Trigger[] };
    this._errors = undefined;
    this._dirty = true;
  }

  private _conditionChanged(ev: CustomEvent): void {
    this._config = {
      ...this._config!,
      condition: ev.detail.value as Condition[],
    };
    this._errors = undefined;
    this._dirty = true;
  }

  private _actionChanged(ev: CustomEvent): void {
    this._config = { ...this._config!, action: ev.detail.value as Action[] };
    this._errors = undefined;
    this._dirty = true;
  }

  private _excuteAutomation() {
    triggerAutomation(this.opp, this.automation.entity_id);
  }

  private _backTapped(): void {
    if (this._dirty) {
      showConfirmationDialog(this, {
        text: this.opp!.localize(
          "ui.panel.config.automation.editor.unsaved_confirm"
        ),
        confirmText: this.opp!.localize("ui.common.yes"),
        dismissText: this.opp!.localize("ui.common.no"),
        confirm: () => history.back(),
      });
    } else {
      history.back();
    }
  }

  private async _deleteConfirm() {
    showConfirmationDialog(this, {
      text: this.opp.localize(
        "ui.panel.config.automation.picker.delete_confirm"
      ),
      confirmText: this.opp!.localize("ui.common.yes"),
      dismissText: this.opp!.localize("ui.common.no"),
      confirm: () => this._delete(),
    });
  }

  private async _delete() {
    await deleteAutomation(this.opp, this.automation.attributes.id!);
    history.back();
  }

  private _saveAutomation(): void {
    const id = this.creatingNew
      ? "" + Date.now()
      : this.automation.attributes.id;
    this.opp!.callApi(
      "POST",
      "config/automation/config/" + id,
      this._config
    ).then(
      () => {
        this._dirty = false;

        if (this.creatingNew) {
          navigate(this, `/config/automation/edit/${id}`, true);
        }
      },
      (errors) => {
        this._errors = errors.body.message;
        throw errors;
      }
    );
  }

  static get styles(): CSSResult[] {
    return [
      opStyle,
      css`
        op-card {
          overflow: hidden;
        }
        .errors {
          padding: 20px;
          font-weight: bold;
          color: var(--google-red-500);
        }
        .content {
          padding-bottom: 20px;
        }
        span[slot="introduction"] a {
          color: var(--primary-color);
        }
        op-entity-toggle {
          margin-right: 8px;
        }
        op-fab {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 1;
          margin-bottom: -80px;
          transition: margin-bottom 0.3s;
        }

        op-fab[is-wide] {
          bottom: 24px;
          right: 24px;
        }
        op-fab[narrow] {
          bottom: 84px;
          margin-bottom: -140px;
        }
        op-fab[dirty] {
          margin-bottom: 0;
        }

        op-fab.rtl {
          right: auto;
          left: 16px;
        }

        op-fab[is-wide].rtl {
          bottom: 24px;
          right: auto;
          left: 24px;
        }
      `,
    ];
  }
}

customElements.define("op-automation-editor", OpAutomationEditor);
