import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../../../cards/op-history_graph-card";
import "../../../components/op-attributes";

class MoreInfoHistoryGraph extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          margin-bottom: 6px;
        }
      </style>
      <op-history_graph-card
        opp="[[opp]]"
        state-obj="[[stateObj]]"
        in-dialog=""
      >
        <op-attributes state-obj="[[stateObj]]"></op-attributes>
      </op-history_graph-card>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      stateObj: Object,
    };
  }
}
customElements.define("more-info-history_graph", MoreInfoHistoryGraph);
