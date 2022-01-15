import {
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
  CSSResult,
  css,
  property,
  customElement,
  query,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";

import "../../../components/op-card";
import "../../../components/op-label-badge";
import "../components/hui-warning";

import { DevconCard } from "../types";
import { OpenPeerPower } from "../../../types";
import {
  callAlarmAction,
  FORMAT_NUMBER,
} from "../../../data/alarm_control_panel";
import { AlarmPanelCardConfig } from "./types";
import { PaperInputElement } from "@polymer/paper-input/paper-input";
import { applyThemesOnElement } from "../../../common/dom/apply_themes_on_element";

const ICONS = {
  armed_away: "opp:shield-lock",
  armed_custom_bypass: "opp:security",
  armed_home: "opp:shield-home",
  armed_night: "opp:shield-home",
  disarmed: "opp:shield-check",
  pending: "opp:shield-outline",
  triggered: "opp:bell-ring",
};

const BUTTONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "clear"];

@customElement("hui-alarm-panel-card")
class HuiAlarmPanelCard extends LitElement implements DevconCard {
  public static async getConfigElement() {
    await import(
      /* webpackChunkName: "hui-alarm-panel-card-editor" */ "../editor/config-elements/hui-alarm-panel-card-editor"
    );
    return document.createElement("hui-alarm-panel-card-editor");
  }

  public static getStubConfig() {
    return { states: ["arm_home", "arm_away"], entity: "" };
  }

  @property() public opp?: OpenPeerPower;

  @property() private _config?: AlarmPanelCardConfig;

  @query("#alarmCode") private _input?: PaperInputElement;

  public getCardSize(): number {
    if (!this._config || !this.opp) {
      return 0;
    }

    const stateObj = this.opp.states[this._config.entity];

    return !stateObj || stateObj.attributes.code_format !== FORMAT_NUMBER
      ? 3
      : 8;
  }

  public setConfig(config: AlarmPanelCardConfig): void {
    if (
      !config ||
      !config.entity ||
      config.entity.split(".")[0] !== "alarm_control_panel"
    ) {
      throw new Error("Invalid card configuration");
    }

    const defaults = {
      states: ["arm_away", "arm_home"],
    };

    this._config = { ...defaults, ...config };
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._config || !this.opp) {
      return;
    }
    const oldOpp = changedProps.get("opp") as OpenPeerPower | undefined;
    const oldConfig = changedProps.get("_config") as
      | AlarmPanelCardConfig
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
      oldOpp.states[this._config!.entity] !==
      this.opp!.states[this._config!.entity]
    );
  }

  protected render(): TemplateResult {
    if (!this._config || !this.opp) {
      return html``;
    }
    const stateObj = this.opp.states[this._config.entity];

    if (!stateObj) {
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
        .header="${this._config.name ||
          stateObj.attributes.friendly_name ||
          this._label(stateObj.state)}"
      >
        <op-label-badge
          class="${classMap({ [stateObj.state]: true })}"
          .icon="${ICONS[stateObj.state] || "opp:shield-outline"}"
          .label="${this._stateIconLabel(stateObj.state)}"
        ></op-label-badge>
        <div id="armActions" class="actions">
          ${(stateObj.state === "disarmed"
            ? this._config.states!
            : ["disarm"]
          ).map((state) => {
            return html`
              <mwc-button
                .action="${state}"
                @click="${this._handleActionClick}"
                outlined
              >
                ${this._label(state)}
              </mwc-button>
            `;
          })}
        </div>
        ${!stateObj.attributes.code_format
          ? html``
          : html`
              <paper-input
                id="alarmCode"
                label="Alarm Code"
                type="password"
              ></paper-input>
            `}
        ${stateObj.attributes.code_format !== FORMAT_NUMBER
          ? html``
          : html`
              <div id="keypad">
                ${BUTTONS.map((value) => {
                  return value === ""
                    ? html`
                        <mwc-button disabled></mwc-button>
                      `
                    : html`
                        <mwc-button
                          .value="${value}"
                          @click="${this._handlePadClick}"
                          outlined
                        >
                          ${value === "clear"
                            ? this._label("clear_code")
                            : value}
                        </mwc-button>
                      `;
                })}
              </div>
            `}
      </op-card>
    `;
  }

  private _stateIconLabel(state: string): string {
    const stateLabel = state.split("_").pop();
    return stateLabel === "disarmed" ||
      stateLabel === "triggered" ||
      !stateLabel
      ? ""
      : stateLabel;
  }

  private _label(state: string): string {
    return (
      this.opp!.localize(`state.alarm_control_panel.${state}`) ||
      this.opp!.localize(`ui.card.alarm_control_panel.${state}`)
    );
  }

  private _handlePadClick(e: MouseEvent): void {
    const val = (e.currentTarget! as any).value;
    this._input!.value = val === "clear" ? "" : this._input!.value + val;
  }

  private _handleActionClick(e: MouseEvent): void {
    const input = this._input!;
    const code =
      input && input.value && input.value.length > 0 ? input.value : "";
    callAlarmAction(
      this.opp!,
      this._config!.entity,
      (e.currentTarget! as any).action,
      code
    );
    input.value = "";
  }

  static get styles(): CSSResult {
    return css`
      op-card {
        padding-bottom: 16px;
        position: relative;
        --alarm-color-disarmed: var(--label-badge-green);
        --alarm-color-pending: var(--label-badge-yellow);
        --alarm-color-triggered: var(--label-badge-red);
        --alarm-color-armed: var(--label-badge-red);
        --alarm-color-autoarm: rgba(0, 153, 255, 0.1);
        --alarm-state-color: var(--alarm-color-armed);
      }

      op-label-badge {
        --op-label-badge-color: var(--alarm-state-color);
        --label-badge-text-color: var(--alarm-state-color);
        --label-badge-background-color: var(--paper-card-background-color);
        color: var(--alarm-state-color);
        position: absolute;
        right: 12px;
        top: 12px;
      }

      .disarmed {
        --alarm-state-color: var(--alarm-color-disarmed);
      }

      .triggered {
        --alarm-state-color: var(--alarm-color-triggered);
        animation: pulse 1s infinite;
      }

      .arming {
        --alarm-state-color: var(--alarm-color-pending);
        animation: pulse 1s infinite;
      }

      .pending {
        --alarm-state-color: var(--alarm-color-pending);
        animation: pulse 1s infinite;
      }

      @keyframes pulse {
        0% {
          --op-label-badge-color: var(--alarm-state-color);
        }
        100% {
          --op-label-badge-color: rgba(255, 153, 0, 0.3);
        }
      }

      paper-input {
        margin: 0 auto 8px;
        max-width: 150px;
        text-align: center;
      }

      .state {
        margin-left: 16px;
        position: relative;
        bottom: 16px;
        color: var(--alarm-state-color);
        animation: none;
      }

      #keypad {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        margin: auto;
        width: 100%;
        max-width: 300px;
      }

      #keypad mwc-button {
        text-size: 20px;
        padding: 8px;
        width: 30%;
        box-sizing: border-box;
      }

      .actions {
        margin: 0 8px;
        padding-top: 20px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }

      .actions mwc-button {
        margin: 0 4px 4px;
      }

      mwc-button#disarm {
        color: var(--google-red-500);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-alarm-panel-card": HuiAlarmPanelCard;
  }
}