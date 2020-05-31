import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
} from "lit-element";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";

import "../../../../components/entity/state-badge";
import "../../components/hui-theme-select-editor";
import "../../components/hui-entity-editor";
import "../../../../components/op-card";
import "../../../../components/op-icon";
import "../../../../components/op-switch";

import { struct } from "../../common/structs/struct";
import { processEditorEntities } from "../process-editor-entities";
import {
  EntitiesEditorEvent,
  EditorTarget,
  entitiesConfigStruct,
} from "../types";
import { OpenPeerPower } from "../../../../types";
import { DevconCardEditor } from "../../types";
import { fireEvent } from "../../../../common/dom/fire_event";
import { configElementStyle } from "./config-elements-style";
import { GlanceCardConfig, ConfigEntity } from "../../cards/types";

const cardConfigStruct = struct({
  type: "string",
  title: "string|number?",
  theme: "string?",
  columns: "number?",
  show_name: "boolean?",
  show_state: "boolean?",
  show_icon: "boolean?",
  entities: [entitiesConfigStruct],
});

@customElement("hui-glance-card-editor")
export class HuiGlanceCardEditor extends LitElement
  implements DevconCardEditor {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: GlanceCardConfig;

  @property() private _configEntities?: ConfigEntity[];

  public setConfig(config: GlanceCardConfig): void {
    config = cardConfigStruct(config);
    this._config = config;
    this._configEntities = processEditorEntities(config.entities);
  }

  get _title(): string {
    return this._config!.title || "";
  }

  get _theme(): string {
    return this._config!.theme || "Backend-selected";
  }

  get _columns(): number {
    return this._config!.columns || NaN;
  }

  get _show_name(): boolean {
    return this._config!.show_name || true;
  }

  get _show_icon(): boolean {
    return this._config!.show_icon || true;
  }

  get _show_state(): boolean {
    return this._config!.show_state || true;
  }

  protected render(): TemplateResult {
    if (!this.opp) {
      return html``;
    }

    return html`
      ${configElementStyle}
      <div class="card-config">
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
        <div class="side-by-side">
          <hui-theme-select-editor
            .opp="${this.opp}"
            .value="${this._theme}"
            .configValue="${"theme"}"
            @theme-changed="${this._valueChanged}"
          ></hui-theme-select-editor>
          <paper-input
            .label="${this.opp.localize(
              "ui.panel.devcon.editor.card.glance.columns"
            )} (${this.opp.localize(
              "ui.panel.devcon.editor.card.config.optional"
            )})"
            type="number"
            .value="${this._columns}"
            .configValue="${"columns"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
        </div>
        <div class="side-by-side">
          <op-switch
            .checked=${this._config!.show_name !== false}
            .configValue="${"show_name"}"
            @change="${this._valueChanged}"
            >${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.show_name"
            )}</op-switch
          >
          <op-switch
            .checked=${this._config!.show_icon !== false}
            .configValue="${"show_icon"}"
            @change="${this._valueChanged}"
            >${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.show_icon"
            )}</op-switch
          >
          <op-switch
            .checked=${this._config!.show_state !== false}
            .configValue="${"show_state"}"
            @change="${this._valueChanged}"
            >${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.show_state"
            )}</op-switch
          >
        </div>
      </div>
      <hui-entity-editor
        .opp="${this.opp}"
        .entities="${this._configEntities}"
        @entities-changed="${this._valueChanged}"
      ></hui-entity-editor>
    `;
  }

  private _valueChanged(ev: EntitiesEditorEvent): void {
    if (!this._config || !this.opp) {
      return;
    }
    const target = ev.target! as EditorTarget;

    if (target.configValue && this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (ev.detail && ev.detail.entities) {
      this._config.entities = ev.detail.entities;
      this._configEntities = processEditorEntities(this._config.entities);
    } else if (target.configValue) {
      if (
        target.value === "" ||
        (target.type === "number" && isNaN(Number(target.value)))
      ) {
        delete this._config[target.configValue!];
      } else {
        let value: any = target.value;
        if (target.type === "number") {
          value = Number(value);
        }
        this._config = {
          ...this._config,
          [target.configValue!]:
            target.checked !== undefined ? target.checked : value,
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-glance-card-editor": HuiGlanceCardEditor;
  }
}
