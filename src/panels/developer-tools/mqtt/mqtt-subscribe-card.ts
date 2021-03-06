import {
  LitElement,
  customElement,
  TemplateResult,
  html,
  property,
  CSSResult,
  css,
} from "lit-element";
import "@material/mwc-button";
import "@polymer/paper-input/paper-input";
import { OpenPeerPower } from "../../../types";
import "../../../components/op-card";
import { formatTime } from "../../../common/datetime/format_time";

import { subscribeMQTTTopic, MQTTMessage } from "../../../data/mqtt";

@customElement("mqtt-subscribe-card")
class MqttSubscribeCard extends LitElement {
  @property() public opp!: OpenPeerPower;

  @property() private _topic = "";

  @property() private _subscribed?: () => void;

  @property() private _messages: Array<{
    id: number;
    message: MQTTMessage;
    payload: string;
    time: Date;
  }> = [];

  private _messageCount = 0;

  public disconnectedCallback() {
    super.disconnectedCallback();
    if (this._subscribed) {
      this._subscribed();
      this._subscribed = undefined;
    }
  }

  protected render(): TemplateResult {
    return html`
      <op-card
        header="${this.opp.localize(
          "ui.panel.developer-tools.tabs.mqtt.description_listen"
        )}"
      >
        <form>
          <paper-input
            .label=${this._subscribed
              ? this.opp.localize(
                  "ui.panel.developer-tools.tabs.mqtt.listening_to"
                )
              : this.opp.localize(
                  "ui.panel.developer-tools.tabs.mqtt.subscribe_to"
                )}
            .disabled=${this._subscribed !== undefined}
            .value=${this._topic}
            @value-changed=${this._valueChanged}
          ></paper-input>
          <mwc-button
            .disabled=${this._topic === ""}
            @click=${this._handleSubmit}
            type="submit"
          >
            ${this._subscribed
              ? this.opp.localize(
                  "ui.panel.developer-tools.tabs.mqtt.stop_listening"
                )
              : this.opp.localize(
                  "ui.panel.developer-tools.tabs.mqtt.start_listening"
                )}
          </mwc-button>
        </form>
        <div class="events">
          ${this._messages.map(
            (msg) => html`
              <div class="event">
                ${this.opp.localize(
                  "ui.panel.developer-tools.tabs.mqtt.message_received",
                  "id",
                  msg.id,
                  "topic",
                  msg.message.topic,
                  "time",
                  formatTime(msg.time, this.opp!.language)
                )}
                <pre>${msg.payload}</pre>
                <div class="bottom">
                  QoS: ${msg.message.qos} - Retain:
                  ${Boolean(msg.message.retain)}
                </div>
              </div>
            `
          )}
        </div>
      </op-card>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    this._topic = ev.detail.value;
  }

  private async _handleSubmit(): Promise<void> {
    if (this._subscribed) {
      this._subscribed();
      this._subscribed = undefined;
    } else {
      this._subscribed = await subscribeMQTTTopic(
        this.opp!,
        this._topic,
        (message) => this._handleMessage(message)
      );
    }
  }

  private _handleMessage(message: MQTTMessage) {
    const tail =
      this._messages.length > 30 ? this._messages.slice(0, 29) : this._messages;
    let payload: string;
    try {
      payload = JSON.stringify(JSON.parse(message.payload), null, 4);
    } catch (e) {
      payload = message.payload;
    }
    this._messages = [
      {
        payload,
        message,
        time: new Date(),
        id: this._messageCount++,
      },
      ...tail,
    ];
  }

  static get styles(): CSSResult {
    return css`
      form {
        display: block;
        padding: 16px;
      }
      paper-input {
        display: inline-block;
        width: 200px;
      }
      .events {
        margin: -16px 0;
        padding: 0 16px;
      }
      .event {
        border-bottom: 1px solid var(--divider-color);
        padding-bottom: 16px;
        margin: 16px 0;
      }
      .event:last-child {
        border-bottom: 0;
      }
      .bottom {
        font-size: 80%;
        color: var(--secondary-text-color);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mqtt-subscribe-card": MqttSubscribeCard;
  }
}
