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

import "../../../components/entity/state-badge";
import "../components/hui-warning-element";

import { computeTooltip } from "../common/compute-tooltip";
import { LovelaceElement, StateIconElementConfig } from "./types";
import { OpenPeerPower } from "../../../types";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import { actionHandler } from "../common/directives/action-handler-directive";
import { hasAction } from "../common/has-action";
import { ActionHandlerEvent } from "../../../data/lovelace";
import { handleAction } from "../common/handle-action";

@customElement("hui-state-icon-element")
export class HuiStateIconElement extends LitElement implements LovelaceElement {
  @property() public opp?: OpenPeerPower;
  @property() private _config?: StateIconElementConfig;

  public setConfig(config: StateIconElementConfig): void {
    if (!config.entity) {
      throw Error("Invalid Configuration: 'entity' required");
    }

    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.opp) {
      return html``;
    }

    const stateObj = this.opp.states![this._config.entity!];

    if (!stateObj) {
      return html`
        <hui-warning-element
          label=${this.opp.localize(
            "ui.panel.lovelace.warning.entity_not_found",
            "entity",
            this._config.entity
          )}
        ></hui-warning-element>
      `;
    }

    return html`
      <state-badge
        .stateObj="${stateObj}"
        .title="${computeTooltip(this.opp, this._config)}"
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config!.hold_action),
          hasDoubleClick: hasAction(this._config!.double_tap_action),
        })}
        .overrideIcon=${this._config.icon}
      ></state-badge>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        cursor: pointer;
      }
    `;
  }

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.opp!, this._config!, ev.detail.action!);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-state-icon-element": HuiStateIconElement;
  }
}
