import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  css,
  CSSResult,
} from "lit-element";
import "@material/mwc-button";

import "../../../components/op-icon";

import { callService } from "../common/call-service";
import { DevconRow, CallServiceConfig } from "../entity-rows/types";
import { OpenPeerPower } from "../../../types";

@customElement("hui-call-service-row")
class HuiCallServiceRow extends LitElement implements DevconRow {
  public opp?: OpenPeerPower;

  @property() private _config?: CallServiceConfig;

  public setConfig(config: CallServiceConfig): void {
    if (!config || !config.name || !config.service) {
      throw new Error("Error in card configuration.");
    }

    this._config = { icon: "opp:remote", ...config };
  }

  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    return html`
      <op-icon .icon="${this._config.icon}"></op-icon>
      <div class="flex">
        <div>${this._config.name}</div>
        <mwc-button @click="${this._callService}"
          >${this._config.action_name
            ? this._config.action_name
            : this.opp!.localize("ui.card.service.run")}</mwc-button
        >
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: flex;
        align-items: center;
      }
      op-icon {
        padding: 8px;
        color: var(--paper-item-icon-color);
      }
      .flex {
        flex: 1;
        overflow: hidden;
        margin-left: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .flex div {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      mwc-button {
        margin-right: -0.57em;
      }
    `;
  }

  private _callService() {
    callService(this._config!, this.opp!);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-call-service-row": HuiCallServiceRow;
  }
}
