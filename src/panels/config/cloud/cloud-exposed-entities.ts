import {
  html,
  LitElement,
  PropertyDeclarations,
  PropertyValues,
  TemplateResult,
} from "lit-element";
import { repeat } from "lit-html/directives/repeat";
import "@polymer/paper-tooltip/paper-tooltip";
import { OppEntityBase } from "../../../open-peer-power-js-websocket/lib";
import "../../../components/entity/op-state-icon";

import { fireEvent } from "../../../common/dom/fire_event";
import { OpenPeerPower } from "../../../types";
import computeStateName from "../../../common/entity/compute_state_name";
import {
  FilterFunc,
  generateFilter,
} from "../../../common/entity/entity_filter";
import { EntityFilter } from "../../../data/cloud";

export class CloudExposedEntities extends LitElement {
  public opp?: OpenPeerPower;
  public filter?: EntityFilter;
  public supportedDomains?: string[];
  private _filterFunc?: FilterFunc;

  static get properties(): PropertyDeclarations {
    return {
      opp: {},
      filter: {},
      supportedDomains: {},
      _filterFunc: {},
    };
  }

  protected render(): TemplateResult | void {
    if (!this._filterFunc) {
      return html``;
    }

    const states: Array<[string, OppEntityBase]> = [];

    Object.keys(this.opp!.states).forEach((entityId) => {
      if (this._filterFunc!(entityId)) {
        const stateObj = this.opp!.states[entityId];
        states.push([computeStateName(stateObj), stateObj]);
      }
    });
    states.sort();

    return html`
      ${this.renderStyle()}
      ${repeat(
        states!,
        (stateInfo) => stateInfo[1].entity_id,
        (stateInfo) => html`
          <span>
            <op-state-icon
              .stateObj="${stateInfo[1]}"
              @click="${this._handleMoreInfo}"
            ></op-state-icon>
            <paper-tooltip position="bottom">${stateInfo[0]}</paper-tooltip>
          </span>
        `
      )}
    `;
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    if (
      changedProperties.has("filter") &&
      changedProperties.get("filter") !== this.filter
    ) {
      const filter = this.filter!;
      const filterFunc = generateFilter(
        filter.include_domains,
        filter.include_entities,
        filter.exclude_domains,
        filter.exclude_entities
      );
      const domains = new Set(this.supportedDomains);
      this._filterFunc = (entityId: string) => {
        const domain = entityId.split(".")[0];
        return domains.has(domain) && filterFunc(entityId);
      };
    }
  }

  private _handleMoreInfo(ev: MouseEvent) {
    fireEvent(this, "opp-more-info", {
      entityId: (ev.currentTarget as any).stateObj.entity_id,
    });
  }

  private renderStyle(): TemplateResult {
    return html`
      <style>
        op-state-icon {
          color: var(--primary-text-color);
          cursor: pointer;
        }
      </style>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "cloud-exposed-entities": CloudExposedEntities;
  }
}

customElements.define("cloud-exposed-entities", CloudExposedEntities);
