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
import "@polymer/paper-input/paper-input";

import "../../components/dialog/op-paper-dialog";
import "../../components/op-switch";

import { OpenPeerPower } from "../../types";
import { ConfigEntrySystemOptionsDialogParams } from "./show-dialog-config-entry-system-options";
import {
  getConfigEntrySystemOptions,
  updateConfigEntrySystemOptions,
} from "../../data/config_entries";
import { PolymerChangedEvent } from "../../polymer-types";
import { opStyleDialog } from "../../resources/styles";
// tslint:disable-next-line: no-duplicate-imports
import { OpSwitch } from "../../components/op-switch";

@customElement("dialog-config-entry-system-options")
class DialogConfigEntrySystemOptions extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() private _disableNewEntities!: boolean;
  @property() private _error?: string;
  @property() private _params?: ConfigEntrySystemOptionsDialogParams;
  @property() private _loading?: boolean;
  @property() private _submitting?: boolean;

  public async showDialog(
    params: ConfigEntrySystemOptionsDialogParams
  ): Promise<void> {
    this._params = params;
    this._error = undefined;
    this._loading = true;
    const systemOptions = await getConfigEntrySystemOptions(
      this.opp,
      params.entry.entry_id
    );
    this._loading = false;
    this._disableNewEntities = systemOptions.disable_new_entities;
    await this.updateComplete;
  }

  protected render(): TemplateResult {
    if (!this._params) {
      return html``;
    }

    return html`
      <op-paper-dialog
        with-backdrop
        opened
        @opened-changed="${this._openedChanged}"
      >
        <h2>
          ${this.opp.localize(
            "ui.dialogs.config_entry_system_options.title",
            "integration",
            this.opp.localize(
              `component.${this._params.entry.domain}.config.title`
            ) || this._params.entry.domain
          )}
        </h2>
        <paper-dialog-scrollable>
          ${this._loading
            ? html`
                <div class="init-spinner">
                  <paper-spinner-lite active></paper-spinner-lite>
                </div>
              `
            : html`
                ${this._error
                  ? html`
                      <div class="error">${this._error}</div>
                    `
                  : ""}
                <div class="form">
                  <op-switch
                    .checked=${!this._disableNewEntities}
                    @change=${this._disableNewEntitiesChanged}
                    .disabled=${this._submitting}
                  >
                    <div>
                      <p>
                        ${this.opp.localize(
                          "ui.dialogs.config_entry_system_options.enable_new_entities_label"
                        )}
                      </p>
                      <p class="secondary">
                        ${this.opp.localize(
                          "ui.dialogs.config_entry_system_options.enable_new_entities_description",
                          "integration",
                          this.opp.localize(
                            `component.${this._params.entry.domain}.config.title`
                          ) || this._params.entry.domain
                        )}
                      </p>
                    </div>
                  </op-switch>
                </div>
              `}
        </paper-dialog-scrollable>
        ${!this._loading
          ? html`
              <div class="paper-dialog-buttons">
                <mwc-button
                  @click="${this._updateEntry}"
                  .disabled=${this._submitting}
                >
                  ${this.opp.localize(
                    "ui.dialogs.config_entry_system_options.update"
                  )}
                </mwc-button>
              </div>
            `
          : ""}
      </op-paper-dialog>
    `;
  }

  private _disableNewEntitiesChanged(ev: Event): void {
    this._error = undefined;
    this._disableNewEntities = !(ev.target as OpSwitch).checked;
  }

  private async _updateEntry(): Promise<void> {
    this._submitting = true;
    try {
      await updateConfigEntrySystemOptions(
        this.opp,
        this._params!.entry.entry_id,
        {
          disable_new_entities: this._disableNewEntities,
        }
      );
      this._params = undefined;
    } catch (err) {
      this._error = err.message || "Unknown error";
    } finally {
      this._submitting = false;
    }
  }

  private _openedChanged(ev: PolymerChangedEvent<boolean>): void {
    if (!(ev.detail as any).value) {
      this._params = undefined;
    }
  }

  static get styles(): CSSResult[] {
    return [
      opStyleDialog,
      css`
        op-paper-dialog {
          min-width: 400px;
          max-width: 500px;
        }
        .init-spinner {
          padding: 50px 100px;
          text-align: center;
        }

        .form {
          padding-top: 6px;
          padding-bottom: 24px;
          color: var(--primary-text-color);
        }
        p {
          margin: 0;
        }
        .secondary {
          color: var(--secondary-text-color);
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
    "dialog-config-entry-system-options": DialogConfigEntrySystemOptions;
  }
}
