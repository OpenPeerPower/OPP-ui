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
import { ifDefined } from "lit-html/directives/if-defined";

import "../../../components/op-card";
import "../../../components/op-icon";
import "../components/hui-image";
import "../components/hui-warning-element";

import { computeStateName } from "../../../common/entity/compute_state_name";
import { computeDomain } from "../../../common/entity/compute_domain";
import { stateIcon } from "../../../common/entity/state_icon";
import { computeStateDisplay } from "../../../common/entity/compute_state_display";
import { DOMAINS_TOGGLE } from "../../../common/const";
import { DevconCard, DevconCardEditor } from "../types";
import { OpenPeerPower } from "../../../types";
import { processConfigEntities } from "../common/process-config-entities";
import { PictureGlanceCardConfig, PictureGlanceEntityConfig } from "./types";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import { applyThemesOnElement } from "../../../common/dom/apply_themes_on_element";
import { actionHandler } from "../common/directives/action-handler-directive";
import { hasAction } from "../common/has-action";
import { ActionHandlerEvent } from "../../../data/devcon";
import { handleAction } from "../common/handle-action";

const STATES_OFF = new Set(["closed", "locked", "not_home", "off"]);

@customElement("hui-picture-glance-card")
class HuiPictureGlanceCard extends LitElement implements DevconCard {
  public static async getConfigElement(): Promise<DevconCardEditor> {
    await import(
      /* webpackChunkName: "hui-picture-glance-card-editor" */ "../editor/config-elements/hui-picture-glance-card-editor"
    );
    return document.createElement("hui-picture-glance-card-editor");
  }
  public static getStubConfig(): object {
    return {
      image:
        "https://www.open-peer-power.io/images/merchandise/shirt-frontpage.png",
      entities: [],
    };
  }

  @property() public opp?: OpenPeerPower;

  @property() private _config?: PictureGlanceCardConfig;

  private _entitiesDialog?: PictureGlanceEntityConfig[];

  private _entitiesToggle?: PictureGlanceEntityConfig[];

  public getCardSize(): number {
    return 3;
  }

  public setConfig(config: PictureGlanceCardConfig): void {
    if (
      !config ||
      !config.entities ||
      !Array.isArray(config.entities) ||
      !(config.image || config.camera_image || config.state_image) ||
      (config.state_image && !config.entity)
    ) {
      throw new Error("Invalid card configuration");
    }

    const entities = processConfigEntities(config.entities);
    this._entitiesDialog = [];
    this._entitiesToggle = [];

    entities.forEach((item) => {
      if (
        config.force_dialog ||
        !DOMAINS_TOGGLE.has(computeDomain(item.entity))
      ) {
        this._entitiesDialog!.push(item);
      } else {
        this._entitiesToggle!.push(item);
      }
    });

    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (hasConfigOrEntityChanged(this, changedProps)) {
      return true;
    }

    const oldOpp = changedProps.get("opp") as OpenPeerPower | undefined;

    if (
      !oldOpp ||
      oldOpp.themes !== this.opp!.themes ||
      oldOpp.language !== this.opp!.language
    ) {
      return true;
    }

    if (this._entitiesDialog) {
      for (const entity of this._entitiesDialog) {
        if (oldOpp!.states[entity.entity] !== this.opp!.states[entity.entity]) {
          return true;
        }
      }
    }

    if (this._entitiesToggle) {
      for (const entity of this._entitiesToggle) {
        if (oldOpp!.states[entity.entity] !== this.opp!.states[entity.entity]) {
          return true;
        }
      }
    }

    return false;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._config || !this.opp) {
      return;
    }
    const oldOpp = changedProps.get("opp") as OpenPeerPower | undefined;
    const oldConfig = changedProps.get("_config") as
      | PictureGlanceCardConfig
      | undefined;

