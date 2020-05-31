import {
  customElement,
  LitElement,
  html,
  property,
  TemplateResult,
} from "lit-element";

import "../components/hui-buttons-base";

import { DevconHeaderFooter } from "../types";
import { ButtonsHeaderFooterConfig } from "./types";
import { processConfigEntities } from "../common/process-config-entities";
import { EntityConfig } from "../entity-rows/types";
import { OpenPeerPower } from "../../../types";

@customElement("hui-buttons-header-footer")
export class HuiButtonsHeaderFooter extends LitElement
  implements DevconHeaderFooter {
  public static getStubConfig(): object {
    return { entities: [] };
  }

  @property() public opp?: OpenPeerPower;
  private _configEntities?: EntityConfig[];

  public setConfig(config: ButtonsHeaderFooterConfig): void {
    this._configEntities = processConfigEntities(config.entities);
    this.requestUpdate();
  }

  protected render(): TemplateResult | void {
    return html`
      <hui-buttons-base
        .opp=${this.opp}
        .configEntities=${this._configEntities}
      ></hui-buttons-base>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-buttons-header-footer": HuiButtonsHeaderFooter;
  }
}
