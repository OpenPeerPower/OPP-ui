import { customElement } from "lit-element";
import {
  DeviceCondition,
  fetchDeviceConditions,
  localizeDeviceAutomationCondition,
} from "../../data/device_automation";
import "../../components/op-paper-dropdown-menu";
import { OpDeviceAutomationPicker } from "./op-device-automation-picker";

@customElement("op-device-condition-picker")
class OpDeviceConditionPicker extends OpDeviceAutomationPicker<
  DeviceCondition
> {
  protected NO_AUTOMATION_TEXT = "No conditions";
  protected UNKNOWN_AUTOMATION_TEXT = "Unknown condition";

  constructor() {
    super(
      localizeDeviceAutomationCondition,
      fetchDeviceConditions,
      (deviceId?: string) => ({
        device_id: deviceId || "",
        condition: "device",
        domain: "",
        entity_id: "",
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-device-condition-picker": OpDeviceConditionPicker;
  }
}
