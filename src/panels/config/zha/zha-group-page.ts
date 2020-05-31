import {
  property,
  LitElement,
  html,
  customElement,
  css,
  CSSResult,
  PropertyValues,
} from "lit-element";

import memoizeOne from "memoize-one";

import "../../../layouts/opp-subpage";
import "../../../layouts/opp-error-screen";
import "../op-config-section";
import { OpenPeerPower } from "../../../types";
import {
  ZHADevice,
  ZHAGroup,
  fetchGroup,
  removeGroups,
  fetchGroupableDevices,
  addMembersToGroup,
  removeMembersFromGroup,
} from "../../../data/zha";
import { formatAsPaddedHex } from "./functions";
import "./zha-device-card";
import "./zha-devices-data-table";
import { navigate } from "../../../common/navigate";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-spinner/paper-spinner";
import "@material/mwc-button";
import { SelectionChangedEvent } from "../../../components/data-table/op-data-table";

@customElement("zha-group-page")
export class ZHAGroupPage extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public group?: ZHAGroup;
  @property() public groupId!: number;
  @property() public narrow!: boolean;
  @property() public isWide!: boolean;
  @property() public devices: ZHADevice[] = [];
  @property() private _processingAdd: boolean = false;
  @property() private _processingRemove: boolean = false;
  @property() private _filteredDevices: ZHADevice[] = [];
  @property() private _selectedDevicesToAdd: string[] = [];
  @property() private _selectedDevicesToRemove: string[] = [];

  private _firstUpdatedCalled: boolean = false;

  private _members = memoizeOne(
    (group: ZHAGroup): ZHADevice[] => group.members
  );

  public connectedCallback(): void {
    super.connectedCallback();
    if (this.opp && this._firstUpdatedCalled) {
      this._fetchData();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._processingAdd = false;
    this._processingRemove = false;
    this._selectedDevicesToRemove = [];
    this._selectedDevicesToAdd = [];
    this.devices = [];
    this._filteredDevices = [];
  }

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    if (this.opp) {
      this._fetchData();
    }
    this._firstUpdatedCalled = true;
  }

  protected render() {
    if (!this.group) {
      return html`
        <opp-error-screen
          error="${this.opp.localize(
            "ui.panel.config.zha.groups.group_not_found"
          )}"
        ></opp-error-screen>
      `;
    }

    const members = this._members(this.group);

    return html`
      <opp-subpage .header=${this.group.name}>
        <paper-icon-button
          slot="toolbar-icon"
          icon="opp:delete"
          @click=${this._deleteGroup}
        ></paper-icon-button>
        <op-config-section .isWide=${this.isWide}>
          <div class="header">
            ${this.opp.localize("ui.panel.config.zha.groups.group_info")}
          </div>

          <p slot="introduction">
            ${this.opp.localize("ui.panel.config.zha.groups.group_details")}
          </p>

          <p><b>Name:</b> ${this.group.name}</p>
          <p><b>Group Id:</b> ${formatAsPaddedHex(this.group.group_id)}</p>

          <div class="header">
            ${this.opp.localize("ui.panel.config.zha.groups.members")}
          </div>

          ${members.length
            ? members.map(
                (member) => html`
                  <zha-device-card
                    class="card"
                    .opp=${this.opp}
                    .device=${member}
                    .narrow=${this.narrow}
                    .showActions=${false}
                    .showEditableInfo=${false}
                  ></zha-device-card>
                `
              )
            : html`
                <p>
                  This group has no members
                </p>
              `}
          ${members.length
            ? html`
                <div class="header">
                  ${this.opp.localize(
                    "ui.panel.config.zha.groups.remove_members"
                  )}
                </div>

                <zha-devices-data-table
                  .opp=${this.opp}
                  .devices=${members}
                  .narrow=${this.narrow}
                  selectable
                  @selection-changed=${this._handleRemoveSelectionChanged}
                  class="table"
                >
                </zha-devices-data-table>

                <div class="paper-dialog-buttons">
                  <mwc-button
                    .disabled="${!this._selectedDevicesToRemove.length ||
                      this._processingRemove}"
                    @click="${this._removeMembersFromGroup}"
                    class="button"
                  >
                    <paper-spinner
                      ?active="${this._processingRemove}"
                      alt=${this.opp.localize(
                        "ui.panel.config.zha.groups.removing_members"
                      )}
                    ></paper-spinner>
                    ${this.opp!.localize(
                      "ui.panel.config.zha.groups.remove_members"
                    )}</mwc-button
                  >
                </div>
              `
            : html``}

          <div class="header">
            ${this.opp.localize("ui.panel.config.zha.groups.add_members")}
          </div>

          <zha-devices-data-table
            .opp=${this.opp}
            .devices=${this._filteredDevices}
            .narrow=${this.narrow}
            selectable
            @selection-changed=${this._handleAddSelectionChanged}
            class="table"
          >
          </zha-devices-data-table>

          <div class="paper-dialog-buttons">
            <mwc-button
              .disabled="${!this._selectedDevicesToAdd.length ||
                this._processingAdd}"
              @click="${this._addMembersToGroup}"
              class="button"
            >
              <paper-spinner
                ?active="${this._processingAdd}"
                alt=${this.opp.localize(
                  "ui.panel.config.zha.groups.adding_members"
                )}
              ></paper-spinner>
              ${this.opp!.localize(
                "ui.panel.config.zha.groups.add_members"
              )}</mwc-button
            >
          </div>
        </op-config-section>
      </opp-subpage>
    `;
  }

  private async _fetchData() {
    if (this.groupId !== null && this.groupId !== undefined) {
      this.group = await fetchGroup(this.opp!, this.groupId);
    }
    this.devices = await fetchGroupableDevices(this.opp!);
    // filter the groupable devices so we only show devices that aren't already in the group
    this._filterDevices();
  }

  private _filterDevices() {
    // filter the groupable devices so we only show devices that aren't already in the group
    this._filteredDevices = this.devices.filter((device) => {
      return !this.group!.members.some((member) => member.ieee === device.ieee);
    });
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

  private _handleRemoveSelectionChanged(ev: CustomEvent): void {
    const changedSelection = ev.detail as SelectionChangedEvent;
    const entity = changedSelection.id;
    if (
      changedSelection.selected &&
      !this._selectedDevicesToRemove.includes(entity)
    ) {
      this._selectedDevicesToRemove.push(entity);
    } else {
      const index = this._selectedDevicesToRemove.indexOf(entity);
      if (index !== -1) {
        this._selectedDevicesToRemove.splice(index, 1);
      }
    }
    this._selectedDevicesToRemove = [...this._selectedDevicesToRemove];
  }

  private async _addMembersToGroup(): Promise<void> {
    this._processingAdd = true;
    this.group = await addMembersToGroup(
      this.opp,
      this.groupId,
      this._selectedDevicesToAdd
    );
    this._filterDevices();
    this._selectedDevicesToAdd = [];
    this._processingAdd = false;
  }

  private async _removeMembersFromGroup(): Promise<void> {
    this._processingRemove = true;
    this.group = await removeMembersFromGroup(
      this.opp,
      this.groupId,
      this._selectedDevicesToRemove
    );
    this._filterDevices();
    this._selectedDevicesToRemove = [];
    this._processingRemove = false;
  }

  private async _deleteGroup(): Promise<void> {
    await removeGroups(this.opp, [this.groupId]);
    navigate(this, `/config/zha/groups`, true);
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

        op-config-section *:last-child {
          padding-bottom: 24px;
        }

        .button {
          float: right;
        }

        .table {
          height: 200px;
          overflow: auto;
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
