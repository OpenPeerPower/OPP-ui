import { html, LitElement, css, CSSResult, property } from "lit-element";

import "@material/mwc-button";
import "@polymer/paper-input/paper-input";
import "@polymer/paper-dialog-scrollable/paper-dialog-scrollable";
import "../../../../components/dialog/op-paper-dialog";
// This is not a duplicate import, one is for types, one is for element.
// tslint:disable-next-line
import { OpPaperDialog } from "../../../../components/dialog/op-paper-dialog";
// tslint:disable-next-line
import { PaperInputElement } from "@polymer/paper-input/paper-input";

import { OpenPeerPower } from "../../../../types";
import { opStyle } from "../../../../resources/styles";
import { WebhookDialogParams } from "./show-dialog-manage-cloudhook";

const inputLabel = "Public URL – Click to copy to clipboard";

export class DialogManageCloudhook extends LitElement {
  protected opp?: OpenPeerPower;
  @property() private _params?: WebhookDialogParams;

  public async showDialog(params: WebhookDialogParams) {
    this._params = params;
    // Wait till dialog is rendered.
    await this.updateComplete;
    this._dialog.open();
  }

  protected render() {
    if (!this._params) {
      return html``;
    }
    const { webhook, cloudhook } = this._params;
    const docsUrl =
      webhook.domain === "automation"
        ? "https://www.open-peer-power.io/docs/automation/trigger/#webhook-trigger"
        : `https://www.open-peer-power.io/integrations/${webhook.domain}/`;
    return html`
      <op-paper-dialog with-backdrop>
        <h2>
          ${this.opp!.localize(
            "ui.panel.config.cloud.dialog_cloudhook.webhook_for",
            "name",
            webhook.name
          )}
        </h2>
        <div>
          <p>
            ${this.opp!.localize(
              "ui.panel.config.cloud.dialog_cloudhook.available_at"
            )}
          </p>
          <paper-input
            label="${inputLabel}"
            value="${cloudhook.cloudhook_url}"
            @click="${this._copyClipboard}"
            @blur="${this._restoreLabel}"
          ></paper-input>
          <p>
            ${cloudhook.managed
              ? html`
                  ${this.opp!.localize(
                    "ui.panel.config.cloud.dialog_cloudhook.managed_by_integration"
                  )}
                `
              : html`
                  ${this.opp!.localize(
                    "ui.panel.config.cloud.dialog_cloudhook.info_disable_webhook"
                  )}
                  <button class="link" @click="${this._disableWebhook}">
                    ${this.opp!.localize(
                      "ui.panel.config.cloud.dialog_cloudhook.link_disable_webhook"
                    )}</button
                  >.
                `}
          </p>
        </div>

        <div class="paper-dialog-buttons">
          <a href="${docsUrl}" target="_blank">
            <mwc-button
              >${this.opp!.localize(
                "ui.panel.config.cloud.dialog_cloudhook.view_documentation"
              )}</mwc-button
            >
          </a>
          <mwc-button @click="${this._closeDialog}"
            >${this.opp!.localize(
              "ui.panel.config.cloud.dialog_cloudhook.close"
            )}</mwc-button
          >
        </div>
      </op-paper-dialog>
    `;
  }

  private get _dialog(): OpPaperDialog {
    return this.shadowRoot!.querySelector("op-paper-dialog")!;
  }

  private get _paperInput(): PaperInputElement {
    return this.shadowRoot!.querySelector("paper-input")!;
  }

  private _closeDialog() {
    this._dialog.close();
  }

  private async _disableWebhook() {
    if (
      !confirm(
        this.opp!.localize(
          "ui.panel.config.cloud.dialog_cloudhook.confirm_disable"
        )
      )
    ) {
      return;
    }

    this._params!.disableHook();
    this._closeDialog();
  }

  private _copyClipboard(ev: FocusEvent) {
    // paper-input -> iron-input -> input
    const paperInput = ev.currentTarget as PaperInputElement;
    const input = (paperInput.inputElement as any)
      .inputElement as HTMLInputElement;
    input.setSelectionRange(0, input.value.length);
    try {
      document.execCommand("copy");
      paperInput.label = this.opp!.localize(
        "ui.panel.config.cloud.dialog_cloudhook.copied_to_clipboard"
      );
    } catch (err) {
      // Copying failed. Oh no
    }
  }

  private _restoreLabel() {
    this._paperInput.label = inputLabel;
  }

  static get styles(): CSSResult[] {
    return [
      opStyle,
      css`
        op-paper-dialog {
          width: 650px;
        }
        paper-input {
          margin-top: -8px;
        }
        button.link {
          color: var(--primary-color);
        }
        .paper-dialog-buttons a {
          text-decoration: none;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dialog-manage-cloudhook": DialogManageCloudhook;
  }
}

customElements.define("dialog-manage-cloudhook", DialogManageCloudhook);
