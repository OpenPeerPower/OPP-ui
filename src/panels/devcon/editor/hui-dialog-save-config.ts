import {
  html,
  css,
  LitElement,
  TemplateResult,
  CSSResult,
  customElement,
  property,
} from "lit-element";
import "@polymer/paper-spinner/paper-spinner";
import "../../../components/dialog/op-paper-dialog";
// tslint:disable-next-line:no-duplicate-imports
import { OpPaperDialog } from "../../../components/dialog/op-paper-dialog";
import "@material/mwc-button";

import { opStyleDialog } from "../../../resources/styles";
import { OpenPeerPower } from "../../../types";
import { SaveDialogParams } from "./show-save-config-dialog";

@customElement("hui-dialog-save-config")
export class HuiSaveConfig extends LitElement {
  @property() public opp?: OpenPeerPower;

  @property() private _params?: SaveDialogParams;

  @property() private _saving: boolean;

  public constructor() {
    super();
    this._saving = false;
  }

  public async showDialog(params: SaveDialogParams): Promise<void> {
    this._params = params;
    await this.updateComplete;
    this._dialog.open();
  }

  private get _dialog(): OpPaperDialog {
    return this.shadowRoot!.querySelector("op-paper-dialog")!;
  }

  protected render(): TemplateResult {
    return html`
      <op-paper-dialog with-backdrop>
        <h2>
          ${this.opp!.localize("ui.panel.devcon.editor.save_config.header")}
        </h2>
        <paper-dialog-scrollable>
          <p>
            ${this.opp!.localize("ui.panel.devcon.editor.save_config.para")}
          </p>
          <p>
            ${this.opp!.localize(
              "ui.panel.devcon.editor.save_config.para_sure"
            )}
          </p>
        </paper-dialog-scrollable>
        <div class="paper-dialog-buttons">
          <mwc-button @click="${this._closeDialog}"
            >${this.opp!.localize(
              "ui.panel.devcon.editor.save_config.cancel"
            )}</mwc-button
          >
          <mwc-button ?disabled="${this._saving}" @click="${this._saveConfig}">
            <paper-spinner
              ?active="${this._saving}"
              alt="Saving"
            ></paper-spinner>
            ${this.opp!.localize(
              "ui.panel.devcon.editor.save_config.save"
            )}</mwc-button
          >
        </div>
      </op-paper-dialog>
    `;
  }

  private _closeDialog(): void {
    this._dialog.close();
  }

  private async _saveConfig(): Promise<void> {
    if (!this.opp || !this._params) {
      return;
    }
    this._saving = true;
    try {
      const devcon = this._params!.devcon;
      await devcon.saveConfig(devcon.config);
      devcon.setEditMode(true);
      this._saving = false;
      this._closeDialog();
    } catch (err) {
      alert(`Saving failed: ${err.message}`);
      this._saving = false;
    }
  }

  static get styles(): CSSResult[] {
    return [
      opStyleDialog,
      css`
        @media all and (max-width: 450px), all and (max-height: 500px) {
          /* overrule the op-style-dialog max-height on small screens */
          op-paper-dialog {
            max-height: 100%;
            height: 100%;
          }
        }
        @media all and (min-width: 660px) {
          op-paper-dialog {
            width: 650px;
          }
        }
        op-paper-dialog {
          max-width: 650px;
        }
        paper-spinner {
          display: none;
        }
        paper-spinner[active] {
          display: block;
        }
        mwc-button paper-spinner {
          width: 14px;
          height: 14px;
          margin-right: 20px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-dialog-save-config": HuiSaveConfig;
  }
}
