import "@polymer/paper-radio-button/paper-radio-button";
import "@polymer/paper-radio-group/paper-radio-group";
// tslint:disable-next-line
import { PaperRadioGroupElement } from "@polymer/paper-radio-group/paper-radio-group";
import { LitElement, html, property, customElement } from "lit-element";
import { fireEvent } from "../../../../../common/dom/fire_event";
import { OpenPeerPower } from "../../../../../types";
import { OppTrigger } from "../../../../../data/automation";

@customElement("op-automation-trigger-openpeerpower")
export default class OpOppTrigger extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public trigger!: OppTrigger;

  public static get defaultConfig() {
    return {
      event: "start",
    };
  }

  public render() {
    const { event } = this.trigger;
    return html`
      <label id="eventlabel">
        ${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.openpeerpower.event"
        )}
      </label>
      <paper-radio-group
        .selected=${event}
        aria-labelledby="eventlabel"
        @paper-radio-group-changed="${this._radioGroupPicked}"
      >
        <paper-radio-button name="start">
          ${this.opp.localize(
            "ui.panel.config.automation.editor.triggers.type.openpeerpower.start"
          )}
        </paper-radio-button>
        <paper-radio-button name="shutdown">
          ${this.opp.localize(
            "ui.panel.config.automation.editor.triggers.type.openpeerpower.shutdown"
          )}
        </paper-radio-button>
      </paper-radio-group>
    `;
  }

  private _radioGroupPicked(ev) {
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
    "op-automation-trigger-openpeerpower": OpOppTrigger;
  }
}
