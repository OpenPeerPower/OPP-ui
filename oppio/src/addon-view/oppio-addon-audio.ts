import "web-animations-js/web-animations-next-lite.min";

import "@material/mwc-button";
import "@polymer/paper-card/paper-card";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  PropertyValues,
  TemplateResult,
} from "lit-element";

import { OpenPeerPower } from "../../../src/types";
import {
  OppioAddonDetails,
  setOppioAddonOption,
  OppioAddonSetOptionParams,
} from "../../../src/data/oppio/addon";
import {
  OppioHardwareAudioDevice,
  fetchOppioHardwareAudio,
} from "../../../src/data/oppio/hardware";
import { oppioStyle } from "../resources/oppio-style";
import { haStyle } from "../../../src/resources/styles";

@customElement("oppio-addon-audio")
class OppioAddonAudio extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public addon!: OppioAddonDetails;
  @property() private _error?: string;
  @property() private _inputDevices?: OppioHardwareAudioDevice[];
  @property() private _outputDevices?: OppioHardwareAudioDevice[];
  @property() private _selectedInput!: null | string;
  @property() private _selectedOutput!: null | string;

  protected render(): TemplateResult {
    return html`
      <paper-card heading="Audio">
        <div class="card-content">
          ${this._error
            ? html`
                <div class="errors">${this._error}</div>
              `
            : ""}

          <paper-dropdown-menu
            label="Input"
            @iron-select=${this._setInputDevice}
          >
            <paper-listbox
              slot="dropdown-content"
              attr-for-selected="device"
              .selected=${this._selectedInput}
            >
              ${this._inputDevices &&
                this._inputDevices.map((item) => {
                  return html`
                    <paper-item device=${item.device || ""}
                      >${item.name}</paper-item
                    >
                  `;
                })}
            </paper-listbox>
          </paper-dropdown-menu>
          <paper-dropdown-menu
            label="Output"
            @iron-select=${this._setOutputDevice}
          >
            <paper-listbox
              slot="dropdown-content"
              attr-for-selected="device"
              .selected=${this._selectedOutput}
            >
              ${this._outputDevices &&
                this._outputDevices.map((item) => {
                  return html`
                    <paper-item device=${item.device || ""}
                      >${item.name}</paper-item
                    >
                  `;
                })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div class="card-actions">
          <mwc-button @click=${this._saveSettings}>Save</mwc-button>
        </div>
      </paper-card>
    `;
  }

  static get styles(): CSSResult[] {
    return [
      haStyle,
      oppioStyle,
      css`
        :host,
        paper-card,
        paper-dropdown-menu {
          display: block;
        }
        .errors {
          color: var(--google-red-500);
          margin-bottom: 16px;
        }
        paper-item {
          width: 450px;
        }
        .card-actions {
          text-align: right;
        }
      `,
    ];
  }

  protected update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
    if (changedProperties.has("addon")) {
      this._addonChanged();
    }
  }

  private _setInputDevice(ev): void {
    const device = ev.detail.item.getAttribute("device");
    this._selectedInput = device || null;
  }

  private _setOutputDevice(ev): void {
    const device = ev.detail.item.getAttribute("device");
    this._selectedOutput = device || null;
  }

  private async _addonChanged(): Promise<void> {
    this._selectedInput = this.addon.audio_input;
    this._selectedOutput = this.addon.audio_output;
    if (this._outputDevices) {
      return;
    }

    const noDevice: OppioHardwareAudioDevice = { device: null, name: "-" };

    try {
      const { audio } = await fetchOppioHardwareAudio(this.opp);
      const input = Object.keys(audio.input).map((key) => ({
        device: key,
        name: audio.input[key],
      }));
      const output = Object.keys(audio.output).map((key) => ({
        device: key,
        name: audio.output[key],
      }));

      this._inputDevices = [noDevice, ...input];
      this._outputDevices = [noDevice, ...output];
    } catch {
      this._error = "Failed to fetch audio hardware";
      this._inputDevices = [noDevice];
      this._outputDevices = [noDevice];
    }
  }

  private async _saveSettings(): Promise<void> {
    this._error = undefined;
    const data: OppioAddonSetOptionParams = {
      audio_input: this._selectedInput || null,
      audio_output: this._selectedOutput || null,
    };
    try {
      await setOppioAddonOption(this.opp, this.addon.slug, data);
    } catch {
      this._error = "Failed to set addon audio device";
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "oppio-addon-audio": OppioAddonAudio;
  }
}
