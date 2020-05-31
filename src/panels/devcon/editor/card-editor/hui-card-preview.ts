import "@polymer/paper-input/paper-textarea";

import { createCardElement } from "../../create-element/create-card-element";
import { OpenPeerPower } from "../../../../types";
import { DevconCardConfig } from "../../../../data/devcon";
import { DevconCard } from "../../types";
import { ConfigError } from "../types";
import { createErrorCardConfig } from "../../cards/hui-error-card";
import { computeRTL } from "../../../../common/util/compute_rtl";

export class HuiCardPreview extends HTMLElement {
  private _opp?: OpenPeerPower;
  private _element?: DevconCard;
  private _config?: DevconCardConfig;

  private get _error() {
    return this._element?.tagName === "HUI-ERROR-CARD";
  }

  constructor() {
    super();
    this.addEventListener("ll-rebuild", () => {
      this._cleanup();
      if (this._config) {
        this.config = this._config;
      }
    });
  }

  set opp(opp: OpenPeerPower) {
    if (!this._opp || this._opp.language !== opp.language) {
      this.style.direction = computeRTL(opp) ? "rtl" : "ltr";
    }

    this._opp = opp;
    if (this._element) {
      this._element.opp = opp;
    }
  }

  set error(error: ConfigError) {
    this._createCard(
      createErrorCardConfig(`${error.type}: ${error.message}`, undefined)
    );
  }

  set config(configValue: DevconCardConfig) {
    const curConfig = this._config;
    this._config = configValue;

    if (!configValue) {
      this._cleanup();
      return;
    }

    if (!configValue.type) {
      this._createCard(
        createErrorCardConfig("No card type found", configValue)
      );
      return;
    }

    if (!this._element) {
      this._createCard(configValue);
      return;
    }

    // in case the element was an error element we always want to recreate it
    if (!this._error && curConfig && configValue.type === curConfig.type) {
      try {
        this._element.setConfig(configValue);
      } catch (err) {
        this._createCard(createErrorCardConfig(err.message, configValue));
      }
    } else {
      this._createCard(configValue);
    }
  }

  private _createCard(configValue: DevconCardConfig): void {
    this._cleanup();
    this._element = createCardElement(configValue);

    if (this._opp) {
      this._element!.opp = this._opp;
    }

    this.appendChild(this._element!);
  }

  private _cleanup() {
    if (!this._element) {
      return;
    }
    this.removeChild(this._element);
    this._element = undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-card-preview": HuiCardPreview;
  }
}

customElements.define("hui-card-preview", HuiCardPreview);
