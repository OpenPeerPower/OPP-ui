import "../../../../../components/device/op-device-picker";
import "../../../../../components/device/op-device-trigger-picker";
import "../../../../../components/op-form/op-form";

import {
  fetchDeviceTriggerCapabilities,
  deviceAutomationsEqual,
  DeviceTrigger,
} from "../../../../../data/device_automation";
import { LitElement, customElement, property, html } from "lit-element";
import { fireEvent } from "../../../../../common/dom/fire_event";
import { OpenPeerPower } from "../../../../../types";

@customElement("op-automation-trigger-device")
export class OpDeviceTrigger extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public trigger!: DeviceTrigger;
  @property() private _deviceId?: string;
  @property() private _capabilities?;
  private _origTrigger?: DeviceTrigger;

  public static get defaultConfig() {
    return {
      device_id: "",
      domain: "",
      entity_id: "",
    };
  }

  protected render() {
    const deviceId = this._deviceId || this.trigger.device_id;

    const extraFieldsData =
      this._capabilities && this._capabilities.extra_fields
        ? this._capabilities.extra_fields.map((item) => {
            return { [item.name]: this.trigger[item.name] };
          })
        : undefined;

    return html`
      <op-device-picker
        .value=${deviceId}
        @value-changed=${this._devicePicked}
        .opp=${this.opp}
        label="Device"
      ></op-device-picker>
      <op-device-trigger-picker
        .value=${this.trigger}
        .deviceId=${deviceId}
        @value-changed=${this._deviceTriggerPicked}
        .opp=${this.opp}
        label="Trigger"
      ></op-device-trigger-picker>
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
    if (this.trigger) {
      this._origTrigger = this.trigger;
    }
  }

  protected updated(changedPros) {
    const prevTrigger = changedPros.get("trigger");
    if (prevTrigger && !deviceAutomationsEqual(prevTrigger, this.trigger)) {
      this._getCapabilities();
    }
  }

  private async _getCapabilities() {
    const trigger = this.trigger;

    this._capabilities = trigger.domain
      ? await fetchDeviceTriggerCapabilities(this.opp, trigger)
      : null;
  }

  private _devicePicked(ev) {
    ev.stopPropagation();
    this._deviceId = ev.target.value;
  }

  private _deviceTriggerPicked(ev) {
    ev.stopPropagation();
    let trigger = ev.detail.value;
    if (
      this._origTrigger &&
      deviceAutomationsEqual(this._origTrigger, trigger)
    ) {
      trigger = this._origTrigger;
    }
    fireEvent(this, "value-changed", { value: trigger });
  }

  private _extraFieldsChanged(ev) {
    ev.stopPropagation();
    fireEvent(this, "value-changed", {
      value: {
        ...this.trigger,
        ...ev.detail.value,
      },
    });
  }

  private _extraFieldsComputeLabelCallback(localize) {
    // Returns a callback for op-form to calculate labels per schema object
    return (schema) =>
      localize(
        `ui.panel.config.automation.editor.triggers.type.device.extra_fields.${schema.name}`
      ) || schema.name;
  }
}
