import {
  html,
  LitElement,
  TemplateResult,
  css,
  CSSResult,
  property,
  customElement,
  PropertyValues,
} from "lit-element";
import { repeat } from "lit-html/directives/repeat";
import { PaperInputElement } from "@polymer/paper-input/paper-input";
import "@polymer/paper-checkbox/paper-checkbox";

import "../../../components/op-card";
import "../../../components/op-icon";

import { OpenPeerPower } from "../../../types";
import { DevconCard, DevconCardEditor } from "../types";
import {
  fetchItems,
  updateItem,
  ShoppingListItem,
  clearItems,
  addItem,
} from "../../../data/shopping-list";
import { ShoppingListCardConfig, SensorCardConfig } from "./types";
import { applyThemesOnElement } from "../../../common/dom/apply_themes_on_element";
import { actionHandler } from "../common/directives/action-handler-directive";

@customElement("hui-shopping-list-card")
class HuiShoppingListCard extends LitElement implements DevconCard {
  public static async getConfigElement(): Promise<DevconCardEditor> {
    await import(
      /* webpackChunkName: "hui-shopping-list-editor" */ "../editor/config-elements/hui-shopping-list-editor"
    );
    return document.createElement("hui-shopping-list-card-editor");
  }

  public static getStubConfig(): object {
    return {};
  }

  @property() public opp?: OpenPeerPower;

  @property() private _config?: ShoppingListCardConfig;

  @property() private _uncheckedItems?: ShoppingListItem[];

  @property() private _checkedItems?: ShoppingListItem[];

  private _unsubEvents?: Promise<() => Promise<void>>;

  public getCardSize(): number {
    return (this._config ? (this._config.title ? 1 : 0) : 0) + 3;
  }

  public setConfig(config: ShoppingListCardConfig): void {
    this._config = config;
    this._uncheckedItems = [];
    this._checkedItems = [];
    this._fetchData();
  }

  public connectedCallback(): void {
    super.connectedCallback();

    if (this.opp) {
      this._unsubEvents = this.opp.connection.subscribeEvents(
        () => this._fetchData(),
        "shopping_list_updated"
      );
      this._fetchData();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();

    if (this._unsubEvents) {
      this._unsubEvents.then((unsub) => unsub());
    }
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._config || !this.opp) {
      return;
    }
    const oldOpp = changedProps.get("opp") as OpenPeerPower | undefined;
    const oldConfig = changedProps.get("_config") as
      | SensorCardConfig
      | undefined;

    if (
      !oldOpp ||
      !oldConfig ||
      oldOpp.themes !== this.opp.themes ||
      oldConfig.theme !== this._config.theme
    ) {
      applyThemesOnElement(this, this.opp.themes, this._config.theme);
    }
  }

