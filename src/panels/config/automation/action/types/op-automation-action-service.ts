import "@polymer/paper-input/paper-input";
import "../../../../../components/op-service-picker";
import "../../../../../components/entity/op-entity-picker";
import "../../../../../components/op-yaml-editor";

import {
  LitElement,
  property,
  customElement,
  PropertyValues,
  query,
} from "lit-element";
import { ActionElement, handleChangeEvent } from "../op-automation-action-row";
import { OpenPeerPower } from "../../../../../types";
import { html } from "lit-html";
import memoizeOne from "memoize-one";
import { computeDomain } from "../../../../../common/entity/compute_domain";
import { computeObjectId } from "../../../../../common/entity/compute_object_id";
import { PolymerChangedEvent } from "../../../../../polymer-types";
import { fireEvent } from "../../../../../common/dom/fire_event";
import { ServiceAction } from "../../../../../data/script";
// tslint:disable-next-line
import { OpYamlEditor } from "../../../../../components/op-yaml-editor";

@customElement("op-automation-action-service")
export class OpServiceAction extends LitElement implements ActionElement {
  @property() public opp!: OpenPeerPower;
  @property() public action!: ServiceAction;
  @query("op-yaml-editor") private _yamlEditor?: OpYamlEditor;
  private _actionData?: ServiceAction["data"];

  public static get defaultConfig() {
    return { service: "", data: {} };
  }

  private _getServiceData = memoizeOne((service: string) => {
    if (!service) {
      return [];
    }
    const domain = computeDomain(service);
    const serviceName = computeObjectId(service);
    const serviceDomains = this.opp.services;
    if (!(domain in serviceDomains)) {
      return [];
    }
    if (!(serviceName in serviceDomains[domain])) {
      return [];
    }

    const fields = serviceDomains[domain][serviceName].fields;
    return Object.keys(fields).map((field) => {
      return { key: field, ...fields[field] };
    });
  });

  protected updated(changedProperties: PropertyValues) {
    if (!changedProperties.has("action")) {
      return;
    }
    if (this._actionData && this._actionData !== this.action.data) {
      if (this._yamlEditor) {
        this._yamlEditor.setValue(this.action.data);
      }
    }
    this._actionData = this.action.data;
  }

  protected render() {
    const { service, data, entity_id } = this.action;

    const serviceData = this._getServiceData(service);
    const entity = serviceData.find((attr) => attr.key === "entity_id");

    return html`
      <op-service-picker
        .opp=${this.opp}
        .value=${service}
        @value-changed=${this._serviceChanged}
      ></op-service-picker>
      ${entity
        ? html`
            <op-entity-picker
              .opp=${this.opp}
              .value=${entity_id}
              .label=${entity.description}
              @value-changed=${this._entityPicked}
              .includeDomains=${[computeDomain(service)]}
              allow-custom-entity
            ></op-entity-picker>
          `
        : ""}
      <op-yaml-editor
        .label=${this.opp.localize(
          "ui.panel.config.automation.editor.actions.type.service.service_data"
        )}
        .name=${"data"}
        .defaultValue=${data}
        @value-changed=${this._dataChanged}
      ></op-yaml-editor>
    `;
  }

  private _dataChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!ev.detail.isValid) {
      return;
    }
    this._actionData = ev.detail.value;
    handleChangeEvent(this, ev);
  }

  private _serviceChanged(ev: PolymerChangedEvent<string>) {
    ev.stopPropagation();
    if (ev.detail.value === this.action.service) {
      return;
    }
    fireEvent(this, "value-changed", {
      value: { ...this.action, service: ev.detail.value },
    });
  }

  private _entityPicked(ev: PolymerChangedEvent<string>) {
    ev.stopPropagation();
    fireEvent(this, "value-changed", {
      value: { ...this.action, entity_id: ev.detail.value },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-action-service": OpServiceAction;
  }
}
