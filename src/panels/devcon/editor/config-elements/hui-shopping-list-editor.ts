import {
  html,
  CSSResult,
  css,
  LitElement,
  TemplateResult,
  customElement,
  property,
} from "lit-element";
import "@polymer/paper-input/paper-input";

import { struct } from "../../common/structs/struct";
import { EntitiesEditorEvent, EditorTarget } from "../types";
import { OpenPeerPower } from "../../../../types";
import { DevconCardEditor } from "../../types";
import { fireEvent } from "../../../../common/dom/fire_event";
import { ShoppingListCardConfig } from "../../cards/types";

import { isComponentLoaded } from "../../../../common/config/is_component_loaded";
import "../../components/hui-theme-select-editor";

const cardConfigStruct = struct({
  type: "string",
  title: "string?",
  theme: "string?",
});

@customElement("hui-shopping-list-card-editor")
export class HuiShoppingListEditor extends LitElement
  implements DevconCardEditor {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: ShoppingListCardConfig;

  public setConfig(config: ShoppingListCardConfig): void {
    config = cardConfigStruct(config);
    this._config = config;
  }

  get _title(): string {
    return this._config!.title || "";
  }

  get _theme(): string {
    return this._config!.theme || "Backend-selected";
  }

  protected render(): TemplateResult {
    if (!this.opp) {
      return html``;
    }

    return html`
      <div class="card-config">
        ${!isComponentLoaded(this.opp, "shopping_list")
          ? html`
              <div class="error">
                ${this.opp.localize(
                  "ui.panel.devcon.editor.card.shopping-list.integration_not_loaded"
                )}
              </div>
            `
          : ""}
        <paper-input
          .label="${this.opp.localize(
            "ui.panel.devcon.editor.card.generic.title"
          )} (${this.opp.localize(
            "ui.panel.devcon.editor.card.config.optional"
          )})"
          .value="${this._title}"
          .configValue="${"title"}"
          @value-changed="${this._valueChanged}"
        ></paper-input>
        <hui-theme-select-editor
          .opp="${this.opp}"
          .value="${this._theme}"
          .configValue="${"theme"}"
          @theme-changed="${this._valueChanged}"
        ></hui-theme-select-editor>
      </div>
    `;
  }

  private _valueChanged(ev: EntitiesEditorEvent): void {
    if (!this._config || !this.opp) {
      return;
    }
    const target = ev.target! as EditorTarget;

    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === "") {
        delete this._config[target.configValue!];
      } else {
        this._config = {
          ...this._config,
          [target.configValue!]: target.value,
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }

  static get styles(): CSSResult {
    return css`
      .error {
        color: var(--google-red-500);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-shopping-list-card-editor": HuiShoppingListEditor;
  }
}
