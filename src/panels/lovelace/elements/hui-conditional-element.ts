import {
  checkConditionsMet,
  validateConditionalConfig,
} from "../../lovelace/common/validate-condition";
import { createStyledHuiElement } from "../cards/picture-elements/create-styled-hui-element";
import {
  LovelaceElement,
  LovelaceElementConfig,
  ConditionalElementConfig,
} from "./types";
import { OpenPeerPower } from "../../../types";

class HuiConditionalElement extends HTMLElement implements LovelaceElement {
  public _opp?: OpenPeerPower;
  private _config?: ConditionalElementConfig;
  private _elements: LovelaceElement[] = [];

  public setConfig(config: ConditionalElementConfig): void {
    if (
      !config.conditions ||
      !Array.isArray(config.conditions) ||
      !config.elements ||
      !Array.isArray(config.elements) ||
      !validateConditionalConfig(config.conditions)
    ) {
      throw new Error("Error in card configuration.");
    }

    if (this._elements.length > 0) {
      this._elements.map((el: LovelaceElement) => {
        if (el.parentElement) {
          el.parentElement.removeChild(el);
        }
      });

      this._elements = [];
    }

    this._config = config;

    this._config.elements.map((elementConfig: LovelaceElementConfig) => {
      this._elements.push(createStyledHuiElement(elementConfig));
    });

    this.updateElements();
  }

  set opp(opp: OpenPeerPower) {
    this._opp = opp;

    this.updateElements();
  }

  private updateElements() {
    if (!this._opp || !this._config) {
      return;
    }

    const visible = checkConditionsMet(this._config.conditions, this._opp);

    this._elements.map((el: LovelaceElement) => {
      if (visible) {
        el.opp = this._opp;
        if (!el.parentElement) {
          this.appendChild(el);
        }
      } else if (el.parentElement) {
        el.parentElement.removeChild(el);
      }
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-conditional-element": HuiConditionalElement;
  }
}

customElements.define("hui-conditional-element", HuiConditionalElement);
