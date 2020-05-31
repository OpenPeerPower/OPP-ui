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

import { createStyledHuiElement } from "./picture-elements/create-styled-hui-element";
import { DevconCard } from "../types";
import { OpenPeerPower } from "../../../types";
import { DevconElementConfig, DevconElement } from "../elements/types";
import { PictureElementsCardConfig } from "./types";
import { applyThemesOnElement } from "../../../common/dom/apply_themes_on_element";

@customElement("hui-picture-elements-card")
class HuiPictureElementsCard extends LitElement implements DevconCard {
  @property() private _config?: PictureElementsCardConfig;

  private _opp?: OpenPeerPower;

  set opp(opp: OpenPeerPower) {
    this._opp = opp;
    for (const el of Array.from(
      this.shadowRoot!.querySelectorAll("#root > *")
    )) {
      const element = el as DevconElement;
      element.opp = this._opp;
    }
  }

  public getCardSize(): number {
    return 4;
  }

  public setConfig(config: PictureElementsCardConfig): void {
    if (!config) {
      throw new Error("Invalid Configuration");
    } else if (
      !(config.image || config.camera_image || config.state_image) ||
      (config.state_image && !config.entity)
    ) {
      throw new Error("Invalid Configuration: image required");
    } else if (!Array.isArray(config.elements)) {
      throw new Error("Invalid Configuration: elements required");
    }

    this._config = config;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._config || !this._opp) {
      return;
    }
    const oldOpp = changedProps.get("opp") as OpenPeerPower | undefined;
    const oldConfig = changedProps.get("_config") as
      | PictureElementsCardConfig
      | undefined;

    if (
      !oldOpp ||
      !oldConfig ||
      oldOpp.themes !== this.opp.themes ||
      oldConfig.theme !== this._config.theme
    ) {
      applyThemesOnElement(this, this._opp.themes, this._config.theme);
    }
  }

  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    return html`
      <op-card .header="${this._config.title}">
        <div id="root">
          <hui-image
            .opp=${this._opp}
            .image=${this._config.image}
            .stateImage=${this._config.state_image}
            .stateFilter=${this._config.state_filter}
            .cameraImage=${this._config.camera_image}
            .cameraView=${this._config.camera_view}
            .entity=${this._config.entity}
            .aspectRatio=${this._config.aspect_ratio}
          ></hui-image>
          ${this._config.elements.map((elementConfig: DevconElementConfig) => {
            const element = createStyledHuiElement(elementConfig);
            element.opp = this._opp;

            return element;
          })}
        </div>
      </op-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      #root {
        position: relative;
      }

      .element {
        position: absolute;
        transform: translate(-50%, -50%);
      }

      op-card {
        overflow: hidden;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-picture-elements-card": HuiPictureElementsCard;
  }
}
