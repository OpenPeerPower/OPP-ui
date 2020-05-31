import { customElement } from "lit-element";

import { HuiConditionalBase } from "../components/hui-conditional-base";
import { createCardElement } from "../create-element/create-card-element";
import { DevconCard } from "../types";
import { computeCardSize } from "../common/compute-card-size";
import { ConditionalCardConfig } from "./types";

@customElement("hui-conditional-card")
class HuiConditionalCard extends HuiConditionalBase implements DevconCard {
  public setConfig(config: ConditionalCardConfig): void {
    this.validateConfig(config);

    if (!config.card) {
      throw new Error("No card configured.");
    }

    this._element = createCardElement(config.card) as DevconCard;
  }

  public getCardSize(): number {
    return computeCardSize(this._element as DevconCard);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-conditional-card": HuiConditionalCard;
  }
}
