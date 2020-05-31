import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "./op-label-badge";

class OpDemoBadge extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          --op-label-badge-color: #dac90d;
        }
      </style>

      <op-label-badge
        icon="opp:emoticon"
        label="Demo"
        description=""
      ></op-label-badge>
    `;
  }
}

customElements.define("op-demo-badge", OpDemoBadge);
