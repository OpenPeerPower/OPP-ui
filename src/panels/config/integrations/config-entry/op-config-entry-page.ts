import memoizeOne from "memoize-one";
import "../../../../layouts/opp-subpage";
import "../../../../layouts/opp-error-screen";

import "../../devices/op-devices-data-table";
import "./op-ce-entities-card";
import { showOptionsFlowDialog } from "../../../../dialogs/config-flow/show-dialog-options-flow";
import { property, LitElement, CSSResult, css, html } from "lit-element";
import { navigate } from "../../../../common/navigate";
import { OpenPeerPower } from "../../../../types";
import {
  ConfigEntry,
  deleteConfigEntry,
} from "../../../../data/config_entries";
import { EntityRegistryEntry } from "../../../../data/entity_registry";
import { DeviceRegistryEntry } from "../../../../data/device_registry";
import { AreaRegistryEntry } from "../../../../data/area_registry";
import { fireEvent } from "../../../../common/dom/fire_event";
import { showConfigEntrySystemOptionsDialog } from "../../../../dialogs/config-entry-system-options/show-dialog-config-entry-system-options";
import {
  showAlertDialog,
  showConfirmationDialog,
} from "../../../../dialogs/generic/show-dialog-box";

class OpConfigEntryPage extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public narrow!: boolean;
  @property() public configEntryId!: string;
  @property() public configEntries!: ConfigEntry[];
  @property() public entityRegistryEntries!: EntityRegistryEntry[];
  @property() public deviceRegistryEntries!: DeviceRegistryEntry[];
  @property() public areas!: AreaRegistryEntry[];

  private get _configEntry(): ConfigEntry | undefined {
    return this.configEntries
      ? this.configEntries.find(
          (entry) => entry.entry_id === this.configEntryId
        )
      : undefined;
  }

  private _computeConfigEntryDevices = memoizeOne(
    (configEntry: ConfigEntry, devices: DeviceRegistryEntry[]) => {
      if (!devices) {
        return [];
      }
      return devices.filter((device) =>
        device.config_entries.includes(configEntry.entry_id)
      );
    }
  );

  private _computeNoDeviceEntities = memoizeOne(
    (configEntry: ConfigEntry, entities: EntityRegistryEntry[]) => {
      if (!entities) {
        return [];
      }
      return entities.filter(
        (ent) => !ent.device_id && ent.config_entry_id === configEntry.entry_id
      );
    }
  );

  protected render() {
    const configEntry = this._configEntry;

    if (!configEntry) {
      return html`
        <opp-error-screen
          error="${this.opp.localize(
            "ui.panel.config.integrations.integration_not_found"
          )}"
        ></opp-error-screen>
      `;
    }

    const configEntryDevices = this._computeConfigEntryDevices(
      configEntry,
      this.deviceRegistryEntries
    );

    const noDeviceEntities = this._computeNoDeviceEntities(
      configEntry,
      this.entityRegistryEntries
    );

    return html`
      <opp-subpage .header=${configEntry.title}>
        ${configEntry.supports_options
          ? html`
              <paper-icon-button
                slot="toolbar-icon"
                icon="opp:settings"
                @click=${this._showSettings}
                title=${this.opp.localize(
                  "ui.panel.config.integrations.config_entry.settings_button",
                  "integration",
                  configEntry.title
                )}
              ></paper-icon-button>
            `
          : ""}
        <paper-icon-button
          slot="toolbar-icon"
          icon="opp:message-settings-variant"
          title=${this.opp.localize(
            "ui.panel.config.integrations.config_entry.system_options_button",
            "integration",
            configEntry.title
          )}
          @click=${this._showSystemOptions}
        ></paper-icon-button>
        <paper-icon-button
          slot="toolbar-icon"
          icon="opp:delete"
          title=${this.opp.localize(
            "ui.panel.config.integrations.config_entry.delete_button",
            "integration",
            configEntry.title
          )}
          @click=${this._confirmRemoveEntry}
        ></paper-icon-button>

        <div class="content">
          ${configEntryDevices.length === 0 && noDeviceEntities.length === 0
            ? html`
                <p>
                  ${this.opp.localize(
                    "ui.panel.config.integrations.config_entry.no_devices"
                  )}
                </p>
              `
            : html`
                <op-devices-data-table
                  .opp=${this.opp}
                  .narrow=${this.narrow}
                  .devices=${configEntryDevices}
                  .entries=${this.configEntries}
                  .entities=${this.entityRegistryEntries}
                  .areas=${this.areas}
                ></op-devices-data-table>
              `}
          ${noDeviceEntities.length > 0
            ? html`
                <op-ce-entities-card
                  .heading=${this.opp.localize(
                    "ui.panel.config.integrations.config_entry.no_device"
                  )}
                  .entities=${noDeviceEntities}
                  .opp=${this.opp}
                  .narrow=${this.narrow}
                ></op-ce-entities-card>
              `
            : ""}
        </div>
      </opp-subpage>
    `;
  }

  private _showSettings() {
    showOptionsFlowDialog(this, this._configEntry!);
  }

  private _showSystemOptions() {
    showConfigEntrySystemOptionsDialog(this, {
      entry: this._configEntry!,
    });
  }

  private _confirmRemoveEntry() {
    showConfirmationDialog(this, {
      text: this.opp.localize(
        "ui.panel.config.integrations.config_entry.delete_confirm"
      ),
      confirm: () => this._removeEntry(),
    });
  }

  private _removeEntry() {
    deleteConfigEntry(this.opp, this.configEntryId).then((result) => {
      fireEvent(this, "opp-reload-entries");
      if (result.require_restart) {
        showAlertDialog(this, {
          text: this.opp.localize(
            "ui.panel.config.integrations.config_entry.restart_confirm"
          ),
        });
      }
      navigate(this, "/config/integrations/dashboard", true);
    });
  }

  static get styles(): CSSResult {
    return css`
      .content {
        padding: 4px;
      }
      p {
        text-align: center;
      }
      op-devices-data-table {
        width: 100%;
      }
    `;
  }
}

customElements.define("op-config-entry-page", OpConfigEntryPage);
