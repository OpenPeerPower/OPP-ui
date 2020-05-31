import {
  customElement,
  LitElement,
  html,
  property,
  TemplateResult,
  CSSResult,
  css,
  query,
} from "lit-element";
import {
  OpFormElement,
  OpFormBooleanData,
  OpFormBooleanSchema,
} from "./op-form";
import { fireEvent } from "../../common/dom/fire_event";

import "@polymer/paper-checkbox/paper-checkbox";
// Not duplicate, is for typing
// tslint:disable-next-line
import { PaperCheckboxElement } from "@polymer/paper-checkbox/paper-checkbox";

@customElement("op-form-boolean")
export class OpFormBoolean extends LitElement implements OpFormElement {
  @property() public schema!: OpFormBooleanSchema;
  @property() public data!: OpFormBooleanData;
  @property() public label!: string;
  @property() public suffix!: string;
  @query("paper-checkbox") private _input?: HTMLElement;

  public focus() {
    if (this._input) {
      this._input.focus();
    }
  }

  protected render(): TemplateResult {
    return html`
      <paper-checkbox .checked=${this.data} @change=${this._valueChanged}>
        ${this.label}
      </paper-checkbox>
    `;
  }

  private _valueChanged(ev: Event) {
    fireEvent(this, "value-changed", {
      value: (ev.target as PaperCheckboxElement).checked,
    });
  }

  static get styles(): CSSResult {
    return css`
      paper-checkbox {
        display: block;
        padding: 22px 0;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-form-boolean": OpFormBoolean;
  }
}
