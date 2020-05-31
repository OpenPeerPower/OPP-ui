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
import "@polymer/paper-tabs/paper-tab";
import "@polymer/paper-tabs/paper-tabs";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "../../../../components/dialog/op-paper-dialog";
// tslint:disable-next-line:no-duplicate-imports
import { OpPaperDialog } from "../../../../components/dialog/op-paper-dialog";
import "@material/mwc-button";
import "@polymer/paper-dialog-scrollable/paper-dialog-scrollable";

import { opStyleDialog } from "../../../../resources/styles";

import "../../components/hui-entity-editor";
import "./hui-view-editor";
import { OpenPeerPower } from "../../../../types";
import {
  DevconViewConfig,
  DevconCardConfig,
  DevconBadgeConfig,
} from "../../../../data/devcon";
import { fireEvent } from "../../../../common/dom/fire_event";
import { EntitiesEditorEvent, ViewEditEvent } from "../types";
import { processEditorEntities } from "../process-editor-entities";
import { navigate } from "../../../../common/navigate";
import { Devcon } from "../../types";
import { deleteView, addView, replaceView } from "../config-util";
import {
  showAlertDialog,
  showConfirmationDialog,
} from "../../../../dialogs/generic/show-dialog-box";

@customElement("hui-edit-view")
export class HuiEditView extends LitElement {
  @property() public devcon?: Devcon;

  @property() public viewIndex?: number;

  @property() public opp?: OpenPeerPower;

  @property() private _config?: DevconViewConfig;

  @property() private _badges?: DevconBadgeConfig[];

  @property() private _cards?: DevconCardConfig[];

  @property() private _saving: boolean;

  @property() private _curTab?: string;

  private _curTabIndex: number;

  public constructor() {
    super();
    this._saving = false;
    this._curTabIndex = 0;
  }

  public async showDialog(): Promise<void> {
    // Wait till dialog is rendered.
    if (this._dialog == null) {
      await this.updateComplete;
    }

    if (this.viewIndex === undefined) {
      this._config = {};
      this._badges = [];
      this._cards = [];
    } else {
      const { cards, badges, ...viewConfig } = this.devcon!.config.views[
        this.viewIndex
      ];
      this._config = viewConfig;
      this._badges = badges ? processEditorEntities(badges) : [];
      this._cards = cards;
    }

    this._dialog.open();
  }

  private get _dialog(): OpPaperDialog {
    return this.shadowRoot!.querySelector("op-paper-dialog")!;
  }

  private get _viewConfigTitle(): string {
    if (!this._config || !this._config.title) {
      return this.opp!.localize("ui.panel.devcon.editor.edit_view.header");
    }

    return this.opp!.localize(
      "ui.panel.devcon.editor.edit_view.header_name",
      "name",
      this._config.title
    );
  }

  protected render(): TemplateResult {
    let content;
    switch (this._curTab) {
      case "tab-settings":
        content = html`
          <hui-view-editor
            .isNew=${this.viewIndex === undefined}
            .opp="${this.opp}"
            .config="${this._config}"
            @view-config-changed="${this._viewConfigChanged}"
          ></hui-view-editor>
        `;
        break;
      case "tab-badges":
        content = html`
          <hui-entity-editor
            .opp="${this.opp}"
            .entities="${this._badges}"
            @entities-changed="${this._badgesChanged}"
          ></hui-entity-editor>
        `;
        break;
      case "tab-cards":
        content = html`
          Cards
        `;
        break;
    }
    return html`
      <op-paper-dialog with-backdrop modal>
        <h2>
          ${this._viewConfigTitle}
        </h2>
        <paper-tabs
          scrollable
          hide-scroll-buttons
          .selected="${this._curTabIndex}"
          @selected-item-changed="${this._handleTabSelected}"
        >
          <paper-tab id="tab-settings">Settings</paper-tab>
          <paper-tab id="tab-badges">Badges</paper-tab>
        </paper-tabs>
        <paper-dialog-scrollable> ${content} </paper-dialog-scrollable>
        <div class="paper-dialog-buttons">
          ${this.viewIndex !== undefined
            ? html`
                <mwc-button class="warning" @click="${this._deleteConfirm}">
                  ${this.opp!.localize(
                    "ui.panel.devcon.editor.edit_view.delete"
                  )}
                </mwc-button>
              `
            : ""}
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

  private async _delete(): Promise<void> {
    try {
      await this.devcon!.saveConfig(
        deleteView(this.devcon!.config, this.viewIndex!)
      );
      this._closeDialog();
      navigate(this, `/devcon/0`);
    } catch (err) {
      showAlertDialog(this, {
        text: `Deleting failed: ${err.message}`,
      });
    }
  }

  private _deleteConfirm(): void {
    if (this._cards && this._cards.length > 0) {
      showAlertDialog(this, {
        text: this.opp!.localize("ui.panel.devcon.views.existing_cards"),
      });
      return;
    }

    showConfirmationDialog(this, {
      text: this.opp!.localize("ui.panel.devcon.views.confirm_delete"),
      confirm: () => this._delete(),
    });
  }

  private async _resizeDialog(): Promise<void> {
    await this.updateComplete;
    fireEvent(this._dialog as HTMLElement, "iron-resize");
  }

  private _closeDialog(): void {
    this._curTabIndex = 0;
    this.devcon = undefined;
    this._config = {};
    this._badges = [];
    this._dialog.close();
  }

  private _handleTabSelected(ev: CustomEvent): void {
    if (!ev.detail.value) {
      return;
    }
    this._curTab = ev.detail.value.id;
    this._resizeDialog();
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

    const viewConf: DevconViewConfig = {
      ...this._config,
      badges: this._badges,
      cards: this._cards,
    };

    const devcon = this.devcon!;

    try {
      await devcon.saveConfig(
        this._creatingView
          ? addView(devcon.config, viewConf)
          : replaceView(devcon.config, this.viewIndex!, viewConf)
      );
      this._closeDialog();
    } catch (err) {
      showAlertDialog(this, {
        text: `Saving failed: ${err.message}`,
      });
    } finally {
      this._saving = false;
    }
  }

  private _viewConfigChanged(ev: ViewEditEvent): void {
    if (ev.detail && ev.detail.config) {
      this._config = ev.detail.config;
    }
  }

  private _badgesChanged(ev: EntitiesEditorEvent): void {
    if (!this._badges || !this.opp || !ev.detail || !ev.detail.entities) {
      return;
    }
    this._badges = processEditorEntities(ev.detail.entities);
  }

  private _isConfigChanged(): boolean {
    return (
      this._creatingView ||
      JSON.stringify(this._config) !==
        JSON.stringify(this.devcon!.config.views[this.viewIndex!])
    );
  }

  private get _creatingView(): boolean {
    return this.viewIndex === undefined;
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
        paper-tabs {
          --paper-tabs-selection-bar-color: var(--primary-color);
          text-transform: uppercase;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        mwc-button paper-spinner {
          width: 14px;
          height: 14px;
          margin-right: 20px;
        }
        mwc-button.warning {
          margin-right: auto;
        }
        paper-spinner {
          display: none;
        }
        paper-spinner[active] {
          display: block;
        }
        .hidden {
          display: none;
        }
        .error {
          color: var(--error-color);
          border-bottom: 1px solid var(--error-color);
        }
      </style>
    `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-edit-view": HuiEditView;
  }
}
