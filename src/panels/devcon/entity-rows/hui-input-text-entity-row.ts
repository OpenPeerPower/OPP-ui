import {
  html,
  LitElement,
  TemplateResult,
  property,
  customElement,
  PropertyValues,
} from "lit-element";
import { PaperInputElement } from "@polymer/paper-input/paper-input";

import "../components/hui-generic-entity-row";
import "../components/hui-warning";

import { OpenPeerPower } from "../../../types";
import { DevconRow, EntityConfig } from "./types";
import { setValue } from "../../../data/input_text";
import { hasConfigOrEntityChanged } from "../common/has-changed";

@customElement("hui-input-text-entity-row")
class HuiInputTextEntityRow extends LitElement implements DevconRow {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: EntityConfig;

  public setConfig(config: EntityConfig): void {
    if (!config) {
      throw new Error("Configuration error");
    }
    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected render(): TemplateResult {
    if (!this._config || !this.opp) {
      return html``;
    }

    const stateObj = this.opp.states[this._config.entity];

    if (!stateObj) {
      return html`
        <hui-warning
          >${this.opp.localize(
            "ui.panel.devcon.warning.entity_not_found",
            "entity",
            this._config.entity
          )}</hui-warning
        >
      `;
    }

    return html`
      <hui-generic-entity-row .opp="${this.opp}" .config="${this._config}">
        <paper-input
          no-label-float
          .value="${stateObj.state}"
          .minlength="${stateObj.attributes.min}"
          .maxlength="${stateObj.attributes.max}"
          .autoValidate="${stateObj.attributes.pattern}"
          .pattern="${stateObj.attributes.pattern}"
          .type="${stateObj.attributes.mode}"
          @change="${this._selectedValueChanged}"
          placeholder="(empty value)"
        ></paper-input>
      </hui-generic-entity-row>
    `;
  }

  private get _inputEl(): PaperInputElement {
    return this.shadowRoot!.querySelector("paper-input") as PaperInputElement;
  }

  private _selectedValueChanged(ev): void {
    const element = this._inputEl;
    const stateObj = this.opp!.states[this._config!.entity];

    if (element.value !== stateObj.state) {
      setValue(this.opp!, stateObj.entity_id, element.value!);
    }

    ev.target.blur();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-input-text-entity-row": HuiInputTextEntityRow;
  }
}
