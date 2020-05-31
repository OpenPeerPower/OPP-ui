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
import { classMap } from "lit-html/directives/class-map";
import { ifDefined } from "lit-html/directives/if-defined";

import { computeStateName } from "../../../common/entity/compute_state_name";
import { applyThemesOnElement } from "../../../common/dom/apply_themes_on_element";
import relativeTime from "../../../common/datetime/relative_time";

import "../../../components/entity/state-badge";
import "../../../components/op-card";
import "../../../components/op-icon";
import "../components/hui-warning-element";

import { computeStateDisplay } from "../../../common/entity/compute_state_display";
import { OpenPeerPower } from "../../../types";
import { DevconCard, DevconCardEditor } from "../types";
import { processConfigEntities } from "../common/process-config-entities";
import { GlanceCardConfig, GlanceConfigEntity } from "./types";
import { actionHandler } from "../common/directives/action-handler-directive";
import { hasAction } from "../common/has-action";
import { ActionHandlerEvent } from "../../../data/devcon";
import { handleAction } from "../common/handle-action";
import { computeDomain } from "../../../common/entity/compute_domain";
import { UNAVAILABLE, UNKNOWN } from "../../../data/entity";

@customElement("hui-glance-card")
export class HuiGlanceCard extends LitElement implements DevconCard {
  public static async getConfigElement(): Promise<DevconCardEditor> {
    await import(
      /* webpackChunkName: "hui-glance-card-editor" */ "../editor/config-elements/hui-glance-card-editor"
    );
    return document.createElement("hui-glance-card-editor");
  }

  public static getStubConfig(): object {
    return { entities: [] };
  }

  @property() public opp?: OpenPeerPower;

  @property() private _config?: GlanceCardConfig;

  private _configEntities?: GlanceConfigEntity[];

  public getCardSize(): number {
    return (
      (this._config!.title ? 1 : 0) +
      Math.ceil(this._configEntities!.length / 5)
    );
  }

  public setConfig(config: GlanceCardConfig): void {
    this._config = { theme: "default", state_color: true, ...config };
    const entities = processConfigEntities<GlanceConfigEntity>(config.entities);

    for (const entity of entities) {
      if (
        (entity.tap_action &&
          entity.tap_action.action === "call-service" &&
          !entity.tap_action.service) ||
        (entity.hold_action &&
          entity.hold_action.action === "call-service" &&
          !entity.hold_action.service)
      ) {
        throw new Error(
          'Missing required property "service" when tap_action or hold_action is call-service'
        );
      }
    }

    const columns = config.columns || Math.min(config.entities.length, 5);
    this.style.setProperty("--glance-column-width", `${100 / columns}%`);

    this._configEntities = entities;

    if (this.opp) {
      this.requestUpdate();
    }
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has("_config")) {
      return true;
    }

    const oldOpp = changedProps.get("opp") as OpenPeerPower | undefined;

    if (
      !this._configEntities ||
      !oldOpp ||
      oldOpp.themes !== this.opp!.themes ||
      oldOpp.language !== this.opp!.language
    ) {
      return true;
    }

    for (const entity of this._configEntities) {
      if (oldOpp.states[entity.entity] !== this.opp!.states[entity.entity]) {
        return true;
      }
    }

    return false;
  }

  protected render(): TemplateResult {
    if (!this._config || !this.opp) {
      return html``;
    }
    const { title } = this._config;

    return html`
      <op-card .header="${title}">
        <div class="${classMap({ entities: true, "no-header": !title })}">
          ${this._configEntities!.map((entityConf) =>
            this.renderEntity(entityConf)
          )}
        </div>
      </op-card>
    `;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._config || !this.opp) {
      return;
    }

    const oldOpp = changedProps.get("opp") as OpenPeerPower | undefined;
    const oldConfig = changedProps.get("_config") as
      | GlanceCardConfig
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

  static get styles(): CSSResult {
    return css`
      .entities {
        display: flex;
        padding: 0 16px 4px;
        flex-wrap: wrap;
      }
      .entities.no-header {
        padding-top: 16px;
      }
      .entity {
        box-sizing: border-box;
        padding: 0 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        margin-bottom: 12px;
        width: var(--glance-column-width, 20%);
      }
      .entity:focus {
        outline: none;
        background: var(--divider-color);
        border-radius: 14px;
        padding: 4px;
        margin: -4px 0;
      }
      .entity div {
        width: 100%;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .name {
        min-height: var(--paper-font-body1_-_line-height, 20px);
      }
      state-badge {
        margin: 8px 0;
      }
    `;
  }

  private renderEntity(entityConf): TemplateResult {
    const stateObj = this.opp!.states[entityConf.entity];

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
      <div
        class="entity"
        .config="${entityConf}"
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(entityConf.hold_action),
          hasDoubleClick: hasAction(entityConf.double_tap_action),
        })}
        tabindex=${ifDefined(
          hasAction(entityConf.tap_action) ? "0" : undefined
        )}
      >
        ${this._config!.show_name !== false
          ? html`
              <div class="name">
                ${"name" in entityConf
                  ? entityConf.name
                  : computeStateName(stateObj)}
              </div>
            `
          : ""}
        ${this._config!.show_icon !== false
          ? html`
              <state-badge
                .opp=${this.opp}
                .stateObj=${stateObj}
                .overrideIcon=${entityConf.icon}
                .overrideImage=${entityConf.image}
                .stateColor=${(entityConf.state_color === false ||
                  entityConf.state_color) ??
                  this._config!.state_color}
              ></state-badge>
            `
          : ""}
        ${this._config!.show_state !== false && entityConf.show_state !== false
          ? html`
              <div>
                ${computeDomain(entityConf.entity) === "sensor" &&
                stateObj.attributes.device_class === "timestamp" &&
                stateObj.state !== UNAVAILABLE &&
                stateObj.state !== UNKNOWN
                  ? html`
                      <hui-timestamp-display
                        .opp=${this.opp}
                        .ts=${new Date(stateObj.state)}
                        .format=${entityConf.format}
                      ></hui-timestamp-display>
                    `
                  : entityConf.show_last_changed
                  ? relativeTime(
                      new Date(stateObj.last_changed),
                      this.opp!.localize
                    )
                  : computeStateDisplay(
                      this.opp!.localize,
                      stateObj,
                      this.opp!.language
                    )}
              </div>
            `
          : ""}
      </div>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent) {
    const config = (ev.currentTarget as any).config as GlanceConfigEntity;
    handleAction(this, this.opp!, config, ev.detail.action!);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-glance-card": HuiGlanceCard;
  }
}
