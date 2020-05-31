import {
  LitElement,
  TemplateResult,
  html,
  CSSResultArray,
  css,
  customElement,
  property,
  PropertyValues,
} from "lit-element";
import "@polymer/paper-item/paper-item-body";
import "@polymer/paper-item/paper-item";
import "../../../components/op-card";
import "../../../components/op-icon-next";
import "../../../layouts/opp-subpage";
import "../op-config-section";

import { opStyle } from "../../../resources/styles";
import { OpenPeerPower, Route } from "../../../types";
import { fetchDevices, ZHADevice } from "../../../data/zha";
import { sortZHADevices, formatAsPaddedHex } from "./functions";
import memoizeOne from "memoize-one";
import {
  DataTableColumnContainer,
  RowClickedEvent,
} from "../../../components/data-table/op-data-table";
import { navigate } from "../../../common/navigate";

export interface DeviceRowData extends ZHADevice {
  device?: DeviceRowData;
}

@customElement("zha-config-dashboard")
class ZHAConfigDashboard extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public route!: Route;
  @property() public narrow!: boolean;
  @property() public isWide!: boolean;
  @property() private _devices: ZHADevice[] = [];
  private pages: string[] = ["add", "groups"];
  private _firstUpdatedCalled: boolean = false;

  private _memoizeDevices = memoizeOne((devices: ZHADevice[]) => {
    let outputDevices: DeviceRowData[] = devices;

    outputDevices = outputDevices.map((device) => {
      return {
        ...device,
        name: device.user_given_name ? device.user_given_name : device.name,
        nwk: formatAsPaddedHex(device.nwk),
      };
    });

    return outputDevices;
  });

  private _columns = memoizeOne(
    (narrow: boolean): DataTableColumnContainer =>
      narrow
        ? {
            name: {
              title: "Devices",
              sortable: true,
              filterable: true,
              direction: "asc",
            },
          }
        : {
            name: {
              title: "Name",
              sortable: true,
              filterable: true,
              direction: "asc",
            },
            nwk: {
              title: "Nwk",
              sortable: true,
              filterable: true,
            },
            ieee: {
              title: "IEEE",
              sortable: true,
              filterable: true,
            },
          }
  );

  public connectedCallback(): void {
    super.connectedCallback();
    if (this.opp && this._firstUpdatedCalled) {
      this._fetchDevices();
    }
  }

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    if (this.opp) {
      this._fetchDevices();
    }
    this._firstUpdatedCalled = true;
  }

  protected render(): TemplateResult {
    return html`
      <opp-subpage .header=${this.opp.localize("ui.panel.config.zha.title")}>
        <op-config-section .narrow=${this.narrow} .isWide=${this.isWide}>
          <div slot="header">
            ${this.opp.localize("ui.panel.config.zha.header")}
          </div>

          <div slot="introduction">
            ${this.opp.localize("ui.panel.config.zha.introduction")}
          </div>

          <op-card>
            ${this.pages.map((page) => {
              return html`
                <a href=${`/config/zha/${page}`}>
                  <paper-item>
                    <paper-item-body two-line="">
                      ${this.opp.localize(
                        `ui.panel.config.zha.${page}.caption`
                      )}
                      <div secondary>
                        ${this.opp.localize(
                          `ui.panel.config.zha.${page}.description`
                        )}
                      </div>
                    </paper-item-body>
                    <op-icon-next></op-icon-next>
                  </paper-item>
                </a>
              `;
            })}
          </op-card>
          <op-card>
            <op-data-table
              .columns=${this._columns(this.narrow)}
              .data=${this._memoizeDevices(this._devices)}
              @row-click=${this._handleDeviceClicked}
              .id=${"ieee"}
            ></op-data-table>
          </op-card>
        </op-config-section>
      </opp-subpage>
    `;
  }

  private async _fetchDevices() {
    this._devices = (await fetchDevices(this.opp!)).sort(sortZHADevices);
  }

  private async _handleDeviceClicked(ev: CustomEvent) {
    const deviceId = (ev.detail as RowClickedEvent).id;
    navigate(this, `/config/zha/device/${deviceId}`);
  }

  static get styles(): CSSResultArray {
    return [
      opStyle,
      css`
        a {
          text-decoration: none;
          color: var(--primary-text-color);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zha-config-dashboard": ZHAConfigDashboard;
  }
}
