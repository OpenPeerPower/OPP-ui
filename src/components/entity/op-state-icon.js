import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../op-icon";
import { stateIcon } from "../../common/entity/state_icon";

class OpStateIcon extends PolymerElement {
  static get template() {
    return html`
      <op-icon icon="[[computeIcon(stateObj)]]"></op-icon>
    `;
  }

  static get properties() {
    return {
      stateObj: {
        type: Object,
      },
    };
  }

  computeIcon(stateObj) {
    return stateIcon(stateObj);
  }
}

customElements.define("op-state-icon", OpStateIcon);
