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
import "../../../../components/op-switch";
import "../../components/hui-theme-select-editor";

import { struct } from "../../common/structs/struct";
import {
  EntitiesEditorEvent,
  EditorTarget,
  actionConfigStruct,
} from "../types";
import { OpenPeerPower } from "../../../../types";
import { DevconCardEditor } from "../../types";
import { fireEvent } from "../../../../common/dom/fire_event";
import { configElementStyle } from "./config-elements-style";
import { ActionConfig } from "../../../../data/devcon";
import { PictureEntityCardConfig } from "../../cards/types";

const cardConfigStruct = struct({
  type: "string",
  entity: "string",
  image: "string?",
  name: "string?",
  camera_image: "string?",
  camera_view: "string?",
  aspect_ratio: "string?",
  tap_action: struct.optional(actionConfigStruct),
  hold_action: struct.optional(actionConfigStruct),
  show_name: "boolean?",
  show_state: "boolean?",
  theme: "string?",
});

@customElement("hui-picture-entity-card-editor")
export class HuiPictureEntityCardEditor extends LitElement
  implements DevconCardEditor {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: PictureEntityCardConfig;

  public setConfig(config: PictureEntityCardConfig): void {
    config = cardConfigStruct(config);
    this._config = config;
  }

  get _entity(): string {
    return this._config!.entity || "";
  }

  get _name(): string {
    return this._config!.name || "";
  }

  get _image(): string {
    return this._config!.image || "";
  }

  get _camera_image(): string {
    return this._config!.camera_image || "";
  }

  get _camera_view(): string {
    return this._config!.camera_view || "auto";
  }

  get _aspect_ratio(): string {
    return this._config!.aspect_ratio || "50";
  }

  get _tap_action(): ActionConfig {
    return this._config!.tap_action || { action: "more-info" };
  }

  get _hold_action(): ActionConfig {
    return this._config!.hold_action || { action: "more-info" };
  }

  get _show_name(): boolean {
    return this._config!.show_name || true;
  }

  get _show_state(): boolean {
    return this._config!.show_state || true;
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
        <op-entity-picker
          .label="${this.opp.localize(
            "ui.panel.devcon.editor.card.generic.entity"
          )} (${this.opp.localize(
            "ui.panel.devcon.editor.card.config.required"
          )})"
          .opp="${this.opp}"
          .value="${this._entity}"
          .configValue=${"entity"}
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
          include-domains='["camera"]'
          allow-custom-entity
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
        <div class="side-by-side">
          <op-switch
            .checked="${this._config!.show_name !== false}"
            .configValue="${"show_name"}"
            @change="${this._valueChanged}"
            >${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.show_name"
            )}</op-switch
          >
          <op-switch
            .checked="${this._config!.show_state !== false}"
            .configValue="${"show_state"}"
            @change="${this._valueChanged}"
            >${this.opp.localize(
              "ui.panel.devcon.editor.card.generic.show_state"
            )}</op-switch
          >
        </div>
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
          <hui-theme-select-editor
            .opp="${this.opp}"
            .value="${this._theme}"
            .configValue="${"theme"}"
            @theme-changed="${this._valueChanged}"
          ></hui-theme-select-editor>
        </div>
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

    if (
      this[`_${target.configValue}`] === value ||
      this[`_${target.configValue}`] === target.config
    ) {
      return;
    }
    if (target.configValue) {
      if (value === "") {
        delete this._config[target.configValue!];
      } else {
        this._config = {
          ...this._config,
          [target.configValue!]:
            target.checked !== undefined
              ? target.checked
              : value
              ? value
              : target.config,
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-picture-entity-card-editor": HuiPictureEntityCardEditor;
  }
}
