import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
} from "lit-element";

import "../../../../components/entity/op-entity-picker";
import "../../components/hui-theme-select-editor";

import { struct } from "../../common/structs/struct";
import { EntitiesEditorEvent, EditorTarget } from "../types";
import { OpenPeerPower } from "../../../../types";
import { DevconCardEditor } from "../../types";
import { fireEvent } from "../../../../common/dom/fire_event";
import { configElementStyle } from "./config-elements-style";
import { WeatherForecastCardConfig } from "../../cards/types";

const cardConfigStruct = struct({
  type: "string",
  entity: "string?",
  name: "string?",
  theme: "string?",
});

@customElement("hui-weather-forecast-card-editor")
export class HuiWeatherForecastCardEditor extends LitElement
  implements DevconCardEditor {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: WeatherForecastCardConfig;

  public setConfig(config: WeatherForecastCardConfig): void {
    config = cardConfigStruct(config);
    this._config = config;
  }

  get _entity(): string {
    return this._config!.entity || "";
  }

  get _name(): string {
    return this._config!.name || "";
  }

  get _theme(): string {
    return this._config!.theme || "Backend-selected";
  }

  protected render(): TemplateResult {
    if (!this.opp) {
      return html``;
    }

    return html`
      ${configElementStyle}
      <div class="card-config">
        <op-entity-picker
          .label="${this.opp.localize(
            "ui.panel.devcon.editor.card.generic.entity"
          )} (${this.opp.localize(
            "ui.panel.devcon.editor.card.config.required"
          )})"
          .opp="${this.opp}"
          .value="${this._entity}"
          .configValue=${"entity"}
          include-domains='["weather"]'
          @change="${this._valueChanged}"
          allow-custom-entity
        ></op-entity-picker>
        <paper-input
          .label="${this.opp.localize(
            "ui.panel.devcon.editor.card.generic.name"
          )} (${this.opp.localize(
            "ui.panel.devcon.editor.card.config.optional"
          )})"
          .value="${this._name}"
          .configValue="${"name"}"
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
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-weather-forecast-card-editor": HuiWeatherForecastCardEditor;
  }
}
