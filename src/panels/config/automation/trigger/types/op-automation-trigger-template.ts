import "../../../../../components/op-textarea";
import { LitElement, property, html, customElement } from "lit-element";
import { OpenPeerPower } from "../../../../../types";
import { handleChangeEvent } from "../op-automation-trigger-row";
import { TemplateTrigger } from "../../../../../data/automation";

@customElement("op-automation-trigger-template")
export class OpTemplateTrigger extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public trigger!: TemplateTrigger;

  public static get defaultConfig() {
    return { value_template: "" };
  }

  protected render() {
    const { value_template } = this.trigger;
    return html`
      <op-textarea
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.triggers.type.template.value_template"
        )}
        name="value_template"
        .value=${value_template}
        @value-changed=${this._valueChanged}
        dir="ltr"
      ></op-textarea>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    handleChangeEvent(this, ev);
  }
}
