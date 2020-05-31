import "@polymer/app-layout/app-toolbar/app-toolbar";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../../components/op-menu-button";
import "../../resources/op-style";

class OpPanelIframe extends PolymerElement {
  static get template() {
    return html`
      <style include="op-style">
        iframe {
          border: 0;
          width: 100%;
          height: calc(100% - 64px);
          background-color: var(--primary-background-color);
        }
      </style>
      <app-toolbar>
        <op-menu-button opp="[[opp]]" narrow="[[narrow]]"></op-menu-button>
        <div main-title>[[panel.title]]</div>
      </app-toolbar>

      <iframe
        src="[[panel.config.url]]"
        sandbox="allow-forms allow-popups allow-pointer-lock allow-same-origin allow-scripts"
        allowfullscreen="true"
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
      ></iframe>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      narrow: Boolean,
      panel: Object,
    };
  }
}

customElements.define("op-panel-iframe", OpPanelIframe);
