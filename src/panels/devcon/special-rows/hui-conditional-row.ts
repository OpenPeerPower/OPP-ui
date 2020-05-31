import { customElement } from "lit-element";

import { HuiConditionalBase } from "../components/hui-conditional-base";
import { createRowElement } from "../create-element/create-row-element";
import { DevconRow, ConditionalRowConfig } from "../entity-rows/types";

@customElement("hui-conditional-row")
class HuiConditionalRow extends HuiConditionalBase implements DevconRow {
  public setConfig(config: ConditionalRowConfig): void {
    this.validateConfig(config);

    if (!config.row) {
      throw new Error("No row configured.");
    }

    this._element = createRowElement(config.row) as DevconRow;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-conditional-row": HuiConditionalRow;
  }
}
