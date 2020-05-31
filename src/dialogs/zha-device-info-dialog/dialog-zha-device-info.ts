import {
  LitElement,
  html,
  css,
  CSSResult,
  TemplateResult,
  customElement,
  property,
} from "lit-element";
import "@polymer/paper-dialog-scrollable/paper-dialog-scrollable";
import "../../components/dialog/op-paper-dialog";
// Not duplicate, is for typing
// tslint:disable-next-line
import { OpPaperDialog } from "../../components/dialog/op-paper-dialog";
import "../../panels/config/zha/zha-device-card";

import { PolymerChangedEvent } from "../../polymer-types";
import { opStyleDialog } from "../../resources/styles";
import { OpenPeerPower } from "../../types";
import { ZHADeviceInfoDialogParams } from "./show-dialog-zha-device-info";
import { ZHADevice, fetchZHADevice } from "../../data/zha";

@customElement("dialog-zha-device-info")
class DialogZHADeviceInfo extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() private _params?: ZHADeviceInfoDialogParams;
  @property() private _error?: string;
  @property() private _device?: ZHADevice;

  public async showDialog(params: ZHADeviceInfoDialogParams): Promise<void> {
    this._params = params;
    this._device = await fetchZHADevice(this.opp, params.ieee);
    await this.updateComplete;
    this._dialog.open();
  }

  protected render(): TemplateResult {
    if (!this._params || !this._device) {
      return html``;
    }

    return html`
      <op-paper-dialog
        with-backdrop
        opened
        @opened-changed=${this._openedChanged}
      >
        ${this._error
          ? html`
              <div class="error">${this._error}</div>
            `
          : html`
              <zha-device-card
                class="card"
                .opp=${this.opp}
                .device=${this._device}
                @zha-device-removed=${this._onDeviceRemoved}
                .showEntityDetail=${false}
                .showActions="${this._device.device_type !== "Coordinator"}"
              ></zha-device-card>
            `}
      </op-paper-dialog>
    `;
  }

  private _openedChanged(ev: PolymerChangedEvent<boolean>): void {
    if (!ev.detail.value) {
      this._params = undefined;
      this._error = undefined;
      this._device = undefined;
    }
  }

  private _onDeviceRemoved(): void {
    this._closeDialog();
  }

  private get _dialog(): OpPaperDialog {
    return this.shadowRoot!.querySelector("op-paper-dialog")!;
  }

  private _closeDialog() {
    this._dialog.close();
  }

  static get styles(): CSSResult[] {
    return [
      opStyleDialog,
      css`
        op-paper-dialog > * {
          margin: 0;
          display: block;
          padding: 0;
        }
        .card {
          box-sizing: border-box;
          display: flex;
          flex: 1 0 300px;
          min-width: 0;
          max-width: 600px;
          word-wrap: break-word;
        }
        .error {
          color: var(--google-red-500);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dialog-zha-device-info": DialogZHADeviceInfo;
  }
}
