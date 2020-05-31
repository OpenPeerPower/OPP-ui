import "../../../../../components/device/op-device-picker";
import "../../../../../components/device/op-device-action-picker";
import "../../../../../components/op-form/op-form";

import {
  fetchDeviceActionCapabilities,
  deviceAutomationsEqual,
  DeviceAction,
} from "../../../../../data/device_automation";
import { LitElement, customElement, property, html } from "lit-element";
import { fireEvent } from "../../../../../common/dom/fire_event";
import { OpenPeerPower } from "../../../../../types";

@customElement("op-automation-action-device_id")
export class OpDeviceAction extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public action!: DeviceAction;
  @property() private _deviceId?: string;
  @property() private _capabilities?;
  private _origAction?: DeviceAction;

  public static get defaultConfig() {
    return {
      device_id: "",
      domain: "",
      entity_id: "",
    };
  }

  protected render() {
    const deviceId = this._deviceId || this.action.device_id;
    const extraFieldsData =
      this._capabilities && this._capabilities.extra_fields
        ? this._capabilities.extra_fields.map((item) => {
            return { [item.name]: this.action[item.name] };
          })
        : undefined;

    return html`
      <op-device-picker
        .value=${deviceId}
        @value-changed=${this._devicePicked}
        .opp=${this.opp}
        label="Device"
      ></op-device-picker>
      <op-device-action-picker
        .value=${this.action}
        .deviceId=${deviceId}
        @value-changed=${this._deviceActionPicked}
        .opp=${this.opp}
        label="Action"
      ></op-device-action-picker>
      ${extraFieldsData
        ? html`
            <op-form
              .data=${Object.assign({}, ...extraFieldsData)}
              .schema=${this._capabilities.extra_fields}
              .computeLabel=${this._extraFieldsComputeLabelCallback(
                this.opp.localize
              )}
              @value-changed=${this._extraFieldsChanged}
            ></op-form>
          `
        : ""}
    `;
  }

  protected firstUpdated() {
    if (!this._capabilities) {
      this._getCapabilities();
    }
    if (this.action) {
      this._origAction = this.action;
    }
  }

  protected updated(changedPros) {
    const prevAction = changedPros.get("action");
    if (prevAction && !deviceAutomationsEqual(prevAction, this.action)) {
      this._getCapabilities();
    }
  }

  private async _getCapabilities() {
    const action = this.action;

    this._capabilities = action.domain
      ? await fetchDeviceActionCapabilities(this.opp, action)
      : null;
  }

  private _devicePicked(ev) {
    ev.stopPropagation();
    this._deviceId = ev.target.value;
  }

  private _deviceActionPicked(ev) {
    ev.stopPropagation();
    let action = ev.detail.value;
    if (this._origAction && deviceAutomationsEqual(this._origAction, action)) {
      action = this._origAction;
    }
    fireEvent(this, "value-changed", { value: action });
  }

  private _extraFieldsChanged(ev) {
    ev.stopPropagation();
    fireEvent(this, "value-changed", {
      value: {
        ...this.action,
        ...ev.detail.value,
      },
    });
  }

  private _extraFieldsComputeLabelCallback(localize) {
    // Returns a callback for op-form to calculate labels per schema object
    return (schema) =>
      localize(
        `ui.panel.config.automation.editor.actions.type.device.extra_fields.${schema.name}`
      ) || schema.name;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-action-device_id": OpDeviceAction;
  }
}
