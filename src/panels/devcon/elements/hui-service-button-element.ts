import {
  html,
  LitElement,
  TemplateResult,
  property,
  customElement,
  CSSResult,
  css,
} from "lit-element";

import "../../../components/buttons/op-call-service-button";

import { DevconElement, ServiceButtonElementConfig } from "./types";
import { OpenPeerPower } from "../../../types";

@customElement("hui-service-button-element")
export class HuiServiceButtonElement extends LitElement
  implements DevconElement {
  public opp?: OpenPeerPower;
  @property() private _config?: ServiceButtonElementConfig;
  private _domain?: string;
  private _service?: string;

  static get properties() {
    return { _config: {} };
  }

  public setConfig(config: ServiceButtonElementConfig): void {
    if (!config || !config.service) {
      throw Error("Invalid Configuration: 'service' required");
    }

    [this._domain, this._service] = config.service.split(".", 2);

    if (!this._domain) {
      throw Error("Invalid Configuration: 'service' does not have a domain");
    }

    if (!this._service) {
      throw Error(
        "Invalid Configuration: 'service' does not have a service name"
      );
    }

    this._config = config;
  }

  protected render(): TemplateResult {
    if (!this._config || !this.opp) {
      return html``;
    }

    return html`
      <op-call-service-button
        .opp="${this.opp}"
        .domain="${this._domain}"
        .service="${this._service}"
        .serviceData="${this._config.service_data}"
        >${this._config.title}</op-call-service-button
      >
    `;
  }

  static get styles(): CSSResult {
    return css`
      op-call-service-button {
        color: var(--primary-color);
        white-space: nowrap;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-service-button-element": HuiServiceButtonElement;
  }
}
