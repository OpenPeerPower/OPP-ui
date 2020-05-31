import {
  customElement,
  LitElement,
  html,
  property,
  CSSResult,
  css,
} from "lit-element";

import "./op-form-string";
import "./op-form-integer";
import "./op-form-float";
import "./op-form-boolean";
import "./op-form-select";
import "./op-form-multi_select";
import "./op-form-positive_time_period_dict";
import { fireEvent } from "../../common/dom/fire_event";
import { dynamicElement } from "../../common/dom/dynamic-element-directive";

export type OpFormSchema =
  | OpFormStringSchema
  | OpFormIntegerSchema
  | OpFormFloatSchema
  | OpFormBooleanSchema
  | OpFormSelectSchema
  | OpFormMultiSelectSchema
  | OpFormTimeSchema;

export interface OpFormBaseSchema {
  name: string;
  default?: OpFormData;
  required?: boolean;
  optional?: boolean;
  description?: { suffix?: string };
}

export interface OpFormIntegerSchema extends OpFormBaseSchema {
  type: "integer";
  default?: OpFormIntegerData;
  valueMin?: number;
  valueMax?: number;
}

export interface OpFormSelectSchema extends OpFormBaseSchema {
  type: "select";
  options?: string[] | Array<[string, string]>;
}

export interface OpFormMultiSelectSchema extends OpFormBaseSchema {
  type: "multi_select";
  options?: { [key: string]: string } | string[] | Array<[string, string]>;
}

export interface OpFormFloatSchema extends OpFormBaseSchema {
  type: "float";
}

export interface OpFormStringSchema extends OpFormBaseSchema {
  type: "string";
  format?: string;
}

export interface OpFormBooleanSchema extends OpFormBaseSchema {
  type: "boolean";
}

export interface OpFormTimeSchema extends OpFormBaseSchema {
  type: "time";
}

export interface OpFormDataContainer {
  [key: string]: OpFormData;
}

export type OpFormData =
  | OpFormStringData
  | OpFormIntegerData
  | OpFormFloatData
  | OpFormBooleanData
  | OpFormSelectData
  | OpFormMultiSelectData
  | OpFormTimeData;

export type OpFormStringData = string;
export type OpFormIntegerData = number;
export type OpFormFloatData = number;
export type OpFormBooleanData = boolean;
export type OpFormSelectData = string;
export type OpFormMultiSelectData = string[];
export interface OpFormTimeData {
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export interface OpFormElement extends LitElement {
  schema: OpFormSchema;
  data: OpFormDataContainer | OpFormData;
  label?: string;
  suffix?: string;
}

@customElement("op-form")
export class OpForm extends LitElement implements OpFormElement {
  @property() public data!: OpFormDataContainer | OpFormData;
  @property() public schema!: OpFormSchema;
  @property() public error;
  @property() public computeError?: (schema: OpFormSchema, error) => string;
  @property() public computeLabel?: (schema: OpFormSchema) => string;
  @property() public computeSuffix?: (schema: OpFormSchema) => string;

  public focus() {
    const input =
      this.shadowRoot!.getElementById("child-form") ||
      this.shadowRoot!.querySelector("op-form");
    if (!input) {
      return;
    }
    (input as HTMLElement).focus();
  }

  protected render() {
    if (Array.isArray(this.schema)) {
      return html`
        ${this.error && this.error.base
          ? html`
              <div class="error">
                ${this._computeError(this.error.base, this.schema)}
              </div>
            `
          : ""}
        ${this.schema.map(
          (item) => html`
            <op-form
              .data=${this._getValue(this.data, item)}
              .schema=${item}
              .error=${this._getValue(this.error, item)}
              @value-changed=${this._valueChanged}
              .computeError=${this.computeError}
              .computeLabel=${this.computeLabel}
              .computeSuffix=${this.computeSuffix}
            ></op-form>
          `
        )}
      `;
    }

    return html`
      ${this.error
        ? html`
            <div class="error">
              ${this._computeError(this.error, this.schema)}
            </div>
          `
        : ""}
      ${dynamicElement(`op-form-${this.schema.type}`, {
        schema: this.schema,
        data: this.data,
        label: this._computeLabel(this.schema),
        suffix: this._computeSuffix(this.schema),
        id: "child-form",
      })}
    `;
  }

  private _computeLabel(schema: OpFormSchema) {
    return this.computeLabel
      ? this.computeLabel(schema)
      : schema
      ? schema.name
      : "";
  }

  private _computeSuffix(schema: OpFormSchema) {
    return this.computeSuffix
      ? this.computeSuffix(schema)
      : schema && schema.description
      ? schema.description.suffix
      : "";
  }

  private _computeError(error, schema: OpFormSchema) {
    return this.computeError ? this.computeError(error, schema) : error;
  }

  private _getValue(obj, item) {
    if (obj) {
      return obj[item.name];
    }
    return null;
  }

  private _valueChanged(ev: CustomEvent) {
    ev.stopPropagation();
    const schema = (ev.target as OpFormElement).schema;
    const data = this.data as OpFormDataContainer;
    data[schema.name] = ev.detail.value;
    fireEvent(this, "value-changed", {
      value: { ...data },
    });
  }

  static get styles(): CSSResult {
    return css`
      .error {
        color: var(--error-color);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-form": OpForm;
  }
}
