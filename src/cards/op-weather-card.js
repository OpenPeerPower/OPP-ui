import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import { computeStateName } from "../common/entity/compute_state_name";

import "../components/op-card";
import "../components/op-icon";

import { EventsMixin } from "../mixins/events-mixin";
import LocalizeMixin from "../mixins/localize-mixin";
import { computeRTL } from "../common/util/compute_rtl";

/*
 * @appliesMixin LocalizeMixin
 */
class OpWeatherCard extends LocalizeMixin(EventsMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        :host {
          cursor: pointer;
        }

        .content {
          padding: 0 20px 20px;
        }

        op-icon {
          color: var(--paper-item-icon-color);
        }

        .header {
          font-family: var(--paper-font-headline_-_font-family);
          -webkit-font-smoothing: var(
            --paper-font-headline_-_-webkit-font-smoothing
          );
          font-size: var(--paper-font-headline_-_font-size);
          font-weight: var(--paper-font-headline_-_font-weight);
          letter-spacing: var(--paper-font-headline_-_letter-spacing);
          line-height: var(--paper-font-headline_-_line-height);
          text-rendering: var(
            --paper-font-common-expensive-kerning_-_text-rendering
          );
          opacity: var(--dark-primary-opacity);
          padding: 24px 16px 16px;
          display: flex;
          align-items: baseline;
        }

        .name {
          margin-left: 16px;
          font-size: 16px;
          color: var(--secondary-text-color);
        }

        :host([rtl]) .name {
          margin-left: 0px;
          margin-right: 16px;
        }

        .now {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }

        .main {
          display: flex;
          align-items: center;
          margin-right: 32px;
        }

        :host([rtl]) .main {
          margin-right: 0px;
        }

        .main op-icon {
          --iron-icon-height: 72px;
          --iron-icon-width: 72px;
          margin-right: 8px;
        }

        :host([rtl]) .main op-icon {
          margin-right: 0px;
        }

        .main .temp {
          font-size: 52px;
          line-height: 1em;
          position: relative;
        }

        :host([rtl]) .main .temp {
          direction: ltr;
          margin-right: 28px;
        }

        .main .temp span {
          font-size: 24px;
          line-height: 1em;
          position: absolute;
          top: 4px;
        }

        .measurand {
          display: inline-block;
        }

        :host([rtl]) .measurand {
          direction: ltr;
        }

        .forecast {
          margin-top: 16px;
          display: flex;
          justify-content: space-between;
        }

        .forecast div {
          flex: 0 0 auto;
          text-align: center;
        }

        .forecast .icon {
          margin: 4px 0;
          text-align: center;
        }

        :host([rtl]) .forecast .temp {
          direction: ltr;
        }

        .weekday {
          font-weight: bold;
        }

        .attributes,
        .templow,
        .precipitation {
          color: var(--secondary-text-color);
        }

        :host([rtl]) .precipitation {
          direction: ltr;
        }
      </style>
      <op-card>
        <div class="header">
          [[computeState(stateObj.state, localize)]]
          <div class="name">[[computeName(stateObj)]]</div>
        </div>
        <div class="content">
          <div class="now">
            <div class="main">
              <template is="dom-if" if="[[showWeatherIcon(stateObj.state)]]">
                <op-icon icon="[[getWeatherIcon(stateObj.state)]]"></op-icon>
              </template>
              <div class="temp">
                [[stateObj.attributes.temperature]]<span
                  >[[getUnit('temperature')]]</span
                >
              </div>
            </div>
            <div class="attributes">
              <template
                is="dom-if"
                if="[[_showValue(stateObj.attributes.pressure)]]"
              >
                <div>
                  [[localize('ui.card.weather.attributes.air_pressure')]]:
                  <span class="measurand">
                    [[stateObj.attributes.pressure]] [[getUnit('air_pressure')]]
                  </span>
                </div>
              </template>
              <template
                is="dom-if"
                if="[[_showValue(stateObj.attributes.humidity)]]"
              >
                <div>
                  [[localize('ui.card.weather.attributes.humidity')]]:
                  <span class="measurand"
                    >[[stateObj.attributes.humidity]] %</span
                  >
                </div>
              </template>
              <template
                is="dom-if"
                if="[[_showValue(stateObj.attributes.wind_speed)]]"
              >
                <div>
                  [[localize('ui.card.weather.attributes.wind_speed')]]:
                  <span class="measurand">
                    [[getWindSpeed(stateObj.attributes.wind_speed)]]
                  </span>
                  [[getWindBearing(stateObj.attributes.wind_bearing, localize)]]
                </div>
              </template>
            </div>
          </div>
          <template is="dom-if" if="[[forecast]]">
            <div class="forecast">
              <template is="dom-repeat" items="[[forecast]]">
                <div>
                  <div class="weekday">
                    [[computeDate(item.datetime)]]<br />
                    <template is="dom-if" if="[[!_showValue(item.templow)]]">
                      [[computeTime(item.datetime)]]
                    </template>
                  </div>
                  <template is="dom-if" if="[[_showValue(item.condition)]]">
                    <div class="icon">
                      <op-icon
                        icon="[[getWeatherIcon(item.condition)]]"
                      ></op-icon>
                    </div>
                  </template>
                  <template is="dom-if" if="[[_showValue(item.temperature)]]">
                    <div class="temp">
                      [[item.temperature]] [[getUnit('temperature')]]
                    </div>
                  </template>
                  <template is="dom-if" if="[[_showValue(item.templow)]]">
                    <div class="templow">
                      [[item.templow]] [[getUnit('temperature')]]
                    </div>
                  </template>
                  <template is="dom-if" if="[[_showValue(item.precipitation)]]">
                    <div class="precipitation">
                      [[item.precipitation]] [[getUnit('precipitation')]]
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </template>
        </div>
      </op-card>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      config: Object,
      stateObj: Object,
      forecast: {
        type: Array,
        computed: "computeForecast(stateObj.attributes.forecast)",
      },
      rtl: {
        type: Boolean,
        reflectToAttribute: true,
        computed: "_computeRTL(opp)",
      },
    };
  }

  constructor() {
    super();
    this.cardinalDirections = [
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
    this.weatherIcons = {
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
  }

  ready() {
    this.addEventListener("click", this._onClick);
    super.ready();
  }

  _onClick() {
    this.fire("opp-more-info", { entityId: this.stateObj.entity_id });
  }

  computeForecast(forecast) {
    return forecast && forecast.slice(0, 5);
  }

  getUnit(measure) {
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

  computeState(state, localize) {
    return localize(`state.weather.${state}`) || state;
  }

  computeName(stateObj) {
    return (this.config && this.config.name) || computeStateName(stateObj);
  }

  showWeatherIcon(condition) {
    return condition in this.weatherIcons;
  }

  getWeatherIcon(condition) {
    return this.weatherIcons[condition];
  }

  windBearingToText(degree) {
    const degreenum = parseInt(degree);
    if (isFinite(degreenum)) {
      return this.cardinalDirections[(((degreenum + 11.25) / 22.5) | 0) % 16];
    }
    return degree;
  }

  getWindSpeed(speed) {
    return `${speed} ${this.getUnit("length")}/h`;
  }

  getWindBearing(bearing, localize) {
    if (bearing != null) {
      const cardinalDirection = this.windBearingToText(bearing);
      return `(${localize(
        `ui.card.weather.cardinal_direction.${cardinalDirection.toLowerCase()}`
      ) || cardinalDirection})`;
    }
    return ``;
  }

  _showValue(item) {
    return typeof item !== "undefined" && item !== null;
  }

  computeDate(data) {
    const date = new Date(data);
    return date.toLocaleDateString(this.opp.language, { weekday: "short" });
  }

  computeTime(data) {
    const date = new Date(data);
    return date.toLocaleTimeString(this.opp.language, { hour: "numeric" });
  }

  _computeRTL(opp) {
    return computeRTL(opp);
  }
}
customElements.define("op-weather-card", OpWeatherCard);
