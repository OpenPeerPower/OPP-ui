import {
  LitElement,
  TemplateResult,
  html,
  property,
  CSSResult,
  css,
} from "lit-element";
import { OpenPeerPower } from "../../../../types";
import { DeviceAutomation } from "../../../../data/device_automation";

import "../../../../components/op-card";
import "../../../../components/op-chips";
import { showAutomationEditor } from "../../../../data/automation";
import { showScriptEditor } from "../../../../data/script";

export abstract class OpDeviceAutomationCard<
  T extends DeviceAutomation
> extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public deviceId?: string;
  @property() public script = false;
  @property() public automations: T[] = [];

  protected headerKey = "";
  protected type = "";

  private _localizeDeviceAutomation: (
    opp: OpenPeerPower,
    automation: T
  ) => string;

  constructor(
    localizeDeviceAutomation: OpDeviceAutomationCard<
      T
    >["_localizeDeviceAutomation"]
  ) {
    super();
    this._localizeDeviceAutomation = localizeDeviceAutomation;
  }

  protected shouldUpdate(changedProps): boolean {
    if (changedProps.has("deviceId") || changedProps.has("automations")) {
      return true;
    }
    const oldOpp = changedProps.get("opp");
    if (!oldOpp || this.opp.language !== oldOpp.language) {
      return true;
    }
    return false;
  }

  protected render(): TemplateResult {
    if (this.automations.length === 0) {
      return html``;
    }
    return html`
      <h3>
        ${this.opp.localize(this.headerKey)}
      </h3>
      <div class="content">
        <op-chips
          @chip-clicked=${this._handleAutomationClicked}
          .items=${this.automations.map((automation) =>
            this._localizeDeviceAutomation(this.opp, automation)
          )}
        >
        </op-chips>
      </div>
    `;
  }

  private _handleAutomationClicked(ev: CustomEvent) {
    const automation = this.automations[ev.detail.index];
    if (!automation) {
      return;
    }
    if (this.script) {
      showScriptEditor(this, { sequence: [automation] });
      return;
    }
    const data = {};
    data[this.type] = [automation];
    showAutomationEditor(this, data);
  }

  static get styles(): CSSResult {
    return css`
      h3 {
        color: var(--primary-text-color);
      }
    `;
  }
}
