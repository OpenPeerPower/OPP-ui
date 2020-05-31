import {
  html,
  LitElement,
  customElement,
  property,
  css,
  CSSResult,
  TemplateResult,
} from "lit-element";
import "@material/mwc-button";
import "@polymer/paper-menu-button/paper-menu-button";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-listbox/paper-listbox";

import { showEditCardDialog } from "../editor/card-editor/show-edit-card-dialog";
import { confDeleteCard } from "../editor/delete-card";
import { OpenPeerPower } from "../../../types";
import { DevconCardConfig } from "../../../data/devcon";
import { Devcon } from "../types";
import { swapCard } from "../editor/config-util";
import { showMoveCardViewDialog } from "../editor/card-editor/show-move-card-view-dialog";

@customElement("hui-card-options")
export class HuiCardOptions extends LitElement {
  public cardConfig?: DevconCardConfig;

  @property() public opp?: OpenPeerPower;

  @property() public devcon?: Devcon;

  @property() public path?: [number, number];

  protected render(): TemplateResult {
    return html`
      <slot></slot>
      <op-card>
        <div class="options">
          <div class="primary-actions">
            <mwc-button @click="${this._editCard}"
              >${this.opp!.localize(
                "ui.panel.devcon.editor.edit_card.edit"
              )}</mwc-button
            >
          </div>
          <div class="secondary-actions">
            <paper-icon-button
              title="Move card down"
              class="move-arrow"
              icon="opp:arrow-down"
              @click="${this._cardDown}"
              ?disabled="${this.devcon!.config.views[this.path![0]].cards!
                .length ===
                this.path![1] + 1}"
            ></paper-icon-button>
            <paper-icon-button
              title="Move card up"
              class="move-arrow"
              icon="opp:arrow-up"
              @click="${this._cardUp}"
              ?disabled="${this.path![1] === 0}"
            ></paper-icon-button>
            <paper-menu-button
              horizontal-align="right"
              vertical-align="bottom"
              vertical-offset="40"
              close-on-activate
            >
              <paper-icon-button
                icon="opp:dots-vertical"
                slot="dropdown-trigger"
                aria-label=${this.opp!.localize(
                  "ui.panel.devcon.editor.edit_card.options"
                )}
              ></paper-icon-button>
              <paper-listbox slot="dropdown-content">
                <paper-item @tap="${this._moveCard}">
                  ${this.opp!.localize(
                    "ui.panel.devcon.editor.edit_card.move"
                  )}</paper-item
                >
                <paper-item .class="delete-item" @tap="${this._deleteCard}">
                  ${this.opp!.localize(
                    "ui.panel.devcon.editor.edit_card.delete"
                  )}</paper-item
                >
              </paper-listbox>
            </paper-menu-button>
          </div>
        </div>
      </op-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      op-card {
        border-top-right-radius: 0;
        border-top-left-radius: 0;
        box-shadow: rgba(0, 0, 0, 0.14) 0px 2px 2px 0px,
          rgba(0, 0, 0, 0.12) 0px 1px 5px -4px,
          rgba(0, 0, 0, 0.2) 0px 3px 1px -2px;
      }

      div.options {
        border-top: 1px solid #e8e8e8;
        padding: 5px 8px;
        display: flex;
        margin-top: -1px;
      }

      div.options .primary-actions {
        flex: 1;
        margin: auto;
      }

      div.options .secondary-actions {
        flex: 4;
        text-align: right;
      }

      paper-icon-button {
        color: var(--primary-text-color);
      }

      paper-icon-button.move-arrow[disabled] {
        color: var(--disabled-text-color);
      }

      paper-menu-button {
        color: var(--secondary-text-color);
        padding: 0;
      }

      paper-item.header {
        color: var(--primary-text-color);
        text-transform: uppercase;
        font-weight: 500;
        font-size: 14px;
      }

      paper-item {
        cursor: pointer;
      }

      paper-item.delete-item {
        color: var(--google-red-500);
      }
    `;
  }

  private _editCard(): void {
    showEditCardDialog(this, {
      devconConfig: this.devcon!.config,
      saveConfig: this.devcon!.saveConfig,
      path: this.path!,
    });
  }

  private _cardUp(): void {
    const devcon = this.devcon!;
    const path = this.path!;
    devcon.saveConfig(swapCard(devcon.config, path, [path[0], path[1] - 1]));
  }

  private _cardDown(): void {
    const devcon = this.devcon!;
    const path = this.path!;
    devcon.saveConfig(swapCard(devcon.config, path, [path[0], path[1] + 1]));
  }

  private _moveCard(): void {
    showMoveCardViewDialog(this, {
      path: this.path!,
      devcon: this.devcon!,
    });
  }

  private _deleteCard(): void {
    confDeleteCard(this, this.opp!, this.devcon!, this.path!);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-card-options": HuiCardOptions;
  }
}
