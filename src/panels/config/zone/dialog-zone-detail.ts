import {
  LitElement,
  html,
  css,
  CSSResult,
  TemplateResult,
  property,
} from "lit-element";

import "@polymer/paper-input/paper-input";
import "@material/mwc-button";

import "../../../components/map/op-location-editor";
import "../../../components/op-switch";
import "../../../components/op-dialog";

import { ZoneDetailDialogParams } from "./show-dialog-zone-detail";
import { OpenPeerPower } from "../../../types";
import {
  ZoneMutableParams,
  passiveRadiusColor,
  defaultRadiusColor,
  getZoneEditorInitData,
} from "../../../data/zone";
import { addDistanceToCoord } from "../../../common/location/add_distance_to_coord";

class DialogZoneDetail extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() private _name!: string;
  @property() private _icon!: string;
  @property() private _latitude!: number;
  @property() private _longitude!: number;
  @property() private _passive!: boolean;
  @property() private _radius!: number;
  @property() private _error?: string;
  @property() private _params?: ZoneDetailDialogParams;
  @property() private _submitting: boolean = false;

  public async showDialog(params: ZoneDetailDialogParams): Promise<void> {
    this._params = params;
    this._error = undefined;
    if (this._params.entry) {
      this._name = this._params.entry.name || "";
      this._icon = this._params.entry.icon || "";
      this._latitude = this._params.entry.latitude || this.opp.config.latitude;
      this._longitude =
        this._params.entry.longitude || this.opp.config.longitude;
      this._passive = this._params.entry.passive || false;
      this._radius = this._params.entry.radius || 100;
    } else {
      const initConfig = getZoneEditorInitData();
      let movedHomeLocation;
      if (!initConfig?.latitude || !initConfig?.longitude) {
        movedHomeLocation = addDistanceToCoord(
          [this.opp.config.latitude, this.opp.config.longitude],
          Math.random() * 500 * (Math.random() < 0.5 ? -1 : 1),
          Math.random() * 500 * (Math.random() < 0.5 ? -1 : 1)
        );
      }
      this._latitude = initConfig?.latitude || movedHomeLocation[0];
      this._longitude = initConfig?.longitude || movedHomeLocation[1];
      this._name = initConfig?.name || "";
      this._icon = initConfig?.icon || "mdi:map-marker";

      this._passive = false;
      this._radius = 100;
    }
    await this.updateComplete;
  }

  protected render(): TemplateResult {
    if (!this._params) {
      return html``;
    }
    const title = html`
      ${this._params.entry
        ? this._params.entry.name
        : this.opp!.localize("ui.panel.config.zone.detail.new_zone")}
      <paper-icon-button
        aria-label=${this.opp.localize(
          "ui.panel.config.integrations.config_flow.dismiss"
        )}
        icon="opp:close"
        dialogAction="close"
        style="position: absolute; right: 16px; top: 12px;"
      ></paper-icon-button>
    `;
    const nameValid = this._name.trim() === "";
    const iconValid = !this._icon.trim().includes(":");
    const latValid = String(this._latitude) === "";
    const lngValid = String(this._longitude) === "";
    const radiusValid = String(this._radius) === "";

    const valid =
      !nameValid && !iconValid && !latValid && !lngValid && !radiusValid;

    return html`
      <op-dialog
        open
        @closing="${this._close}"
        scrimClickAction=""
        escapeKeyAction=""
        .heading=${title}
      >
        <div>
          ${this._error
            ? html`
                <div class="error">${this._error}</div>
              `
            : ""}
          <div class="form">
            <paper-input
              .value=${this._name}
              .configValue=${"name"}
              @value-changed=${this._valueChanged}
              .label="${this.opp!.localize("ui.panel.config.zone.detail.name")}"
              .errorMessage="${this.opp!.localize(
                "ui.panel.config.zone.detail.required_error_msg"
              )}"
              .invalid=${nameValid}
            ></paper-input>
            <paper-input
              .value=${this._icon}
              .configValue=${"icon"}
              @value-changed=${this._valueChanged}
              .label="${this.opp!.localize("ui.panel.config.zone.detail.icon")}"
              .errorMessage="${this.opp!.localize(
                "ui.panel.config.zone.detail.icon_error_msg"
              )}"
              .invalid=${iconValid}
            ></paper-input>
            <op-location-editor
              class="flex"
              .location=${this._locationValue}
              .radius=${this._radius}
              .radiusColor=${this._passive
                ? passiveRadiusColor
                : defaultRadiusColor}
              .icon=${this._icon}
              @change=${this._locationChanged}
            ></op-location-editor>
            <div class="location">
              <paper-input
                .value=${this._latitude}
                .configValue=${"latitude"}
                @value-changed=${this._valueChanged}
                .label="${this.opp!.localize(
                  "ui.panel.config.zone.detail.latitude"
                )}"
                .errorMessage="${this.opp!.localize(
                  "ui.panel.config.zone.detail.required_error_msg"
                )}"
                .invalid=${latValid}
              ></paper-input>
              <paper-input
                .value=${this._longitude}
                .configValue=${"longitude"}
                @value-changed=${this._valueChanged}
                .label="${this.opp!.localize(
                  "ui.panel.config.zone.detail.longitude"
                )}"
                .errorMessage="${this.opp!.localize(
                  "ui.panel.config.zone.detail.required_error_msg"
                )}"
                .invalid=${lngValid}
              ></paper-input>
            </div>
            <paper-input
              .value=${this._radius}
              .configValue=${"radius"}
              @value-changed=${this._valueChanged}
              .label="${this.opp!.localize(
                "ui.panel.config.zone.detail.radius"
              )}"
              .errorMessage="${this.opp!.localize(
                "ui.panel.config.zone.detail.required_error_msg"
              )}"
              .invalid=${radiusValid}
            ></paper-input>
            <p>
              ${this.opp!.localize("ui.panel.config.zone.detail.passive_note")}
            </p>
            <op-switch .checked=${this._passive} @change=${this._passiveChanged}
              >${this.opp!.localize(
                "ui.panel.config.zone.detail.passive"
              )}</op-switch
            >
          </div>
        </div>
        ${this._params.entry
          ? html`
              <mwc-button
                slot="secondaryAction"
                class="warning"
                @click="${this._deleteEntry}"
                .disabled=${this._submitting}
              >
                ${this.opp!.localize("ui.panel.config.zone.detail.delete")}
              </mwc-button>
            `
          : html``}
        <mwc-button
          slot="primaryAction"
          @click="${this._updateEntry}"
          .disabled=${!valid || this._submitting}
        >
          ${this._params.entry
            ? this.opp!.localize("ui.panel.config.zone.detail.update")
            : this.opp!.localize("ui.panel.config.zone.detail.create")}
        </mwc-button>
      </op-dialog>
    `;
  }

  private get _locationValue() {
    return [Number(this._latitude), Number(this._longitude)];
  }

  private _locationChanged(ev) {
    [this._latitude, this._longitude] = ev.currentTarget.location;
    this._radius = ev.currentTarget.radius;
  }

  private _passiveChanged(ev) {
    this._passive = ev.target.checked;
  }

  private _valueChanged(ev: CustomEvent) {
    const configValue = (ev.target as any).configValue;

    this._error = undefined;
    this[`_${configValue}`] = ev.detail.value;
  }

  private async _updateEntry() {
    this._submitting = true;
    try {
      const values: ZoneMutableParams = {
        name: this._name.trim(),
        icon: this._icon.trim(),
        latitude: this._latitude,
        longitude: this._longitude,
        passive: this._passive,
        radius: this._radius,
      };
      if (this._params!.entry) {
        await this._params!.updateEntry!(values);
      } else {
        await this._params!.createEntry(values);
      }
      this._params = undefined;
    } catch (err) {
      this._error = err ? err.message : "Unknown error";
    } finally {
      this._submitting = false;
    }
  }

  private async _deleteEntry() {
    this._submitting = true;
    try {
      if (await this._params!.removeEntry!()) {
        this._params = undefined;
      }
    } finally {
      this._submitting = false;
    }
  }

  private _close(): void {
    this._params = undefined;
  }

  static get styles(): CSSResult[] {
    return [
      css`
        op-dialog {
          --mdc-dialog-title-ink-color: var(--primary-text-color);
          --justify-action-buttons: space-between;
        }
        @media only screen and (min-width: 600px) {
          op-dialog {
            --mdc-dialog-min-width: 600px;
          }
        }

        /* make dialog fullscreen on small screens */
        @media all and (max-width: 450px), all and (max-height: 500px) {
          op-dialog {
            --mdc-dialog-min-width: 100vw;
            --mdc-dialog-max-height: 100vh;
            --mdc-dialog-shape-radius: 0px;
            --vertial-align-dialog: flex-end;
          }
        }
        .form {
          padding-bottom: 24px;
          color: var(--primary-text-color);
        }
        .location {
          display: flex;
        }
        .location > * {
          flex-grow: 1;
          min-width: 0;
        }
        .location > *:first-child {
          margin-right: 4px;
        }
        .location > *:last-child {
          margin-left: 4px;
        }
        op-location-editor {
          margin-top: 16px;
        }
        op-user-picker {
          margin-top: 16px;
        }
        mwc-button.warning {
          --mdc-theme-primary: var(--google-red-500);
        }
        .error {
          color: var(--google-red-500);
        }
        a {
          color: var(--primary-color);
        }
        p {
          color: var(--primary-text-color);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dialog-zone-detail": DialogZoneDetail;
  }
}

customElements.define("dialog-zone-detail", DialogZoneDetail);
