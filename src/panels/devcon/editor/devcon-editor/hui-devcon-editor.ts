import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
} from "lit-element";
import "@polymer/paper-input/paper-input";

import { EditorTarget } from "../types";
import { OpenPeerPower } from "../../../../types";
import { fireEvent } from "../../../../common/dom/fire_event";
import { configElementStyle } from "../config-elements/config-elements-style";

import { DevconConfig } from "../../../../data/devcon";

declare global {
  interface OPPDomEvents {
    "devcon-config-changed": {
      config: DevconConfig;
    };
  }
}

@customElement("hui-devcon-editor")
export class HuiDevconEditor extends LitElement {
  @property() public opp?: OpenPeerPower;

  @property() public config?: DevconConfig;

  get _title(): string {
    if (!this.config) {
      return "";
    }
    return this.config.title || "";
  }

  protected render(): TemplateResult {
    return html`
      ${configElementStyle}
      <div class="card-config">
        <paper-input
          label="Title"
          .value="${this._title}"
          .configValue="${"title"}"
          @value-changed="${this._valueChanged}"
        ></paper-input>
      </div>
    `;
  }

  private _valueChanged(ev: Event): void {
    if (!this.config) {
      return;
    }

    const target = ev.currentTarget! as EditorTarget;

    if (this[`_${target.configValue}`] === target.value) {
      return;
    }

    let newConfig;

    if (target.configValue) {
      newConfig = {
        ...this.config,
        [target.configValue]: target.value,
      };
    }

    fireEvent(this, "devcon-config-changed", { config: newConfig });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-devcon-editor": HuiDevconEditor;
  }
}
