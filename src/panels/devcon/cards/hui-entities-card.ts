import {
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
  customElement,
  property,
  css,
  CSSResult,
} from "lit-element";

import "../../../components/op-card";
import "../components/hui-entities-toggle";

import { OpenPeerPower } from "../../../types";
import { DevconRow } from "../entity-rows/types";
import { DevconCard, DevconCardEditor, DevconHeaderFooter } from "../types";
import { processConfigEntities } from "../common/process-config-entities";
import { createRowElement } from "../create-element/create-row-element";
import { EntitiesCardConfig, EntitiesCardEntityConfig } from "./types";
import { applyThemesOnElement } from "../../../common/dom/apply_themes_on_element";
import { createHeaderFooterElement } from "../create-element/create-header-footer-element";
import { DevconHeaderFooterConfig } from "../header-footer/types";

@customElement("hui-entities-card")
class HuiEntitiesCard extends LitElement implements DevconCard {
  public static async getConfigElement(): Promise<DevconCardEditor> {
    await import(
      /* webpackChunkName: "hui-entities-card-editor" */ "../editor/config-elements/hui-entities-card-editor"
    );
    return document.createElement("hui-entities-card-editor");
  }

  public static getStubConfig(): object {
    return { entities: [] };
  }

  @property() private _config?: EntitiesCardConfig;

  private _opp?: OpenPeerPower;

  private _configEntities?: EntitiesCardEntityConfig[];

  set opp(opp: OpenPeerPower) {
    this._opp = opp;
    this.shadowRoot!.querySelectorAll("#states > div > *").forEach(
      (element: unknown) => {
        (element as DevconRow).opp = opp;
      }
    );
    this.shadowRoot!.querySelectorAll(".header-footer > *").forEach(
      (element: unknown) => {
        (element as DevconHeaderFooter).opp = opp;
      }
    );
    const entitiesToggle = this.shadowRoot!.querySelector(
      "hui-entities-toggle"
    );
    if (entitiesToggle) {
      (entitiesToggle as any).opp = opp;
    }
  }

  public getCardSize(): number {
    if (!this._config) {
      return 0;
    }
    // +1 for the header
    return (this._config.title ? 1 : 0) + this._config.entities.length;
  }

  public setConfig(config: EntitiesCardConfig): void {
    const entities = processConfigEntities(config.entities);

    this._config = { theme: "default", ...config };
    this._configEntities = entities;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._config || !this._opp) {
      return;
    }
    const oldOpp = changedProps.get("opp") as OpenPeerPower | undefined;
    const oldConfig = changedProps.get("_config") as
      | EntitiesCardConfig
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

  protected render(): TemplateResult {
    if (!this._config || !this._opp) {
      return html``;
    }

    return html`
      <op-card>
        ${this._config.header
          ? this.renderHeaderFooter(this._config.header, "header")
          : ""}
        ${!this._config.title &&
        !this._config.show_header_toggle &&
        !this._config.icon
          ? ""
          : html`
              <div class="card-header">
                <div class="name">
                  ${this._config.icon
                    ? html`
                        <op-icon
                          class="icon"
                          .icon="${this._config.icon}"
                        ></op-icon>
                      `
                    : ""}
                  ${this._config.title}
                </div>
                ${this._config.show_header_toggle === false
                  ? html``
                  : html`
                      <hui-entities-toggle
                        .opp="${this._opp}"
                        .entities="${this._configEntities!.map(
                          (conf) => conf.entity
                        )}"
                      ></hui-entities-toggle>
                    `}
              </div>
            `}
        <div id="states" class="card-content">
          ${this._configEntities!.map((entityConf) =>
            this.renderEntity(entityConf)
          )}
        </div>

        ${this._config.footer
          ? this.renderHeaderFooter(this._config.footer, "footer")
          : ""}
      </op-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .card-header {
        display: flex;
        justify-content: space-between;
      }

      .card-header .name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      #states > * {
        margin: 8px 0;
      }

      #states > div > * {
        overflow: hidden;
      }

      .icon {
        padding: 0px 18px 0px 8px;
      }

      .header {
        border-top-left-radius: var(--op-card-border-radius, 2px);
        border-top-right-radius: var(--op-card-border-radius, 2px);
        margin-bottom: 16px;
        overflow: hidden;
      }

      .footer {
        border-bottom-left-radius: var(--op-card-border-radius, 2px);
        border-bottom-right-radius: var(--op-card-border-radius, 2px);
        margin-top: -16px;
        overflow: hidden;
      }
    `;
  }

  private renderHeaderFooter(
    conf: DevconHeaderFooterConfig,
    className: string
  ): TemplateResult {
    const element = createHeaderFooterElement(conf);
    if (this._opp) {
      element.opp = this._opp;
    }
    return html`
      <div class=${"header-footer " + className}>${element}</div>
    `;
  }

  private renderEntity(entityConf: EntitiesCardEntityConfig): TemplateResult {
    const element = createRowElement(
      this._config!.state_color
        ? {
            state_color: true,
            ...entityConf,
          }
        : entityConf
    );
    if (this._opp) {
      element.opp = this._opp;
    }

    return html`
      <div>${element}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-entities-card": HuiEntitiesCard;
  }
}
