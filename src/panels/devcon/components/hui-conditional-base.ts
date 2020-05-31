import { customElement, property, UpdatingElement } from "lit-element";

import {
  checkConditionsMet,
  validateConditionalConfig,
} from "../common/validate-condition";
import { OpenPeerPower } from "../../../types";
import { DevconCard } from "../types";
import { DevconRow, ConditionalRowConfig } from "../entity-rows/types";
import { ConditionalCardConfig } from "../cards/types";

@customElement("hui-conditional-base")
export class HuiConditionalBase extends UpdatingElement {
  @property() public opp?: OpenPeerPower;
  @property() protected _config?: ConditionalCardConfig | ConditionalRowConfig;
  protected _element?: DevconCard | DevconRow;

  protected validateConfig(
    config: ConditionalCardConfig | ConditionalRowConfig
  ): void {
    if (!config.conditions) {
      throw new Error("No conditions configured.");
    }

    if (!Array.isArray(config.conditions)) {
      throw new Error("Conditions should be in an array.");
    }

    if (!validateConditionalConfig(config.conditions)) {
      throw new Error("Conditions are invalid.");
    }

    if (this._element && this._element.parentElement) {
      this.removeChild(this._element);
    }

    this._config = config;
  }

  protected update(): void {
    if (!this._element || !this.opp) {
      return;
    }

    const visible =
      this._config && checkConditionsMet(this._config.conditions, this.opp);

    if (visible) {
      this._element.opp = this.opp;
      if (!this._element.parentElement) {
        this.appendChild(this._element);
      }
    }

    this.style.setProperty("display", visible ? "" : "none");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-conditional-base": HuiConditionalBase;
  }
}
