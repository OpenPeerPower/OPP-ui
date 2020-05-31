import "../../../components/data-table/op-data-table";
import "../../../components/entity/op-state-icon";

import memoizeOne from "memoize-one";

import {
  LitElement,
  html,
  TemplateResult,
  property,
  customElement,
} from "lit-element";
import { OpenPeerPower } from "../../../types";
// tslint:disable-next-line
import { DataTableColumnContainer } from "../../../components/data-table/op-data-table";
// tslint:disable-next-line
import { ZHADevice } from "../../../data/zha";
import { showZHADeviceInfoDialog } from "../../../dialogs/zha-device-info-dialog/show-dialog-zha-device-info";

export interface DeviceRowData extends ZHADevice {
  device?: DeviceRowData;
}

@customElement("zha-devices-data-table")
export class ZHADevicesDataTable extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public narrow = false;
  @property({ type: Boolean }) public selectable = false;
  @property() public devices: ZHADevice[] = [];

  private _devices = memoizeOne((devices: ZHADevice[]) => {
    let outputDevices: DeviceRowData[] = devices;

    outputDevices = outputDevices.map((device) => {
      return {
        ...device,
        name: device.user_given_name || device.name,
        model: device.model,
        manufacturer: device.manufacturer,
        id: device.ieee,
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
              template: (name) => html`
                <div @click=${this._handleClicked} style="cursor: pointer;">
                  ${name}
                </div>
              `,
            },
          }
        : {
            name: {
              title: "Name",
              sortable: true,
              filterable: true,
              direction: "asc",
              template: (name) => html`
                <div @click=${this._handleClicked} style="cursor: pointer;">
                  ${name}
                </div>
              `,
            },
            manufacturer: {
              title: "Manufacturer",
              sortable: true,
              filterable: true,
            },
            model: {
              title: "Model",
              sortable: true,
              filterable: true,
            },
          }
  );

  protected render(): TemplateResult {
    return html`
      <op-data-table
        .columns=${this._columns(this.narrow)}
        .data=${this._devices(this.devices)}
        .selectable=${this.selectable}
      ></op-data-table>
    `;
  }

  private async _handleClicked(ev: CustomEvent) {
    const ieee = (ev.target as HTMLElement)
      .closest("tr")!
      .getAttribute("data-row-id")!;
    showZHADeviceInfoDialog(this, { ieee });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zha-devices-data-table": ZHADevicesDataTable;
  }
}
