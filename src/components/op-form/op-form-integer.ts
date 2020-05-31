import {
  customElement,
  LitElement,
  html,
  property,
  TemplateResult,
  query,
} from "lit-element";
import {
  OpFormElement,
  OpFormIntegerData,
  OpFormIntegerSchema,
} from "./op-form";
import { fireEvent } from "../../common/dom/fire_event";

import "../op-paper-slider";
import "@polymer/paper-input/paper-input";
// Not duplicate, is for typing
// tslint:disable-next-line
import { PaperInputElement } from "@polymer/paper-input/paper-input";
import { PaperSliderElement } from "@polymer/paper-slider/paper-slider";

@customElement("op-form-integer")
export class OpFormInteger extends LitElement implements OpFormElement {
  @property() public schema!: OpFormIntegerSchema;
  @property() public data!: OpFormIntegerData;
  @property() public label!: string;
  @property() public suffix!: string;
  @query("paper-input op-paper-slider") private _input?: HTMLElement;

  public focus() {
    if (this._input) {
      this._input.focus();
    }
  }

  protected render(): TemplateResult {
    return "valueMin" in this.schema && "valueMax" in this.schema
      ? html`
          <div>
            ${this.label}
            <op-paper-slider
              pin=""
              .value=${this._value}
              .min=${this.schema.valueMin}
              .max=${this.schema.valueMax}
              @value-changed=${this._valueChanged}
            ></op-paper-slider>
          </div>
        `
      : html`
          <paper-input
            type="number"
            .label=${this.label}
            .value=${this.data}
            .required=${this.schema.required}
            .autoValidate=${this.schema.required}
            @value-changed=${this._valueChanged}
          ></paper-input>
        `;
  }

  private get _value() {
    return this.data || 0;
  }

  private _valueChanged(ev: Event) {
    const value = Number(
      (ev.target as PaperInputElement | PaperSliderElement).value
    );
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
    "op-form-integer": OpFormInteger;
  }
}
