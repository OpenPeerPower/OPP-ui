import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  PropertyValues,
} from "lit-element";
import { ifDefined } from "lit-html/directives/if-defined";

import "../../../components/entity/op-state-label-badge";
import "../components/hui-warning-element";

import { computeStateName } from "../../../common/entity/compute_state_name";
import { DevconElement, StateBadgeElementConfig } from "./types";
import { OpenPeerPower } from "../../../types";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import { actionHandler } from "../common/directives/action-handler-directive";
import { hasAction } from "../common/has-action";
import { ActionHandlerEvent } from "../../../data/devcon";
import { handleAction } from "../common/handle-action";

@customElement("hui-state-badge-element")
export class HuiStateBadgeElement extends LitElement implements DevconElement {
  @property() public opp?: OpenPeerPower;
  @property() private _config?: StateBadgeElementConfig;

  public setConfig(config: StateBadgeElementConfig): void {
    if (!config.entity) {
      throw Error("Invalid Configuration: 'entity' required");
    }

    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected render(): TemplateResult {
    if (!this._config || !this.opp) {
      return html``;
    }

    const stateObj = this.opp.states[this._config.entity!];

    if (!stateObj) {
      return html`
        <hui-warning-element
          label="${this.opp.localize(
            "ui.panel.devcon.warning.entity_not_found",
            "entity",
            this._config.entity
          )}"
        ></hui-warning-element>
      `;
    }

    return html`
      <op-state-label-badge
        .opp="${this.opp}"
        .state="${stateObj}"
        .title="${this._config.title === undefined
          ? computeStateName(stateObj)
          : this._config.title === null
          ? ""
          : this._config.title}"
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config!.hold_action),
          hasDoubleClick: hasAction(this._config!.double_tap_action),
        })}
        tabindex=${ifDefined(
          hasAction(this._config.tap_action) ? "0" : undefined
        )}
      ></op-state-label-badge>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.opp!, this._config!, ev.detail.action!);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-state-badge-element": HuiStateBadgeElement;
  }
}
