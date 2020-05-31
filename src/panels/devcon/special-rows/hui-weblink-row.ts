import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  css,
  CSSResult,
} from "lit-element";

import { DevconRow, WeblinkConfig } from "../entity-rows/types";
import { OpenPeerPower } from "../../../types";

import "../../../components/op-icon";

@customElement("hui-weblink-row")
class HuiWeblinkRow extends LitElement implements DevconRow {
  public opp?: OpenPeerPower;

  @property() private _config?: WeblinkConfig;

  public setConfig(config: WeblinkConfig): void {
    if (!config || !config.url) {
      throw new Error("Invalid Configuration: 'url' required");
    }

    this._config = {
      icon: "opp:link",
      name: config.url,
      ...config,
    };
  }

  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    return html`
      <a
        href=${this._config.url}
        target=${this._config.url.indexOf("://") !== -1 ? "_blank" : ""}
      >
        <op-icon .icon="${this._config.icon}"></op-icon>
        <div>${this._config.name}</div>
      </a>
    `;
  }

  static get styles(): CSSResult {
    return css`
      a {
        display: flex;
        align-items: center;
        color: var(--primary-color);
      }
      op-icon {
        padding: 8px;
        color: var(--paper-item-icon-color);
      }
      div {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-left: 16px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-weblink-row": HuiWeblinkRow;
  }
}
