import {
  html,
  css,
  LitElement,
  TemplateResult,
  CSSResult,
  customElement,
} from "lit-element";
import "@material/mwc-button";

import { OpenPeerPower } from "../../../../types";
import { DevconCardConfig } from "../../../../data/devcon";
import { CardPickTarget } from "../types";
import { fireEvent } from "../../../../common/dom/fire_event";
import { getCardElementClass } from "../../create-element/create-card-element";

const cards: string[] = [
  "alarm-panel",
  "conditional",
  "entities",
  "button",
  "entity-filter",
  "gauge",
  "glance",
  "history-graph",
  "horizontal-stack",
  "iframe",
  "light",
  "map",
  "markdown",
  "media-control",
  "picture",
  "picture-elements",
  "picture-entity",
  "picture-glance",
  "plant-status",
  "sensor",
  "shopping-list",
  "thermostat",
  "vertical-stack",
  "weather-forecast",
];

@customElement("hui-card-picker")
export class HuiCardPicker extends LitElement {
  public opp?: OpenPeerPower;

  public cardPicked?: (cardConf: DevconCardConfig) => void;

  protected render(): TemplateResult {
    return html`
      <div class="cards-container">
        ${cards.map((card: string) => {
          return html`
            <mwc-button @click="${this._cardPicked}" .type="${card}">
              ${this.opp!.localize(`ui.panel.devcon.editor.card.${card}.name`)}
            </mwc-button>
          `;
        })}
      </div>
      <div class="cards-container">
        <mwc-button @click="${this._manualPicked}">MANUAL CARD</mwc-button>
      </div>
    `;
  }

  static get styles(): CSSResult[] {
    return [
      css`
        .cards-container {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .cards-container mwc-button {
          flex: 1 0 25%;
          margin: 4px;
        }

        @media all and (max-width: 450px), all and (max-height: 500px) {
          .cards-container mwc-button {
            flex: 1 0 33%;
          }
        }
      `,
    ];
  }

  private _manualPicked(): void {
    fireEvent(this, "config-changed", {
      config: { type: "" },
    });
  }

  private async _cardPicked(ev: Event): Promise<void> {
    const type = (ev.currentTarget! as CardPickTarget).type;

    const elClass = await getCardElementClass(type);
    let config: DevconCardConfig = { type };

    if (elClass && elClass.getStubConfig) {
      const cardConfig = elClass.getStubConfig(this.opp!);
      config = { ...config, ...cardConfig };
    }

    fireEvent(this, "config-changed", { config });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-card-picker": HuiCardPicker;
  }
}
