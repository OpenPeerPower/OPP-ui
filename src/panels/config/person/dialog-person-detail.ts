import {
  LitElement,
  html,
  css,
  CSSResult,
  TemplateResult,
  property,
} from "lit-element";
import memoizeOne from "memoize-one";

import "@polymer/paper-input/paper-input";
import "@material/mwc-button";

import "../../../components/entity/op-entities-picker";
import "../../../components/user/op-user-picker";
import "../../../components/op-dialog";
import { PersonDetailDialogParams } from "./show-dialog-person-detail";
import { PolymerChangedEvent } from "../../../polymer-types";
import { OpenPeerPower } from "../../../types";
import { PersonMutableParams } from "../../../data/person";

class DialogPersonDetail extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() private _name!: string;
  @property() private _userId?: string;
  @property() private _deviceTrackers!: string[];
  @property() private _error?: string;
  @property() private _params?: PersonDetailDialogParams;
  @property() private _submitting: boolean = false;

  private _deviceTrackersAvailable = memoizeOne((opp) => {
    return Object.keys(opp.states).some(
      (entityId) =>
        entityId.substr(0, entityId.indexOf(".")) === "device_tracker"
    );
  });

  public async showDialog(params: PersonDetailDialogParams): Promise<void> {
    this._params = params;
    this._error = undefined;
    if (this._params.entry) {
      this._name = this._params.entry.name || "";
      this._userId = this._params.entry.user_id || undefined;
      this._deviceTrackers = this._params.entry.device_trackers || [];
    } else {
      this._name = "";
      this._userId = undefined;
      this._deviceTrackers = [];
    }
    await this.updateComplete;
  }

  protected render(): TemplateResult {
    if (!this._params) {
      return html``;
    }
    const nameInvalid = this._name.trim() === "";
    const title = html`
      ${this._params.entry
        ? this._params.entry.name
        : this.opp!.localize("ui.panel.config.person.detail.new_person")}
      <paper-icon-button
        aria-label=${this.opp.localize(
          "ui.panel.config.integrations.config_flow.dismiss"
        )}
        icon="opp:close"
        dialogAction="close"
        style="position: absolute; right: 16px; top: 12px;"
      ></paper-icon-button>
    `;
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
              @value-changed=${this._nameChanged}
              label="${this.opp!.localize(
                "ui.panel.config.person.detail.name"
              )}"
              error-message="${this.opp!.localize(
                "ui.panel.config.person.detail.name_error_msg"
              )}"
              .invalid=${nameInvalid}
            ></paper-input>
            <op-user-picker
              label="${this.opp!.localize(
                "ui.panel.config.person.detail.linked_user"
              )}"
              .opp=${this.opp}
              .value=${this._userId}
              .users=${this._params.users}
              @value-changed=${this._userChanged}
            ></op-user-picker>
            ${this._deviceTrackersAvailable(this.opp)
              ? html`
                  <p>
                    ${this.opp.localize(
                      "ui.panel.config.person.detail.device_tracker_intro"
                    )}
                  </p>
                  <op-entities-picker
                    .opp=${this.opp}
                    .value=${this._deviceTrackers}
                    include-domains='["device_tracker"]'
                    .pickedEntityLabel=${this.opp.localize(
                      "ui.panel.config.person.detail.device_tracker_picked"
                    )}
                    .pickEntityLabel=${this.opp.localize(
                      "ui.panel.config.person.detail.device_tracker_pick"
                    )}
                    @value-changed=${this._deviceTrackersChanged}
                  >
                  </op-entities-picker>
                `
              : html`
                  <p>
                    ${this.opp!.localize(
                      "ui.panel.config.person.detail.no_device_tracker_available_intro"
                    )}
                  </p>
                  <ul>
                    <li>
                      <a
                        href="https://www.open-peer-power.io/integrations/#presence-detection"
                        target="_blank"
                        >${this.opp!.localize(
                          "ui.panel.config.person.detail.link_presence_detection_integrations"
                        )}</a
                      >
                    </li>
                    <li>
                      <a
                        @click="${this._closeDialog}"
                        href="/config/integrations"
                      >
                        ${this.opp!.localize(
                          "ui.panel.config.person.detail.link_integrations_page"
                        )}</a
                      >
                    </li>
                  </ul>
                `}
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
                ${this.opp!.localize("ui.panel.config.person.detail.delete")}
              </mwc-button>
            `
          : html``}
        <mwc-button
          slot="primaryAction"
          @click="${this._updateEntry}"
          .disabled=${nameInvalid || this._submitting}
        >
          ${this._params.entry
            ? this.opp!.localize("ui.panel.config.person.detail.update")
            : this.opp!.localize("ui.panel.config.person.detail.create")}
        </mwc-button>
      </op-dialog>
    `;
  }

  private _closeDialog() {
    this._params = undefined;
  }

  private _nameChanged(ev: PolymerChangedEvent<string>) {
    this._error = undefined;
    this._name = ev.detail.value;
  }

  private _userChanged(ev: PolymerChangedEvent<string>) {
    this._error = undefined;
    this._userId = ev.detail.value;
  }

  private _deviceTrackersChanged(ev: PolymerChangedEvent<string[]>) {
    this._error = undefined;
    this._deviceTrackers = ev.detail.value;
  }

  private async _updateEntry() {
    this._submitting = true;
    try {
      const values: PersonMutableParams = {
        name: this._name.trim(),
        device_trackers: this._deviceTrackers,
        user_id: this._userId || null,
      };
      if (this._params!.entry) {
        await this._params!.updateEntry(values);
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
      if (await this._params!.removeEntry()) {
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
          --mdc-dialog-min-width: 400px;
          --mdc-dialog-max-width: 600px;
          --mdc-dialog-title-ink-color: var(--primary-text-color);
          --justify-action-buttons: space-between;
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
    "dialog-person-detail": DialogPersonDetail;
  }
}

customElements.define("dialog-person-detail", DialogPersonDetail);
