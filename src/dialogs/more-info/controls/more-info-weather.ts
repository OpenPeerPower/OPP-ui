import "@polymer/iron-icon/iron-icon";
import {
  LitElement,
  property,
  CSSResult,
  css,
  customElement,
  PropertyValues,
} from "lit-element";
import { OppEntity } from "../../../websocket/lib";
import { TemplateResult, html } from "lit-html";

import { OpenPeerPower } from "../../../types";

const cardinalDirections = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
  "N",
];

const weatherIcons = {
  "clear-night": "opp:weather-night",
  cloudy: "opp:weather-cloudy",
  exceptional: "opp:alert-circle-outline",
  fog: "opp:weather-fog",
  hail: "opp:weather-hail",
  lightning: "opp:weather-lightning",
  "lightning-rainy": "opp:weather-lightning-rainy",
  partlycloudy: "opp:weather-partly-cloudy",
  pouring: "opp:weather-pouring",
  rainy: "opp:weather-rainy",
  snowy: "opp:weather-snowy",
  "snowy-rainy": "opp:weather-snowy-rainy",
  sunny: "opp:weather-sunny",
  windy: "opp:weather-windy",
  "windy-variant": "opp:weather-windy-variant",
};

@customElement("more-info-weather")
class MoreInfoWeather extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public stateObj?: OppEntity;

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has("stateObj")) {
      return true;
    }

    const oldOpp = changedProps.get("opp") as OpenPeerPower | undefined;
    if (
      !oldOpp ||
      oldOpp.language !== this.opp.language ||
      oldOpp.config.unit_system !== this.opp.config.unit_system
    ) {
      return true;
    }

    return false;
  }

  protected render(): TemplateResult {
    if (!this.opp || !this.stateObj) {
      return html``;
    }

    return html`
      <div class="flex">
        <iron-icon icon="opp:thermometer"></iron-icon>
        <div class="main">
          ${this.opp.localize("ui.card.weather.attributes.temperature")}
        </div>
        <div>
          ${this.stateObj.attributes.temperature} ${this.getUnit("temperature")}
        </div>
      </div>
      ${this._showValue(this.stateObj.attributes.pressure)
        ? html`
            <div class="flex">
              <iron-icon icon="opp:gauge"></iron-icon>
              <div class="main">
                ${this.opp.localize("ui.card.weather.attributes.air_pressure")}
              </div>
              <div>
                ${this.stateObj.attributes.pressure}
                ${this.getUnit("air_pressure")}
              </div>
            </div>
          `
        : ""}
      ${this._showValue(this.stateObj.attributes.humidity)
        ? html`
            <div class="flex">
              <iron-icon icon="opp:water-percent"></iron-icon>
              <div class="main">
                ${this.opp.localize("ui.card.weather.attributes.humidity")}
              </div>
              <div>${this.stateObj.attributes.humidity} %</div>
            </div>
          `
        : ""}
      ${this._showValue(this.stateObj.attributes.wind_speed)
        ? html`
            <div class="flex">
              <iron-icon icon="opp:weather-windy"></iron-icon>
              <div class="main">
                ${this.opp.localize("ui.card.weather.attributes.wind_speed")}
              </div>
              <div>
                ${this.getWind(
                  this.stateObj.attributes.wind_speed,
                  this.stateObj.attributes.wind_bearing
                )}
              </div>
            </div>
          `
        : ""}
      ${this._showValue(this.stateObj.attributes.visibility)
        ? html`
            <div class="flex">
              <iron-icon icon="opp:eye"></iron-icon>
              <div class="main">
                ${this.opp.localize("ui.card.weather.attributes.visibility")}
              </div>
              <div>
                ${this.stateObj.attributes.visibility} ${this.getUnit("length")}
              </div>
            </div>
          `
        : ""}
      ${this.stateObj.attributes.forecast
        ? html`
            <div class="section">
              ${this.opp.localize("ui.card.weather.forecast")}:
            </div>
            ${this.stateObj.attributes.forecast.map((item) => {
              return html`
                <div class="flex">
                  ${item.condition
                    ? html`
                        <iron-icon
                          .icon="${weatherIcons[item.condition]}"
                        ></iron-icon>
                      `
                    : ""}
                  ${!this._showValue(item.templow)
                    ? html`
                        <div class="main">
                          ${this.computeDateTime(item.datetime)}
                        </div>
                      `
                    : ""}
                  ${this._showValue(item.templow)
                    ? html`
                        <div class="main">
                          ${this.computeDate(item.datetime)}
                        </div>
                        <div class="templow">
                          ${item.templow} ${this.getUnit("temperature")}
                        </div>
                      `
                    : ""}
                  <div class="temp">
                    ${item.temperature} ${this.getUnit("temperature")}
                  </div>
                </div>
              `;
            })}
          `
        : ""}
      ${this.stateObj.attributes.attribution
        ? html`
            <div class="attribution">
              ${this.stateObj.attributes.attribution}
            </div>
          `
        : ""}
    `;
  }

  static get styles(): CSSResult {
    return css`
      iron-icon {
        color: var(--paper-item-icon-color);
      }
      .section {
        margin: 16px 0 8px 0;
        font-size: 1.2em;
      }

      .flex {
        display: flex;
        height: 32px;
        align-items: center;
      }

      .main {
        flex: 1;
        margin-left: 24px;
      }

      .temp,
      .templow {
        min-width: 48px;
        text-align: right;
      }

      .templow {
        margin: 0 16px;
        color: var(--secondary-text-color);
      }

      .attribution {
        color: var(--secondary-text-color);
        text-align: center;
      }
    `;
  }

  private computeDate(data) {
    const date = new Date(data);
    return date.toLocaleDateString(this.opp.language, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }

  private computeDateTime(data) {
    const date = new Date(data);
    return date.toLocaleDateString(this.opp.language, {
      weekday: "long",
      hour: "numeric",
    });
  }

  private getUnit(measure: string): string {
    const lengthUnit = this.opp.config.unit_system.length || "";
    switch (measure) {
      case "air_pressure":
        return lengthUnit === "km" ? "hPa" : "inHg";
      case "length":
        return lengthUnit;
      case "precipitation":
        return lengthUnit === "km" ? "mm" : "in";
      default:
        return this.opp.config.unit_system[measure] || "";
    }
  }

  private windBearingToText(degree: string): string {
    const degreenum = parseInt(degree, 10);
    if (isFinite(degreenum)) {
      // tslint:disable-next-line: no-bitwise
      return cardinalDirections[(((degreenum + 11.25) / 22.5) | 0) % 16];
    }
    return degree;
  }

  private getWind(speed: string, bearing: string) {
    if (bearing != null) {
      const cardinalDirection = this.windBearingToText(bearing);
      return `${speed} ${this.getUnit("length")}/h (${this.opp.localize(
        `ui.card.weather.cardinal_direction.${cardinalDirection.toLowerCase()}`
      ) || cardinalDirection})`;
    }
    return `${speed} ${this.getUnit("length")}/h`;
  }

  private _showValue(item: string): boolean {
    return typeof item !== "undefined" && item !== null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-weather": MoreInfoWeather;
  }
}
