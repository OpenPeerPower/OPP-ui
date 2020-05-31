import {
  html,
  LitElement,
  TemplateResult,
  css,
  CSSResult,
  property,
  customElement,
  PropertyValues,
} from "lit-element";
import "@polymer/paper-icon-button/paper-icon-button";

import "../components/hui-generic-entity-row";
import "../components/hui-warning";

import { DevconRow, EntityConfig } from "./types";
import { OpenPeerPower } from "../../../types";
import { OppEntity } from "../../../websocket/lib";
import { supportsFeature } from "../../../common/entity/supports-feature";
import {
  SUPPORTS_PLAY,
  SUPPORT_NEXT_TRACK,
  OFF_STATES,
  SUPPORT_PAUSE,
} from "../../../data/media-player";
import { hasConfigOrEntityChanged } from "../common/has-changed";

@customElement("hui-media-player-entity-row")
class HuiMediaPlayerEntityRow extends LitElement implements DevconRow {
  @property() public opp?: OpenPeerPower;

  @property() private _config?: EntityConfig;

  public setConfig(config: EntityConfig): void {
    if (!config || !config.entity) {
      throw new Error("Invalid Configuration: 'entity' required");
    }

    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected render(): TemplateResult {
    if (!this.opp || !this._config) {
      return html``;
    }

    const stateObj = this.opp.states[this._config.entity];

    if (!stateObj) {
      return html`
        <hui-warning
          >${this.opp.localize(
            "ui.panel.devcon.warning.entity_not_found",
            "entity",
            this._config.entity
          )}</hui-warning
        >
      `;
    }

    return html`
      <hui-generic-entity-row
        .opp="${this.opp}"
        .config="${this._config}"
        .showSecondary=${false}
      >
        ${OFF_STATES.includes(stateObj.state)
          ? html`
              <div>
                ${this.opp!.localize(`state.media_player.${stateObj.state}`) ||
                  this.opp!.localize(`state.default.${stateObj.state}`) ||
                  stateObj.state}
              </div>
            `
          : html`
              <div class="controls">
                ${stateObj.state !== "playing" &&
                !supportsFeature(stateObj, SUPPORTS_PLAY)
                  ? ""
                  : html`
                      <paper-icon-button
                        icon="${this._computeControlIcon(stateObj)}"
                        @click="${this._playPause}"
                      ></paper-icon-button>
                    `}
                ${supportsFeature(stateObj, SUPPORT_NEXT_TRACK)
                  ? html`
                      <paper-icon-button
                        icon="opp:skip-next"
                        @click="${this._nextTrack}"
                      ></paper-icon-button>
                    `
                  : ""}
              </div>
              <div slot="secondary">${this._computeMediaTitle(stateObj)}</div>
            `}
      </hui-generic-entity-row>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .controls {
        white-space: nowrap;
      }
    `;
  }

  private _computeControlIcon(stateObj: OppEntity): string {
    if (stateObj.state !== "playing") {
      return "opp:play";
    }

    // tslint:disable-next-line:no-bitwise
    return supportsFeature(stateObj, SUPPORT_PAUSE) ? "opp:pause" : "opp:stop";
  }

  private _computeMediaTitle(stateObj: OppEntity): string {
    let prefix;
    let suffix;

    switch (stateObj.attributes.media_content_type) {
      case "music":
        prefix = stateObj.attributes.media_artist;
        suffix = stateObj.attributes.media_title;
        break;
      case "tvshow":
        prefix = stateObj.attributes.media_series_title;
        suffix = stateObj.attributes.media_title;
        break;
      default:
        prefix =
          stateObj.attributes.media_title ||
          stateObj.attributes.app_name ||
          stateObj.state;
        suffix = "";
    }

    return prefix && suffix ? `${prefix}: ${suffix}` : prefix || suffix || "";
  }

  private _playPause(ev: MouseEvent): void {
    ev.stopPropagation();
    this.opp!.callService("media_player", "media_play_pause", {
      entity_id: this._config!.entity,
    });
  }

  private _nextTrack(ev: MouseEvent): void {
    ev.stopPropagation();
    this.opp!.callService("media_player", "media_next_track", {
      entity_id: this._config!.entity,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-media-player-entity-row": HuiMediaPlayerEntityRow;
  }
}
