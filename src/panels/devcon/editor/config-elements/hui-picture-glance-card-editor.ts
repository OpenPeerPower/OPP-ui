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

import "../../components/hui-action-editor";
import "../../components/hui-entity-editor";
import "../../../../components/entity/op-entity-picker";
import "../../components/hui-theme-select-editor";

import { struct } from "../../common/structs/struct";
import {
  EntitiesEditorEvent,
  EditorTarget,
  actionConfigStruct,
  entitiesConfigStruct,
} from "../types";
import { OpenPeerPower } from "../../../../types";
import { DevconCardEditor } from "../../types";
import { fireEvent } from "../../../../common/dom/fire_event";
import { configElementStyle } from "./config-elements-style";
import { ActionConfig } from "../../../../data/devcon";
import { PictureGlanceCardConfig } from "../../cards/types";
import { EntityConfig } from "../../entity-rows/types";
import { processEditorEntities } from "../process-editor-entities";

const cardConfigStruct = struct({
  type: "string",
  title: "string?",
  entity: "string?",
  image: "string?",
  camera_image: "string?",
  camera_view: "string?",
  aspect_ratio: "string?",
  tap_action: struct.optional(actionConfigStruct),
  hold_action: struct.optional(actionConfigStruct),
  entities: [entitiesConfigStruct],
  theme: "string?",
});

@customElement("hui-picture-glance-card-editor")
export class HuiPictureGlanceCardEditor extends LitElement
  implements DevconCardEditor {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: PictureGlanceCardConfig;

  @property() private _configEntities?: EntityConfig[];

  public setConfig(config: PictureGlanceCardConfig): void {
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

  get _image(): string {
    return this._config!.image || this._camera_image
      ? ""
      : "https://www.open-peer-power.io/images/merchandise/shirt-frontpage.png";
  }

  get _camera_image(): string {
    return this._config!.camera_image || "";
  }

  get _camera_view(): string {
    return this._config!.camera_view || "auto";
  }

  get _state_image(): {} {
    return this._config!.state_image || {};
  }

  get _aspect_ratio(): string {
    return this._config!.aspect_ratio || "";
  }

  get _tap_action(): ActionConfig {
    return this._config!.tap_action || { action: "more-info" };
  }

  get _hold_action(): ActionConfig {
    return this._config!.hold_action || { action: "more-info" };
  }

  get _show_name(): boolean {
    return this._config!.show_name || false;
  }

  get _show_state(): boolean {
    return this._config!.show_state || false;
  }

  get _theme(): string {
    return this._config!.theme || "Backend-selected";
  }

  protected render(): TemplateResult {
    if (!this.opp) {
      return html``;
    }

    const actions = ["more-info", "toggle", "navigate", "call-service", "none"];
    const views = ["auto", "live"];

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
        <paper-input
          .label="${this.opp.localize(
            "ui.panel.devcon.editor.card.generic.image"
          )} (${this.opp.localize(
            "ui.panel.devcon.editor.card.config.optional"
          )})"
          .value="${this._image}"
          .configValue="${"image"}"
          @value-changed="${this._valueChanged}"
        ></paper-input>
        <op-entity-picker
          .label="${this.opp.localize(
            "ui.panel.devcon.editor.card.generic.camera_image"
          )} (${this.opp.localize(
            "ui.panel.devcon.editor.card.config.optional"
          )})"
          .opp="${this.opp}"
          .value="${this._camera_image}"
          .configValue=${"camera_image"}
          @change="${this._valueChanged}"
          allow-custom-entity
          include-domains='["camera"]'
        ></op-entity-picker>
        <div class="side-by-side">
          <paper-dropdown-menu
            .label="${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.camera_view"
            )} (${this.opp.localize(
              "ui.panel.devcon.editor.card.config.optional"
            )})"
            .configValue="${"camera_view"}"
            @value-changed="${this._valueChanged}"
          >
            <paper-listbox
              slot="dropdown-content"
              .selected="${views.indexOf(this._camera_view)}"
            >
              ${views.map((view) => {
                return html`
                  <paper-item>${view}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
          <paper-input
            .label="${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.aspect_ratio"
            )} (${this.opp.localize(
              "ui.panel.devcon.editor.card.config.optional"
            )})"
            type="number"
            .value="${Number(this._aspect_ratio.replace("%", ""))}"
            .configValue="${"aspect_ratio"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
        </div>
        <op-entity-picker
          .label="${this.opp.localize(
            "ui.panel.devcon.editor.card.generic.entity"
          )} (${this.opp.localize(
            "ui.panel.devcon.editor.card.config.optional"
          )})"
          .opp="${this.opp}"
          .value="${this._entity}"
          .configValue=${"entity"}
          @change="${this._valueChanged}"
          allow-custom-entity
        ></op-entity-picker>
        <div class="side-by-side">
          <hui-action-editor
            .label="${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.tap_action"
            )} (${this.opp.localize(
              "ui.panel.devcon.editor.card.config.optional"
            )})"
            .opp="${this.opp}"
            .config="${this._tap_action}"
            .actions="${actions}"
            .configValue="${"tap_action"}"
            @action-changed="${this._valueChanged}"
          ></hui-action-editor>
          <hui-action-editor
            .label="${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.hold_action"
            )} (${this.opp.localize(
              "ui.panel.devcon.editor.card.config.optional"
            )})"
            .opp="${this.opp}"
            .config="${this._hold_action}"
            .actions="${actions}"
            .configValue="${"hold_action"}"
            @action-changed="${this._valueChanged}"
          ></hui-action-editor>
        </div>
        <hui-entity-editor
          .opp="${this.opp}"
          .entities="${this._configEntities}"
          @entities-changed="${this._valueChanged}"
        ></hui-entity-editor>
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
    let value = target.value;

    if (target.configValue! === "aspect_ratio" && target.value) {
      value += "%";
    }

    if (ev.detail && ev.detail.entities) {
      this._config.entities = ev.detail.entities;
      this._configEntities = processEditorEntities(this._config.entities);
    } else if (target.configValue) {
      if (
        this[`_${target.configValue}`] === value ||
        this[`_${target.configValue}`] === target.config
      ) {
        return;
      }

      if (value === "") {
        delete this._config[target.configValue!];
      } else {
        this._config = {
          ...this._config,
          [target.configValue!]: value ? value : target.config,
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-picture-glance-card-editor": HuiPictureGlanceCardEditor;
  }
}
