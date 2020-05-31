import { customElement } from "lit-element";
import {
  DeviceTrigger,
  fetchDeviceTriggers,
  localizeDeviceAutomationTrigger,
} from "../../data/device_automation";
import "../../components/op-paper-dropdown-menu";
import { OpDeviceAutomationPicker } from "./op-device-automation-picker";

@customElement("op-device-trigger-picker")
class OpDeviceTriggerPicker extends OpDeviceAutomationPicker<DeviceTrigger> {
  protected NO_AUTOMATION_TEXT = "No triggers";
  protected UNKNOWN_AUTOMATION_TEXT = "Unknown trigger";

  constructor() {
    super(
      localizeDeviceAutomationTrigger,
      fetchDeviceTriggers,
      (deviceId?: string) => ({
        device_id: deviceId || "",
        platform: "device",
        domain: "",
        entity_id: "",
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-device-trigger-picker": OpDeviceTriggerPicker;
  }
}
