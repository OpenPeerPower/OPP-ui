import "@polymer/paper-radio-button/paper-radio-button";
import "@polymer/paper-radio-group/paper-radio-group";
// tslint:disable-next-line
import { PaperRadioGroupElement } from "@polymer/paper-radio-group/paper-radio-group";
import "../../../../../components/entity/op-entity-picker";

import { hasLocation } from "../../../../../common/entity/has_location";
import { computeStateDomain } from "../../../../../common/entity/compute_state_domain";
import { LitElement, property, html, customElement } from "lit-element";
import { OpenPeerPower } from "../../../../../types";
import { PolymerChangedEvent } from "../../../../../polymer-types";
import { fireEvent } from "../../../../../common/dom/fire_event";
import { ZoneTrigger } from "../../../../../data/automation";

function zoneAndLocationFilter(stateObj) {
  return hasLocation(stateObj) && computeStateDomain(stateObj) !== "zone";
}

@customElement("op-automation-trigger-zone")
export class OpZoneTrigger extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public trigger!: ZoneTrigger;

  public static get defaultConfig() {
    return {
      entity_id: "",
      zone: "",
      event: "enter",
    };
  }

  protected render() {
    const { entity_id, zone, event } = this.trigger;
    return html`
      <op-entity-picker
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.zone.entity"
        )}
        .value=${entity_id}
        @value-changed=${this._entityPicked}
        .opp=${this.opp}
        allow-custom-entity
        .entityFilter=${zoneAndLocationFilter}
      ></op-entity-picker>
      <op-entity-picker
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.zone.zone"
        )}
        .value=${zone}
        @value-changed=${this._zonePicked}
        .opp=${this.opp}
        allow-custom-entity
        .includeDomains=${["zone"]}
      ></op-entity-picker>
      <label id="eventlabel">
        ${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.zone.event"
        )}
      </label>
      <paper-radio-group
        .selected=${event}
        aria-labelledby="eventlabel"
        @paper-radio-group-changed=${this._radioGroupPicked}
      >
        <paper-radio-button name="enter">
          ${this.opp.localize(
            "ui.panel.config.automation.editor.triggers.type.zone.enter"
          )}
        </paper-radio-button>
        <paper-radio-button name="leave">
          ${this.opp.localize(
            "ui.panel.config.automation.editor.triggers.type.zone.leave"
          )}
        </paper-radio-button>
      </paper-radio-group>
    `;
  }

  private _entityPicked(ev: PolymerChangedEvent<string>) {
    ev.stopPropagation();
    fireEvent(this, "value-changed", {
      value: { ...this.trigger, entity_id: ev.detail.value },
    });
  }

  private _zonePicked(ev: PolymerChangedEvent<string>) {
    ev.stopPropagation();
    fireEvent(this, "value-changed", {
      value: { ...this.trigger, zone: ev.detail.value },
    });
  }

  private _radioGroupPicked(ev: CustomEvent) {
    ev.stopPropagation();
    fireEvent(this, "value-changed", {
      value: {
        ...this.trigger,
        event: (ev.target as PaperRadioGroupElement).selected,
      },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-trigger-zone": OpZoneTrigger;
  }
}
