import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  CSSResult,
  css,
} from "lit-element";
import "@polymer/paper-input/paper-input";

import { EditorTarget } from "../types";
import { OpenPeerPower } from "../../../../types";
import { fireEvent } from "../../../../common/dom/fire_event";
import { configElementStyle } from "../config-elements/config-elements-style";
import { DevconViewConfig } from "../../../../data/devcon";
import { slugify } from "../../../../common/string/slugify";

import "../../components/hui-theme-select-editor";
import "../../../../components/op-switch";

declare global {
  interface OPPDomEvents {
    "view-config-changed": {
      config: DevconViewConfig;
    };
  }
}

@customElement("hui-view-editor")
export class HuiViewEditor extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public isNew!: boolean;
  @property() private _config!: DevconViewConfig;
  private _suggestedPath = false;

  get _path(): string {
    if (!this._config) {
      return "";
    }
    return this._config.path || "";
  }

  get _title(): string {
    if (!this._config) {
      return "";
    }
    return this._config.title || "";
  }

  get _icon(): string {
    if (!this._config) {
      return "";
    }
    return this._config.icon || "";
  }

  get _theme(): string {
    if (!this._config) {
      return "";
    }
    return this._config.theme || "Backend-selected";
  }

  get _panel(): boolean {
    if (!this._config) {
      return false;
    }
    return this._config.panel || false;
  }

  set config(config: DevconViewConfig) {
    this._config = config;
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
          )}  (${this.opp.localize(
            "ui.panel.devcon.editor.card.config.optional"
          )})"
          .value=${this._title}
          .configValue=${"title"}
          @value-changed=${this._valueChanged}
          @blur=${this._handleTitleBlur}
        ></paper-input>
        <paper-input
          .label="${this.opp.localize(
            "ui.panel.devcon.editor.card.generic.icon"
          )}  (${this.opp.localize(
            "ui.panel.devcon.editor.card.config.optional"
          )})"
          .value=${this._icon}
          .configValue=${"icon"}
          @value-changed=${this._valueChanged}
        ></paper-input>
        <paper-input
          .label="${this.opp.localize(
            "ui.panel.devcon.editor.card.generic.url"
          )}  (${this.opp.localize(
            "ui.panel.devcon.editor.card.config.optional"
          )})"
          .value=${this._path}
          .configValue=${"path"}
          @value-changed=${this._valueChanged}
        ></paper-input>
        <hui-theme-select-editor
          .opp=${this.opp}
          .value=${this._theme}
          .configValue=${"theme"}
          @theme-changed=${this._valueChanged}
        ></hui-theme-select-editor>
        <op-switch
          .checked=${this._panel !== false}
          .configValue=${"panel"}
          @change=${this._valueChanged}
          >${this.opp.localize(
            "ui.panel.devcon.editor.view.panel_mode.title"
          )}</op-switch
        >
        <span class="panel"
          >${this.opp.localize(
            "ui.panel.devcon.editor.view.panel_mode.description"
          )}</span
        >
      </div>
    `;
  }

  private _valueChanged(ev: Event): void {
    const target = ev.currentTarget! as EditorTarget;

    if (this[`_${target.configValue}`] === target.value) {
      return;
    }

    let newConfig;

    if (target.configValue) {
      newConfig = {
        ...this._config,
        [target.configValue!]:
          target.checked !== undefined ? target.checked : target.value,
      };
    }

    fireEvent(this, "view-config-changed", { config: newConfig });
  }

  private _handleTitleBlur(ev) {
    if (
      !this.isNew ||
      this._suggestedPath ||
      this._config.path ||
      !ev.currentTarget.value
    ) {
      return;
    }

    const config = { ...this._config, path: slugify(ev.currentTarget.value) };
    fireEvent(this, "view-config-changed", { config });
  }

  static get styles(): CSSResult {
    return css`
      .panel {
        color: var(--secondary-text-color);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-view-editor": HuiViewEditor;
  }
}
