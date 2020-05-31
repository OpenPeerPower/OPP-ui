import {
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
  CSSResult,
  css,
  customElement,
  property,
} from "lit-element";
import { OppEntity } from "../../../websocket/lib";
import { styleMap } from "lit-html/directives/style-map";
import { ifDefined } from "lit-html/directives/if-defined";
import "@material/mwc-ripple";

import "../../../components/op-card";
import "../components/hui-warning";

import { isValidEntityId } from "../../../common/entity/valid_entity_id";
import { stateIcon } from "../../../common/entity/state_icon";
import { computeStateDomain } from "../../../common/entity/compute_state_domain";
import { computeStateName } from "../../../common/entity/compute_state_name";
import { applyThemesOnElement } from "../../../common/dom/apply_themes_on_element";
import { computeDomain } from "../../../common/entity/compute_domain";

import { OpenPeerPower, LightEntity } from "../../../types";
import { DevconCard, DevconCardEditor } from "../types";
import { DOMAINS_TOGGLE } from "../../../common/const";
import { ButtonCardConfig } from "./types";
import { actionHandler } from "../common/directives/action-handler-directive";
import { hasAction } from "../common/has-action";
import { handleAction } from "../common/handle-action";
import { ActionHandlerEvent } from "../../../data/devcon";
import { computeActiveState } from "../../../common/entity/compute_active_state";
import { iconColorCSS } from "../../../common/style/icon_color_css";

@customElement("hui-button-card")
export class HuiButtonCard extends LitElement implements DevconCard {
  public static async getConfigElement(): Promise<DevconCardEditor> {
    await import(
      /* webpackChunkName: "hui-button-card-editor" */ "../editor/config-elements/hui-button-card-editor"
    );
    return document.createElement("hui-button-card-editor");
  }

  public static getStubConfig(): object {
    return {
      tap_action: { action: "toggle" },
      hold_action: { action: "more-info" },
      show_icon: true,
      show_name: true,
      state_color: true,
    };
  }

  @property() public opp?: OpenPeerPower;

  @property() private _config?: ButtonCardConfig;

  public getCardSize(): number {
    return 2;
  }

  public setConfig(config: ButtonCardConfig): void {
    if (config.entity && !isValidEntityId(config.entity)) {
      throw new Error("Invalid Entity");
    }

    this._config = {
      theme: "default",
      hold_action: { action: "more-info" },
      double_tap_action: { action: "none" },
      show_icon: true,
      show_name: true,
      ...config,
    };

    if (config.entity && DOMAINS_TOGGLE.has(computeDomain(config.entity))) {
      this._config = {
        tap_action: {
          action: "toggle",
        },
        ...this._config,
      };
    } else {
      this._config = {
        tap_action: {
          action: "more-info",
        },
        ...this._config,
      };
    }
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has("_config")) {
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

    return (
      Boolean(this._config!.entity) &&
      oldOpp.states[this._config!.entity!] !==
        this.opp!.states[this._config!.entity!]
    );
  }

  protected render(): TemplateResult {
    if (!this._config || !this.opp) {
      return html``;
    }
    const stateObj = this._config.entity
      ? this.opp.states[this._config.entity]
      : undefined;

    if (this._config.entity && !stateObj) {
      return html`
        <hui-warning
          >${this.opp.localize(
            "ui.panel.devcon.warning.entity_not_found",
            "entity",
            this._config.entity
          )}</hui-warning
        >
      `;
    }

    return html`
      <op-card
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config!.hold_action),
          hasDoubleClick: hasAction(this._config!.double_tap_action),
        })}
        tabindex=${ifDefined(
          hasAction(this._config.tap_action) ? "0" : undefined
        )}
      >
        ${this._config.show_icon
          ? html`
              <op-icon
                data-domain=${ifDefined(
                  this._config.state_color && stateObj
                    ? computeStateDomain(stateObj)
                    : undefined
                )}
                data-state=${ifDefined(
                  stateObj ? computeActiveState(stateObj) : undefined
                )}
                .icon=${this._config.icon ||
                  (stateObj ? stateIcon(stateObj) : "")}
                style=${styleMap({
                  filter: stateObj ? this._computeBrightness(stateObj) : "",
                  color: stateObj ? this._computeColor(stateObj) : "",
                  height: this._config.icon_height
                    ? this._config.icon_height
                    : "auto",
                })}
              ></op-icon>
            `
          : ""}
        ${this._config.show_name
          ? html`
              <span>
                ${this._config.name ||
                  (stateObj ? computeStateName(stateObj) : "")}
              </span>
            `
          : ""}
        <mwc-ripple></mwc-ripple>
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
      | ButtonCardConfig
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
      op-card {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 4% 0;
        font-size: 1.2rem;
      }

      op-card:focus {
        outline: none;
        background: var(--divider-color);
      }

      op-icon {
        width: 40%;
        height: auto;
        color: var(--paper-item-icon-color, #44739e);
      }

      ${iconColorCSS}
    `;
  }

  private _computeBrightness(stateObj: OppEntity | LightEntity): string {
    if (!stateObj.attributes.brightness || !this._config?.state_color) {
      return "";
    }
    const brightness = stateObj.attributes.brightness;
    return `brightness(${(brightness + 245) / 5}%)`;
  }

  private _computeColor(stateObj: OppEntity | LightEntity): string {
    if (!stateObj.attributes.hs_color || !this._config?.state_color) {
      return "";
    }
    const [hue, sat] = stateObj.attributes.hs_color;
    if (sat <= 10) {
      return "";
    }
    return `hsl(${hue}, 100%, ${100 - sat / 2}%)`;
  }

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.opp!, this._config!, ev.detail.action!);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-button-card": HuiButtonCard;
  }
}
