import "@polymer/paper-input/paper-input";
import "@polymer/paper-radio-button/paper-radio-button";
import "@polymer/paper-radio-group/paper-radio-group";
// tslint:disable-next-line
import { PaperRadioGroupElement } from "@polymer/paper-radio-group/paper-radio-group";
import { LitElement, customElement, property, html } from "lit-element";
import { OpenPeerPower } from "../../../../../types";
import {
  handleChangeEvent,
  ConditionElement,
} from "../op-automation-condition-row";
import { fireEvent } from "../../../../../common/dom/fire_event";
import { SunCondition } from "../../../../../data/automation";

@customElement("op-automation-condition-sun")
export class OpSunCondition extends LitElement implements ConditionElement {
  @property() public opp!: OpenPeerPower;
  @property() public condition!: SunCondition;

  public static get defaultConfig() {
    return {};
  }

  protected render() {
    const { after, after_offset, before, before_offset } = this.condition;
    return html`
      <label id="beforelabel">
        ${this.opp.localize(
          "ui.panel.config.automation.editor.conditions.type.sun.before"
        )}
      </label>
      <paper-radio-group
        .selected=${before}
        .name=${"before"}
        aria-labelledby="beforelabel"
        @paper-radio-group-changed=${this._radioGroupPicked}
      >
        <paper-radio-button name="sunrise">
          ${this.opp.localize(
            "ui.panel.config.automation.editor.conditions.type.sun.sunrise"
          )}
        </paper-radio-button>
        <paper-radio-button name="sunset">
          ${this.opp.localize(
            "ui.panel.config.automation.editor.conditions.type.sun.sunset"
          )}
        </paper-radio-button>
      </paper-radio-group>

      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.conditions.type.sun.before_offset"
        )}
        name="before_offset"
        .value=${before_offset}
        @value-changed=${this._valueChanged}
      ></paper-input>

      <label id="afterlabel">
        ${this.opp.localize(
          "ui.panel.config.automation.editor.conditions.type.sun.after"
        )}
      </label>
      <paper-radio-group
        .selected=${after}
        .name=${"after"}
        aria-labelledby="afterlabel"
        @paper-radio-group-changed=${this._radioGroupPicked}
      >
        <paper-radio-button name="sunrise">
          ${this.opp.localize(
            "ui.panel.config.automation.editor.conditions.type.sun.sunrise"
          )}
        </paper-radio-button>
        <paper-radio-button name="sunset">
          ${this.opp.localize(
            "ui.panel.config.automation.editor.conditions.type.sun.sunset"
          )}
        </paper-radio-button>
      </paper-radio-group>

      <paper-input
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.conditions.type.sun.after_offset"
        )}
        name="after_offset"
        .value=${after_offset}
        @value-changed=${this._valueChanged}
      ></paper-input>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    handleChangeEvent(this, ev);
  }

  private _radioGroupPicked(ev) {
    const key = ev.target.name;
    ev.stopPropagation();
    fireEvent(this, "value-changed", {
      value: {
        ...this.condition,
        [key]: (ev.target as PaperRadioGroupElement).selected,
      },
    });
  }
}
