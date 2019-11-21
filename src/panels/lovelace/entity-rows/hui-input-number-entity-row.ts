import {
  html,
  LitElement,
  TemplateResult,
  property,
  customElement,
  css,
  CSSResult,
  PropertyValues,
} from "lit-element";

import "../components/hui-generic-entity-row";
import "../../../components/op-slider";
import "../components/hui-warning";

import { EntityRow, EntityConfig } from "./types";
import { OpenPeerPower } from "../../../types";
import { setValue } from "../../../data/input_text";
import { hasConfigOrEntityChanged } from "../common/has-changed";

@customElement("hui-input-number-entity-row")
class HuiInputNumberEntityRow extends LitElement implements EntityRow {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: EntityConfig;

  private _loaded?: boolean;

  private _updated?: boolean;

  public setConfig(config: EntityConfig): void {
    if (!config) {
      throw new Error("Configuration error");
    }
    this._config = config;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    if (this._updated && !this._loaded) {
      this._initialLoad();
    }
  }

  protected firstUpdated(): void {
    this._updated = true;
    if (this.isConnected && !this._loaded) {
      this._initialLoad();
    }
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.opp) {
      return html``;
    }

    const stateObj = this.opp.states[this._config.entity];

    if (!stateObj) {
      return html`
        <hui-warning>
          "ui.panel.lovelace.warning.entity_not_found entity ${this._config.entity}""
        </hui-warning>
        >
      `;
    }

    return html`
      <hui-generic-entity-row .opp="${this.opp}" .config="${this._config}">
        <div>
          ${stateObj.attributes.mode === "slider"
            ? html`
                <div class="flex">
                  <op-slider
                    .dir="ltr"
                    .step="${Number(stateObj.attributes.step)}"
                    .min="${Number(stateObj.attributes.min)}"
                    .max="${Number(stateObj.attributes.max)}"
                    .value="${Number(stateObj.state)}"
                    pin
                    @change="${this._selectedValueChanged}"
                    ignore-bar-touch
                    id="input"
                  ></op-slider>
                  <span class="state">
                    ${Number(stateObj.state)}
                    ${stateObj.attributes.unit_of_measurement}
                  </span>
                </div>
              `
            : html`
                <paper-input
                  no-label-float
                  auto-validate
                  .pattern="[0-9]+([\\.][0-9]+)?"
                  .step="${Number(stateObj.attributes.step)}"
                  .min="${Number(stateObj.attributes.min)}"
                  .max="${Number(stateObj.attributes.max)}"
                  .value="${Number(stateObj.state)}"
                  type="number"
                  @change="${this._selectedValueChanged}"
                  id="input"
                ></paper-input>
              `}
        </div>
      </hui-generic-entity-row>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .flex {
        display: flex;
        align-items: center;
      }
      .state {
        min-width: 45px;
        text-align: end;
      }
      paper-input {
        text-align: end;
      }
    `;
  }

  private async _initialLoad(): Promise<void> {
    this._loaded = true;
    await this.updateComplete;
    const element = this.shadowRoot!.querySelector(".state") as HTMLElement;

    if (!element || !this.parentElement) {
      return;
    }

    element.hidden = this.parentElement.clientWidth <= 350;
  }

  private get _inputElement(): { value: string } {
    // linter recommended the following syntax
    return (this.shadowRoot!.getElementById("input") as unknown) as {
      value: string;
    };
  }

  private _selectedValueChanged(): void {
    const element = this._inputElement;
    const stateObj = this.opp!.states[this._config!.entity];

    if (element.value !== stateObj.state) {
      setValue(this.opp!, stateObj.entity_id, element.value!);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-input-number-entity-row": HuiInputNumberEntityRow;
  }
}