  protected render(): TemplateResult {
    if (!this._config || !this.opp) {
      return html``;
    }

    return html`
      <op-card .header="${this._config.title}">
        <div class="addRow">
          <op-icon
            class="addButton"
            @click="${this._addItem}"
            icon="opp:plus"
            .title="${this.opp!.localize(
              "ui.panel.devcon.cards.shopping-list.add_item"
            )}"
          >
          </op-icon>
          <paper-item-body>
            <paper-input
              no-label-float
              class="addBox"
              placeholder="${this.opp!.localize(
                "ui.panel.devcon.cards.shopping-list.add_item"
              )}"
              @keydown="${this._addKeyPress}"
            ></paper-input>
          </paper-item-body>
        </div>
        ${repeat(
          this._uncheckedItems!,
          (item) => item.id,
          (item, index) =>
            html`
              <div class="editRow">
                <paper-checkbox
                  slot="item-icon"
                  id="${index}"
                  ?checked="${item.complete}"
                  .itemId="${item.id}"
                  @click="${this._completeItem}"
                  tabindex="0"
                ></paper-checkbox>
                <paper-item-body>
                  <paper-input
                    no-label-float
                    .value="${item.name}"
                    .itemId="${item.id}"
                    @change="${this._saveEdit}"
                  ></paper-input>
                </paper-item-body>
              </div>
            `
        )}
        ${this._checkedItems!.length > 0
          ? html`
              <div class="divider"></div>
              <div class="checked">
                <span class="label">
                  ${this.opp!.localize(
                    "ui.panel.devcon.cards.shopping-list.checked_items"
                  )}
                </span>
                <op-icon
                  class="clearall"
                  @action=${this._clearItems}
                  .actionHandler=${actionHandler()}
                  tabindex="0"
                  icon="opp:notification-clear-all"
                  .title="${this.opp!.localize(
                    "ui.panel.devcon.cards.shopping-list.clear_items"
                  )}"
                >
                </op-icon>
              </div>
              ${repeat(
                this._checkedItems!,
                (item) => item.id,
                (item, index) =>
                  html`
                    <div class="editRow">
                      <paper-checkbox
                        slot="item-icon"
                        id="${index}"
                        ?checked="${item.complete}"
                        .itemId="${item.id}"
                        @click="${this._completeItem}"
                        tabindex="0"
                      ></paper-checkbox>
                      <paper-item-body>
                        <paper-input
                          no-label-float
                          .value="${item.name}"
                          .itemId="${item.id}"
                          @change="${this._saveEdit}"
                        ></paper-input>
                      </paper-item-body>
                    </div>
                  `
              )}
            `
          : ""}
      </op-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .editRow,
      .addRow {
        display: flex;
        flex-direction: row;
      }

      .addButton {
        padding: 9px 15px 11px 15px;
        cursor: pointer;
      }

      paper-item-body {
        width: 75%;
      }

      paper-checkbox {
        padding: 11px 11px 11px 18px;
      }

      paper-input {
        --paper-input-container-underline: {
          display: none;
        }
        --paper-input-container-underline-focus: {
          display: none;
        }
        --paper-input-container-underline-disabled: {
          display: none;
        }
        position: relative;
        top: 1px;
      }

      .checked {
        margin-left: 17px;
        margin-bottom: 11px;
        margin-top: 11px;
      }

      .label {
        color: var(--primary-color);
      }

      .divider {
        height: 1px;
        background-color: var(--divider-color);
        margin: 10px;
      }

      .clearall {
        cursor: pointer;
        margin-bottom: 3px;
        float: right;
        padding-right: 10px;
      }

      .addRow > op-icon {
        color: var(--secondary-text-color);
      }
    `;
  }

  private async _fetchData(): Promise<void> {
    if (this.opp) {
      const checkedItems: ShoppingListItem[] = [];
      const uncheckedItems: ShoppingListItem[] = [];
      const items = await fetchItems(this.opp);
      for (const key in items) {
        if (items[key].complete) {
          checkedItems.push(items[key]);
        } else {
          uncheckedItems.push(items[key]);
        }
      }
      this._checkedItems = checkedItems;
      this._uncheckedItems = uncheckedItems;
    }
  }

  private _completeItem(ev): void {
    updateItem(this.opp!, ev.target.itemId, {
      complete: ev.target.checked,
    }).catch(() => this._fetchData());
  }

  private _saveEdit(ev): void {
    updateItem(this.opp!, ev.target.itemId, {
      name: ev.target.value,
    }).catch(() => this._fetchData());

    ev.target.blur();
  }

  private _clearItems(): void {
    if (this.opp) {
      clearItems(this.opp).catch(() => this._fetchData());
    }
  }

  private get _newItem(): PaperInputElement {
    return this.shadowRoot!.querySelector(".addBox") as PaperInputElement;
  }

  private _addItem(ev): void {
    const newItem = this._newItem;

    if (newItem.value!.length > 0) {
      addItem(this.opp!, newItem.value!).catch(() => this._fetchData());
    }

    newItem.value = "";
    if (ev) {
      newItem.focus();
    }
  }

  private _addKeyPress(ev): void {
    if (ev.keyCode === 13) {
      this._addItem(null);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-shopping-list-card": HuiShoppingListCard;
  }
}
