import "../../../../../components/op-textarea";
import { LitElement, property, html, customElement } from "lit-element";
import { OpenPeerPower } from "../../../../../types";
import { handleChangeEvent } from "../op-automation-condition-row";
import { TemplateCondition } from "../../../../../data/automation";

@customElement("op-automation-condition-template")
export class OpTemplateCondition extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public condition!: TemplateCondition;

  public static get defaultConfig() {
    return { value_template: "" };
  }

  protected render() {
    const { value_template } = this.condition;
    return html`
      <op-textarea
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.conditions.type.template.value_template"
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
