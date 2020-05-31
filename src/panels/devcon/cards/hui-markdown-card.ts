import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  css,
  CSSResult,
  PropertyValues,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { UnsubscribeFunc } from "../../../websocket/lib";

import "../../../components/op-card";
import "../../../components/op-markdown";

import { OpenPeerPower } from "../../../types";
import { DevconCard, DevconCardEditor } from "../types";
import { MarkdownCardConfig } from "./types";
import { subscribeRenderTemplate } from "../../../data/ws-templates";
import { applyThemesOnElement } from "../../../common/dom/apply_themes_on_element";

@customElement("hui-markdown-card")
export class HuiMarkdownCard extends LitElement implements DevconCard {
  public static async getConfigElement(): Promise<DevconCardEditor> {
    await import(
      /* webpackChunkName: "hui-markdown-card-editor" */ "../editor/config-elements/hui-markdown-card-editor"
    );
    return document.createElement("hui-markdown-card-editor");
  }

  public static getStubConfig(): object {
    return {
      content:
        "The **Markdown** card allows you to write any text. You can style it **bold**, *italicized*, ~strikethrough~ etc. You can do images, links, and more.\n\nFor more information see the [Markdown Cheatsheet](https://commonmark.org/help).",
    };
  }

  @property() private _config?: MarkdownCardConfig;
  @property() private _content?: string = "";
  @property() private _unsubRenderTemplate?: Promise<UnsubscribeFunc>;
  @property() private _opp?: OpenPeerPower;

  public getCardSize(): number {
    return this._config === undefined
      ? 3
      : this._config.card_size === undefined
      ? this._config.content.split("\n").length + (this._config.title ? 1 : 0)
      : this._config.card_size;
  }

  public setConfig(config: MarkdownCardConfig): void {
    if (!config.content) {
      throw new Error("Invalid Configuration: Content Required");
    }

    this._config = config;
    this._disconnect().then(() => {
      if (this._opp) {
        this._connect();
      }
    });
  }

  public disconnectedCallback() {
    this._disconnect();
  }

  public set opp(opp) {
    this._opp = opp;
    this._connect();
  }

  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    return html`
      <op-card .header="${this._config.title}">
        <op-markdown
          class="markdown ${classMap({
            "no-header": !this._config.title,
          })}"
          .content="${this._content}"
        ></op-markdown>
      </op-card>
    `;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._config || !this._opp) {
      return;
    }
    const oldOpp = changedProps.get("opp") as OpenPeerPower | undefined;
    const oldConfig = changedProps.get("_config") as
      | MarkdownCardConfig
      | undefined;

    if (
      !oldOpp ||
      !oldConfig ||
      oldOpp.themes !== this.opp.themes ||
      oldConfig.theme !== this._config.theme
    ) {
      applyThemesOnElement(this, this._opp.themes, this._config.theme);
    }
  }

  private async _connect() {
    if (!this._unsubRenderTemplate && this._opp && this._config) {
      this._unsubRenderTemplate = subscribeRenderTemplate(
        this._opp.connection,
        (result) => {
          this._content = result;
        },
        {
          template: this._config.content,
          entity_ids: this._config.entity_id,
          variables: { config: this._config },
        }
      );
      this._unsubRenderTemplate.catch(() => {
        this._content = this._config!.content;
        this._unsubRenderTemplate = undefined;
      });
    }
  }

  private async _disconnect() {
    if (this._unsubRenderTemplate) {
      try {
        const unsub = await this._unsubRenderTemplate;
        this._unsubRenderTemplate = undefined;
        await unsub();
      } catch (e) {
        if (e.code === "not_found") {
          // If we get here, the connection was probably already closed. Ignore.
        } else {
          throw e;
        }
      }
    }
  }

  static get styles(): CSSResult {
    return css`
      op-markdown {
        display: block;
        padding: 0 16px 16px;
        -ms-user-select: initial;
        -webkit-user-select: initial;
        -moz-user-select: initial;
      }
      .markdown.no-header {
        padding-top: 16px;
      }
      op-markdown > *:first-child {
        margin-top: 0;
      }
      op-markdown > *:last-child {
        margin-bottom: 0;
      }
      op-markdown a {
        color: var(--primary-color);
      }
      op-markdown img {
        max-width: 100%;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-markdown-card": HuiMarkdownCard;
  }
}
