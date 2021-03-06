import "@polymer/paper-icon-button/paper-icon-button";

import { STATES_OFF } from "../../common/const";
import {
  LitElement,
  TemplateResult,
  html,
  CSSResult,
  css,
  property,
  PropertyValues,
} from "lit-element";
import { OpenPeerPower } from "../../types";
import { OppEntity } from "../../websocket/lib";
import { forwardHaptic } from "../../data/haptics";

import { computeStateDomain } from "../../common/entity/compute_state_domain";
import { computeStateName } from "../../common/entity/compute_state_name";

import "../op-switch";

const isOn = (stateObj?: OppEntity) =>
  stateObj !== undefined && !STATES_OFF.includes(stateObj.state);

class OpEntityToggle extends LitElement {
  // opp is not a property so that we only re-render on stateObj changes
  public opp?: OpenPeerPower;
  @property() public stateObj?: OppEntity;
  @property() private _isOn: boolean = false;

  protected render(): TemplateResult {
    if (!this.stateObj) {
      return html`
        <op-switch disabled></op-switch>
      `;
    }

    if (this.stateObj.attributes.assumed_state) {
      return html`
        <paper-icon-button
          aria-label=${`Turn ${computeStateName(this.stateObj)} off`}
          icon="opp:flash-off"
          @click=${this._turnOff}
          ?state-active=${!this._isOn}
        ></paper-icon-button>
        <paper-icon-button
          aria-label=${`Turn ${computeStateName(this.stateObj)} on`}
          icon="opp:flash"
          @click=${this._turnOn}
          ?state-active=${this._isOn}
        ></paper-icon-button>
      `;
    }

    return html`
      <op-switch
        aria-label=${`Toggle ${computeStateName(this.stateObj)} ${
          this._isOn ? "off" : "on"
        }`}
        .checked=${this._isOn}
        @change=${this._toggleChanged}
      ></op-switch>
    `;
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this.addEventListener("click", (ev) => ev.stopPropagation());
  }

  protected updated(changedProps: PropertyValues): void {
    if (changedProps.has("stateObj")) {
      this._isOn = isOn(this.stateObj);
    }
  }

  private _toggleChanged(ev) {
    const newVal = ev.target.checked;

    if (newVal !== this._isOn) {
      this._callService(newVal);
    }
  }

  private _turnOn() {
    this._callService(true);
  }

  private _turnOff() {
    this._callService(false);
  }

  // We will force a re-render after a successful call to re-sync the toggle
  // with the state. It will be out of sync if our service call did not
  // result in the entity to be turned on. Since the state is not changing,
  // the resync is not called automatic.
  private async _callService(turnOn): Promise<void> {
    if (!this.opp || !this.stateObj) {
      return;
    }
    forwardHaptic("light");
    const stateDomain = computeStateDomain(this.stateObj);
    let serviceDomain;
    let service;

    if (stateDomain === "lock") {
      serviceDomain = "lock";
      service = turnOn ? "unlock" : "lock";
    } else if (stateDomain === "cover") {
      serviceDomain = "cover";
      service = turnOn ? "open_cover" : "close_cover";
    } else if (stateDomain === "group") {
      serviceDomain = "openpeerpower";
      service = turnOn ? "turn_on" : "turn_off";
    } else {
      serviceDomain = stateDomain;
      service = turnOn ? "turn_on" : "turn_off";
    }

    const currentState = this.stateObj;

    // Optimistic update.
    this._isOn = turnOn;

    await this.opp.callService(serviceDomain, service, {
      entity_id: this.stateObj.entity_id,
    });

    setTimeout(async () => {
      // If after 2 seconds we have not received a state update
      // reset the switch to it's original state.
      if (this.stateObj === currentState) {
        this._isOn = isOn(this.stateObj);
      }
    }, 2000);
  }

  static get styles(): CSSResult {
    return css`
      :host {
        white-space: nowrap;
        min-width: 38px;
      }
      paper-icon-button {
        color: var(
          --paper-icon-button-inactive-color,
          var(--primary-text-color)
        );
        transition: color 0.5s;
      }
      paper-icon-button[state-active] {
        color: var(--paper-icon-button-active-color, var(--primary-color));
      }
      op-switch {
        padding: 13px 5px;
      }
    `;
  }
}

customElements.define("op-entity-toggle", OpEntityToggle);
