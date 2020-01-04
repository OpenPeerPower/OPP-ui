import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  css,
  CSSResult,
  PropertyValues,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";

import "../../../components/op-card";
import "../components/hui-image";
import "../components/hui-warning";

import computeDomain from "../../../common/entity/compute_domain";
import computeStateDisplay from "../../../common/entity/compute_state_display";
import computeStateName from "../../../common/entity/compute_state_name";

import { longPress } from "../common/directives/long-press-directive";
import { OpenPeerPower } from "../../../types";
import { LovelaceCard } from "../types";
import { handleClick } from "../common/handle-click";
import { UNAVAILABLE } from "../../../data/entity";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import { PictureEntityCardConfig } from "./types";

@customElement("hui-picture-entity-card")
class HuiPictureEntityCard extends LitElement implements LovelaceCard {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: PictureEntityCardConfig;

  public getCardSize(): number {
    return 3;
  }

  public setConfig(config: PictureEntityCardConfig): void {
    if (!config || !config.entity) {
      throw new Error("Invalid Configuration: 'entity' required");
    }

    if (
      computeDomain(config.entity) !== "camera" &&
      (!config.image && !config.state_image && !config.camera_image)
    ) {
      throw new Error("No image source configured.");
    }

    this._config = { show_name: true, show_state: true, ...config };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.opp) {
      return html``;
    }

    const stateObj = this.opp.states![this._config.entity];

    if (!stateObj) {
      return html`
        <hui-warning
          >${this.opp.localize(
            "ui.panel.lovelace.warning.entity_not_found",
            "entity",
            this._config.entity
          )}</hui-warning
        >
      `;
    }

    const name = this._config.name || computeStateName(stateObj);
    const state = computeStateDisplay(
      this.opp!.localize,
      stateObj,
      this.opp.language
    );

    let footer: TemplateResult | string = "";
    if (this._config.show_name && this._config.show_state) {
      footer = html`
        <div class="footer both">
          <div>${name}</div>
          <div>${state}</div>
        </div>
      `;
    } else if (this._config.show_name) {
      footer = html`
        <div class="footer">${name}</div>
      `;
    } else if (this._config.show_state) {
      footer = html`
        <div class="footer state">${state}</div>
      `;
    }

    return html`
      <op-card>
        <hui-image
          .opp="${this.opp}"
          .image="${this._config.image}"
          .stateImage="${this._config.state_image}"
          .cameraImage="${computeDomain(this._config.entity) === "camera"
            ? this._config.entity
            : this._config.camera_image}"
          .cameraView="${this._config.camera_view}"
          .entity="${this._config.entity}"
          .aspectRatio="${this._config.aspect_ratio}"
          @op-click="${this._handleTap}"
          @op-hold="${this._handleHold}"
          .longPress="${longPress()}"
          class="${classMap({
            clickable: stateObj.state !== UNAVAILABLE,
          })}"
        ></hui-image>
        ${footer}
      </op-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      op-card {
        min-height: 75px;
        overflow: hidden;
        position: relative;
      }

      hui-image.clickable {
        cursor: pointer;
      }

      .footer {
        /* start paper-font-common-nowrap style */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        /* end paper-font-common-nowrap style */

        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.3);
        padding: 16px;
        font-size: 16px;
        line-height: 16px;
        color: white;
      }

      .both {
        display: flex;
        justify-content: space-between;
      }

      .state {
        text-align: right;
      }
    `;
  }

  private _handleTap() {
    handleClick(this, this.opp!, this._config!, false);
  }

  private _handleHold() {
    handleClick(this, this.opp!, this._config!, true);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-picture-entity-card": HuiPictureEntityCard;
  }
}
