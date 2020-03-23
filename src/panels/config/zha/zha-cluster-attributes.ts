import "../../../components/buttons/op-call-service-button";
import "../../../components/op-service-description";
import "../../../components/op-card";
import "../op-config-section";
import "@material/mwc-button";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-input/paper-input";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";

import {
  css,
  CSSResult,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
  property,
} from "lit-element";

import {
  Attribute,
  Cluster,
  fetchAttributesForCluster,
  ReadAttributeServiceData,
  readAttributeValue,
  ZHADevice,
} from "../../../data/zha";
import { opStyle } from "../../../resources/styles";
import { OpenPeerPower } from "../../../types";
import { formatAsPaddedHex } from "./functions";
import {
  ChangeEvent,
  ItemSelectedEvent,
  SetAttributeServiceData,
} from "./types";

export class ZHAClusterAttributes extends LitElement {
  @property() public opp?: OpenPeerPower;
  @property() public isWide?: boolean;
  @property() public showHelp = false;
  @property() public selectedNode?: ZHADevice;
  @property() public selectedCluster?: Cluster;
  @property() private _attributes: Attribute[] = [];
  @property() private _selectedAttributeIndex = -1;
  @property() private _attributeValue?: any = "";
  @property() private _manufacturerCodeOverride?: string | number;
  @property() private _setAttributeServiceData?: SetAttributeServiceData;

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has("selectedCluster")) {
      this._attributes = [];
      this._selectedAttributeIndex = -1;
      this._attributeValue = "";
      this._fetchAttributesForCluster();
    }
    super.update(changedProperties);
  }

  protected render(): TemplateResult {
    return html`
      <op-config-section .isWide="${this.isWide}">
        <div class="header" slot="header">
          <span>
            ${this.opp!.localize(
              "ui.panel.config.zha.cluster_attributes.header"
            )}
          </span>
          <paper-icon-button
            class="toggle-help-icon"
            @click="${this._onHelpTap}"
            icon="opp:help-circle"
          >
          </paper-icon-button>
        </div>
        <span slot="introduction">
          ${this.opp!.localize(
            "ui.panel.config.zha.cluster_attributes.introduction"
          )}
        </span>

        <op-card class="content">
          <div class="attribute-picker">
            <paper-dropdown-menu
              label="${this.opp!.localize(
                "ui.panel.config.zha.cluster_attributes.attributes_of_cluster"
              )}"
              class="menu"
            >
              <paper-listbox
                slot="dropdown-content"
                .selected="${this._selectedAttributeIndex}"
                @iron-select="${this._selectedAttributeChanged}"
              >
                ${this._attributes.map(
                  (entry) => html`
                    <paper-item
                      >${entry.name +
                        " (id: " +
                        formatAsPaddedHex(entry.id) +
                        ")"}</paper-item
                    >
                  `
                )}
              </paper-listbox>
            </paper-dropdown-menu>
          </div>
          ${this.showHelp
            ? html`
                <div class="help-text">
                  ${this.opp!.localize(
                    "ui.panel.config.zha.cluster_attributes.help_attribute_dropdown"
                  )}
                </div>
              `
            : ""}
          ${this._selectedAttributeIndex !== -1
            ? this._renderAttributeInteractions()
            : ""}
        </op-card>
      </op-config-section>
    `;
  }

  private _renderAttributeInteractions(): TemplateResult {
    return html`
      <div class="input-text">
        <paper-input
          label="${this.opp!.localize("ui.panel.config.zha.common.value")}"
          type="string"
          .value="${this._attributeValue}"
          @value-changed="${this._onAttributeValueChanged}"
          placeholder="${this.opp!.localize(
            "ui.panel.config.zha.common.value"
          )}"
        ></paper-input>
      </div>
      <div class="input-text">
        <paper-input
          label="${this.opp!.localize(
            "ui.panel.config.zha.common.manufacturer_code_override"
          )}"
          type="number"
          .value="${this._manufacturerCodeOverride}"
          @value-changed="${this._onManufacturerCodeOverrideChanged}"
          placeholder="${this.opp!.localize(
            "ui.panel.config.zha.common.value"
          )}"
        ></paper-input>
      </div>
      <div class="card-actions">
        <mwc-button @click="${this._onGetZigbeeAttributeClick}">
          ${this.opp!.localize(
            "ui.panel.config.zha.cluster_attributes.get_zigbee_attribute"
          )}
        </mwc-button>
        ${this.showHelp
          ? html`
              <div class="help-text2">
                ${this.opp!.localize(
                  "ui.panel.config.zha.cluster_attributes.help_get_zigbee_attribute"
                )}
              </div>
            `
          : ""}
        <op-call-service-button
          .opp="${this.opp}"
          domain="zha"
          service="set_zigbee_cluster_attribute"
          .serviceData="${this._setAttributeServiceData}"
        >
          ${this.opp!.localize(
            "ui.panel.config.zha.cluster_attributes.set_zigbee_attribute"
          )}
        </op-call-service-button>
        ${this.showHelp
          ? html`
              <op-service-description
                .opp="${this.opp}"
                domain="zha"
                service="set_zigbee_cluster_attribute"
                class="help-text2"
              ></op-service-description>
            `
          : ""}
      </div>
    `;
  }

  private async _fetchAttributesForCluster(): Promise<void> {
    if (this.selectedNode && this.selectedCluster && this.opp) {
      this._attributes = await fetchAttributesForCluster(
        this.opp,
        this.selectedNode!.ieee,
        this.selectedCluster!.endpoint_id,
        this.selectedCluster!.id,
        this.selectedCluster!.type
      );
      this._attributes.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    }
  }

  private _computeReadAttributeServiceData():
    | ReadAttributeServiceData
    | undefined {
    if (!this.selectedCluster || !this.selectedNode) {
      return;
    }
    return {
      ieee: this.selectedNode!.ieee,
      endpoint_id: this.selectedCluster!.endpoint_id,
      cluster_id: this.selectedCluster!.id,
      cluster_type: this.selectedCluster!.type,
      attribute: this._attributes[this._selectedAttributeIndex].id,
      manufacturer: this._manufacturerCodeOverride
        ? parseInt(this._manufacturerCodeOverride as string, 10)
        : undefined,
    };
  }

  private _computeSetAttributeServiceData():
    | SetAttributeServiceData
    | undefined {
    if (!this.selectedCluster || !this.selectedNode) {
      return;
    }
    return {
      ieee: this.selectedNode!.ieee,
      endpoint_id: this.selectedCluster!.endpoint_id,
      cluster_id: this.selectedCluster!.id,
      cluster_type: this.selectedCluster!.type,
      attribute: this._attributes[this._selectedAttributeIndex].id,
      value: this._attributeValue,
      manufacturer: this._manufacturerCodeOverride
        ? parseInt(this._manufacturerCodeOverride as string, 10)
        : undefined,
    };
  }

  private _onAttributeValueChanged(value: ChangeEvent): void {
    this._attributeValue = value.detail!.value;
    this._setAttributeServiceData = this._computeSetAttributeServiceData();
  }

  private _onManufacturerCodeOverrideChanged(value: ChangeEvent): void {
    this._manufacturerCodeOverride = value.detail!.value;
    this._setAttributeServiceData = this._computeSetAttributeServiceData();
  }

  private async _onGetZigbeeAttributeClick(): Promise<void> {
    const data = this._computeReadAttributeServiceData();
    if (data && this.opp) {
      this._attributeValue = await readAttributeValue(this.opp, data);
    }
  }

  private _onHelpTap(): void {
    this.showHelp = !this.showHelp;
  }

  private _selectedAttributeChanged(event: ItemSelectedEvent): void {
    this._selectedAttributeIndex = event.target!.selected;
    this._attributeValue = "";
  }

  static get styles(): CSSResult[] {
    return [
      opStyle,
      css`
        .menu {
          width: 100%;
        }

        .content {
          margin-top: 24px;
        }

        op-card {
          max-width: 680px;
        }

        .card-actions.warning op-call-service-button {
          color: var(--google-red-500);
        }

        .attribute-picker {
          align-items: center;
          padding-left: 28px;
          padding-right: 28px;
          padding-bottom: 10px;
        }

        .input-text {
          padding-left: 28px;
          padding-right: 28px;
          padding-bottom: 10px;
        }

        .header {
          flex-grow: 1;
        }

        .toggle-help-icon {
          float: right;
          top: -6px;
          right: 0;
          padding-right: 0px;
          color: var(--primary-color);
        }

        op-service-description {
          display: block;
          color: grey;
        }

        [hidden] {
          display: none;
        }
        .help-text {
          color: grey;
          padding-left: 28px;
          padding-right: 28px;
          padding-bottom: 16px;
        }
        .help-text2 {
          color: grey;
          padding: 16px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zha-cluster-attributes": ZHAClusterAttributes;
  }
}

customElements.define("zha-cluster-attributes", ZHAClusterAttributes);
