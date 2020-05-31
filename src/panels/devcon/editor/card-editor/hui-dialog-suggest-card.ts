import {
  css,
  html,
  LitElement,
  TemplateResult,
  CSSResultArray,
  customElement,
  property,
  query,
} from "lit-element";

import deepFreeze from "deep-freeze";

import { OpenPeerPower } from "../../../../types";
import { DevconCardConfig } from "../../../../data/devcon";
import "./hui-card-editor";
import "./hui-card-preview";
import "./hui-card-picker";
import { addCards } from "../config-util";

import "../../../../components/op-yaml-editor";
import "../../../../components/dialog/op-paper-dialog";
import { opStyleDialog } from "../../../../resources/styles";
import { showEditCardDialog } from "./show-edit-card-dialog";
import { computeCards } from "../../common/generate-devcon-config";
import { SuggestCardDialogParams } from "./show-suggest-card-dialog";
import { showSaveSuccessToast } from "../../../../util/toast-saved-success";
// tslint:disable-next-line
import { OpPaperDialog } from "../../../../components/dialog/op-paper-dialog";
// tslint:disable-next-line
import { OpYamlEditor } from "../../../../components/op-yaml-editor";

@customElement("hui-dialog-suggest-card")
export class HuiDialogSuggestCard extends LitElement {
  @property() protected opp!: OpenPeerPower;
  @property() private _params?: SuggestCardDialogParams;
  @property() private _cardConfig?: DevconCardConfig[];
  @property() private _saving: boolean = false;
  @property() private _yamlMode: boolean = false;
  @query("op-paper-dialog") private _dialog?: OpPaperDialog;
  @query("op-yaml-editor") private _yamlEditor?: OpYamlEditor;

  public async showDialog(params: SuggestCardDialogParams): Promise<void> {
    this._params = params;
    this._yamlMode = (this.opp.panels.devcon?.config as any)?.mode === "yaml";
    this._cardConfig =
      params.cardConfig ||
      computeCards(
        params.entities.map((entityId) => [
          entityId,
          this.opp.states[entityId],
        ]),
        {},
        true
      );
    if (!Object.isFrozen(this._cardConfig)) {
      this._cardConfig = deepFreeze(this._cardConfig);
    }
    if (this._dialog) {
      this._dialog.open();
    }
    if (this._yamlEditor) {
      this._yamlEditor.setValue(this._cardConfig);
    }
  }

  protected render(): TemplateResult {
    return html`
      <op-paper-dialog with-backdrop opened>
        <h2>
          ${this.opp!.localize("ui.panel.devcon.editor.suggest_card.header")}
        </h2>
        <paper-dialog-scrollable>
          ${this._cardConfig
            ? html`
                <div class="element-preview">
                  ${this._cardConfig.map(
                    (cardConfig) => html`
                      <hui-card-preview
                        .opp="${this.opp}"
                        .config="${cardConfig}"
                      ></hui-card-preview>
                    `
                  )}
                </div>
              `
            : ""}
          ${this._yamlMode && this._cardConfig
            ? html`
                <div class="editor">
                  <op-yaml-editor
                    .defaultValue=${this._cardConfig}
                  ></op-yaml-editor>
                </div>
              `
            : ""}
        </paper-dialog-scrollable>
        <div class="paper-dialog-buttons">
          <mwc-button @click="${this._close}">
            ${this._yamlMode
              ? this.opp!.localize("ui.common.close")
              : this.opp!.localize("ui.common.cancel")}
          </mwc-button>
          ${!this._yamlMode
            ? html`
                <mwc-button @click="${this._pickCard}"
                  >${this.opp!.localize(
                    "ui.panel.devcon.editor.suggest_card.create_own"
                  )}</mwc-button
                >
                <mwc-button ?disabled="${this._saving}" @click="${this._save}">
                  ${this._saving
                    ? html`
                        <paper-spinner active alt="Saving"></paper-spinner>
                      `
                    : this.opp!.localize(
                        "ui.panel.devcon.editor.suggest_card.add"
                      )}
                </mwc-button>
              `
            : ""}
        </div>
      </op-paper-dialog>
    `;
  }

  static get styles(): CSSResultArray {
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
        @media all and (min-width: 850px) {
          op-paper-dialog {
            width: 845px;
          }
        }
        op-paper-dialog {
          max-width: 845px;
        }
        mwc-button paper-spinner {
          width: 14px;
          height: 14px;
          margin-right: 20px;
        }
        .hidden {
          display: none;
        }
        .element-preview {
          position: relative;
        }
        hui-card-preview {
          padding-top: 8px;
          margin: 4px auto;
          max-width: 390px;
          display: block;
          width: 100%;
        }
        .editor {
          padding-top: 16px;
        }
      `,
    ];
  }

  private _close(): void {
    this._dialog!.close();
    this._params = undefined;
    this._cardConfig = undefined;
    this._yamlMode = false;
  }

  private _pickCard(): void {
    if (
      !this._params?.devconConfig ||
      !this._params?.path ||
      !this._params?.saveConfig
    ) {
      return;
    }
    showEditCardDialog(this, {
      devconConfig: this._params!.devconConfig,
      saveConfig: this._params!.saveConfig,
      path: this._params!.path,
      entities: this._params!.entities,
    });
    this._close();
  }

  private async _save(): Promise<void> {
    if (
      !this._params?.devconConfig ||
      !this._params?.path ||
      !this._params?.saveConfig ||
      !this._cardConfig
    ) {
      return;
    }
    this._saving = true;
    await this._params!.saveConfig(
      addCards(
        this._params!.devconConfig,
        this._params!.path as [number],
        this._cardConfig
      )
    );
    this._saving = false;
    showSaveSuccessToast(this, this.opp);
    this._close();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-dialog-suggest-card": HuiDialogSuggestCard;
  }
}
