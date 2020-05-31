import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
} from "lit-element";
import "@polymer/paper-input/paper-input";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";

import "../../components/hui-theme-select-editor";
import "../../../../components/entity/op-entity-picker";

import { struct } from "../../common/structs/struct";
import { EntitiesEditorEvent, EditorTarget } from "../types";
import { OpenPeerPower } from "../../../../types";
import { DevconCardEditor } from "../../types";
import { fireEvent } from "../../../../common/dom/fire_event";
import { configElementStyle } from "./config-elements-style";
import { SensorCardConfig } from "../../cards/types";

const cardConfigStruct = struct({
  type: "string",
  entity: "string?",
  name: "string?",
  icon: "string?",
  graph: "string?",
  unit: "string?",
  detail: "number?",
  theme: "string?",
  hours_to_show: "number?",
});

@customElement("hui-sensor-card-editor")
export class HuiSensorCardEditor extends LitElement
  implements DevconCardEditor {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: SensorCardConfig;

  public setConfig(config: SensorCardConfig): void {
    config = cardConfigStruct(config);
    this._config = config;
  }

  get _entity(): string {
    return this._config!.entity || "";
  }

  get _name(): string {
    return this._config!.name || "";
  }

  get _icon(): string {
    return this._config!.icon || "";
  }

  get _graph(): string {
    return this._config!.graph || "none";
  }

  get _unit(): string {
    return this._config!.unit || "";
  }

  get _detail(): number | string {
    return this._config!.number || "1";
  }

  get _theme(): string {
    return this._config!.theme || "default";
  }

  get _hours_to_show(): number | string {
    return this._config!.hours_to_show || "24";
  }

  protected render(): TemplateResult {
    if (!this.opp) {
      return html``;
    }

    const graphs = ["line", "none"];

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
          include-domains='["sensor"]'
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
        <div class="side-by-side">
          <paper-input
            .label="${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.icon"
            )} (${this.opp.localize(
              "ui.panel.devcon.editor.card.config.optional"
            )})"
            .value="${this._icon}"
            .configValue="${"icon"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          <paper-dropdown-menu
            .label="${this.opp.localize(
              "ui.panel.devcon.editor.card.sensor.graph_type"
            )} (${this.opp.localize(
              "ui.panel.devcon.editor.card.config.optional"
            )})"
            .configValue="${"graph"}"
            @value-changed="${this._valueChanged}"
          >
            <paper-listbox
              slot="dropdown-content"
              .selected="${graphs.indexOf(this._graph)}"
            >
              ${graphs.map((graph) => {
                return html`
                  <paper-item>${graph}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div class="side-by-side">
          <paper-input
            .label="${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.unit"
            )} (${this.opp.localize(
              "ui.panel.devcon.editor.card.config.optional"
            )})"
            .value="${this._unit}"
            .configValue="${"unit"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          <paper-input
            .label="${this.opp.localize(
              "ui.panel.devcon.editor.card.sensor.graph_detail"
            )} (${this.opp.localize(
              "ui.panel.devcon.editor.card.config.optional"
            )})"
            type="number"
            .value="${this._detail}"
            .configValue="${"detail"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
        </div>
        <div class="side-by-side">
          <hui-theme-select-editor
            .opp="${this.opp}"
            .value="${this._theme}"
            .configValue="${"theme"}"
            @theme-changed="${this._valueChanged}"
          ></hui-theme-select-editor>
          <paper-input
            .label="${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.hours_to_show"
            )} (${this.opp.localize(
              "ui.panel.devcon.editor.card.config.optional"
            )})"
            type="number"
            .value="${this._hours_to_show}"
            .configValue="${"hours_to_show"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
        </div>
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
        this._config = { ...this._config, [target.configValue!]: value };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-sensor-card-editor": HuiSensorCardEditor;
  }
}
