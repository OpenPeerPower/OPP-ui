import "@polymer/paper-input/paper-input";
import { LitElement, customElement, property, html } from "lit-element";
import { OpenPeerPower } from "../../../../../types";
import { handleChangeEvent } from "../op-automation-trigger-row";
import { WebhookTrigger } from "../../../../../data/automation";

@customElement("op-automation-trigger-webhook")
export class OpWebhookTrigger extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public trigger!: WebhookTrigger;

  public static get defaultConfig() {
    return {
      webhook_id: "",
    };
  }

  protected render() {
    const { webhook_id: webhookId } = this.trigger;
    return html`
      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.webhook.webhook_id"
        )}
        name="webhook_id"
        .value=${webhookId}
        @value-changed=${this._valueChanged}
      ></paper-input>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    handleChangeEvent(this, ev);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-trigger-webhook": OpWebhookTrigger;
  }
}
