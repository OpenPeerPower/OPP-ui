import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-input/paper-input";
import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import "@vaadin/vaadin-combo-box/theme/material/vaadin-combo-box-light";
import memoizeOne from "memoize-one";

import "./state-badge";

import { computeStateName } from "../../common/entity/compute_state_name";
import {
  LitElement,
  TemplateResult,
  html,
  css,
  CSSResult,
  property,
  PropertyValues,
} from "lit-element";
import { OpenPeerPower } from "../../types";
import { OppEntity } from "../../websocket/lib";
import { PolymerChangedEvent } from "../../polymer-types";
import { fireEvent } from "../../common/dom/fire_event";
import { computeDomain } from "../../common/entity/compute_domain";

export type OpEntityPickerEntityFilterFunc = (entityId: OppEntity) => boolean;

const rowRenderer = (root: HTMLElement, _owner, model: { item: OppEntity }) => {
  if (!root.firstElementChild) {
    root.innerHTML = `
      <style>
        paper-icon-item {
          margin: -10px;
          padding: 0;
        }
      </style>
      <paper-icon-item>
        <state-badge state-obj="[[item]]" slot="item-icon"></state-badge>
        <paper-item-body two-line="">
          <div class='name'>[[_computeStateName(item)]]</div>
          <div secondary>[[item.entity_id]]</div>
        </paper-item-body>
      </paper-icon-item>
    `;
  }

  root.querySelector("state-badge")!.stateObj = model.item;
  root.querySelector(".name")!.textContent = computeStateName(model.item);
  root.querySelector("[secondary]")!.textContent = model.item.entity_id;
};

class OpEntityPicker extends LitElement {
  @property({ type: Boolean }) public autofocus?: boolean;
  @property({ type: Boolean }) public disabled?: boolean;
  @property({ type: Boolean, attribute: "allow-custom-entity" })
  public allowCustomEntity;
  @property() public opp?: OpenPeerPower;
  @property() public label?: string;
  @property() public value?: string;
  /**
   * Show entities from specific domains.
   * @type {Array}
   * @attr include-domains
   */
  @property({ type: Array, attribute: "include-domains" })
  public includeDomains?: string[];
  /**
   * Show no entities of these domains.
   * @type {Array}
   * @attr exclude-domains
   */
  @property({ type: Array, attribute: "exclude-domains" })
  public excludeDomains?: string[];
  /**
   * Show only entities of these device classes.
   * @type {Array}
   * @attr include-device-classes
   */
  @property({ type: Array, attribute: "include-device-classes" })
  public includeDeviceClasses?: string[];
  @property() public entityFilter?: OpEntityPickerEntityFilterFunc;
  @property({ type: Boolean }) private _opened?: boolean;
  @property() private _opp?: OpenPeerPower;

  private _getStates = memoizeOne(
    (
      opp: this["opp"],
      includeDomains: this["includeDomains"],
      excludeDomains: this["excludeDomains"],
      entityFilter: this["entityFilter"],
      includeDeviceClasses: this["includeDeviceClasses"]
    ) => {
      let states: OppEntity[] = [];

      if (!opp) {
        return [];
      }
      let entityIds = Object.keys(opp.states);

      if (includeDomains) {
        entityIds = entityIds.filter((eid) =>
          includeDomains.includes(computeDomain(eid))
        );
      }

      if (excludeDomains) {
        entityIds = entityIds.filter(
          (eid) => !excludeDomains.includes(computeDomain(eid))
        );
      }

      states = entityIds.sort().map((key) => opp!.states[key]);

      if (includeDeviceClasses) {
        states = states.filter(
          (stateObj) =>
            // We always want to include the entity of the current value
            stateObj.entity_id === this.value ||
            (stateObj.attributes.device_class &&
              includeDeviceClasses.includes(stateObj.attributes.device_class))
        );
      }

      if (entityFilter) {
        states = states.filter(
          (stateObj) =>
            // We always want to include the entity of the current value
            stateObj.entity_id === this.value || entityFilter!(stateObj)
        );
      }

      return states;
    }
  );

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);

    if (changedProps.has("opp") && !this._opened) {
      this._opp = this.opp;
    }
  }

  protected render(): TemplateResult {
    const states = this._getStates(
      this._opp,
      this.includeDomains,
      this.excludeDomains,
      this.entityFilter,
      this.includeDeviceClasses
    );

    return html`
      <vaadin-combo-box-light
        item-value-path="entity_id"
        item-label-path="entity_id"
        .items=${states}
        .value=${this._value}
        .allowCustomValue=${this.allowCustomEntity}
        .renderer=${rowRenderer}
        @opened-changed=${this._openedChanged}
        @value-changed=${this._valueChanged}
      >
        <paper-input
          .autofocus=${this.autofocus}
          .label=${this.label === undefined && this._opp
            ? this._opp.localize("ui.components.entity.entity-picker.entity")
            : this.label}
          .value=${this._value}
          .disabled=${this.disabled}
          class="input"
          autocapitalize="none"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        >
          ${this.value
            ? html`
                <paper-icon-button
                  aria-label=${this.opp!.localize(
                    "ui.components.entity.entity-picker.clear"
                  )}
                  slot="suffix"
                  class="clear-button"
                  icon="opp:close"
                  @click=${this._clearValue}
                  no-ripple
                >
                  Clear
                </paper-icon-button>
              `
            : ""}
          ${states.length > 0
            ? html`
                <paper-icon-button
                  aria-label=${this.opp!.localize(
                    "ui.components.entity.entity-picker.show_entities"
                  )}
                  slot="suffix"
                  class="toggle-button"
                  .icon=${this._opened ? "opp:menu-up" : "opp:menu-down"}
                >
                  Toggle
                </paper-icon-button>
              `
            : ""}
        </paper-input>
      </vaadin-combo-box-light>
    `;
  }

  private _clearValue(ev: Event) {
    ev.stopPropagation();
    this._setValue("");
  }

  private get _value() {
    return this.value || "";
  }

  private _openedChanged(ev: PolymerChangedEvent<boolean>) {
    this._opened = ev.detail.value;
  }

  private _valueChanged(ev: PolymerChangedEvent<string>) {
    const newValue = ev.detail.value;
    if (newValue !== this._value) {
      this._setValue(newValue);
    }
  }

  private _setValue(value: string) {
    this.value = value;
    setTimeout(() => {
      fireEvent(this, "value-changed", { value });
      fireEvent(this, "change");
    }, 0);
  }

  static get styles(): CSSResult {
    return css`
      paper-input > paper-icon-button {
        width: 24px;
        height: 24px;
        padding: 2px;
        color: var(--secondary-text-color);
      }
      [hidden] {
        display: none;
      }
    `;
  }
}

customElements.define("op-entity-picker", OpEntityPicker);

declare global {
  interface HTMLElementTagNameMap {
    "op-entity-picker": OpEntityPicker;
  }
}