    if (
      !oldOpp ||
      !oldConfig ||
      oldOpp.themes !== this.opp.themes ||
      oldConfig.theme !== this._config.theme
    ) {
      applyThemesOnElement(this, this.opp.themes, this._config.theme);
    }
  }

  protected render(): TemplateResult {
    if (!this._config || !this.opp) {
      return html``;
    }

    return html`
      <op-card>
        <hui-image
          class=${classMap({
            clickable: Boolean(
              this._config.tap_action ||
                this._config.hold_action ||
                this._config.camera_image
            ),
          })}
          @action=${this._handleAction}
          .actionHandler=${actionHandler({
            hasHold: hasAction(this._config!.hold_action),
            hasDoubleClick: hasAction(this._config!.double_tap_action),
          })}
          tabindex=${ifDefined(
            hasAction(this._config.tap_action) ? "0" : undefined
          )}
          .config=${this._config}
          .opp=${this.opp}
          .image=${this._config.image}
          .stateImage=${this._config.state_image}
          .stateFilter=${this._config.state_filter}
          .cameraImage=${this._config.camera_image}
          .cameraView=${this._config.camera_view}
          .entity=${this._config.entity}
          .aspectRatio=${this._config.aspect_ratio}
        ></hui-image>
        <div class="box">
          ${this._config.title
            ? html`
                <div class="title">${this._config.title}</div>
              `
            : ""}
          <div class="row">
            ${this._entitiesDialog!.map((entityConf) =>
              this.renderEntity(entityConf, true)
            )}
          </div>
          <div class="row">
            ${this._entitiesToggle!.map((entityConf) =>
              this.renderEntity(entityConf, false)
            )}
          </div>
        </div>
      </op-card>
    `;
  }

  private renderEntity(
    entityConf: PictureGlanceEntityConfig,
    dialog: boolean
  ): TemplateResult {
    const stateObj = this.opp!.states[entityConf.entity];

    entityConf = {
      tap_action: { action: dialog ? "more-info" : "toggle" },
      ...entityConf,
    };

    if (!stateObj) {
      return html`
        <hui-warning-element
          label=${this.opp!.localize(
            "ui.panel.devcon.warning.entity_not_found",
            "entity",
            entityConf.entity
          )}
        ></hui-warning-element>
      `;
    }

    return html`
      <div class="wrapper">
        <op-icon
          @action=${this._handleAction}
          .actionHandler=${actionHandler({
            hasHold: hasAction(entityConf.hold_action),
            hasDoubleClick: hasAction(entityConf.double_tap_action),
          })}
          tabindex=${ifDefined(
            hasAction(entityConf.tap_action) ? "0" : undefined
          )}
          .config=${entityConf}
          class="${classMap({
            "state-on": !STATES_OFF.has(stateObj.state),
          })}"
          .icon="${entityConf.icon || stateIcon(stateObj)}"
          title="${`
            ${computeStateName(stateObj)} : ${computeStateDisplay(
            this.opp!.localize,
            stateObj,
            this.opp!.language
          )}
          `}"
        ></op-icon>
        ${this._config!.show_state !== true && entityConf.show_state !== true
          ? html`
              <div class="state"></div>
            `
          : html`
              <div class="state">
                ${computeStateDisplay(
                  this.opp!.localize,
                  stateObj,
                  this.opp!.language
                )}
              </div>
            `}
      </div>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent) {
    const config = (ev.currentTarget as any).config as any;
    handleAction(this, this.opp!, config, ev.detail.action!);
  }

  static get styles(): CSSResult {
    return css`
      op-card {
        position: relative;
        min-height: 48px;
        overflow: hidden;
      }

      hui-image.clickable {
        cursor: pointer;
      }

      .box {
        /* start paper-font-common-nowrap style */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        /* end paper-font-common-nowrap style */

        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.3);
        padding: 4px 8px;
        font-size: 16px;
        line-height: 40px;
        color: white;
        display: flex;
        justify-content: space-between;
        flex-direction: row;
      }

      .box .title {
        font-weight: 500;
        margin-left: 8px;
      }

      op-icon {
        cursor: pointer;
        padding: 8px;
        color: #a9a9a9;
      }

      op-icon.state-on {
        color: white;
      }
      op-icon.show-state {
        width: 20px;
        height: 20px;
        padding-bottom: 4px;
        padding-top: 4px;
      }
      op-icon:focus {
        outline: none;
        background: var(--divider-color);
        border-radius: 100%;
      }
      .state {
        display: block;
        font-size: 12px;
        text-align: center;
        line-height: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .row {
        display: flex;
        flex-direction: row;
      }
      .wrapper {
        display: flex;
        flex-direction: column;
        width: 40px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-picture-glance-card": HuiPictureGlanceCard;
  }
}
