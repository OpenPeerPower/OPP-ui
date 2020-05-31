import { customElement } from "lit-element";
import {
  DeviceAction,
  fetchDeviceActions,
  localizeDeviceAutomationAction,
} from "../../data/device_automation";
import "../../components/op-paper-dropdown-menu";
import { OpDeviceAutomationPicker } from "./op-device-automation-picker";

@customElement("op-device-action-picker")
class OpDeviceActionPicker extends OpDeviceAutomationPicker<DeviceAction> {
  protected NO_AUTOMATION_TEXT = "No actions";
  protected UNKNOWN_AUTOMATION_TEXT = "Unknown action";

  constructor() {
    super(
      localizeDeviceAutomationAction,
      fetchDeviceActions,
      (deviceId?: string) => ({
        device_id: deviceId || "",
        domain: "",
        entity_id: "",
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-device-action-picker": OpDeviceActionPicker;
  }
}
