import "@polymer/iron-flex-layout/iron-flex-layout-classes";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../components/entity/state-info";
import "../components/op-cover-controls";
import "../components/op-cover-tilt-controls";
import CoverEntity from "../util/cover-model";

class StateCardCover extends PolymerElement {
  static get template() {
    return html`
      <style include="iron-flex iron-flex-alignment"></style>
      <style>
        :host {
          line-height: 1.5;
        }
      </style>

      <div class="horizontal justified layout">
        ${this.stateInfoTemplate}
        <div class="horizontal layout">
          <op-cover-controls
            hidden$="[[entityObj.isTiltOnly]]"
            opp="[[opp]]"
            state-obj="[[stateObj]]"
          ></op-cover-controls>
          <op-cover-tilt-controls
            hidden$="[[!entityObj.isTiltOnly]]"
            opp="[[opp]]"
            state-obj="[[stateObj]]"
          ></op-cover-tilt-controls>
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
      entityObj: {
        type: Object,
        computed: "computeEntityObj(opp, stateObj)",
      },
    };
  }

  computeEntityObj(opp, stateObj) {
    var entity = new CoverEntity(opp, stateObj);
    return entity;
  }
}
customElements.define("state-card-cover", StateCardCover);
