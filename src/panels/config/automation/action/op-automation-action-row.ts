import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
// tslint:disable-next-line
import { PaperListboxElement } from "@polymer/paper-listbox/paper-listbox";
import "@polymer/paper-menu-button/paper-menu-button";
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
} from "lit-element";
import { dynamicElement } from "../../../../common/dom/dynamic-element-directive";
import { fireEvent } from "../../../../common/dom/fire_event";
import "../../../../components/op-card";
import { OpenPeerPower } from "../../../../types";

import { Action } from "../../../../data/script";

import "./types/op-automation-action-service";
import "./types/op-automation-action-device_id";
import "./types/op-automation-action-delay";
import "./types/op-automation-action-event";
import "./types/op-automation-action-condition";
import "./types/op-automation-action-scene";
import "./types/op-automation-action-wait_template";

const OPTIONS = [
  "condition",
  "delay",
  "device_id",
  "event",
  "scene",
  "service",
  "wait_template",
];

const getType = (action: Action) => {
  return OPTIONS.find((option) => option in action);
};

declare global {
  // for fire event
  interface OPPDomEvents {
    "move-action": { direction: "up" | "down" };
  }
}

export interface ActionElement extends LitElement {
  action: Action;
}

export const handleChangeEvent = (element: ActionElement, ev: CustomEvent) => {
  ev.stopPropagation();
  const name = (ev.target as any)?.name;
  if (!name) {
    return;
  }
  const newVal = ev.detail.value;

  if ((element.action[name] || "") === newVal) {
    return;
  }

  let newAction: Action;
  if (!newVal) {
    newAction = { ...element.action };
    delete newAction[name];
  } else {
    newAction = { ...element.action, [name]: newVal };
  }
  fireEvent(element, "value-changed", { value: newAction });
};

@customElement("op-automation-action-row")
export default class OpAutomationActionRow extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public action!: Action;
  @property() public index!: number;
  @property() public totalActions!: number;
  @property() private _yamlMode = false;

  protected render() {
    const type = getType(this.action);
    const selected = type ? OPTIONS.indexOf(type) : -1;
    const yamlMode = this._yamlMode || selected === -1;

    return html`
      <op-card>
        <div class="card-content">
          <div class="card-menu">
            ${this.index !== 0
              ? html`
                  <paper-icon-button
                    icon="opp:arrow-up"
                    @click=${this._moveUp}
                  ></paper-icon-button>
                `
              : ""}
            ${this.index !== this.totalActions - 1
              ? html`
                  <paper-icon-button
                    icon="opp:arrow-down"
                    @click=${this._moveDown}
                  ></paper-icon-button>
                `
              : ""}
            <paper-menu-button
              no-animations
              horizontal-align="right"
              horizontal-offset="-5"
              vertical-offset="-5"
              close-on-activate
            >
              <paper-icon-button
                icon="opp:dots-vertical"
                slot="dropdown-trigger"
              ></paper-icon-button>
              <paper-listbox slot="dropdown-content">
                <paper-item
                  @tap=${this._switchYamlMode}
                  .disabled=${selected === -1}
                >
                  ${yamlMode
                    ? this.opp.localize(
                        "ui.panel.config.automation.editor.edit_ui"
                      )
                    : this.opp.localize(
                        "ui.panel.config.automation.editor.edit_yaml"
                      )}
                </paper-item>
                <paper-item disabled>
                  ${this.opp.localize(
                    "ui.panel.config.automation.editor.actions.duplicate"
                  )}
                </paper-item>
                <paper-item @tap=${this._onDelete}>
                  ${this.opp.localize(
                    "ui.panel.config.automation.editor.actions.delete"
                  )}
                </paper-item>
              </paper-listbox>
            </paper-menu-button>
          </div>
          ${yamlMode
            ? html`
                <div style="margin-right: 24px;">
                  ${selected === -1
                    ? html`
                        ${this.opp.localize(
                          "ui.panel.config.automation.editor.actions.unsupported_action",
                          "action",
                          type
                        )}
                      `
                    : ""}
                  <op-yaml-editor
                    .defaultValue=${this.action}
                    @value-changed=${this._onYamlChange}
                  ></op-yaml-editor>
                </div>
              `
            : html`
                <paper-dropdown-menu-light
                  .label=${this.opp.localize(
                    "ui.panel.config.automation.editor.actions.type_select"
                  )}
                  no-animations
                >
                  <paper-listbox
                    slot="dropdown-content"
                    .selected=${selected}
                    @iron-select=${this._typeChanged}
                  >
                    ${OPTIONS.map(
                      (opt) => html`
                        <paper-item .action=${opt}>
                          ${this.opp.localize(
                            `ui.panel.config.automation.editor.actions.type.${opt}.label`
                          )}
                        </paper-item>
                      `
                    )}
                  </paper-listbox>
                </paper-dropdown-menu-light>
                <div>
                  ${dynamicElement(`op-automation-action-${type}`, {
                    opp: this.opp,
                    action: this.action,
                  })}
                </div>
              `}
        </div>
      </op-card>
    `;
  }

  private _moveUp() {
    fireEvent(this, "move-action", { direction: "up" });
  }

  private _moveDown() {
    fireEvent(this, "move-action", { direction: "down" });
  }

  private _onDelete() {
    if (
      confirm(
        this.opp.localize(
          "ui.panel.config.automation.editor.actions.delete_confirm"
        )
      )
    ) {
      fireEvent(this, "value-changed", { value: null });
    }
  }

  private _typeChanged(ev: CustomEvent) {
    const type = ((ev.target as PaperListboxElement)?.selectedItem as any)
      ?.action;

    if (!type) {
      return;
    }

    if (type !== getType(this.action)) {
      const elClass = customElements.get(`op-automation-action-${type}`);

      fireEvent(this, "value-changed", {
        value: {
          ...elClass.defaultConfig,
        },
      });
    }
  }

  private _onYamlChange(ev: CustomEvent) {
    ev.stopPropagation();
    if (!ev.detail.isValid) {
      return;
    }
    fireEvent(this, "value-changed", { value: ev.detail.value });
  }

  private _switchYamlMode() {
    this._yamlMode = !this._yamlMode;
  }

  static get styles(): CSSResult {
    return css`
      .card-menu {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 3;
        color: var(--primary-text-color);
      }
      .rtl .card-menu {
        right: auto;
        left: 0;
      }
      .card-menu paper-item {
        cursor: pointer;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-action-row": OpAutomationActionRow;
  }
}
