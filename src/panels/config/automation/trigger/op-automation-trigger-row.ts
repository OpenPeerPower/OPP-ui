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

import "./types/op-automation-trigger-device";
import "./types/op-automation-trigger-event";
import "./types/op-automation-trigger-state";
import "./types/op-automation-trigger-geo_location";
import "./types/op-automation-trigger-openpeerpower";
import "./types/op-automation-trigger-mqtt";
import "./types/op-automation-trigger-numeric_state";
import "./types/op-automation-trigger-sun";
import "./types/op-automation-trigger-template";
import "./types/op-automation-trigger-time";
import "./types/op-automation-trigger-time_pattern";
import "./types/op-automation-trigger-webhook";
import "./types/op-automation-trigger-zone";

import { Trigger } from "../../../../data/automation";

const OPTIONS = [
  "device",
  "event",
  "state",
  "geo_location",
  "openpeerpower",
  "mqtt",
  "numeric_state",
  "sun",
  "template",
  "time",
  "time_pattern",
  "webhook",
  "zone",
];

export interface TriggerElement extends LitElement {
  trigger: Trigger;
}

export const handleChangeEvent = (element: TriggerElement, ev: CustomEvent) => {
  ev.stopPropagation();
  const name = (ev.target as any)?.name;
  if (!name) {
    return;
  }
  const newVal = ev.detail.value;

  if ((element.trigger[name] || "") === newVal) {
    return;
  }

  let newTrigger: Trigger;
  if (!newVal) {
    newTrigger = { ...element.trigger };
    delete newTrigger[name];
  } else {
    newTrigger = { ...element.trigger, [name]: newVal };
  }
  fireEvent(element, "value-changed", { value: newTrigger });
};

@customElement("op-automation-trigger-row")
export default class OpAutomationTriggerRow extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public trigger!: Trigger;
  @property() private _yamlMode = false;

  protected render() {
    const selected = OPTIONS.indexOf(this.trigger.platform);
    const yamlMode = this._yamlMode || selected === -1;

    return html`
      <op-card>
        <div class="card-content">
          <div class="card-menu">
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
                    "ui.panel.config.automation.editor.triggers.duplicate"
                  )}
                </paper-item>
                <paper-item @tap=${this._onDelete}>
                  ${this.opp.localize(
                    "ui.panel.config.automation.editor.triggers.delete"
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
                          "ui.panel.config.automation.editor.triggers.unsupported_platform",
                          "platform",
                          this.trigger.platform
                        )}
                      `
                    : ""}
                  <op-yaml-editor
                    .defaultValue=${this.trigger}
                    @value-changed=${this._onYamlChange}
                  ></op-yaml-editor>
                </div>
              `
            : html`
                <paper-dropdown-menu-light
                  .label=${this.opp.localize(
                    "ui.panel.config.automation.editor.triggers.type_select"
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
                        <paper-item .platform=${opt}>
                          ${this.opp.localize(
                            `ui.panel.config.automation.editor.triggers.type.${opt}.label`
                          )}
                        </paper-item>
                      `
                    )}
                  </paper-listbox>
                </paper-dropdown-menu-light>
                <div>
                  ${dynamicElement(
                    `op-automation-trigger-${this.trigger.platform}`,
                    { opp: this.opp, trigger: this.trigger }
                  )}
                </div>
              `}
        </div>
      </op-card>
    `;
  }

  private _onDelete() {
    if (
      confirm(
        this.opp.localize(
          "ui.panel.config.automation.editor.triggers.delete_confirm"
        )
      )
    ) {
      fireEvent(this, "value-changed", { value: null });
    }
  }

  private _typeChanged(ev: CustomEvent) {
    const type = ((ev.target as PaperListboxElement)?.selectedItem as any)
      ?.platform;

    if (!type) {
      return;
    }

    const elClass = customElements.get(`op-automation-trigger-${type}`);

    if (type !== this.trigger.platform) {
      fireEvent(this, "value-changed", {
        value: {
          platform: type,
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
    "op-automation-trigger-row": OpAutomationTriggerRow;
  }
}
