import "@polymer/iron-flex-layout/iron-flex-layout-classes";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../components/entity/state-info";
import OppMediaPlayerEntity from "../util/opp-media-player-model";

/*
 * @appliesMixin LocalizeMixin
 */
class StateCardMediaPlayer extends PolymerElement {
  static get template() {
    return html`
      <style include="iron-flex iron-flex-alignment"></style>
      <style>
        :host {
          line-height: 1.5;
        }

        .state {
          @apply --paper-font-common-nowrap;
          @apply --paper-font-body1;
          margin-left: 16px;
          text-align: right;
        }

        .main-text {
          @apply --paper-font-common-nowrap;
          color: var(--primary-text-color);
          text-transform: capitalize;
        }

        .main-text[take-height] {
          line-height: 40px;
        }

        .secondary-text {
          @apply --paper-font-common-nowrap;
          color: var(--secondary-text-color);
        }
      </style>

      <div class="horizontal justified layout">
        ${this.stateInfoTemplate}
        <div class="state">
          <div class="main-text" take-height$="[[!playerObj.secondaryTitle]]">
            [[computePrimaryText(localize, playerObj)]]
          </div>
          <div class="secondary-text">[[playerObj.secondaryTitle]]</div>
        </div>
      </div>
    `;
  }

  static get stateInfoTemplate() {
    return html`
      <state-info
        opp="[[opp]]"
        state-obj="[[stateObj]]"
        in-dialog="[[inDialog]]"
      ></state-info>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      stateObj: Object,
      inDialog: {
        type: Boolean,
        value: false,
      },
      playerObj: {
        type: Object,
        computed: "computePlayerObj(opp, stateObj)",
      },
    };
  }

  computePlayerObj(opp, stateObj) {
    return new OppMediaPlayerEntity(opp, stateObj);
  }

  computePrimaryText(localize, playerObj) {
    return (
      playerObj.primaryTitle ||
      localize(`state.media_player.${playerObj.stateObj.state}`) ||
      localize(`state.default.${playerObj.stateObj.state}`) ||
      playerObj.stateObj.state
    );
  }
}
customElements.define("state-card-media_player", StateCardMediaPlayer);
