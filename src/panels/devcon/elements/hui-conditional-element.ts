import {
  checkConditionsMet,
  validateConditionalConfig,
} from "../../devcon/common/validate-condition";
import { createStyledHuiElement } from "../cards/picture-elements/create-styled-hui-element";
import {
  DevconElement,
  DevconElementConfig,
  ConditionalElementConfig,
} from "./types";
import { OpenPeerPower } from "../../../types";

class HuiConditionalElement extends HTMLElement implements DevconElement {
  public _opp?: OpenPeerPower;
  private _config?: ConditionalElementConfig;
  private _elements: DevconElement[] = [];

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
      this._elements.map((el: DevconElement) => {
        if (el.parentElement) {
          el.parentElement.removeChild(el);
        }
      });

      this._elements = [];
    }

    this._config = config;

    this._config.elements.map((elementConfig: DevconElementConfig) => {
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

    this._elements.map((el: DevconElement) => {
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
