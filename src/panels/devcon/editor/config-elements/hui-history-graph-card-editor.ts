import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
} from "lit-element";
import "@polymer/paper-input/paper-input";

import "../../components/hui-entity-editor";

import { struct } from "../../common/structs/struct";
import { EntitiesEditorEvent, EditorTarget } from "../types";
import { OpenPeerPower } from "../../../../types";
import { DevconCardEditor } from "../../types";
import { fireEvent } from "../../../../common/dom/fire_event";
import { EntityConfig } from "../../entity-rows/types";
import { processEditorEntities } from "../process-editor-entities";
import { configElementStyle } from "./config-elements-style";
import { HistoryGraphCardConfig } from "../../cards/types";

const entitiesConfigStruct = struct.union([
  {
    entity: "entity-id",
    name: "string?",
  },
  "entity-id",
]);

const cardConfigStruct = struct({
  type: "string",
  entities: [entitiesConfigStruct],
  title: "string?",
  hours_to_show: "number?",
  refresh_interval: "number?",
});

@customElement("hui-history-graph-card-editor")
export class HuiHistoryGraphCardEditor extends LitElement
  implements DevconCardEditor {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: HistoryGraphCardConfig;

  @property() private _configEntities?: EntityConfig[];

  public setConfig(config: HistoryGraphCardConfig): void {
    config = cardConfigStruct(config);
    this._config = config;
    this._configEntities = processEditorEntities(config.entities);
  }

  get _entity(): string {
    return this._config!.entity || "";
  }

  get _title(): string {
    return this._config!.title || "";
  }

  get _hours_to_show(): number {
    return this._config!.hours_to_show || 24;
  }

  get _refresh_interval(): number {
    return this._config!.refresh_interval || 0;
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
          <paper-input
            type="number"
            .label="${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.hours_to_show"
            )} (${this.opp.localize(
              "ui.panel.devcon.editor.card.config.optional"
            )})"
            .value="${this._hours_to_show}"
            .configValue=${"hours_to_show"}
            @value-changed="${this._valueChanged}"
          ></paper-input>
          <paper-input
            type="number"
            .label="${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.refresh_interval"
            )} (${this.opp.localize(
              "ui.panel.devcon.editor.card.config.optional"
            )})"
            .value="${this._refresh_interval}"
            .configValue=${"refresh_interval"}
            @value-changed="${this._valueChanged}"
          ></paper-input>
        </div>
        <hui-entity-editor
          .opp="${this.opp}"
          .entities="${this._configEntities}"
          @entities-changed="${this._valueChanged}"
        ></hui-entity-editor>
      </div>
    `;
  }

  private _valueChanged(ev: EntitiesEditorEvent): void {
    if (!this._config || !this.opp) {
      return;
    }
    const target = ev.target! as EditorTarget;

    if (!ev.detail && this[`_${target.configValue}`] === target.value) {
      return;
    }

    if (ev.detail && ev.detail.entities) {
      this._config.entities = ev.detail.entities;
      this._configEntities = processEditorEntities(this._config.entities);
    } else if (target.configValue) {
      if (target.value === "") {
        delete this._config[target.configValue!];
      } else {
        let value: any = target.value;
        if (target.type === "number") {
          value = Number(value);
        }
        this._config = {
          ...this._config,
          [target.configValue!]: value,
        };
      }
    }

    fireEvent(this, "config-changed", { config: this._config });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-history-graph-card-editor": HuiHistoryGraphCardEditor;
  }
}
