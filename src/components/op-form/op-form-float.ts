import {
  customElement,
  LitElement,
  html,
  property,
  TemplateResult,
  query,
} from "lit-element";
import { OpFormElement, OpFormFloatData, OpFormFloatSchema } from "./op-form";
import { fireEvent } from "../../common/dom/fire_event";

import "@polymer/paper-input/paper-input";
// Not duplicate, is for typing
// tslint:disable-next-line
import { PaperInputElement } from "@polymer/paper-input/paper-input";

@customElement("op-form-float")
export class OpFormFloat extends LitElement implements OpFormElement {
  @property() public schema!: OpFormFloatSchema;
  @property() public data!: OpFormFloatData;
  @property() public label!: string;
  @property() public suffix!: string;
  @query("paper-input") private _input?: HTMLElement;

  public focus() {
    if (this._input) {
      this._input.focus();
    }
  }

  protected render(): TemplateResult {
    return html`
      <paper-input
        .label=${this.label}
        .value=${this._value}
        .required=${this.schema.required}
        .autoValidate=${this.schema.required}
        @value-changed=${this._valueChanged}
      >
        <span suffix="" slot="suffix">${this.suffix}</span>
      </paper-input>
    `;
  }

  private get _value() {
    return this.data || 0;
  }

  private _valueChanged(ev: Event) {
    const value = Number((ev.target as PaperInputElement).value);
    if (this._value === value) {
      return;
    }
    fireEvent(this, "value-changed", {
      value,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-form-float": OpFormFloat;
  }
}
