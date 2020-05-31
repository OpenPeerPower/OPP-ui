import { customElement } from "lit-element";
import {
  DeviceAction,
  localizeDeviceAutomationAction,
} from "../../../../data/device_automation";

import "../../../../components/op-card";

import { OpDeviceAutomationCard } from "./op-device-automation-card";

@customElement("op-device-actions-card")
export class OpDeviceActionsCard extends OpDeviceAutomationCard<DeviceAction> {
  protected type = "action";
  protected headerKey = "ui.panel.config.devices.automation.actions.caption";

  constructor() {
    super(localizeDeviceAutomationAction);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-device-actions-card": OpDeviceActionsCard;
  }
}
