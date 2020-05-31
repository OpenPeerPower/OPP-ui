import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../../components/op-paper-dropdown-menu";

import { EventsMixin } from "../../mixins/events-mixin";
import LocalizeMixin from "../../mixins/localize-mixin";

/*
 * @appliesMixin LocalizeMixin
 * @appliesMixin EventsMixin
 */
class OpPickThemeRow extends LocalizeMixin(EventsMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        a {
          color: var(--primary-color);
        }
      </style>
      <op-settings-row narrow="[[narrow]]">
        <span slot="heading"
          >[[localize('ui.panel.profile.themes.header')]]</span
        >
        <span slot="description">
          <template is="dom-if" if="[[!_hasThemes]]">
            [[localize('ui.panel.profile.themes.error_no_theme')]]
          </template>
          <a
            href="https://www.open-peer-power.io/integrations/frontend/#defining-themes"
            target="_blank"
            >[[localize('ui.panel.profile.themes.link_promo')]]</a
          >
        </span>
        <op-paper-dropdown-menu
          label="[[localize('ui.panel.profile.themes.dropdown_label')]]"
          dynamic-align
          disabled="[[!_hasThemes]]"
        >
          <paper-listbox slot="dropdown-content" selected="{{selectedTheme}}">
            <template is="dom-repeat" items="[[themes]]" as="theme">
              <paper-item>[[theme]]</paper-item>
            </template>
          </paper-listbox>
        </op-paper-dropdown-menu>
      </op-settings-row>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      narrow: Boolean,
      _hasThemes: {
        type: Boolean,
        computed: "_compHasThemes(opp)",
      },
      themes: {
        type: Array,
        computed: "_computeThemes(opp)",
      },
      selectedTheme: {
        type: Number,
      },
    };
  }

  static get observers() {
    return ["selectionChanged(opp, selectedTheme)"];
  }

  _compHasThemes(opp) {
    return (
      opp.themes && opp.themes.themes && Object.keys(opp.themes.themes).length
    );
  }

  ready() {
    super.ready();
    if (
      this.opp.selectedTheme &&
      this.themes.indexOf(this.opp.selectedTheme) > 0
    ) {
      this.selectedTheme = this.themes.indexOf(this.opp.selectedTheme);
    } else if (!this.opp.selectedTheme) {
      this.selectedTheme = 0;
    }
  }

  _computeThemes(opp) {
    if (!opp) return [];
    return ["Backend-selected", "default"].concat(
      Object.keys(opp.themes.themes).sort()
    );
  }

  selectionChanged(opp, selection) {
    if (selection > 0 && selection < this.themes.length) {
      if (opp.selectedTheme !== this.themes[selection]) {
        this.fire("settheme", this.themes[selection]);
      }
    } else if (selection === 0 && opp.selectedTheme !== "") {
      this.fire("settheme", "");
    }
  }
}

customElements.define("op-pick-theme-row", OpPickThemeRow);
