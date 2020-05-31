import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  css,
  CSSResult,
} from "lit-element";

import "../../../components/op-card";

import { DevconCard, DevconCardEditor } from "../types";
import { styleMap } from "lit-html/directives/style-map";
import { IframeCardConfig } from "./types";

@customElement("hui-iframe-card")
export class HuiIframeCard extends LitElement implements DevconCard {
  public static async getConfigElement(): Promise<DevconCardEditor> {
    await import(
      /* webpackChunkName: "hui-iframe-card-editor" */ "../editor/config-elements/hui-iframe-card-editor"
    );
    return document.createElement("hui-iframe-card-editor");
  }
  public static getStubConfig(): object {
    return { url: "https://www.open-peer-power.io", aspect_ratio: "50%" };
  }

  @property() protected _config?: IframeCardConfig;

  public getCardSize(): number {
    if (!this._config) {
      return 3;
    }
    const aspectRatio = this._config.aspect_ratio
      ? Number(this._config.aspect_ratio.replace("%", ""))
      : 50;
    return 1 + aspectRatio / 25;
  }

  public setConfig(config: IframeCardConfig): void {
    if (!config.url) {
      throw new Error("URL required");
    }

    this._config = config;
  }

  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    const aspectRatio = this._config.aspect_ratio || "50%";

    return html`
      <op-card .header="${this._config.title}">
        <div
          id="root"
          style="${styleMap({
            "padding-top": aspectRatio,
          })}"
        >
          <iframe src="${this._config.url}"></iframe>
        </div>
      </op-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      op-card {
        overflow: hidden;
      }

      #root {
        width: 100%;
        position: relative;
      }

      iframe {
        position: absolute;
        border: none;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-iframe-card": HuiIframeCard;
  }
}
