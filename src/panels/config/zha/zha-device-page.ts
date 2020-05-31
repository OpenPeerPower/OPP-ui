import "../../../layouts/opp-subpage";
import "../../../components/op-paper-icon-button-arrow-prev";
import "./zha-device-binding";
import "./zha-group-binding";
import "./zha-cluster-attributes";
import "./zha-cluster-commands";
import "./zha-clusters";
import "./zha-node";
import "@polymer/paper-icon-button/paper-icon-button";

import {
  CSSResult,
  html,
  LitElement,
  property,
  PropertyValues,
  TemplateResult,
  customElement,
  css,
} from "lit-element";

import { OPPDomEvent } from "../../../common/dom/fire_event";
import {
  Cluster,
  fetchBindableDevices,
  ZHADevice,
  fetchZHADevice,
  ZHAGroup,
  fetchGroups,
} from "../../../data/zha";
import { opStyle } from "../../../resources/styles";
import { OpenPeerPower } from "../../../types";
import { sortZHADevices, sortZHAGroups } from "./functions";
import { ZHAClusterSelectedParams } from "./types";

@customElement("zha-device-page")
export class ZHADevicePage extends LitElement {
  @property() public opp?: OpenPeerPower;
  @property() public isWide?: boolean;
  @property() public ieee?: string;
  @property() public device?: ZHADevice;
  @property() public narrow?: boolean;
  @property() private _selectedCluster?: Cluster;
  @property() private _bindableDevices: ZHADevice[] = [];
  @property() private _groups: ZHAGroup[] = [];

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has("ieee")) {
      this._fetchData();
    }
    super.update(changedProperties);
  }

  protected render(): TemplateResult {
    return html`
      <opp-subpage
        .header=${this.opp!.localize("ui.panel.config.zha.devices.header")}
        .back=${!this.isWide}
      >
        <zha-node
          .isWide="${this.isWide}"
          .opp="${this.opp}"
          .device=${this.device}
        ></zha-node>

        ${this.device && this.device.device_type !== "Coordinator"
          ? html`
              <zha-clusters
                .opp="${this.opp}"
                .isWide="${this.isWide}"
                .selectedDevice="${this.device}"
                @zha-cluster-selected="${this._onClusterSelected}"
              ></zha-clusters>
              ${this._selectedCluster
                ? html`
                    <zha-cluster-attributes
                      .isWide="${this.isWide}"
                      .opp="${this.opp}"
                      .selectedNode="${this.device}"
                      .selectedCluster="${this._selectedCluster}"
                    ></zha-cluster-attributes>

                    <zha-cluster-commands
                      .isWide="${this.isWide}"
                      .opp="${this.opp}"
                      .selectedNode="${this.device}"
                      .selectedCluster="${this._selectedCluster}"
                    ></zha-cluster-commands>
                  `
                : ""}
              ${this._bindableDevices.length > 0
                ? html`
                    <zha-device-binding-control
                      .isWide="${this.isWide}"
                      .opp="${this.opp}"
                      .selectedDevice="${this.device}"
                      .bindableDevices="${this._bindableDevices}"
                    ></zha-device-binding-control>
                  `
                : ""}
              ${this.device && this._groups.length > 0
                ? html`
                    <zha-group-binding-control
                      .isWide="${this.isWide}"
                      .narrow="${this.narrow}"
                      .opp="${this.opp}"
                      .selectedDevice="${this.device}"
                      .groups="${this._groups}"
                    ></zha-group-binding-control>
                  `
                : ""}
            `
          : ""}
        <div class="spacer" />
      </opp-subpage>
    `;
  }

  private _onClusterSelected(
    selectedClusterEvent: OPPDomEvent<ZHAClusterSelectedParams>
  ): void {
    this._selectedCluster = selectedClusterEvent.detail.cluster;
  }

  private async _fetchData(): Promise<void> {
    if (this.ieee && this.opp) {
      this.device = await fetchZHADevice(this.opp, this.ieee);
      this._bindableDevices =
        this.device && this.device.device_type !== "Coordinator"
          ? (await fetchBindableDevices(this.opp, this.ieee)).sort(
              sortZHADevices
            )
          : [];
      this._groups = (await fetchGroups(this.opp!)).sort(sortZHAGroups);
    }
  }

  static get styles(): CSSResult[] {
    return [
      opStyle,
      css`
        .spacer {
          height: 50px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zha-device-page": ZHADevicePage;
  }
}
