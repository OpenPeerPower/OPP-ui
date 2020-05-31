import "@polymer/paper-checkbox/paper-checkbox";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

class OpCustomizeBoolean extends PolymerElement {
  static get template() {
    return html`
      <paper-checkbox disabled="[[item.secondary]]" checked="{{item.value}}">
        [[item.description]]
      </paper-checkbox>
    `;
  }

  static get properties() {
    return {
      item: {
        type: Object,
        notifies: true,
      },
    };
  }
}
customElements.define("op-customize-boolean", OpCustomizeBoolean);
