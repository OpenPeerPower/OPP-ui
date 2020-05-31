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
import "../../../../components/dialog/op-paper-dialog";
// tslint:disable-next-line:no-duplicate-imports
import { OpPaperDialog } from "../../../../components/dialog/op-paper-dialog";
import "@material/mwc-button";
import "@polymer/paper-dialog-scrollable/paper-dialog-scrollable";

import { opStyleDialog } from "../../../../resources/styles";

import "./hui-devcon-editor";
import { OpenPeerPower } from "../../../../types";
import { DevconConfig } from "../../../../data/devcon";
import { Devcon } from "../../types";

@customElement("hui-dialog-edit-devcon")
export class HuiDialogEditDevcon extends LitElement {
  @property() public opp?: OpenPeerPower;

  @property() private _devcon?: Devcon;

  private _config?: DevconConfig;

  private _saving: boolean;

  public constructor() {
    super();
    this._saving = false;
  }

  public async showDialog(devcon: Devcon): Promise<void> {
    this._devcon = devcon;
    if (this._dialog == null) {
      await this.updateComplete;
    }

    const { views, ...devconConfig } = this._devcon!.config;
    this._config = devconConfig as DevconConfig;

    this._dialog.open();
  }

  private get _dialog(): OpPaperDialog {
    return this.shadowRoot!.querySelector("op-paper-dialog")!;
  }

  protected render(): TemplateResult {
    return html`
      <op-paper-dialog with-backdrop modal>
        <h2>
          ${this.opp!.localize("ui.panel.devcon.editor.edit_devcon.header")}
        </h2>
        <paper-dialog-scrollable>
          ${this.opp!.localize(
            "ui.panel.devcon.editor.edit_devcon.explanation"
          )}
          <hui-devcon-editor
            .opp="${this.opp}"
            .config="${this._config}"
            @devcon-config-changed="${this._ConfigChanged}"
          ></hui-devcon-editor
        ></paper-dialog-scrollable>
        <div class="paper-dialog-buttons">
          <mwc-button @click="${this._closeDialog}"
            >${this.opp!.localize("ui.common.cancel")}</mwc-button
          >
          <mwc-button
            ?disabled="${!this._config || this._saving}"
            @click="${this._save}"
          >
            <paper-spinner
              ?active="${this._saving}"
              alt="Saving"
            ></paper-spinner>
            ${this.opp!.localize("ui.common.save")}</mwc-button
          >
        </div>
      </op-paper-dialog>
    `;
  }

  private _closeDialog(): void {
    this._config = undefined;
    this._dialog.close();
  }

  private async _save(): Promise<void> {
    if (!this._config) {
      return;
    }
    if (!this._isConfigChanged()) {
      this._closeDialog();
      return;
    }

    this._saving = true;
    const devcon = this._devcon!;

    const config: DevconConfig = {
      ...devcon.config,
      ...this._config,
    };

    try {
      await devcon.saveConfig(config);
      this._closeDialog();
    } catch (err) {
      alert(`Saving failed: ${err.message}`);
    } finally {
      this._saving = false;
    }
  }

  private _ConfigChanged(ev: CustomEvent): void {
    if (ev.detail && ev.detail.config) {
      this._config = ev.detail.config;
    }
  }

  private _isConfigChanged(): boolean {
    const { views, ...devconConfig } = this._devcon!.config;
    return JSON.stringify(this._config) !== JSON.stringify(devconConfig);
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
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-dialog-edit-devcon": HuiDialogEditDevcon;
  }
}
