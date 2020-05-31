import {
  property,
  LitElement,
  html,
  customElement,
  css,
  CSSResult,
  PropertyValues,
} from "lit-element";

import "../../../layouts/opp-subpage";
import "../../../layouts/opp-error-screen";
import "../op-config-section";
import { OpenPeerPower } from "../../../types";
import {
  ZHADevice,
  fetchGroupableDevices,
  addGroup,
  ZHAGroup,
} from "../../../data/zha";
import "./zha-devices-data-table";
import { SelectionChangedEvent } from "../../../components/data-table/op-data-table";
import { navigate } from "../../../common/navigate";
import { PolymerChangedEvent } from "../../../polymer-types";
import "@polymer/paper-spinner/paper-spinner";
import "@material/mwc-button";
import { PaperInputElement } from "@polymer/paper-input/paper-input";

@customElement("zha-add-group-page")
export class ZHAAddGroupPage extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public narrow!: boolean;
  @property() public devices: ZHADevice[] = [];
  @property() private _processingAdd: boolean = false;
  @property() private _groupName: string = "";

  private _firstUpdatedCalled: boolean = false;
  private _selectedDevicesToAdd: string[] = [];

  public connectedCallback(): void {
    super.connectedCallback();
    if (this.opp && this._firstUpdatedCalled) {
      this._fetchData();
    }
  }

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    if (this.opp) {
      this._fetchData();
    }
    this._firstUpdatedCalled = true;
  }

  protected render() {
    return html`
      <opp-subpage
        .header=${this.opp.localize("ui.panel.config.zha.groups.create_group")}
      >
        <op-config-section .isWide=${!this.narrow}>
          <p slot="introduction">
            ${this.opp.localize(
              "ui.panel.config.zha.groups.create_group_details"
            )}
          </p>
          <paper-input
            type="string"
            .value="${this._groupName}"
            @value-changed=${this._handleNameChange}
            placeholder="${this.opp!.localize(
              "ui.panel.config.zha.groups.group_name_placeholder"
            )}"
          ></paper-input>

          <div class="header">
            ${this.opp.localize("ui.panel.config.zha.groups.add_members")}
          </div>

          <zha-devices-data-table
            .opp=${this.opp}
            .devices=${this.devices}
            .narrow=${this.narrow}
            selectable
            @selection-changed=${this._handleAddSelectionChanged}
            class="table"
          >
          </zha-devices-data-table>

          <div class="paper-dialog-buttons">
            <mwc-button
              .disabled="${!this._groupName ||
                this._groupName === "" ||
                this._processingAdd}"
              @click="${this._createGroup}"
              class="button"
            >
              <paper-spinner
                ?active="${this._processingAdd}"
                alt="${this.opp!.localize(
                  "ui.panel.config.zha.groups.creating_group"
                )}"
              ></paper-spinner>
              ${this.opp!.localize(
                "ui.panel.config.zha.groups.create"
              )}</mwc-button
            >
          </div>
        </op-config-section>
      </opp-subpage>
    `;
  }

  private async _fetchData() {
    this.devices = await fetchGroupableDevices(this.opp!);
  }

  private _handleAddSelectionChanged(ev: CustomEvent): void {
    const changedSelection = ev.detail as SelectionChangedEvent;
    const entity = changedSelection.id;
    if (
      changedSelection.selected &&
      !this._selectedDevicesToAdd.includes(entity)
    ) {
      this._selectedDevicesToAdd.push(entity);
    } else {
      const index = this._selectedDevicesToAdd.indexOf(entity);
      if (index !== -1) {
        this._selectedDevicesToAdd.splice(index, 1);
      }
    }
    this._selectedDevicesToAdd = [...this._selectedDevicesToAdd];
  }

  private async _createGroup(): Promise<void> {
    this._processingAdd = true;
    const group: ZHAGroup = await addGroup(
      this.opp,
      this._groupName,
      this._selectedDevicesToAdd
    );
    this._selectedDevicesToAdd = [];
    this._processingAdd = false;
    this._groupName = "";
    navigate(this, `/config/zha/group/${group.group_id}`, true);
  }

  private _handleNameChange(ev: PolymerChangedEvent<string>) {
    const target = ev.currentTarget as PaperInputElement;
    this._groupName = target.value || "";
  }

  static get styles(): CSSResult[] {
    return [
      css`
        .header {
          font-family: var(--paper-font-display1_-_font-family);
          -webkit-font-smoothing: var(
            --paper-font-display1_-_-webkit-font-smoothing
          );
          font-size: var(--paper-font-display1_-_font-size);
          font-weight: var(--paper-font-display1_-_font-weight);
          letter-spacing: var(--paper-font-display1_-_letter-spacing);
          line-height: var(--paper-font-display1_-_line-height);
          opacity: var(--dark-primary-opacity);
        }

        .button {
          float: right;
        }

        .table {
          height: 400px;
          overflow: auto;
        }

        op-config-section *:last-child {
          padding-bottom: 24px;
        }
        mwc-button paper-spinner {
          width: 14px;
          height: 14px;
          margin-right: 20px;
        }
        paper-spinner {
          display: none;
        }
        paper-spinner[active] {
          display: block;
        }
        .paper-dialog-buttons {
          align-items: flex-end;
          padding: 8px;
        }
        .paper-dialog-buttons .warning {
          --mdc-theme-primary: var(--google-red-500);
        }
      `,
    ];
  }
}
