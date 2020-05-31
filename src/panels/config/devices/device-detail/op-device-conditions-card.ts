import { customElement } from "lit-element";
import {
  DeviceCondition,
  localizeDeviceAutomationCondition,
} from "../../../../data/device_automation";

import "../../../../components/op-card";

import { OpDeviceAutomationCard } from "./op-device-automation-card";

@customElement("op-device-conditions-card")
export class OpDeviceConditionsCard extends OpDeviceAutomationCard<
  DeviceCondition
> {
  protected type = "condition";
  protected headerKey = "ui.panel.config.devices.automation.conditions.caption";

  constructor() {
    super(localizeDeviceAutomationCondition);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-device-conditions-card": OpDeviceConditionsCard;
  }
}
